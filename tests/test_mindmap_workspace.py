"""Pruebas reales del workspace multiproyección: sin mocks ni sustitución de servicios."""
import json
import os
from pathlib import Path
import subprocess
import sys
import threading
from urllib.error import HTTPError
from urllib.request import Request, urlopen

# Asegurar que mindmap se importe desde este worktree y no del editable de master
_frontends_dir = str(Path(__file__).resolve().parent.parent / 'frontends')
if _frontends_dir not in sys.path:
    sys.path.insert(0, _frontends_dir)
for _mod in list(sys.modules):
    if _mod == 'mindmap' or _mod.startswith('mindmap.'):
        del sys.modules[_mod]

import pytest
from deskops.bootstrap import SLDBBootstrap
from deskops.lifecycle import ensure_lifecycle_graph
from deskops.models import PillDoc, TaskDoc
from deskops.operations import DeskopsOperations
from deskops.workspace import scaffold_desk
from mindmap import serve


@pytest.fixture
def test_env(tmp_path, monkeypatch):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    root = tmp_path / 'repo'
    root.mkdir()

    # Inicializar git para pruebas de gitignore y fronteras
    subprocess.run(['git', 'init', str(root)], check=True, capture_output=True)
    subprocess.run(['git', '-C', str(root), 'config', 'user.name', 'test'], check=True)
    subprocess.run(['git', '-C', str(root), 'config', 'user.email', 'test@example.com'], check=True)

    # .gitignore real con secrets.json
    (root / '.gitignore').write_text('secrets.json\n*.secret\n', encoding='utf-8')
    (root / 'secrets.json').write_text('API_KEY=top_secret_123\n', encoding='utf-8')

    assert SLDBBootstrap().init_local_store(root) == 0
    scaffold_desk(root)
    ensure_lifecycle_graph(root)
    ops = DeskopsOperations(root)

    # Archivo de código real y archivo sin extensión
    code_dir = root / 'src'
    code_dir.mkdir(parents=True)
    sample_py = code_dir / 'sample.py'
    sample_py.write_text('def hello():\n    print("line 2")\n    print("line 3")\n    return "world"\n', encoding='utf-8')
    makefile = root / 'Makefile'
    makefile.write_text('all:\n\t@echo hello\n', encoding='utf-8')

    # Symlink hacia afuera del repo
    outside_file = tmp_path / 'outside.txt'
    outside_file.write_text('contenido exterior\n', encoding='utf-8')
    escaped_symlink = root / 'leak_symlink.txt'
    try:
        escaped_symlink.symlink_to(outside_file)
    except OSError:
        pass

    # Cadena y ciclo real: task_c -> task_b -> task_a -> task_c
    task_c = ops.create_task_bundle(dict(
        title='Tarea C',
        goal='Tercer eslabon',
        scope='Desk temporal',
        implementation_path='C',
        validation=['pytest'],
        done_when='C listo'
    )).task_id

    task_b = ops.create_task_bundle(dict(
        title='Tarea B',
        goal='Segundo eslabon',
        scope='Desk temporal',
        implementation_path='B',
        validation=['pytest'],
        done_when='B listo',
        depends_on=[task_c]
    )).task_id

    task_a = ops.create_task_bundle(dict(
        title='Tarea A',
        goal='Primer eslabon con codigo',
        scope='Desk temporal',
        implementation_path='A',
        validation=['pytest'],
        done_when='A listo',
        depends_on=[task_b],
        files=['src/sample.py', 'src/sample.py:3', 'Makefile', 'secrets.json', 'leak_symlink.txt', 'src/missing.py', 'src/'],
        references=['atom-identificador-logico', '/etc/passwd', '../outside.py']
    )).task_id

    # Cerrar el ciclo: task_c depende de task_a
    c_path = root / 'desk' / 'tasks' / f'{task_c}.md'
    c_payload = ops._read_doc(c_path, TaskDoc)
    c_payload['depends_on'] = [task_a]
    ops._write_doc(c_path, TaskDoc, c_payload)

    # Crear una PillDoc con el MISMO id y filename que task_a para probar colisión / ambigüedad
    pill_path = root / 'desk' / 'contexts' / f'{task_a}.md'
    pill_payload = {
        'id': task_a,
        'title': 'Pill con id compartido',
        'tags': ['workspace:desk'],
        'what': 'Definicion de guardarrail',
        'why': 'Justificacion',
        'when': 'Siempre',
        'where': 'Todo el repositorio',
        'how': 'Aplicar reglas',
        'how_not': 'No omitir verificaciones'
    }
    ops._write_new_doc(pill_path, PillDoc, pill_payload)
    ops._track_created_document(PillDoc, pill_path, task_a)

    return root, ops, task_a, task_b, task_c


