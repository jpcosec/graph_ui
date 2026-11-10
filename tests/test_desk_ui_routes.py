"""Real HTTP tests for frontends/desk/serve.py (the deskops UI server).

Each /api/view/* must return exactly what `deskops view` returns for the same
temporary desk; only POST /api/desk/advance writes; the server binds loopback;
the shell loads no external URL.
"""
import json
from pathlib import Path
import re
import subprocess
import sys
import threading
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import pytest

_frontends_dir = str(Path(__file__).resolve().parent.parent / 'frontends')
if _frontends_dir not in sys.path:
    sys.path.insert(0, _frontends_dir)

pytest.importorskip('deskops.services.desk_view', reason='this deskops has no `deskops view` (deskops UI01)')

import deskops  # noqa: E402
from deskops.bootstrap import SLDBBootstrap  # noqa: E402
from deskops.lifecycle import write_lifecycle_graph  # noqa: E402
from deskops.operations import DeskopsOperations  # noqa: E402
from deskops.workspace import seed_desk  # noqa: E402
from desk import serve as desk_serve  # noqa: E402

DESK_DIR = Path(desk_serve.__file__).resolve().parent
MISSING_HERDR = 'herdr-missing-for-tests'


def _git(root, *argv):
    subprocess.run(['git', *argv], cwd=root, check=True, capture_output=True)


def _make_desk(root, titles):
    root.mkdir(parents=True)
    _git(root, 'init', '-q')
    _git(root, 'config', 'user.name', 'test')
    _git(root, 'config', 'user.email', 'test@example.com')
    assert SLDBBootstrap().init_local_store(root) == 0
    seed_desk(root)
    write_lifecycle_graph(root)
    ops = DeskopsOperations(root)
    ids = [ops.create_task_bundle({
        'title': title, 'goal': f'Objetivo de {title}', 'scope': 's', 'implementation_path': 'i',
        'validation': ['pytest'], 'done_when': 'd', 'task_type': 'code',
    }).task_id for title in titles]
    return ops, ids


@pytest.fixture
def desk_env(tmp_path, monkeypatch):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    root = tmp_path / 'repo'
    ops, ids = _make_desk(root, ['Primera tarea', 'Segunda tarea'])
    ops.advance_task(ids[1])
    other = tmp_path / 'other'
    _make_desk(other, ['Tarea del otro desk'])
    (tmp_path / 'nodesk').mkdir()
    # Registry entries are written by deskops (desk/registry/repo-<name>.md, id repo-<name>).
    for name, path in (('main', root), ('other', other), ('nodesk', tmp_path / 'nodesk')):
        ops.create_artifact('artifact.repository', {
            'name': name, 'path': str(path), 'status': 'active', 'description': 'd', 'tags': [],
        })
    return root, other, ids


@pytest.fixture
def server(desk_env):
    root, _, _ = desk_env
    instance = desk_serve.make_server(0, root, herdr=MISSING_HERDR)
    thread = threading.Thread(target=instance.serve_forever, daemon=True)
    thread.start()
    yield instance, f'http://127.0.0.1:{instance.server_port}'
    instance.shutdown()
    instance.server_close()
    thread.join()


def _request(url, method='GET', body=None, headers=None):
    data = json.dumps(body).encode() if body is not None else None
    req = Request(url, data=data, method=method, headers={'Content-Type': 'application/json', **(headers or {})})
    try:
        resp = urlopen(req, timeout=60)
    except HTTPError as exc:
        resp = exc
    with resp:
        raw = resp.read()
        return resp.status, (json.loads(raw) if raw else None)


def _cli_view(root, *argv):
    env_path = str(Path(deskops.__file__).resolve().parent.parent)
    result = subprocess.run(
        [sys.executable, '-m', 'deskops', 'view', *argv, '--root', str(root), '--format', 'json'],
        capture_output=True, text=True, env={**__import__('os').environ, 'PYTHONPATH': env_path},
    )
    assert result.returncode == 0, result.stderr
    return json.loads(result.stdout)


