"""WS13.2: explorador de documentos modelados y no modelados, y catalogo degradado.

Sin mocks ni stubs: repos git, stores sldb, desks y servidores HTTP reales en directorios
temporales. Los stores se preparan fuera del request. El modelo no importable es real: su
modulo vive en un directorio que el servidor no tiene en su ruta de importacion.
"""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import threading
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen

_frontends_dir = str(Path(__file__).resolve().parent.parent / 'frontends')
if _frontends_dir not in sys.path:
    sys.path.insert(0, _frontends_dir)
for _mod in list(sys.modules):
    if _mod == 'mindmap' or _mod.startswith('mindmap.'):
        del sys.modules[_mod]

import pytest
from deskops.bootstrap import SLDBBootstrap
from deskops.lifecycle import ensure_lifecycle_graph
from deskops.operations import DeskopsOperations
from deskops.workspace import scaffold_desk
from mindmap import serve
from sldb.api.records.extract import extract_sections

BAD_MODEL_SRC = '''from __future__ import annotations
from pydantic import Field
from sldb.models.structured_doc import StructuredNLDoc


class Bitacora(StructuredNLDoc):
    __semantics__ = {"type": ["log"], "layer": ["notes"]}
    __template__ = """---
id: ⸢rev•id⸥
---

# ⸢rev•title⸥

## Entrada

⸢rev•entry⸥
""".strip()

    id: str = Field(description="Id.")
    title: str = Field(description="Titulo.")
    entry: str = Field(description="Entrada.")
'''

# Se ejecuta en un proceso aparte: el modulo del modelo solo existe en ese proceso.
PREPARE_SCRIPT = '''
import sys
from pathlib import Path
from sldb.api.model_registry.add_model import add_model
from sldb.api.documents.create_document import create_document
root, models = Path(sys.argv[1]), sys.argv[2]
add_model(root / '.sldb', 'ws132_bitacora:Bitacora', pythonpath=models)
create_document(root / '.sldb', 'Bitacora', 'bitacoras/b1.md',
                {'id': 'b1', 'title': 'Bitacora uno', 'entry': 'Texto de la entrada.'}, pythonpath=models)
'''


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def git_init(root: Path) -> None:
    subprocess.run(['git', 'init', str(root)], check=True, capture_output=True)
    subprocess.run(['git', '-C', str(root), 'config', 'user.name', 'test'], check=True)
    subprocess.run(['git', '-C', str(root), 'config', 'user.email', 'test@example.com'], check=True)


def prepare_store(root: Path) -> DeskopsOperations:
    assert SLDBBootstrap().init_local_store(root) == 0
    scaffold_desk(root)
    ensure_lifecycle_graph(root)
    return DeskopsOperations(root)


def add_bad_model(root: Path, tmp_path: Path) -> None:
    models = tmp_path / 'modelos'
    models.mkdir()
    (models / 'ws132_bitacora.py').write_text(BAD_MODEL_SRC, encoding='utf-8')
    res = subprocess.run([sys.executable, '-c', PREPARE_SCRIPT, str(root), str(models)], capture_output=True, text=True)
    assert res.returncode == 0, res.stderr
    # Comprobacion de que de verdad no es importable desde este proceso ni desde el servidor.
    probe = subprocess.run([sys.executable, '-c', 'import ws132_bitacora'], capture_output=True, text=True)
    assert probe.returncode != 0 and 'ws132_bitacora' in probe.stderr


def write(root: Path, rel: str, text: str = '# t\n') -> None:
    p = root / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text, encoding='utf-8')


@pytest.fixture
def env(tmp_path, monkeypatch):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    monkeypatch.delenv('WORKSPACE_EXPLORER_ROOTS', raising=False)
    monkeypatch.delenv('SLDB_PYTHONPATH', raising=False)
    root = tmp_path / 'repo'
    root.mkdir()
    git_init(root)
    (root / '.gitignore').write_text('desk/privado/\nignorado.md\n', encoding='utf-8')
    ops = prepare_store(root)
    task = ops.create_task_bundle(dict(
        title='Tarea sana', goal='Meta', scope='Desk temporal', implementation_path='P',
        validation=['pytest'], done_when='listo',
    )).task_id
    add_bad_model(root, tmp_path)

    write(root, 'desk/notas/uno.md', '# Uno\n\nTexto uno.\n')
    write(root, 'desk/notas/sub/dos.md', '# Dos\n')
    write(root, 'desk/notas/solo.txt', 'no es markdown\n')
    write(root, 'docs/faq.md', '# FAQ\n\n## Pregunta\n\nRespuesta.\n')
    write(root, 'fuera/otro.md', '# Fuera de las rutas permitidas\n')
    write(root, 'desk/.oculto/x.md')
    write(root, 'desk/__pycache__/y.md')
    write(root, 'desk/node_modules/z.md')
    write(root, 'desk/privado/ign.md', '# ignorado por git\n')
    write(root, 'desk/ignorado.md', '# ignorado por git\n')
    write(root, 'desk/.punto.md')
    (root / 'desk' / 'enlace-dir').symlink_to(root / 'desk' / 'notas', target_is_directory=True)
    outside = tmp_path / 'exterior.md'
    outside.write_text('# exterior\n', encoding='utf-8')
    (root / 'desk' / 'escape.md').symlink_to(outside)
    (root / 'desk' / 'interno.md').symlink_to(root / 'docs' / 'faq.md')
    return root, task