@pytest.fixture
def server(test_env):
    root, _, _, _, _ = test_env
    instance = serve.make_server(0, root / '.sldb')
    thread = threading.Thread(target=instance.serve_forever, daemon=True)
    thread.start()
    yield 'http://127.0.0.1:' + str(instance.server_port)
    instance.shutdown()
    instance.server_close()
    thread.join()


def http_get(server, path):
    request = Request(server + path)
    try:
        response = urlopen(request, timeout=30)
    except HTTPError as exc:
        response = exc
    with response:
        return response.status, json.loads(response.read())


def test_workspace_node_success(test_env, server):
    root, ops, task_a, task_b, task_c = test_env
    # Consultar por identidad canónica
    status, data = http_get(server, f'/api/workspace/node?id=TaskDoc:{task_a}&depth=1')
    assert status == 200
    assert data['ok'] is True

    # Nodo
    node = data['node']
    assert node['id'] == f'TaskDoc:{task_a}'
    assert node['model_name'] == 'TaskDoc'
    assert node['name'] == task_a
    assert node['content_hash'] is not None

    # Proyección Document
    doc_proj = data['projections']['document']
    assert doc_proj['ok'] is True
    assert doc_proj['payload']['title'] == 'Tarea A'

    # Proyección Graph (1 hop)
    graph_proj = data['projections']['graph']
    assert graph_proj['ok'] is True
    assert graph_proj['depth'] == 1
    node_ids = {n['id'] for n in graph_proj['nodes']}
    assert f'TaskDoc:{task_a}' in node_ids
    assert f'TaskDoc:{task_b}' in node_ids  # Outgoing relation
    assert f'TaskDoc:{task_c}' in node_ids  # Incoming relation

    # Proyección Code
    code_proj = data['projections']['code']
    assert code_proj['ok'] is True
    files = {f['reference']: f for f in code_proj['files']}

    # Código válido
    assert files['src/sample.py']['status'] == 'ok'
    assert files['src/sample.py']['language'] == 'python'
    assert 'def hello():' in files['src/sample.py']['content']
    assert files['src/sample.py']['line_count'] == 4

    # Fragmento de código con :line
    assert files['src/sample.py:3']['status'] == 'ok'
    assert files['src/sample.py:3']['fragment_line'] == 3
    assert 'print("line 3")' in files['src/sample.py:3']['fragment_content']

    # Archivo sin extensión (Makefile)
    assert files['Makefile']['status'] == 'ok'

    # Gitignored -> protegido
    assert files['secrets.json']['status'] == 'protegido'
    assert 'API_KEY' not in files['secrets.json'].get('content', '')

    # Symlink hacia afuera del repo -> fuera_del_repo (incondicional en Linux)
    assert files['leak_symlink.txt']['status'] == 'fuera_del_repo'

    # Fronteras y clasificaciones
    assert files['src/missing.py']['status'] == 'no_existe'
    assert files['src/']['status'] == 'directorio'
    assert files['atom-identificador-logico']['status'] == 'no_es_ruta'
    assert files['/etc/passwd']['status'] == 'fuera_del_repo'
    assert files['../outside.py']['status'] == 'fuera_del_repo'

    # Contexto
    context = data['context']
    assert context['id'] == f'TaskDoc:{task_a}'
    assert context['model_name'] == 'TaskDoc'
    assert context['content_hash'] == node['content_hash']
    assert len(context['incoming_relations']) >= 1
    assert len(context['outgoing_relations']) >= 1
    assert context['problems_report']['ok'] is True


def _store_snapshot(root):
    import hashlib
    return {
        str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest()
        for p in sorted((root / '.sldb').rglob('*')) if p.is_file()
    }