def test_each_view_route_returns_exactly_what_deskops_view_returns(desk_env, server):
    root, _, ids = desk_env
    _, base = server
    for view in ('board', 'drawer', 'inbox'):
        status, data = _request(f'{base}/api/view/{view}')
        assert status == 200
        assert data == _cli_view(root, view)
    status, data = _request(f'{base}/api/view/task?id={ids[0]}')
    assert status == 200
    assert data == _cli_view(root, 'task', ids[0])
    status, data = _request(f'{base}/api/view/agents')
    assert status == 200
    assert data == _cli_view(root, 'agents', '--herdr', MISSING_HERDR)
    assert data['workers'] is None and data['workers_error']


def test_desk_selector_lists_registry_desks_with_a_desk_and_routes_views(desk_env, server):
    root, other, _ = desk_env
    _, base = server
    status, data = _request(f'{base}/api/desks')
    assert status == 200
    assert [(d['id'], d['path'], d['default']) for d in data['desks']] == [
        ('repo-main', str(root), True), ('repo-other', str(other), False)]
    status, board = _request(f'{base}/api/view/board?desk=repo-other')
    assert status == 200 and board == _cli_view(other, 'board')
    status, error = _request(f'{base}/api/view/board?desk=repo-nodesk')
    assert status == 404 and 'repo-nodesk' in error['error']


def test_view_errors_are_visible_with_cause(server):
    _, base = server
    status, data = _request(f'{base}/api/view/task?id=task-no-existe')
    assert status == 404 and 'task-no-existe' in data['error']
    status, data = _request(f'{base}/api/view/task')
    assert status == 400
    status, data = _request(f'{base}/api/view/nope')
    assert status == 404


def test_non_get_methods_are_rejected_except_advance(desk_env, server):
    root, _, ids = desk_env
    _, base = server
    before = (root / 'desk/tasks/Board.md').read_bytes()
    for method in ('POST', 'PUT', 'PATCH', 'DELETE'):
        status, data = _request(f'{base}/api/view/board', method=method, body={})
        assert status == 405, method
    status, _ = _request(f'{base}/api/desk/board', method='POST', body={})
    assert status == 405
    assert (root / 'desk/tasks/Board.md').read_bytes() == before


def test_advance_delegates_to_desk_routes_with_revision_guard(desk_env, server):
    root, _, ids = desk_env
    _, base = server
    _, view = _request(f'{base}/api/view/task?id={ids[0]}')
    status, data = _request(f'{base}/api/desk/advance', 'POST', {'id': ids[0], 'revision': 'stale'})
    assert status == 409 and 'cambió' in data['error']
    status, data = _request(f'{base}/api/desk/advance', 'POST', {'id': ids[0], 'revision': view['revision']})
    assert status == 200 and data['task']['current_node'] == 'ritual-testing'
    task, _ = DeskopsOperations(root).show_task(ids[0])
    assert task.current_node == 'ritual-testing'


def test_server_binds_loopback_only(server):
    instance, _ = server
    assert instance.server_address[0] == '127.0.0.1'


def test_shell_files_are_served_and_have_no_external_urls(server):
    _, base = server
    for name in ('index.html', 'app.js', 'styles.css'):
        text = (DESK_DIR / name).read_text(encoding='utf-8')
        urls = re.findall(r'https?://[^\s\'"`)]+', text)
        # Loopback only; the SVG namespace URI is an identifier, not a fetch.
        allowed = r'https?://(127\.0\.0\.1|localhost)[:/]|http://www\.w3\.org/2000/svg$'
        assert all(re.match(allowed, url) for url in urls), (name, urls)
        assert '@import' not in text and 'cdn' not in text.lower()
        with urlopen(f'{base}/{name}', timeout=10) as resp:
            assert resp.status == 200
    status, _ = _request(f'{base}/serve.py')
    assert status == 404