def commit_all(root: Path) -> None:
    subprocess.run(['git', '-C', str(root), 'add', '-A'], check=True, capture_output=True)
    subprocess.run(['git', '-C', str(root), 'commit', '-q', '-m', 'base'], check=True, capture_output=True)


class Srv:
    def __init__(self, root: Path):
        self.instance = serve.make_server(0, root / '.sldb')
        self.thread = threading.Thread(target=self.instance.serve_forever, daemon=True)
        self.thread.start()
        self.url = 'http://127.0.0.1:' + str(self.instance.server_port)

    def close(self):
        self.instance.shutdown()
        self.instance.server_close()
        self.thread.join()


@pytest.fixture
def server(env):
    srv = Srv(env[0])
    yield srv.url
    srv.close()


def request(server, path, method='GET'):
    try:
        response = urlopen(Request(server + path, method=method, data=b'{}' if method != 'GET' else None), timeout=60)
    except HTTPError as exc:
        response = exc
    with response:
        body = response.read()
        try:
            return response.status, json.loads(body)
        except ValueError:
            return response.status, {'raw': body.decode('utf-8', errors='replace')}


def get(server, path):
    return request(server, path)


def full_state(root: Path) -> dict:
    store, docs = {}, {}
    for p in sorted((root / '.sldb').rglob('*')):
        if p.is_file():
            store[str(p.relative_to(root))] = sha(p.read_bytes())
    for p in sorted(root.rglob('*')):
        rel = p.relative_to(root)
        if rel.parts[0] in ('.git', '.sldb') or p.is_dir() or p.is_symlink():
            continue
        docs[str(rel)] = sha(p.read_bytes())
    git = None
    if (root / '.git').exists():
        porcelain = subprocess.run(['git', '-C', str(root), 'status', '--porcelain'], capture_output=True, text=True).stdout
        head = subprocess.run(['git', '-C', str(root), 'rev-parse', 'HEAD'], capture_output=True, text=True).stdout.strip()
        git = (porcelain, head)
    return {'store': store, 'docs': docs, 'git': git}


def paths(data):
    return [e['path'] for e in data['unmodeled']]


# ---------------------------------------------------------------- listado

def test_explorer_lists_modeled_and_unmodeled_without_knowing_ids(env, server):
    root, task = env
    status, data = get(server, '/api/workspace/explorer')
    assert status == 200 and data['ok'] is True
    assert data['repo'] == 'local' and data['roots'] == ['desk', 'docs']
    assert data['roots_invalid'] == [] and data['sin_git'] is False and data['truncado'] is False
    modeled = {m['id']: m for m in data['modeled']}
    assert modeled[f'TaskDoc:{task}']['path'] == f'desk/tasks/{task}.md'
    assert modeled[f'TaskDoc:{task}']['estado'] == 'ok'
    # los modelados salen de los indices aunque esten fuera de las rutas permitidas
    assert modeled['Bitacora:b1']['path'] == 'bitacoras/b1.md' and modeled['Bitacora:b1']['model_name'] == 'Bitacora'
    # orden: modelo y nombre
    assert [m['id'] for m in data['modeled']] == sorted(modeled, key=lambda i: (i.split(':')[0], i.split(':')[1]))
    got = paths(data)
    assert got == sorted(got)
    assert {'desk/notas/uno.md', 'desk/notas/sub/dos.md', 'docs/faq.md'} <= set(got)
    # un archivo rastreado no se repite como no modelado (Model:name prevalece)
    assert f'desk/tasks/{task}.md' not in got
    for e in data['unmodeled']:
        assert set(e) == {'path', 'name'}


def test_explorer_open_results_with_the_reader(env, server):
    root, task = env
    _, data = get(server, '/api/workspace/explorer')
    entry = next(e for e in data['unmodeled'] if e['path'] == 'docs/faq.md')
    status, src = get(server, f'/api/workspace/source?path={quote(entry["path"])}')
    assert status == 200 and src['identity']['kind'] == 'unmodeled'
    assert src['text'].encode() == (root / 'docs/faq.md').read_bytes()
    mod = next(m for m in data['modeled'] if m['id'] == f'TaskDoc:{task}')
    status, src = get(server, f'/api/workspace/source?id={quote(mod["id"])}')
    assert status == 200 and src['identity']['kind'] == 'modeled'