def test_workspace_cycle_and_2hops_real_edges(test_env, server):
    root, ops, task_a, task_b, task_c = test_env
    # Conducta retirada: el GET ya no reconstruye el indice. La preparacion del store es
    # explicita y externa al request (rebuild_edges publico), antes del GET.
    from sldb.api import rebuild_edges
    rebuild_edges(root / '.sldb', pythonpath=str(root), wait=True)
    before = _store_snapshot(root)
    # A depth=2, el grafo recorre el ciclo completo A -> B -> C -> A
    status, data = http_get(server, f'/api/workspace/node?id=TaskDoc:{task_a}&depth=2')
    assert status == 200
    graph_proj = data['projections']['graph']
    node_ids = [n['id'] for n in graph_proj['nodes']]
    # Sin duplicados en nodos
    assert len(node_ids) == len(set(node_ids))
    assert f'TaskDoc:{task_a}' in node_ids
    assert f'TaskDoc:{task_b}' in node_ids
    assert f'TaskDoc:{task_c}' in node_ids

    # Sin duplicados en aristas
    edge_keys = [(e['source'], e['target'], e['type']) for e in graph_proj['edges']]
    assert len(edge_keys) == len(set(edge_keys))
    # Comprobar que existen las aristas reales
    assert any(e['source'] == f'TaskDoc:{task_a}' and e['target'] == f'TaskDoc:{task_b}' for e in graph_proj['edges'])
    assert any(e['source'] == f'TaskDoc:{task_b}' and e['target'] == f'TaskDoc:{task_c}' for e in graph_proj['edges'])
    assert any(e['source'] == f'TaskDoc:{task_c}' and e['target'] == f'TaskDoc:{task_a}' for e in graph_proj['edges'])
    # preparado y canonico: la lectura no escribio nada
    assert _store_snapshot(root) == before


def test_workspace_cycle_on_unprepared_store_is_rejected_not_rebuilt(test_env, server):
    root, ops, task_a, task_b, task_c = test_env
    # Store sin preparar: el indice de aristas de un documento atrasado (shard ausente)
    shard = root / '.sldb' / 'runtime' / 'edges' / 'TaskDoc' / f'{task_c}.yaml'
    assert shard.is_file()
    shard.unlink()
    before = _store_snapshot(root)
    status, data = http_get(server, f'/api/workspace/node?id=TaskDoc:{task_a}&depth=2')
    assert status == 200
    graph_proj = data['projections']['graph']
    assert graph_proj['ok'] is False and graph_proj['estado'] == 'store_no_preparado'
    assert f'TaskDoc:{task_c}' in graph_proj['stale'] and graph_proj['nodes'] == [] and graph_proj['edges'] == []
    assert data['context']['relations_state']['estado'] == 'store_no_preparado'
    assert data['context']['incoming_relations'] is None
    # nada se escribio: ni el shard ni ningun otro archivo del store
    assert not shard.exists()
    assert _store_snapshot(root) == before


def test_workspace_ambiguous_name_resolution(test_env, server):
    root, ops, task_a, task_b, task_c = test_env
    # Pedir el nombre bare {task_a} debe rechazar con 400 por ser ambiguo (TaskDoc y PillDoc)
    status, data = http_get(server, f'/api/workspace/node?id={task_a}')
    assert status == 400
    assert data['ok'] is False
    assert 'ambigua' in data['error'].lower()

    # Pedir con Model:name debe resolver limpiamente a 200
    status_task, data_task = http_get(server, f'/api/workspace/node?id=TaskDoc:{task_a}')
    assert status_task == 200
    assert data_task['node']['model_name'] == 'TaskDoc'

    status_pill, data_pill = http_get(server, f'/api/workspace/node?id=PillDoc:{task_a}')
    assert status_pill == 200
    assert data_pill['node']['model_name'] == 'PillDoc'