# ---------------------------------------------------------------- inbox actions (UI05)
@pytest.fixture
def inbox_env(tmp_path, monkeypatch):
    """A desk without registry entries, so `message ack` resolves its identity from the desk."""
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    root = tmp_path / 'inbox-desk'
    _make_desk(root, ['Una tarea'])
    instance = desk_serve.make_server(0, root, herdr=MISSING_HERDR)
    thread = threading.Thread(target=instance.serve_forever, daemon=True)
    thread.start()
    yield root, f'http://127.0.0.1:{instance.server_port}'
    instance.shutdown()
    instance.server_close()
    thread.join()


def _send(root, title, body='Cuerpo de la nota.'):
    from deskops.cli.main import main as deskops_main

    assert deskops_main(['message', 'send', '--root', str(root), '--title', title, '--kind', 'suggestion', body]) == 0
    return next(p for p in (root / 'desk/inbox').glob('*.md') if p.stem.endswith('-' + title.lower().replace(' ', '-')))


def _note(base, stem):
    _, inbox = _request(f'{base}/api/view/inbox')
    return next(note for note in inbox['notes'] if note['id'] == stem)


def test_inbox_ack_runs_message_ack_with_revision_guard(inbox_env):
    root, base = inbox_env
    path = _send(root, 'Nota para reconocer')
    note = _note(base, path.stem)
    status, data = _request(f'{base}/api/inbox/ack', 'POST', {'note': path.stem, 'revision': 'vieja'})
    assert status == 409 and 'cambió' in data['error']
    assert _note(base, path.stem)['acknowledged'] is False
    status, data = _request(f'{base}/api/inbox/ack', 'POST', {'note': path.stem, 'revision': note['revision']})
    assert status == 200 and data['ok'] is True
    listed = subprocess.run(
        [sys.executable, '-m', 'deskops', 'message', 'list', '--root', str(root), '--format', 'json'],
        capture_output=True, text=True, env={**__import__('os').environ, 'PYTHONPATH': str(Path(deskops.__file__).resolve().parent.parent)},
    )
    entry = next(n for n in json.loads(listed.stdout)['notes'] if n['id'] == path.stem)
    assert entry['status'] == 'closed'
    status, data = _request(f'{base}/api/inbox/ack', 'POST', {'note': path.stem, 'revision': _note(base, path.stem)['revision']})
    assert status == 409 and 'already acknowledged' in data['error']


def test_inbox_promote_runs_promote_inbox_to_drawer_task(inbox_env):
    root, base = inbox_env
    path = _send(root, 'Idea para el drawer')
    note = _note(base, path.stem)
    status, data = _request(f'{base}/api/inbox/promote', 'POST', {'note': path.stem, 'revision': note['revision']})
    assert status == 200, data
    assert not path.exists()
    assert (root / 'desk/drawer/tasks/task-idea-para-el-drawer.md').is_file()
    _, drawer = _request(f'{base}/api/view/drawer')
    assert any(entry['id'] == 'task-idea-para-el-drawer' for entry in drawer['tasks'])


def test_inbox_actions_validate_request(inbox_env):
    root, base = inbox_env
    path = _send(root, 'Nota protegida')
    note = _note(base, path.stem)
    status, _ = _request(f'{base}/api/inbox/ack', 'POST', {'note': 'no-existe', 'revision': 'x'})
    assert status == 404
    status, _ = _request(f'{base}/api/inbox/ack', 'POST', {'note': '../tasks/Board', 'revision': 'x'})
    assert status == 404
    status, _ = _request(f'{base}/api/inbox/ack', 'POST', {'note': path.stem, 'revision': note['revision'], 'extra': 'x'})
    assert status == 400
    status, _ = _request(f'{base}/api/inbox/ack', 'POST', {'note': path.stem, 'revision': note['revision']},
                         headers={'Origin': 'http://evil.example'})
    assert status == 403
    assert _note(base, path.stem)['acknowledged'] is False