def test_explorer_filters_hidden_ignored_symlinks_and_extensions(env, server):
    root, task = env
    _, data = get(server, '/api/workspace/explorer')
    got = set(paths(data))
    for excluded in (
        'desk/.oculto/x.md', 'desk/__pycache__/y.md', 'desk/node_modules/z.md', 'desk/.punto.md',
        'desk/privado/ign.md', 'desk/ignorado.md', 'desk/notas/solo.txt',
        'desk/escape.md',                      # symlink de archivo que resuelve fuera de la raiz
        'desk/enlace-dir/uno.md',              # los directorios symlink no se siguen
        'fuera/otro.md',                       # fuera de las rutas permitidas
    ):
        assert excluded not in got, excluded
    assert not any(p.startswith('desk/enlace-dir') for p in got)
    # symlink de archivo, aunque resuelva dentro de la raiz: no se lista (una identidad por archivo)
    assert 'desk/interno.md' not in got and 'docs/faq.md' in got
    # y el guardia de ruta del lector sigue rechazando lo que no se lista
    status, src = get(server, f'/api/workspace/source?path={quote("desk/escape.md")}')
    assert status == 403 and src['estado'] == 'fuera_del_repo'
    status, src = get(server, f'/api/workspace/source?path={quote("desk/ignorado.md")}')
    assert status == 403 and src['estado'] == 'protegido'


def test_explorer_ignores_client_parameters(env, server):
    _, base = get(server, '/api/workspace/explorer')
    for q in ('?path=/etc', '?root=fuera', '?path=../x&roots=fuera', '?id=TaskDoc:x'):
        status, data = get(server, '/api/workspace/explorer' + q)
        assert status == 200 and data == base


def test_explorer_rejects_non_get_methods(env, server):
    root, task = env
    before = full_state(root)
    for method in ('POST', 'PUT', 'DELETE', 'PATCH'):
        status, data = request(server, '/api/workspace/explorer', method)
        assert status in (404, 405, 501), (method, status)  # el servidor no enruta no-GET al workspace
    assert full_state(root) == before


def test_allowlist_env_invalid_entries_are_reported_and_missing_ones_omitted(env, tmp_path, monkeypatch):
    root, task = env
    (root / 'enlace-raiz').symlink_to(root / 'docs', target_is_directory=True)
    monkeypatch.setenv('WORKSPACE_EXPLORER_ROOTS', f'fuera, /etc ,../exterior, enlace-raiz,desk/../docs,noexiste,desk/notas, ,{root}')
    srv = Srv(root)
    try:
        status, data = get(srv.url, '/api/workspace/explorer')
    finally:
        srv.close()
    assert status == 200
    assert data['roots'] == ['fuera', 'desk/notas']
    invalid = {e['entry']: e['reason'] for e in data['roots_invalid']}
    assert invalid == {
        '/etc': 'ruta_absoluta', '../exterior': 'contiene_..', 'enlace-raiz': 'symlink',
        'desk/../docs': 'contiene_..', str(root): 'ruta_absoluta',
    }
    assert 'noexiste' not in invalid
    assert set(paths(data)) == {'fuera/otro.md', 'desk/notas/uno.md', 'desk/notas/sub/dos.md'}


def test_allowlist_defaults_omit_absent_desk_and_docs(tmp_path, monkeypatch):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    monkeypatch.delenv('WORKSPACE_EXPLORER_ROOTS', raising=False)
    root = tmp_path / 'repo'
    root.mkdir()
    git_init(root)
    prepare_store(root)
    import shutil
    shutil.rmtree(root / 'desk')
    write(root, 'otra/n.md')
    srv = Srv(root)
    try:
        status, data = get(srv.url, '/api/workspace/explorer')
    finally:
        srv.close()
    assert status == 200 and data['roots'] == [] and data['roots_invalid'] == [] and data['unmodeled'] == []


def test_refresh_shows_new_modeled_and_unmodeled_without_restart(env, server, tmp_path):
    root, task = env
    _, before = get(server, '/api/workspace/explorer')
    ops = DeskopsOperations(root)
    new_task = ops.create_task_bundle(dict(
        title='Tarea nueva', goal='Meta', scope='S', implementation_path='P', validation=['pytest'], done_when='ok',
    )).task_id
    write(root, 'docs/nuevo.md', '# Nuevo\n')
    _, after = get(server, '/api/workspace/explorer')
    assert f'TaskDoc:{new_task}' not in {m['id'] for m in before['modeled']}
    assert f'TaskDoc:{new_task}' in {m['id'] for m in after['modeled']}
    assert 'docs/nuevo.md' not in paths(before) and 'docs/nuevo.md' in paths(after)
    assert f'desk/tasks/{new_task}.md' not in paths(after)
    # y el catalogo /nodes tambien
    _, nodes = get(server, '/api/workspace/nodes')
    assert f'TaskDoc:{new_task}' in {n['id'] for n in nodes['nodes']}