def test_workspace_broken_ir_keeps_graph(test_env, server):
    root, ops, task_a, task_b, task_c = test_env
    # Escribir documento con frontmatter pero sin headings requeridos para que document_ir falle de forma natural (validation error)
    broken_doc = root / f'desk/tasks/{task_b}.md'
    broken_doc.write_text(f'''---
id: {task_b}
status: active
title: Tarea B
---
No headings here
''', encoding='utf-8')

    status, data = http_get(server, f'/api/workspace/node?id=TaskDoc:{task_b}&depth=1')
    assert status == 200
    assert data['ok'] is True
    # La proyección document debe fallar de forma aislada
    assert data['projections']['document']['ok'] is False
    assert data['projections']['document']['error'] is not None
    # Pero el grafo y el contexto siguen vivos
    assert data['projections']['graph']['ok'] is True
    assert len(data['projections']['graph']['nodes']) >= 1
    assert data['context']['id'] == f'TaskDoc:{task_b}'


def test_workspace_canonical_identity(test_env, server):
    root, ops, task_a, task_b, task_c = test_env
    status1, data1 = http_get(server, f'/api/workspace/node?id=TaskDoc:{task_b}')
    status2, data2 = http_get(server, f'/api/workspace/node?id={task_b}')
    assert status1 == 200 and status2 == 200
    assert data1['node']['id'] == data2['node']['id'] == f'TaskDoc:{task_b}'


def test_workspace_node_not_found(server):
    status, data = http_get(server, '/api/workspace/node?id=TaskDoc:no-existe')
    assert status == 404
    assert data['ok'] is False
    assert 'no encontrado' in data['error'].lower()


def test_workspace_depth_validation(test_env, server):
    root, ops, task_a, task_b, task_c = test_env
    status, data = http_get(server, f'/api/workspace/node?id=TaskDoc:{task_a}&depth=3')
    assert status == 400
    assert data['ok'] is False
    assert 'depth' in data['error']


def test_workspace_nodes_catalog(test_env, server):
    root, ops, task_a, task_b, task_c = test_env
    status, data = http_get(server, '/api/workspace/nodes')
    assert status == 200
    assert data['ok'] is True
    assert 'nodes' in data
    ids = [n['id'] for n in data['nodes']]
    assert f'TaskDoc:{task_a}' in ids


def test_workspace_remote_mode_returns_501():
    # Probar que en backend remote responde 501 sin llamar a sldb local
    handler_cls = type('RemoteEditorHandler', (serve.ProxyHandler,), {
        'backend_mode': 'remote',
        'workspace_routes': None,
    })
    server_inst = serve.ThreadingHTTPServer(('127.0.0.1', 0), handler_cls)
    t = threading.Thread(target=server_inst.serve_forever, daemon=True)
    t.start()
    url = f'http://127.0.0.1:{server_inst.server_port}'
    try:
        status, data = http_get(url, '/api/workspace/node?id=any')
        assert status == 501
        assert data['ok'] is False
        assert 'remote' in data['error'].lower()
    finally:
        server_inst.shutdown()
        server_inst.server_close()
        t.join()


def test_workspace_remote_make_server_subprocess():
    # Validar en subproceso que make_server en modo remote arranca limpiamente aun si sldb no está disponible
    code = (
        "import sys; "
        "sys.modules['sldb'] = None; "
        "import mindmap.serve as s; "
        "s.BACKEND_MODE = 'remote'; "
        "srv = s.make_server(0, 'http://127.0.0.1:9999'); "
        "assert srv is not None; "
        "srv.server_close(); "
        "print('REMOTE_MAKE_SERVER_OK')"
    )
    env = os.environ.copy()
    env['PYTHONPATH'] = str(Path(__file__).resolve().parent.parent / 'frontends')
    res = subprocess.run(['python3', '-c', code], capture_output=True, text=True, env=env)
    assert res.returncode == 0, f"Error en subproceso remote make_server: {res.stderr}"
    assert 'REMOTE_MAKE_SERVER_OK' in res.stdout


def test_workspace_path_traversal_rejected(server):
    status, data = http_get(server, '/api/workspace/node?id=TaskDoc:../../../../tmp/sfspec/exp/evil')
    assert status == 400
    assert data['ok'] is False
    assert 'inválido' in data['error'].lower() or 'escape' in data['error'].lower()


