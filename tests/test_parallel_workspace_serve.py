"""Tests reales para el servidor paralelo frontends/workspace/serve.py."""
import json
from pathlib import Path
import subprocess
import sys
import threading
from urllib.error import HTTPError
from urllib.request import Request, urlopen

_frontends_dir = str(Path(__file__).resolve().parent.parent / 'frontends')
if _frontends_dir not in sys.path:
    sys.path.insert(0, _frontends_dir)

import pytest
from deskops.bootstrap import SLDBBootstrap
from deskops.lifecycle import write_lifecycle_graph
from deskops.operations import DeskopsOperations
from deskops.workspace import seed_desk
from workspace import serve as ws_serve


@pytest.fixture
def parallel_env(tmp_path, monkeypatch):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    root = tmp_path / 'repo'
    root.mkdir()
    subprocess.run(['git', 'init', str(root)], check=True, capture_output=True)
    subprocess.run(['git', '-C', str(root), 'config', 'user.name', 'test'], check=True)
    subprocess.run(['git', '-C', str(root), 'config', 'user.email', 'test@example.com'], check=True)

    assert SLDBBootstrap().init_local_store(root) == 0
    seed_desk(root)
    write_lifecycle_graph(root)
    ops = DeskopsOperations(root)

    src_dir = root / 'src'
    src_dir.mkdir()
    (src_dir / 'engine.py').write_text('def run_engine():\n    return 42\n', encoding='utf-8')

    t1 = ops.create_task_bundle(dict(
        title='Tarea Base Paralela',
        goal='Objetivo de prueba en servidor paralelo',
        scope='Solo workspace paralelo',
        implementation_path='frontends/workspace/serve.py',
        validation=['pytest'],
        done_when='Servidor paralelo responde con prosa y grafo',
        files=['src/engine.py:1'],
    )).task_id

    return root, t1


@pytest.fixture
def parallel_server(parallel_env):
    root, _ = parallel_env
    instance = ws_serve.make_server(0, root / '.sldb')
    thread = threading.Thread(target=instance.serve_forever, daemon=True)
    thread.start()
    yield f'http://127.0.0.1:{instance.server_port}'
    instance.shutdown()
    instance.server_close()
    thread.join()


def _get_json(base_url, path):
    req = Request(base_url + path)
    try:
        resp = urlopen(req, timeout=20)
    except HTTPError as exc:
        resp = exc
    with resp:
        return resp.status, json.loads(resp.read())


def test_parallel_workspace_overview_and_catalog(parallel_env, parallel_server):
    _, t1 = parallel_env
    status_ov, ov = _get_json(parallel_server, '/api/workspace/overview')
    assert status_ov == 200
    assert ov['ok'] is True
    assert ov['store']['total_nodes'] >= 1
    assert 'category_counts' in ov['store']
    assert ov['store']['category_counts']['tasks'] >= 1

    status_cat, cat = _get_json(parallel_server, '/api/workspace/nodes')
    assert status_cat == 200
    assert cat['ok'] is True
    ids = {n['id'] for n in cat['nodes']}
    assert f'TaskCodeDoc:{t1}' in ids


def test_parallel_workspace_node_prose_and_changes(parallel_env, parallel_server):
    _, t1 = parallel_env
    status, data = _get_json(parallel_server, f'/api/workspace/node?id=TaskDoc:{t1}&depth=1')
    assert status == 200
    assert data['ok'] is True

    doc_proj = data['projections']['document']
    sections_prose = doc_proj.get('sections_prose') or []
    assert len(sections_prose) >= 1
    assert any('Objetivo de prueba en servidor paralelo' in s.get('body', '') for s in sections_prose)

    changes_proj = data['projections']['changes']
    assert changes_proj['ok'] is True
    assert changes_proj['node_id'] == f'TaskCodeDoc:{t1}'
    assert changes_proj['content_hash'] is not None


def test_parallel_workspace_static_shell(parallel_server):
    with urlopen(parallel_server + '/', timeout=10) as resp:
        html = resp.read().decode('utf-8')
        assert resp.status == 200
        assert 'KIMUN' in html
        assert 'Knowledge Workspace' in html
    with urlopen(parallel_server + '/app.js', timeout=10) as resp_js:
        js = resp_js.read().decode('utf-8')
        assert resp_js.status == 200
        assert 'renderGraphProjection' in js