def test_without_git_repo_reports_sin_git_and_lists(tmp_path, monkeypatch):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    monkeypatch.delenv('WORKSPACE_EXPLORER_ROOTS', raising=False)
    root = tmp_path / 'sin-git'
    root.mkdir()
    prepare_store(root)
    write(root, 'docs/a.md')
    write(root, 'desk/ignorado.md')
    assert not (root / '.git').exists()
    srv = Srv(root)
    try:
        before = full_state(root)
        status, data = get(srv.url, '/api/workspace/explorer')
        assert full_state(root) == before
    finally:
        srv.close()
    assert status == 200 and data['sin_git'] is True and data['ignorados_error'] is None
    assert {'docs/a.md', 'desk/ignorado.md'} <= set(paths(data))


def test_failed_ignore_check_fails_closed(tmp_path, monkeypatch):
    """Un .git que existe pero no es un repo valido: git check-ignore falla de verdad."""
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    monkeypatch.delenv('WORKSPACE_EXPLORER_ROOTS', raising=False)
    root = tmp_path / 'roto'
    root.mkdir()
    prepare_store(root)
    write(root, 'docs/a.md')
    (root / '.git').mkdir()
    srv = Srv(root)
    try:
        status, data = get(srv.url, '/api/workspace/explorer')
    finally:
        srv.close()
    assert status == 200 and data['ignorados_error']
    assert data['unmodeled'] == []
    assert data['modeled'] and all(m['estado'] == 'protegido' for m in data['modeled'])


def test_truncation_flag_at_the_limit(tmp_path, monkeypatch):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    monkeypatch.setenv('WORKSPACE_EXPLORER_ROOTS', 'docs')
    root = tmp_path / 'grande'
    root.mkdir()
    git_init(root)
    prepare_store(root)
    for i in range(5000):
        write(root, f'docs/d{i // 500}/f{i:05d}.md', '#\n')
    srv = Srv(root)
    try:
        _, exact = get(srv.url, '/api/workspace/explorer')
        write(root, 'docs/extra.md')
        _, over = get(srv.url, '/api/workspace/explorer')
    finally:
        srv.close()
    assert len(exact['unmodeled']) == 5000 and exact['truncado'] is False and exact['limite'] == 5000
    assert len(over['unmodeled']) == 5000 and over['truncado'] is True


# ---------------------------------------------------------------- inmutabilidad

def test_every_get_leaves_store_documents_and_git_unchanged(env, server):
    root, task = env
    commit_all(root)
    write(root, 'docs/sin-rastrear.md', '# sin rastrear\n')
    urls = [
        '/api/workspace/explorer', '/api/workspace/nodes',
        f'/api/workspace/source?id=TaskDoc:{task}', '/api/workspace/source?id=Bitacora:b1',
        '/api/workspace/source?path=docs/faq.md', '/api/workspace/source?path=desk/escape.md',
        f'/api/workspace/node?id=TaskDoc:{task}&depth=2', '/api/workspace/node?id=Bitacora:b1&depth=1',
    ]
    for url in urls:
        before = full_state(root)
        get(server, url)
        assert full_state(root) == before, f'GET modifico store, documentos o git: {url}'


# ---------------------------------------------------------------- catalogo degradado

def test_unimportable_model_does_not_take_down_the_catalog(env, server):
    root, task = env
    status, nodes = get(server, '/api/workspace/nodes')
    assert status == 200 and nodes['ok'] is True
    by_id = {n['id']: n for n in nodes['nodes']}
    bad = by_id['Bitacora:b1']
    assert bad['estado'] == 'modelo_no_carga' and bad['path'] == 'bitacoras/b1.md'
    assert bad['model_name'] == 'Bitacora' and bad['name'] == 'b1'
    # la causa recibida, tal cual: texto de la excepcion, no una etiqueta inventada
    assert 'ws132_bitacora' in bad['causa']
    good = by_id[f'TaskDoc:{task}']
    assert good['estado'] == 'ok' and good['title'] == 'Tarea sana' and 'causa' not in good


def test_unimportable_model_source_is_safe_with_cause_and_sections(env, server):
    root, task = env
    status, src = get(server, '/api/workspace/source?id=Bitacora:b1')
    assert status == 200 and src['ok'] is True
    raw = (root / 'bitacoras/b1.md').read_bytes()
    assert src['text'].encode() == raw and src['revision'] == sha(raw)
    assert src['identity']['kind'] == 'modeled' and src['identity']['id'] == 'Bitacora:b1'
    assert src['degraded'] is True and 'ws132_bitacora' in src['degraded_reason']
    assert src['ir'] is None and 'ws132_bitacora' in src['ir_error']
    expected = [(s.title, s.level, s.line_start, s.line_end) for s in extract_sections(src['text'])]
    assert [(s['title'], s['level'], s['line_start'], s['line_end']) for s in src['sections']] == expected
    assert src['fields'] == [] and src['descriptor'] is None
    # el sano sigue entero
    status, ok = get(server, f'/api/workspace/source?id=TaskDoc:{task}')
    assert status == 200 and ok['degraded'] is False and ok['ir'] is not None
    # por ruta, el rastreado se abre igual de degradado
    status, by_path = get(server, '/api/workspace/source?path=bitacoras/b1.md')
    assert status == 200 and by_path['degraded'] is True and by_path['identity']['id'] == 'Bitacora:b1'


