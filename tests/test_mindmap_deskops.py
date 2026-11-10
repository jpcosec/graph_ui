"""Real temporary desks and HTTP servers: no service replacements."""
import json
import threading
from concurrent.futures import ThreadPoolExecutor
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import pytest
from deskops.bootstrap import SLDBBootstrap
from deskops.lifecycle import write_lifecycle_graph
from deskops.models import BoardDoc, TaskDoc
from deskops.operations import DeskopsOperations
from deskops.workspace import scaffold_desk
from mindmap import serve
from mindmap.deskops_routes import configured_routes


@pytest.fixture
def desk(tmp_path, monkeypatch):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    root = tmp_path / 'repo'
    root.mkdir()
    assert SLDBBootstrap().init_local_store(root) == 0
    scaffold_desk(root)
    write_lifecycle_graph(root)
    ops = DeskopsOperations(root)
    task = ops.create_task_bundle(dict(title='Revisar contrato real', goal='Comprobar rutas', scope='Desk temporal', implementation_path='Operaciones reales', validation=['pytest'], done_when='Rutas verificadas')).task_id
    return root, ops, task


@pytest.fixture
def server(desk):
    root, _, _ = desk
    instance = serve.make_server(0, root / '.sldb')
    thread = threading.Thread(target=instance.serve_forever, daemon=True)
    thread.start()
    yield 'http://127.0.0.1:' + str(instance.server_port)
    instance.shutdown()
    instance.server_close()
    thread.join()


def http(server, path, body=None, origin=None):
    headers = {'Content-Type': 'application/json'}
    if origin is not None:
        headers['Origin'] = origin
    request = Request(server+path, data=None if body is None else json.dumps(body).encode(), headers=headers)
    try:
        response = urlopen(request, timeout=30)
    except HTTPError as exc:
        response = exc
    with response:
        return response.status, json.loads(response.read())


def edit_board(root, ops, refs):
    path = root / 'desk/tasks/Board.md'
    payload = ops._read_doc(path, BoardDoc)
    payload['tasks'] = refs
    ops._write_doc(path, BoardDoc, payload)


def test_board_routing_errors_empty_and_orphans(desk, server):
    root, ops, ident = desk
    status, board = http(server, '/api/desk/board')
    assert status == 200 and board['root'] == str(root)
    assert [t['id'] for t in board['tasks']] == [ident]
    edit_board(root, ops, ['desk/tasks/missing.md', '../outside.md'])
    status, board = http(server, '/api/desk/board')
    assert status == 200 and not board['tasks'] and len(board['errors']) == 2
    assert http(server, '/api/desk/task?id='+ident)[0] == 404
    edit_board(root, ops, [])
    assert http(server, '/api/desk/board')[1]['errors'] == []
    assert http(server, '/api/desk/board')[1]['tasks'] == []


def test_real_advance_stale_origin_and_types(desk, server):
    root, ops, ident = desk
    status, detail = http(server, '/api/desk/task?id='+ident)
    assert status == 200 and detail['gates'] and detail['next']['next_actions']
    body = {'id': ident, 'revision': detail['revision']}
    for origin in ('https://evil.example', server.replace('http:', 'https:'), 'null'):
        assert http(server, '/api/desk/advance', body, origin)[0] == 403
    assert http(server, '/api/desk/advance', {**body, 'target': 'complete'})[0] == 400
    assert http(server, '/api/desk/advance', {'id': [], 'revision': 'x'})[0] == 400
    assert http(server, '/api/desk/advance', {'id': ident, 'revision': 'x'})[0] == 409
    status, advanced = http(server, '/api/desk/advance', body, server)
    assert status == 200 and advanced['transition']['progressed']
    assert advanced['task']['current_node'] != detail['task']['current_node']
    assert ops.show_task(ident)[0].current_node == advanced['task']['current_node']
    assert http(server, '/api/desk/advance', body)[0] == 409


def test_serialized_advances_and_board_revision(desk, server):
    root, ops, ident = desk
    detail = http(server, '/api/desk/task?id='+ident)[1]
    body = {'id': ident, 'revision': detail['revision']}
    with ThreadPoolExecutor(2) as pool:
        statuses = list(pool.map(lambda _: http(server, '/api/desk/advance', body)[0], range(2)))
    assert sorted(statuses) == [200, 409]
    detail = http(server, '/api/desk/task?id='+ident)[1]
    path = root / 'desk/tasks/Board.md'
    payload = ops._read_doc(path, BoardDoc)
    payload['notes'] = 'Cambio concurrente del Board'
    ops._write_doc(path, BoardDoc, payload)
    assert http(server, '/api/desk/advance', {'id': ident, 'revision': detail['revision']})[0] == 409


def test_blocked_and_missing_lifecycle(desk, server):
    root, ops, ident = desk
    path = root / f'desk/tasks/{ident}.md'
    payload = ops._read_doc(path, TaskDoc)
    payload.update(current_node='ritual-testing', validation=[])
    ops._write_doc(path, TaskDoc, payload)
    detail = http(server, '/api/desk/task?id='+ident)[1]
    assert not any(g['holds'] for g in detail['gates'])
    status, blocked = http(server, '/api/desk/advance', {'id':ident,'revision':detail['revision']})
    assert status == 409 and blocked['transition']['blocked']
    payload['current_node'] = 'ritual-unknown'
    ops._write_doc(path, TaskDoc, payload)
    status, error = http(server, '/api/desk/task?id='+ident)
    assert status == 503 and error['error']


def test_duplicate_routes_and_configuration(desk, server):
    root, ops, ident = desk
    edit_board(root, ops, [f'desk/tasks/{ident}.md'] * 2)
    assert not http(server, '/api/desk/board')[1]['tasks']
    assert http(server, '/api/desk/task?id='+ident)[0] == 404
    assert configured_routes(root / '.sldb', 'local', None).root == root
    assert 'remote' in configured_routes(None, 'remote', None).error
    assert 'absoluta' in configured_routes(None, 'remote', 'relative').error
    assert configured_routes(None, 'remote', str(root)).root == root


def test_terminal_cannot_close_and_path_escape(desk, server, tmp_path):
    root, ops, ident = desk
    path = root / f'desk/tasks/{ident}.md'
    payload = ops._read_doc(path, TaskDoc)
    payload['current_node'] = 'ritual-closeout'
    ops._write_doc(path, TaskDoc, payload)
    detail = http(server, '/api/desk/task?id='+ident)[1]
    status, result = http(server, '/api/desk/advance', {'id': ident, 'revision': detail['revision']})
    assert status == 409
    assert ops.show_task(ident)[0].current_node == 'ritual-closeout'
    external = tmp_path / 'external.md'
    external.write_bytes(path.read_bytes())
    link = root / 'desk/tasks/escape.md'
    link.symlink_to(external)
    edit_board(root, ops, ['desk/tasks/escape.md'])
    board = http(server, '/api/desk/board')[1]
    assert not board['tasks'] and board['errors']


def test_remote_without_root_is_explicit_http_error(monkeypatch):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    monkeypatch.setattr(serve, 'BACKEND_MODE', 'remote')
    instance = serve.make_server(0)
    thread = threading.Thread(target=instance.serve_forever, daemon=True)
    thread.start()
    try:
        address = 'http://127.0.0.1:' + str(instance.server_port)
        status, payload = http(address, '/api/desk/board')
        assert status == 503 and 'DESKOPS_ROOT' in payload['error']
        assert http(address, '/api/desk/unknown')[0] == 404
    finally:
        instance.shutdown()
        instance.server_close()
        thread.join()