def test_workspace_rejected_relation_reported_in_problems(test_env, server):
    root, ops, task_a, task_b, task_c = test_env
    from sldb.api import create_document

    # Crear una RelationDoc que apunte a un nodo inexistente
    create_document(
        store=root / '.sldb',
        model_name='RelationDoc',
        path='desk/relations/bad-rel-test.yaml',
        payload={
            'id': 'bad-rel-test',
            'title': 'Bad Relation Test',
            'status': 'active',
            'source_id': f'TaskDoc:{task_a}',
            'target_id': 'TaskDoc:no-existe',
            'relation_type': 'type-task_activates'
        }
    )

    # Consultar la RelationDoc rechazada misma
    status_rel, data_rel = http_get(server, '/api/workspace/node?id=RelationDoc:bad-rel-test&depth=1')
    assert status_rel == 200
    report_rel = data_rel['context']['problems_report']
    assert report_rel['ok'] is False
    assert len(report_rel['problems']) >= 1
    assert any('TaskDoc:no-existe' in p for p in report_rel['problems'])
    assert report_rel['store_problems_count'] >= 1

    # Consultar el nodo source task_a: store_problems_count debe alertar del problema global
    status_a, data_a = http_get(server, f'/api/workspace/node?id=TaskDoc:{task_a}&depth=1')
    assert status_a == 200
    assert data_a['context']['problems_report']['store_problems_count'] >= 1


def test_workspace_broken_doc_catalog_degrades_that_entry_and_keeps_healthy_ones(test_env, server):
    root, ops, task_a, task_b, task_c = test_env
    # Corromper task_c eliminando sus campos para romper la validación pydantic del store
    broken_doc = root / f'desk/tasks/{task_c}.md'
    broken_doc.write_text('---\nid: invalid\nstatus: active\n---\nSin titulo requerido\n', encoding='utf-8')

    # El catálogo responde 200: la entrada corrupta conserva identidad y ruta, con estado y causa recibida
    status, data = http_get(server, '/api/workspace/nodes')
    assert status == 200
    assert data['ok'] is True
    by_id = {n['id']: n for n in data['nodes']}
    broken = by_id[f'TaskDoc:{task_c}']
    assert broken['estado'] == 'modelo_no_carga'
    assert broken['causa'] and isinstance(broken['causa'], str)
    assert broken['name'] == task_c and broken['model_name'] == 'TaskDoc'
    assert broken['path'] == f'desk/tasks/{task_c}.md'
    # los documentos sanos siguen intactos en el catálogo
    for healthy in (task_a, task_b):
        entry = by_id[f'TaskDoc:{healthy}']
        assert entry['estado'] == 'ok'
        assert 'causa' not in entry
        assert entry['title']


def test_workspace_broken_and_healthy_docs_coexistence(test_env, server):
    root, ops, task_a, task_b, task_c = test_env
    # Corromper task_c en disco
    broken_doc = root / f'desk/tasks/{task_c}.md'
    broken_doc.write_text('---\nid: invalid\nstatus: active\n---\nSin titulo\n', encoding='utf-8')

    # 1. Documento roto task_c: debe responder 200 via fallback de identidad
    status_broken, data_broken = http_get(server, f'/api/workspace/node?id=TaskDoc:{task_c}&depth=1')
    assert status_broken == 200
    assert data_broken['ok'] is True
    assert data_broken['node']['is_degraded'] is True
    assert data_broken['projections']['document']['ok'] is False
    # Código debe indicar no disponible explícitamente
    assert data_broken['projections']['code']['ok'] is False
    assert 'no disponible' in data_broken['projections']['code']['error'].lower()
    # Grafo y contexto siguen vivos
    assert data_broken['projections']['graph']['ok'] is True
    assert data_broken['context']['id'] == f'TaskDoc:{task_c}'

    # 2. Documento sano task_a: conserva Code, Graph y metadata
    status_sano, data_sano = http_get(server, f'/api/workspace/node?id=TaskDoc:{task_a}&depth=1')
    assert status_sano == 200
    assert data_sano['ok'] is True
    assert data_sano['node']['id'] == f'TaskDoc:{task_a}'
    assert data_sano['projections']['graph']['ok'] is True
    assert data_sano['projections']['code']['ok'] is True
    assert data_sano['context']['id'] == f'TaskDoc:{task_a}'