def test_unimportable_model_node_is_200_degraded_not_500(env, server):
    status, node = get(server, '/api/workspace/node?id=Bitacora:b1&depth=1')
    assert status == 200 and node['ok'] is True
    assert node['node']['is_degraded'] is True
    assert node['context']['is_degraded'] is True
    assert 'ws132_bitacora' in node['context']['degraded_reason']
    assert 'ws132_bitacora' in node['projections']['document']['error']
    # sano: no degradado
    healthy = get(server, f'/api/workspace/node?id=TaskDoc:{env[1]}&depth=1')[1]
    assert healthy['node']['is_degraded'] is False and healthy['context']['degraded_reason'] is None
    assert node['context']['id'] == 'Bitacora:b1'


def test_explorer_lists_unimportable_model_document_with_its_guard_state(env, server):
    status, data = get(server, '/api/workspace/explorer')
    assert status == 200
    m = next(m for m in data['modeled'] if m['id'] == 'Bitacora:b1')
    assert m['estado'] == 'ok' and m['path'] == 'bitacoras/b1.md'


def test_missing_store_gives_error_and_creates_nothing(tmp_path, monkeypatch):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    root = tmp_path / 'nada'
    root.mkdir()
    srv = Srv(root)  # arrancar el servidor es del operador y crea el directorio del store
    import shutil
    shutil.rmtree(root / '.sldb')
    try:
        status, data = get(srv.url, '/api/workspace/explorer')
        status_nodes, _ = get(srv.url, '/api/workspace/nodes')
    finally:
        srv.close()
    assert status == 503 and data['ok'] is False and status_nodes == 503
    assert not (root / '.sldb').exists()


# ---------------------------------------------------------------- otro proceso, servidor vivo

OTHER_PROCESS = '''
import sys, json
from pathlib import Path
root, action, arg = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
if action == 'create':
    from deskops.operations import DeskopsOperations
    r = DeskopsOperations(root).create_task_bundle(dict(
        title=arg, goal='Meta', scope='S', implementation_path='P', validation=['pytest'], done_when='ok'))
    print(r.task_id)
elif action == 'untrack':
    from sldb.api import untrack_document
    untrack_document(root / '.sldb', arg)
elif action == 'track':
    from sldb.api import track_document_file
    track_document_file(root / '.sldb', 'TaskDoc', arg)
elif action == 'delete':
    from sldb.api import delete_document
    delete_document(root / '.sldb', arg)
'''


def other_process(root: Path, action: str, arg: str) -> str:
    res = subprocess.run([sys.executable, '-c', OTHER_PROCESS, str(root), action, arg], capture_output=True, text=True)
    assert res.returncode == 0, res.stderr
    return res.stdout.strip().splitlines()[-1] if res.stdout.strip() else ''


def test_modeled_created_and_removed_by_another_process_show_after_refresh(env, server):
    """Un operador da de alta y de baja documentos desde OTRO proceso con el servidor vivo."""
    root, task = env
    # el servidor ya sirvio un listado: sus caches estan calientes
    _, warm = get(server, '/api/workspace/explorer')
    get(server, '/api/workspace/nodes')
    new_id = other_process(root, 'create', 'Alta externa')
    ident, rel = f'TaskDoc:{new_id}', f'desk/tasks/{new_id}.md'

    _, exp = get(server, '/api/workspace/explorer')
    _, nodes = get(server, '/api/workspace/nodes')
    assert ident in {m['id'] for m in exp['modeled']}
    assert ident in {n['id'] for n in nodes['nodes']}
    assert rel not in paths(exp), 'el rastreado no se repite como no modelado'

    # destrackear (el archivo queda): pasa a no modelado
    other_process(root, 'untrack', new_id)
    _, exp = get(server, '/api/workspace/explorer')
    _, nodes = get(server, '/api/workspace/nodes')
    assert ident not in {m['id'] for m in exp['modeled']} and ident not in {n['id'] for n in nodes['nodes']}
    assert rel in paths(exp)

    # volver a rastrearlo: modelado otra vez, sin duplicar
    other_process(root, 'track', rel)
    _, exp = get(server, '/api/workspace/explorer')
    assert ident in {m['id'] for m in exp['modeled']} and rel not in paths(exp)

    # baja con borrado
    other_process(root, 'delete', new_id)
    _, exp = get(server, '/api/workspace/explorer')
    _, nodes = get(server, '/api/workspace/nodes')
    assert ident not in {m['id'] for m in exp['modeled']} and ident not in {n['id'] for n in nodes['nodes']}
    assert rel not in paths(exp) and not (root / rel).exists()


def test_internal_file_symlink_is_not_listed_as_unmodeled(env, server):
    root, task = env
    _, data = get(server, '/api/workspace/explorer')
    got = paths(data)
    assert 'docs/faq.md' in got                      # el destino real si
    assert 'desk/interno.md' not in got              # su symlink no: una sola identidad por archivo
    assert not any((root / p).is_symlink() for p in got)


# ---------------------------------------------------------------- frontera API (punto 1 de la correccion)
#
# Proceso REAL de serve.py con sys.addaudithook. El hook registra efectos (escrituras, borrados,
# renombres, mkdir...) y las aperturas de .md; no ve llamadas a funciones, solo efectos. Su
# calibracion positiva se hace en el mismo proceso, fuera de los GET, con escrituras conocidas.

HOOK_LAUNCHER = r'''
import os, sys, json, threading, time, shutil
from pathlib import Path

LOG = os.environ['HOOK_LOG']
REPO = os.environ['HOOK_REPO']
fd = os.open(LOG, os.O_WRONLY | os.O_CREAT | os.O_APPEND, 0o644)
WRITE_FLAGS = os.O_WRONLY | os.O_RDWR | os.O_CREAT | os.O_TRUNC | os.O_APPEND
EVENTS = {'os.remove', 'os.rename', 'os.mkdir', 'os.rmdir', 'os.truncate', 'os.chmod', 'os.utime', 'os.link',
          'os.symlink', 'os.chown', 'shutil.copyfile', 'shutil.copymode', 'shutil.copystat', 'shutil.copytree',
          'shutil.move', 'shutil.rmtree', 'shutil.make_archive', 'shutil.unpack_archive'}

def emit(kind, detail):
    os.write(fd, (json.dumps({'k': kind, 'd': detail}, default=str) + '\n').encode())

def hook(event, args):
    if event == 'open':
        path, mode, flags = args
        m = mode or ''
        is_write = any(c in m for c in 'wax+') or (isinstance(flags, int) and flags & WRITE_FLAGS)
        if is_write and isinstance(path, int):
            try:
                target = os.readlink('/proc/self/fd/%d' % path)
            except OSError:
                target = '?'
            emit('open_write_pipe' if target.startswith('pipe:') else 'open_write', [str(path), m, flags, target])
        elif is_write:
            emit('open_write', [str(path), m, flags])
        elif isinstance(path, (str, bytes, os.PathLike)) and str(path).endswith('.md'):
            emit('open_read_md', str(path))
    elif event in EVENTS:
        emit(event, [str(a) for a in args])

sys.addaudithook(hook)

def control():
    trig, sandbox = Path(os.environ['CONTROL_TRIGGER']), Path(os.environ['CONTROL_DIR'])
    while True:
        if trig.exists():
            os.remove(trig)
            emit('CONTROL_BEGIN', '')
            sandbox.mkdir(exist_ok=True)
            with open(sandbox / 'a.txt', 'w') as f:
                f.write('x')
            os.rename(sandbox / 'a.txt', sandbox / 'b.txt')
            shutil.copyfile(sandbox / 'b.txt', sandbox / 'c.txt')
            os.remove(sandbox / 'b.txt')
            os.remove(sandbox / 'c.txt')
            os.rmdir(sandbox)
            emit('CONTROL_END', '')
        time.sleep(0.05)

threading.Thread(target=control, daemon=True).start()
sys.path.insert(0, os.environ['HOOK_FRONTENDS'])
from mindmap import serve
emit('SERVER_START', '')
serve.main([sys.argv[1]])
'''


class RealServer:
    """serve.py real en un proceso aparte, con el hook de auditoria. Puerto libre propio."""

    def __init__(self, root: Path, tmp: Path, extra_env: dict | None = None):
        import socket
        import time
        self.root, self.tmp = root, tmp
        s = socket.socket()
        s.bind(('127.0.0.1', 0))
        port = s.getsockname()[1]
        s.close()
        assert port not in (8090, 8091, 8092)
        self.log = tmp / 'hook.jsonl'
        self.log.write_text('')
        self.trigger = tmp / 'control.trigger'
        launcher = tmp / 'hook_serve.py'
        launcher.write_text(HOOK_LAUNCHER, encoding='utf-8')
        env = dict(os.environ, HOOK_LOG=str(self.log), HOOK_REPO=str(root), HOOK_FRONTENDS=_frontends_dir,
                   CONTROL_TRIGGER=str(self.trigger), CONTROL_DIR=str(tmp / 'control'), SLDB_STORE=str(root / '.sldb'))
        env.pop('DESKOPS_ROOT', None)
        env.update(extra_env or {})
        self.proc = subprocess.Popen([sys.executable, str(launcher), str(port)], env=env, cwd=str(tmp),
                                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        self.url = f'http://127.0.0.1:{port}'
        for _ in range(150):
            if any(e['k'] == 'SERVER_START' for e in self.events()):
                try:
                    urlopen(self.url + '/', timeout=5).read()
                    break
                except Exception:
                    pass
            time.sleep(0.2)
        else:
            raise AssertionError('serve.py no arranco')

    def events(self) -> list:
        return [json.loads(line) for line in self.log.read_text().splitlines() if line]

    def get_observed(self, path: str):
        """(status, json, eventos registrados durante ese GET). Peticiones en serie."""
        n0 = len(self.events())
        status, body = get(self.url, path)
        return status, body, self.events()[n0:]

    def control(self) -> list:
        import time
        n0 = len(self.events())
        self.trigger.write_text('1')
        for _ in range(100):
            if any(e['k'] == 'CONTROL_END' for e in self.events()[n0:]):
                break
            time.sleep(0.05)
        return [e for e in self.events()[n0:] if e['k'] not in ('CONTROL_BEGIN', 'CONTROL_END')]

    def close(self):
        self.proc.terminate()
        self.proc.wait(timeout=20)


def file_effects(events: list) -> list:
    """Efectos sobre archivos y directorios; los pipes a subprocesos (git) no lo son."""
    ignore = {'open_write_pipe', 'open_read_md', 'SERVER_START', 'CONTROL_BEGIN', 'CONTROL_END'}
    return [e for e in events if e['k'] not in ignore]


def mtime_state(root: Path) -> dict:
    """sha256 y mtime_ns de todo archivo (salvo .git), mas directorios y estado git."""
    state = {}
    for p in sorted(root.rglob('*')):
        rel = p.relative_to(root)
        if rel.parts[0] == '.git' or p.is_symlink():
            continue
        state[str(rel)] = 'dir' if p.is_dir() else (sha(p.read_bytes()), p.stat().st_mtime_ns)
    return state


def test_refresh_path_has_no_sldb_store_import():
    """El camino del refresco usa la API publica: ningun import de sldb.store en el modulo."""
    import ast
    src = (Path(_frontends_dir) / 'mindmap' / 'workspace_routes.py').read_text(encoding='utf-8')
    mods = []
    for node in ast.walk(ast.parse(src)):
        if isinstance(node, ast.ImportFrom) and node.module:
            mods.append(node.module)
        elif isinstance(node, ast.Import):
            mods += [a.name for a in node.names]
    assert not [m for m in mods if m == 'sldb.store' or m.startswith('sldb.store.')], mods
    assert 'sldb.api' in mods  # open_store llega por sldb.api


def test_real_process_listing_get_writes_nothing_and_sees_other_process_changes(env, tmp_path):
    root, task = env
    commit_all(root)
    work = tmp_path / 'work'
    work.mkdir()
    srv = RealServer(root, work)
    try:
        # calibracion positiva: el hook de ESTE proceso detecta escrituras conocidas hechas fuera de un GET
        control = srv.control()
        kinds = {e['k'] for e in control}
        assert {'os.mkdir', 'open_write', 'os.rename', 'shutil.copyfile', 'os.remove', 'os.rmdir'} <= kinds, control

        urls = ['/api/workspace/explorer', '/api/workspace/nodes', f'/api/workspace/node?id=TaskDoc:{task}',
                '/api/workspace/source?path=docs/faq.md', '/api/workspace/explorer', '/api/workspace/nodes']
        for url in urls:
            before = mtime_state(root)
            status, _, events = srv.get_observed(url)
            assert status == 200, url
            assert file_effects(events) == [], (url, file_effects(events))
            assert mtime_state(root) == before, f'GET {url} cambio archivos, mtimes o directorios'

        # otro proceso, servidor vivo y caches calientes: alta, untrack, track y baja
        def seen():
            before = mtime_state(root)
            _, exp, ev1 = srv.get_observed('/api/workspace/explorer')
            _, nodes, ev2 = srv.get_observed('/api/workspace/nodes')
            assert file_effects(ev1 + ev2) == [] and mtime_state(root) == before
            return {m['id'] for m in exp['modeled']}, set(paths(exp)), {n['id'] for n in nodes['nodes']}

        new_id = other_process(root, 'create', 'Alta entre procesos')
        ident, rel = f'TaskDoc:{new_id}', f'desk/tasks/{new_id}.md'
        m, u, n = seen()
        assert ident in m and ident in n and rel not in u
        other_process(root, 'untrack', new_id)
        m, u, n = seen()
        assert ident not in m and ident not in n and rel in u
        other_process(root, 'track', rel)
        m, u, n = seen()
        assert ident in m and ident in n and rel not in u
        other_process(root, 'delete', new_id)
        m, u, n = seen()
        assert ident not in m and ident not in n and rel not in u
    finally:
        srv.close()


# ---------------------------------------------------------------- raices prohibidas (punto 2)

FORBIDDEN_DIRECT = ['.git', 'desk/.hidden', 'desk/__pycache__', 'node_modules']
FORBIDDEN_NESTED = ['.git/hooks', 'desk/.hidden/sub', 'desk/node_modules/pkg/lib', 'docs/__pycache__/x', 'desk/notas/.cache/deep']


def forbidden_entries(with_git: bool) -> list:
    # Sin git no hay .git: un directorio .git inventado seria un repo roto (git fallaria, y cerraria).
    return [e for e in FORBIDDEN_DIRECT + FORBIDDEN_NESTED if with_git or not e.startswith('.git')]


def forbidden_repo(tmp_path: Path, with_git: bool) -> Path:
    root = tmp_path / ('con-git' if with_git else 'sin-git')
    root.mkdir()
    if with_git:
        git_init(root)   # sin .gitignore: git no oculta ningun centinela
    prepare_store(root)
    for rel in forbidden_entries(with_git):
        write(root, f'{rel}/CENTINELA.md', f'# centinela {rel}\n')
    write(root, 'desk/notas/uno.md', '# Uno\n')
    write(root, 'docs/faq.md', '# FAQ\n')
    write(root, 'desk/mis notas/ñandú día.md', '# Ñandú\n')
    write(root, 'docs/ñandú/guía rápida.md', '# Guía\n')
    return root


def sentinel_paths(data) -> list:
    return [p for p in paths(data) if 'CENTINELA' in p]


@pytest.mark.parametrize('with_git, entry', [(g, e) for g in (True, False) for e in forbidden_entries(g)],
                         ids=lambda v: str(v))
def test_forbidden_root_is_rejected_before_listing_direct_and_nested(tmp_path_factory, monkeypatch, entry, with_git):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    root = forbidden_repo(tmp_path_factory.mktemp('r'), with_git)
    monkeypatch.setenv('WORKSPACE_EXPLORER_ROOTS', entry)
    srv = Srv(root)
    try:
        status, data = get(srv.url, '/api/workspace/explorer')
    finally:
        srv.close()
    assert status == 200
    assert data['roots'] == [] and data['unmodeled'] == []
    assert data['roots_invalid'] == [{'entry': entry, 'reason': 'componente_prohibido'}]
    assert sentinel_paths(data) == []


@pytest.mark.parametrize('with_git', [True, False], ids=['con-git', 'sin-git'])
def test_mixed_roots_keep_valid_diagnose_forbidden_and_never_open_sentinels(tmp_path_factory, with_git):
    root = forbidden_repo(tmp_path_factory.mktemp('r'), with_git)
    work = tmp_path_factory.mktemp('w')
    forbidden = forbidden_entries(with_git)
    entries = ['desk/notas'] + forbidden + ['docs', 'desk/mis notas', 'docs/ñandú']
    srv = RealServer(root, work, {'WORKSPACE_EXPLORER_ROOTS': ','.join(entries)})
    try:
        status, data, events = srv.get_observed('/api/workspace/explorer')
        _, _, events_nodes = srv.get_observed('/api/workspace/nodes')
        opened = [e['d'] for e in srv.events() if e['k'] == 'open_read_md' and e['d'].startswith(str(root))]
    finally:
        srv.close()
    assert status == 200
    assert data['roots'] == ['desk/notas', 'docs', 'desk/mis notas', 'docs/ñandú']
    assert {(e['entry'], e['reason']) for e in data['roots_invalid']} == {(f, 'componente_prohibido') for f in forbidden}
    assert sentinel_paths(data) == []
    got = set(paths(data))
    assert {'desk/notas/uno.md', 'docs/faq.md', 'desk/mis notas/ñandú día.md', 'docs/ñandú/guía rápida.md'} <= got
    assert not [p for p in opened if 'CENTINELA' in p], 'el servidor abrio un centinela'
    assert file_effects(events + events_nodes) == []
    # ningun metadato del listado sale de los arboles prohibidos
    blob = json.dumps({k: data[k] for k in ('roots', 'modeled', 'unmodeled')}, ensure_ascii=False)
    assert 'CENTINELA' not in blob and '.hidden' not in blob and '__pycache__' not in blob and 'node_modules' not in blob


def test_legit_roots_with_spaces_and_unicode_are_preserved(tmp_path_factory, monkeypatch):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    root = forbidden_repo(tmp_path_factory.mktemp('r'), True)
    monkeypatch.setenv('WORKSPACE_EXPLORER_ROOTS', 'desk/mis notas, docs/ñandú')
    srv = Srv(root)
    try:
        _, data = get(srv.url, '/api/workspace/explorer')
    finally:
        srv.close()
    assert data['roots'] == ['desk/mis notas', 'docs/ñandú'] and data['roots_invalid'] == []
    assert set(paths(data)) == {'desk/mis notas/ñandú día.md', 'docs/ñandú/guía rápida.md'}
