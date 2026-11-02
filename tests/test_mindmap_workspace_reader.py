"""WS13.1: lector de documento (fuente, contexto, enlaces, foco) sobre stores y desks temporales reales.

Sin mocks ni stubs: git, store sldb, desk y servidor HTTP reales en un directorio temporal.
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
from deskops.models import TaskDoc
from deskops.operations import DeskopsOperations
from deskops.workspace import scaffold_desk
from mindmap import serve
from sldb.api.records.extract import extract_sections

GUIDE_MD = (
    '# Guia de lectura\n'
    '\n'
    'Intro con [[notes/otro.md]] y un destino roto [[notes/no-esta.md]].\n'
    '\n'
    '## Primera parte\n'
    '\n'
    'Texto de la primera parte. Ancla: [[notes/otro.md#Segunda parte]].\n'
    'Externo: [[https://example.com/pagina]].\n'
    '\n'
    '## Segunda parte\n'
    '\n'
    'Dos puntos: [[deskops:task-fantasma]] y datos [[data.txt]] y escape [[../fuera.md]].\n'
    'Prefijo local: [[local:notes/otro.md]].\n'
)
OTRO_MD = (
    '# Otro documento\n'
    '\n'
    'Cuerpo.\n'
    '\n'
    '## Segunda parte\n'
    '\n'
    'Vuelve a [[guia.md]] y a la tarea [[__TASK_B__]].\n'
)
SUB_MD = '# Sub\n\nEnlace relativo al directorio: [[hermano.md]] y al root: [[guia.md]].\n'
HERMANO_MD = '# Hermano\n\nTexto del hermano.\n'


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def snapshot(root: Path, *extra: Path) -> dict[str, str]:
    """sha256 de todos los archivos bajo .sldb y de los archivos extra."""
    files = {}
    for p in sorted((root / '.sldb').rglob('*')):
        if p.is_file():
            files[str(p.relative_to(root))] = sha(p.read_bytes())
    for p in extra:
        files[str(p)] = sha(p.read_bytes())
    return files


@pytest.fixture
def env(tmp_path, monkeypatch):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    root = tmp_path / 'repo'
    root.mkdir()
    subprocess.run(['git', 'init', str(root)], check=True, capture_output=True)
    subprocess.run(['git', '-C', str(root), 'config', 'user.name', 'test'], check=True)
    subprocess.run(['git', '-C', str(root), 'config', 'user.email', 'test@example.com'], check=True)
    (root / '.gitignore').write_text('ignorado.md\nsecretos/\n', encoding='utf-8')

    assert SLDBBootstrap().init_local_store(root) == 0
    scaffold_desk(root)
    ensure_lifecycle_graph(root)
    ops = DeskopsOperations(root)

    (root / 'src').mkdir()
    (root / 'src' / 'a.py').write_text('l1\nl2\nl3\nl4\nl5\nl6\nl7\n', encoding='utf-8')
    (root / 'src' / 'b.py').write_text('b1\nb2\nb3\n', encoding='utf-8')

    task_b = ops.create_task_bundle(dict(
        title='Tarea B', goal='Destino', scope='Desk temporal', implementation_path='B',
        validation=['pytest'], done_when='B listo',
    )).task_id
    task_a = ops.create_task_bundle(dict(
        title='Tarea A', goal=f'Meta con enlace [[{task_b}]] y [[desk/tasks/{task_b}.md#Goal]]',
        scope='Desk temporal', implementation_path='A', validation=['pytest'], done_when='A listo',
        depends_on=[task_b], inherits_from=[task_b],
        files=['src/a.py:3', 'src/b.py'], references=['src/b.py:2'],
    )).task_id
    # Un elemento omitido (cadena vacia) entre dos referencias: la posicion cuenta los omitidos.
    a_path = root / 'desk' / 'tasks' / f'{task_a}.md'
    payload = ops._read_doc(a_path, TaskDoc)
    payload['files'] = ['src/a.py:3', '', 'src/b.py']
    ops._write_doc(a_path, TaskDoc, payload)

    # Markdown real sin modelo, fuera de .sldb
    notes = root / 'notes'
    notes.mkdir()
    (root / 'guia.md').write_text(GUIDE_MD, encoding='utf-8')
    (notes / 'otro.md').write_text(OTRO_MD.replace('__TASK_B__', task_b), encoding='utf-8')
    (notes / 'sub').mkdir()
    (notes / 'sub' / 'enlaces.md').write_text(SUB_MD, encoding='utf-8')
    (notes / 'sub' / 'hermano.md').write_text(HERMANO_MD, encoding='utf-8')
    (root / 'data.txt').write_text('no es markdown\n', encoding='utf-8')
    (root / 'ignorado.md').write_text('# secreto\n', encoding='utf-8')
    (root / 'secretos').mkdir()
    (root / 'secretos' / 'x.md').write_text('# secreto x\n', encoding='utf-8')
    (root / 'binario.md').write_bytes(b'# bin\n\x00\x01\x02')
    (root / 'latin.md').write_bytes('# Cafe\n\ncaf\xe9 y acci\xf3n\n'.encode('latin-1'))
    (root / 'grande.md').write_text('# Grande\n' + ('x' * 1024 + '\n') * 300, encoding='utf-8')
    (root / 'dir.md').mkdir()
    outside = tmp_path / 'fuera.md'
    outside.write_text('# exterior\n', encoding='utf-8')
    (root / 'escape.md').symlink_to(outside)

    return root, task_a, task_b


@pytest.fixture
def server(env):
    root = env[0]
    instance = serve.make_server(0, root / '.sldb')
    thread = threading.Thread(target=instance.serve_forever, daemon=True)
    thread.start()
    yield 'http://127.0.0.1:' + str(instance.server_port)
    instance.shutdown()
    instance.server_close()
    thread.join()


def get(server, path):
    try:
        response = urlopen(Request(server + path), timeout=60)
    except HTTPError as exc:
        response = exc
    with response:
        return response.status, json.loads(response.read())


def src_path(rel):
    return f'/api/workspace/source?path={quote(rel)}'


def src_id(ident):
    return f'/api/workspace/source?id={quote(ident)}'


# ---------------------------------------------------------------- fuente y revision

def test_modeled_source_is_byte_exact_and_same_origin(env, server):
    root, task_a, task_b = env
    status, data = get(server, src_id(f'TaskDoc:{task_a}'))
    assert status == 200 and data['ok'] is True
    raw = (root / 'desk' / 'tasks' / f'{task_a}.md').read_bytes()
    assert data['text'].encode('utf-8') == raw
    assert data['revision'] == sha(raw)
    assert data['encoding'] == 'utf-8'
    assert data['identity'] == {
        'kind': 'modeled', 'id': f'TaskDoc:{task_a}', 'model_name': 'TaskDoc', 'name': task_a,
        'repo': 'local', 'path': f'desk/tasks/{task_a}.md', 'requested': {'id': f'TaskDoc:{task_a}'},
    }
    # render (IR del builder publico) y fuente salen de los mismos bytes: los spans de seccion
    # coinciden con extract_sections sobre el texto devuelto.
    assert data['ir'] is not None and data['ir_error'] is None
    expected = [(s.title, s.level, s.line_start, s.line_end) for s in extract_sections(data['text'])]
    got = [(s['title'], s['level'], s['line_start'], s['line_end']) for s in data['sections']]
    assert got == expected
    lines = data['text'].splitlines()
    for sec in data['sections']:
        assert lines[sec['line_start'] - 1].lstrip('#').strip() == sec['title']
    assert {f['field_path'] for f in data['fields']} >= {'title', 'depends_on', 'files'}
    # el payload del descriptor solo se usa para campos y se entrega como descriptor
    assert data['descriptor']['payload']['title'] == 'Tarea A'
    # misma revision en la ruta node (lee el archivo aparte)
    status, node = get(server, f'/api/workspace/node?id=TaskDoc:{task_a}&depth=1')
    assert node['context']['file_revision'] == data['revision']


def test_unmodeled_source_sections_match_written_text(env, server):
    root, task_a, task_b = env
    status, data = get(server, src_path('guia.md'))
    assert status == 200
    raw = (root / 'guia.md').read_bytes()
    assert data['text'].encode() == raw and data['revision'] == sha(raw)
    assert data['identity']['kind'] == 'unmodeled'
    assert data['identity']['id'] is None and data['identity']['path'] == 'guia.md'
    assert data['ir'] is None and data['fields'] == []
    lines = GUIDE_MD.splitlines()
    heads = [(i + 1, len(l) - len(l.lstrip('#')), l.lstrip('#').strip()) for i, l in enumerate(lines) if l.startswith('#')]
    got = [(s['line_start'], s['level'], s['title']) for s in data['sections']]
    assert got == heads
    assert {s['level'] for s in data['sections']} == {1, 2}
    # line_end sigue la regla de sldb (hasta la linea previa al siguiente encabezado de igual o mayor rango)
    ends = {s['title']: s['line_end'] for s in data['sections']}
    assert ends['Primera parte'] == heads[2][0] - 1
    assert ends['Guia de lectura'] == len(lines)
    # contexto: lo que falta se muestra como ausente, no se inventa
    ctx = data['context']
    assert ctx['id'] is None and ctx['revision'] == data['revision'] and ctx['path'] == 'guia.md'
    assert ctx['incoming_relations'] is None and ctx['outgoing_relations'] is None
    assert 'no modelado' in ctx['relations_absent'].lower()


def test_tracked_path_prevails_as_model_identity(env, server):
    root, task_a, task_b = env
    rel = f'desk/tasks/{task_a}.md'
    status, by_path = get(server, src_path(rel))
    assert status == 200
    assert by_path['identity']['kind'] == 'modeled'
    assert by_path['identity']['id'] == f'TaskDoc:{task_a}'
    assert by_path['identity']['path'] == rel
    assert by_path['identity']['requested'] == {'path': rel}
    status, by_id = get(server, src_id(f'TaskDoc:{task_a}'))
    assert by_path['text'] == by_id['text'] and by_path['revision'] == by_id['revision']


def test_selection_requires_exactly_one_of_id_or_path(server, env):
    root, task_a, _ = env
    assert get(server, '/api/workspace/source')[0] == 400
    s, d = get(server, f'/api/workspace/source?id=TaskDoc:{task_a}&path=guia.md')
    assert s == 400 and d['ok'] is False
    assert get(server, '/api/workspace/source?id=TaskDoc:no-existe')[0] == 404
    assert get(server, '/api/workspace/node?path=guia.md')[0] == 400  # node no recibe path


# ---------------------------------------------------------------- contexto

def test_modeled_context_has_real_relations_with_provenance(env, server):
    root, task_a, task_b = env
    status, a = get(server, src_id(f'TaskDoc:{task_a}'))
    ctx = a['context']
    assert ctx['id'] == f'TaskDoc:{task_a}' and ctx['path'] == f'desk/tasks/{task_a}.md'
    out_targets = {e['target'] for e in ctx['outgoing_relations']}
    assert f'TaskDoc:{task_b}' in out_targets
    status, b = get(server, src_id(f'TaskDoc:{task_b}'))
    assert any(e['source'] == f'TaskDoc:{task_a}' for e in b['context']['incoming_relations'])
    # misma regla de vecindad que /node: id/sources de la proyeccion de contexto
    status, node = get(server, f'/api/workspace/node?id=TaskDoc:{task_a}&depth=1')
    node_out = {(e['target'], e['type']) for e in node['context']['outgoing_relations']}
    src_out = {(e['target'], e['type']) for e in ctx['outgoing_relations']}
    assert node_out == src_out


def test_edge_provenance_keeps_every_field(env, server):
    root, task_a, task_b = env
    status, a = get(server, src_id(f'TaskDoc:{task_a}'))
    edges = [e for e in a['context']['outgoing_relations'] if e['target'] == f'TaskDoc:{task_b}']
    # depends_on e inherits_from dan la misma (source, target, type): una arista, dos procedencias
    assert len(edges) == 1
    fields = {p['field'] for p in edges[0]['provenance'] if p.get('origin') == 'schema'}
    assert {'depends_on', 'inherits_from'} <= fields
    for prov in edges[0]['provenance']:
        if prov.get('origin') == 'schema':
            assert prov['declared'] == task_b
    # el grafo de /node conserva las mismas procedencias
    status, node = get(server, f'/api/workspace/node?id=TaskDoc:{task_a}&depth=1')
    gedges = [e for e in node['projections']['graph']['edges'] if e['source'] == f'TaskDoc:{task_a}' and e['target'] == f'TaskDoc:{task_b}']
    assert gedges and {p['field'] for p in gedges[0]['provenance'] if p.get('origin') == 'schema'} >= {'depends_on', 'inherits_from'}


def test_code_references_keep_field_and_position(env, server):
    root, task_a, task_b = env
    status, node = get(server, f'/api/workspace/node?id=TaskDoc:{task_a}&depth=1')
    files = node['projections']['code']['files']
    got = [(f['field'], f['position'], f['value']) for f in files]
    # files: ['src/a.py:3', '', 'src/b.py'] -> la posicion de src/b.py es 2 (cuenta el omitido)
    assert got == [('files', 0, 'src/a.py:3'), ('files', 2, 'src/b.py'), ('references', 0, 'src/b.py:2')]
    assert all(f['doc'] == f'TaskDoc:{task_a}' for f in files)
    assert files[0]['content'].startswith('l1\n')  # archivo completo para el rango local


# ---------------------------------------------------------------- enlaces

def link_by_raw(data):
    return {l['raw']: l for l in data['links']}


def test_links_resolution_for_unmodeled_document(env, server):
    root, task_a, task_b = env
    status, data = get(server, src_path('guia.md'))
    links = link_by_raw(data)
    ok = links['[[notes/otro.md]]']
    assert ok['status'] == 'ok' and ok['open'] == {'path': 'notes/otro.md'}
    assert ok['origin']['path'] == 'guia.md' and ok['origin']['line'] == 3
    anchor = links['[[notes/otro.md#Segunda parte]]']
    assert anchor['status'] == 'ok' and anchor['anchor'] == 'Segunda parte' and anchor['open'] == {'path': 'notes/otro.md'}
    broken = links['[[notes/no-esta.md]]']
    assert broken['status'] == 'roto' and broken['estado'] == 'no_existe' and broken['cause'] and broken['open'] is None
    ext = links['[[https://example.com/pagina]]']
    assert ext['status'] == 'externo' and ext['open'] is None
    # nombre con dos puntos: literal local, no salta al store enlazado 'deskops'
    colon = links['[[deskops:task-fantasma]]']
    assert colon['status'] == 'roto' and colon['open'] is None
    notmd = links['[[data.txt]]']
    assert notmd['status'] == 'no_markdown' and notmd['estado'] == 'no_markdown' and notmd['open'] is None
    esc = links['[[../fuera.md]]']
    assert esc['status'] == 'roto' and esc['estado'] == 'fuera_del_repo'
    local = links['[[local:notes/otro.md]]']
    assert local['status'] == 'ok' and local['open'] == {'path': 'notes/otro.md'}


def test_links_relative_first_then_root_and_model_targets(env, server):
    root, task_a, task_b = env
    status, data = get(server, src_path('notes/sub/enlaces.md'))
    links = link_by_raw(data)
    assert links['[[hermano.md]]']['open'] == {'path': 'notes/sub/hermano.md'}
    assert links['[[guia.md]]']['open'] == {'path': 'guia.md'}
    status, otro = get(server, src_path('notes/otro.md'))
    l = link_by_raw(otro)[f'[[{task_b}]]']
    assert l['status'] == 'ok' and l['open'] == {'id': f'TaskDoc:{task_b}'}
    # seguir el enlace abre ese documento por la misma ruta de lectura
    status, followed = get(server, src_id(l['open']['id']))
    assert status == 200 and followed['identity']['id'] == f'TaskDoc:{task_b}'


def test_modeled_links_with_anchor_resolve_to_identity(env, server):
    root, task_a, task_b = env
    status, data = get(server, src_id(f'TaskDoc:{task_a}'))
    links = link_by_raw(data)
    assert links[f'[[{task_b}]]']['open'] == {'id': f'TaskDoc:{task_b}'}
    anchored = links[f'[[desk/tasks/{task_b}.md#Goal]]']
    assert anchored['anchor'] == 'Goal' and anchored['open'] == {'id': f'TaskDoc:{task_b}'}


# ---------------------------------------------------------------- guardias

@pytest.mark.parametrize('rel,http,estado', [
    ('escape.md', 403, 'fuera_del_repo'),
    ('../fuera.md', 403, 'fuera_del_repo'),
    ('.git/config', 403, 'protegido'),
    ('ignorado.md', 403, 'protegido'),
    ('secretos/x.md', 403, 'protegido'),
    ('data.txt', 415, 'no_markdown'),
    ('dir.md', 415, 'directorio'),
    ('binario.md', 415, 'binario'),
    ('grande.md', 413, 'demasiado_grande'),
    ('no-existe.md', 404, 'no_existe'),
])
def test_read_guards(env, server, rel, http, estado):
    status, data = get(server, src_path(rel))
    assert status == http, data
    assert data['ok'] is False and data['estado'] == estado and data['error']
    assert 'text' not in data


def test_invalid_utf8_is_flagged_not_promised_identical(env, server):
    root, _, _ = env
    status, data = get(server, src_path('latin.md'))
    assert status == 200
    assert data['encoding'] == 'utf-8-replaced'
    assert data['revision'] == sha((root / 'latin.md').read_bytes())
    assert sha(data['text'].encode('utf-8')) != data['revision']


def test_absolute_path_inside_root_is_relativized_outside_is_rejected(env, server):
    root, _, _ = env
    status, data = get(server, src_path(str(root / 'guia.md')))
    assert status == 200 and data['identity']['path'] == 'guia.md'
    status, data = get(server, src_path('/etc/passwd'))
    assert status == 403 and data['estado'] == 'fuera_del_repo'


# ---------------------------------------------------------------- sin mutacion

def test_reads_do_not_modify_store_or_files(env, server):
    root, task_a, task_b = env
    read_files = [root / 'guia.md', root / 'desk' / 'tasks' / f'{task_a}.md', root / 'notes' / 'otro.md']
    before = snapshot(root, *read_files)
    urls = [
        '/api/workspace/nodes',
        src_id(f'TaskDoc:{task_a}'), src_id(f'TaskDoc:{task_b}'),
        src_path('guia.md'), src_path('notes/otro.md'), src_path('notes/sub/enlaces.md'),
        src_path(f'desk/tasks/{task_a}.md'),
        src_path('escape.md'), src_path('ignorado.md'), src_path('binario.md'), src_path('no-existe.md'),
        f'/api/workspace/node?id=TaskDoc:{task_a}&depth=2',
    ]
    for url in urls:
        get(server, url)
        assert snapshot(root, *read_files) == before, f'GET modifico el store o un archivo: {url}'
    # fuente repetida: la misma revision, no una copia
    assert get(server, src_path('guia.md'))[1]['revision'] == get(server, src_path('guia.md'))[1]['revision']


def test_source_route_rejects_mutating_methods(env, server):
    request = Request(server + src_path('guia.md'), data=b'{}', method='POST', headers={'Content-Type': 'application/json'})
    try:
        response = urlopen(request, timeout=30)
    except HTTPError as exc:
        response = exc
    with response:
        assert response.status in (404, 405)


# =====================================================================================
# Correccion WS13.1: lectura sin mutacion, guardias previas, dueño de procedencia, anclas
# =====================================================================================

import socket
import textwrap
import time

from sldb.api import rebuild_edges


def tree_hashes(root: Path) -> dict[str, str]:
    """sha256 de todos los archivos del repo salvo .git y .sldb (los documentos)."""
    out = {}
    for p in sorted(root.rglob('*')):
        rel = p.relative_to(root)
        if rel.parts[0] in ('.git', '.sldb') or p.is_dir() or p.is_symlink():
            continue
        out[str(rel)] = sha(p.read_bytes())
    return out


def git_state(root: Path) -> tuple[str, str]:
    porcelain = subprocess.run(['git', '-C', str(root), 'status', '--porcelain'], check=True, capture_output=True, text=True).stdout
    head = subprocess.run(['git', '-C', str(root), 'rev-parse', 'HEAD'], check=True, capture_output=True, text=True).stdout.strip()
    return porcelain, head


def full_state(root: Path) -> dict:
    store = {}
    for p in sorted((root / '.sldb').rglob('*')):
        if p.is_file():
            store[str(p.relative_to(root))] = sha(p.read_bytes())
    return {'store': store, 'docs': tree_hashes(root), 'git': git_state(root)}


@pytest.fixture
def committed(env):
    """El repo con un HEAD real y un estado git no vacio (archivo nuevo sin rastrear)."""
    root, task_a, task_b = env
    subprocess.run(['git', '-C', str(root), 'add', '-A'], check=True, capture_output=True)
    subprocess.run(['git', '-C', str(root), 'commit', '-q', '-m', 'base'], check=True, capture_output=True)
    (root / 'notes' / 'sin-rastrear.md').write_text('# Sin rastrear\n', encoding='utf-8')
    return root, task_a, task_b


READ_URLS = lambda a, b: [  # noqa: E731
    '/api/workspace/nodes',
    src_id(f'TaskDoc:{a}'), src_id(f'TaskDoc:{b}'), src_path('guia.md'), src_path('notes/otro.md'),
    src_path('escape.md'), src_path('ignorado.md'),
    f'/api/workspace/node?id=TaskDoc:{a}&depth=1', f'/api/workspace/node?id=TaskDoc:{a}&depth=2',
    f'/api/workspace/node?id=TaskDoc:{b}&depth=2',
]


def test_get_leaves_store_documents_and_git_unchanged_canonical(committed, server):
    root, task_a, task_b = committed
    for url in READ_URLS(task_a, task_b):
        before = full_state(root)
        status, data = get(server, url)
        assert full_state(root) == before, f'GET modifico store, documentos o git: {url}'
    # canonico: el grafo responde
    status, node = get(server, f'/api/workspace/node?id=TaskDoc:{task_a}&depth=1')
    assert node['projections']['graph']['ok'] is True and node['projections']['graph']['stale'] == []
    assert node['context']['relations_state']['ok'] is True


def make_stale(root: Path, task_b: str) -> Path:
    """Deja el indice de aristas de un documento atrasado (el shard de su documento falta),
    que es como sldb documenta un store al que se escribio desde fuera."""
    shard = root / '.sldb' / 'runtime' / 'edges' / 'TaskDoc' / f'{task_b}.yaml'
    assert shard.is_file()
    shard.unlink()
    return shard


def test_get_on_stale_store_rejects_observably_and_never_rebuilds(committed, server):
    root, task_a, task_b = committed
    shard = make_stale(root, task_b)
    expected_stale = f'TaskDoc:{task_b}'
    for url in READ_URLS(task_a, task_b):
        before = full_state(root)
        status, data = get(server, url)
        assert full_state(root) == before, f'GET modifico el store desactualizado: {url}'
        assert not shard.exists(), f'GET reconstruyo el shard: {url}'
    # rechazo observable en graph y contexto de /node
    status, node = get(server, f'/api/workspace/node?id=TaskDoc:{task_a}&depth=2')
    assert status == 200
    graph = node['projections']['graph']
    assert graph['ok'] is False and graph['estado'] == 'store_no_preparado'
    assert expected_stale in graph['stale'] and graph['nodes'] == [] and graph['edges'] == []
    ctx = node['context']
    assert ctx['relations_state']['ok'] is False and ctx['relations_state']['estado'] == 'store_no_preparado'
    assert expected_stale in ctx['relations_state']['stale']
    assert ctx['incoming_relations'] is None and ctx['outgoing_relations'] is None
    # y en el contexto de /source, que sigue entregando la fuente autorizada
    status, src = get(server, src_id(f'TaskDoc:{task_a}'))
    assert status == 200 and src['text'] and src['revision']
    sctx = src['context']
    assert sctx['relations_state']['estado'] == 'store_no_preparado' and expected_stale in sctx['relations_state']['stale']
    assert sctx['incoming_relations'] is None and sctx['outgoing_relations'] is None and sctx['relations_error']
    # /nodes no depende del indice de aristas ni cambia con stale
    status, nodes = get(server, '/api/workspace/nodes')
    assert status == 200 and any(n['id'] == f'TaskDoc:{task_a}' and n['title'] == 'Tarea A' for n in nodes['nodes'])
    # la preparacion es explicita y externa al request: despues de ella el grafo responde
    rebuild_edges(root / '.sldb', pythonpath=str(root), wait=True)
    assert shard.exists()
    status, node = get(server, f'/api/workspace/node?id=TaskDoc:{task_a}&depth=1')
    assert node['projections']['graph']['ok'] is True and node['projections']['graph']['stale'] == []
    assert any(e['target'] == f'TaskDoc:{task_b}' for e in node['context']['outgoing_relations'])


# ---------------------------------------------------------------- guardias antes de leer (E/S observada)

AUDIT_LAUNCHER = textwrap.dedent('''
    import os, runpy, sys
    log, serve_py, port = sys.argv[1], sys.argv[2], sys.argv[3]
    fd = os.open(log, os.O_WRONLY | os.O_APPEND | os.O_CREAT)
    def hook(event, args):
        if event == 'open' and args and isinstance(args[0], (str, bytes, os.PathLike)):
            p = os.fsdecode(args[0])
            os.write(fd, (os.path.abspath(p) + '\\t' + os.path.realpath(p) + '\\n').encode())
    sys.addaudithook(hook)
    sys.argv = [serve_py, port]
    runpy.run_path(serve_py, run_name='__main__')
''')


class AuditedServer:
    """serve.py real en un proceso aparte con sys.addaudithook registrando cada open."""

    def __init__(self, root: Path, tmp: Path):
        self.log = tmp / 'opens.log'
        self.log.write_text('')
        launcher = tmp / 'launch_audited.py'
        launcher.write_text(AUDIT_LAUNCHER, encoding='utf-8')
        with socket.socket() as s:
            s.bind(('127.0.0.1', 0))
            self.port = s.getsockname()[1]
        assert self.port not in (8090, 8091, 8092)
        serve_py = Path(serve.__file__).resolve()
        env = dict(os.environ, SLDB_STORE=str(root / '.sldb'))
        env.pop('DESKOPS_ROOT', None)
        # el proceso importa `mindmap` del mismo arbol que este test (no del paquete instalado)
        env['PYTHONPATH'] = os.pathsep.join([str(Path(serve.__file__).resolve().parent.parent)] + ([env['PYTHONPATH']] if env.get('PYTHONPATH') else []))
        self.proc = subprocess.Popen(
            [sys.executable, str(launcher), str(self.log), str(serve_py), str(self.port)],
            env=env, cwd=str(tmp), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        self.url = f'http://127.0.0.1:{self.port}'
        deadline = time.time() + 60
        while time.time() < deadline:
            try:
                with socket.create_connection(('127.0.0.1', self.port), timeout=0.5):
                    return
            except OSError:
                time.sleep(0.2)
        self.close()
        raise RuntimeError('serve.py auditado no arranco')

    def mark(self) -> int:
        return self.log.stat().st_size

    def opened_since(self, mark: int) -> set[str]:
        data = self.log.read_bytes()[mark:].decode()
        out = set()
        for line in data.splitlines():
            out.update(line.split('\t'))
        return out

    def close(self):
        self.proc.terminate()
        try:
            self.proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            self.proc.kill()


@pytest.fixture
def guard_env(env, tmp_path):
    """Tres documentos indexados mas: P protegido (ignorado por git), S symlink que escapa,
    Q protegido que ningun GET pide. Ademas un documento autorizado y no enlazado (L) que /source de A no debe abrir."""
    root, task_a, task_b = env
    ops = DeskopsOperations(root)

    def new(title):
        return ops.create_task_bundle(dict(
            title=title, goal=f'{title} meta', scope='Desk temporal', implementation_path='x',
            validation=['pytest'], done_when='listo')).task_id
    prot, prot_unrequested, sym, free = new('Protegido P'), new('Protegido Q'), new('Symlink S'), new('Libre L')
    outside = tmp_path / 'secreto-externo.md'
    outside.write_text('# SECRETO-EXTERNO\n', encoding='utf-8')
    sym_file = root / 'desk' / 'tasks' / f'{sym}.md'
    sym_file.unlink()
    sym_file.symlink_to(outside)
    with (root / '.gitignore').open('a', encoding='utf-8') as fh:
        fh.write(f'desk/tasks/{prot}.md\ndesk/tasks/{prot_unrequested}.md\n')
    return root, task_a, free, prot, prot_unrequested, sym, outside


def _files(root, *ids):
    return {str((root / 'desk' / 'tasks' / f'{i}.md').resolve()) for i in ids}


def test_no_file_is_opened_before_or_instead_of_its_guards(guard_env, tmp_path):
    root, a, free, prot, prot_q, sym, outside = guard_env
    srv = AuditedServer(root, tmp_path)
    try:
        forbidden = _files(root, prot, prot_q) | {str(outside.resolve()), str((root / 'desk' / 'tasks' / f'{sym}.md'))}
        # 1. documento protegido SOLICITADO: se rechaza con su estado y nunca se abre
        for url in (src_id(f'TaskDoc:{prot}'), f'/api/workspace/node?id=TaskDoc:{prot}&depth=1',
                    src_path(f'desk/tasks/{prot}.md')):
            mark = srv.mark()
            status, data = get(srv.url, url)
            assert status == 403 and data['estado'] == 'protegido', (url, status, data)
            assert not (srv.opened_since(mark) & forbidden), (url, srv.opened_since(mark) & forbidden)
        # 2. symlink que escapa SOLICITADO
        for url in (src_id(f'TaskDoc:{sym}'), f'/api/workspace/node?id=TaskDoc:{sym}&depth=1'):
            mark = srv.mark()
            status, data = get(srv.url, url)
            assert status == 403 and data['estado'] == 'fuera_del_repo', (url, status, data)
            assert not (srv.opened_since(mark) & forbidden), (url, srv.opened_since(mark) & forbidden)
        # 3. documentos indexados NO solicitados (protegidos, symlink y el autorizado B): /source de A no los abre
        mark = srv.mark()
        status, data = get(srv.url, src_id(f'TaskDoc:{a}'))
        assert status == 200
        opened = srv.opened_since(mark)
        assert not (opened & forbidden), opened & forbidden
        assert str((root / 'desk' / 'tasks' / f'{free}.md').resolve()) not in opened, 'se abrio otro documento autorizado'
        assert str((root / 'desk' / 'tasks' / f'{a}.md').resolve()) in opened  # el pedido si
        # 4. /nodes: cada no autorizado aparece con su estado y su name, y nunca se abre
        mark = srv.mark()
        status, data = get(srv.url, '/api/workspace/nodes')
        assert status == 200
        assert not (srv.opened_since(mark) & forbidden), srv.opened_since(mark) & forbidden
        by_id = {n['id']: n for n in data['nodes']}
        assert by_id[f'TaskDoc:{prot}']['estado'] == 'protegido' and by_id[f'TaskDoc:{prot}']['title'] == prot
        assert by_id[f'TaskDoc:{prot_q}']['estado'] == 'protegido'
        assert by_id[f'TaskDoc:{sym}']['estado'] == 'fuera_del_repo' and by_id[f'TaskDoc:{sym}']['title'] == sym
        assert by_id[f'TaskDoc:{a}']['estado'] == 'ok' and by_id[f'TaskDoc:{a}']['title'] == 'Tarea A'
        # 5. /node de A a dos saltos: ningun no autorizado se abre
        mark = srv.mark()
        status, data = get(srv.url, f'/api/workspace/node?id=TaskDoc:{a}&depth=2')
        assert status == 200
        assert not (srv.opened_since(mark) & forbidden), srv.opened_since(mark) & forbidden
        # 6. enlaces con ancla hacia destinos no autorizados: se informa el estado, el destino no se abre
        (root / 'notes' / 'a-protegidos.md').write_text(
            '# A\n\nIgnorado [[ignorado.md#X]], escape [[escape.md#X]].\n', encoding='utf-8')
        mark = srv.mark()
        status, data = get(srv.url, src_path('notes/a-protegidos.md'))
        assert status == 200
        links = link_by_raw(data)
        assert links['[[ignorado.md#X]]']['estado'] == 'protegido' and links['[[ignorado.md#X]]']['open'] is None
        assert links['[[escape.md#X]]']['estado'] == 'fuera_del_repo' and links['[[escape.md#X]]']['open'] is None
        opened = srv.opened_since(mark)
        assert str((root / 'ignorado.md').resolve()) not in opened and str((tmp_path / 'fuera.md').resolve()) not in opened
    finally:
        srv.close()


# ---------------------------------------------------------------- anclas

def test_anchor_must_exist_in_own_modeled_and_unmodeled_targets(env, server):
    root, task_a, task_b = env
    (root / 'notes' / 'anclas.md').write_text(
        '# Anclas\n\n## Propia\n\n'
        'Propio ok [[#Propia]] y propio inexistente [[#Falta]].\n'
        f'No modelado ok [[notes/otro.md#Segunda parte]] e inexistente [[notes/otro.md#Nada]].\n'
        f'Modelado ok [[desk/tasks/{task_b}.md#Goal]] e inexistente [[desk/tasks/{task_b}.md#Nada]].\n'
        f'Por nombre ok [[{task_b}#Goal]] e inexistente [[{task_b}#Nada]].\n', encoding='utf-8')
    status, data = get(server, src_path('notes/anclas.md'))
    assert status == 200
    links = link_by_raw(data)
    ok_raws = ['[[#Propia]]', '[[notes/otro.md#Segunda parte]]', f'[[desk/tasks/{task_b}.md#Goal]]', f'[[{task_b}#Goal]]']
    for raw in ok_raws:
        assert links[raw]['status'] == 'ok' and links[raw]['open'] is not None, (raw, links[raw])
    bad_raws = ['[[#Falta]]', '[[notes/otro.md#Nada]]', f'[[desk/tasks/{task_b}.md#Nada]]', f'[[{task_b}#Nada]]']
    for raw in bad_raws:
        link = links[raw]
        assert link['status'] == 'roto' and link['estado'] == 'ancla_inexistente', (raw, link)
        assert link['open'] is None, 'una ancla inexistente no es navegable'
        assert link['cause'] and link['origin']['path'] == 'notes/anclas.md' and link['origin']['line']
    # no se expande contenido del destino en la clasificacion
    assert 'content' not in links['[[notes/otro.md#Nada]]'] and 'text' not in links['[[notes/otro.md#Nada]]']


# ---------------------------------------------------------------- dueño de la procedencia (datos reales)

@pytest.fixture
def owner_env(env):
    """P depende de Q y R; S depende de P (entrante, mismo nombre de campo); U depende de S (2 saltos)."""
    root, task_a, task_b = env
    ops = DeskopsOperations(root)

    def new(title, **kw):
        return ops.create_task_bundle(dict(
            title=title, goal=f'{title} meta', scope='Desk temporal', implementation_path='x',
            validation=['pytest'], done_when='listo', **kw)).task_id
    q, r = new('Dest Q'), new('Dest R')
    p = new('Doc P', depends_on=[q, r])
    s = new('Doc S', depends_on=[p])
    u = new('Doc U', depends_on=[s])
    return p, q, r, s, u


def run_node(script: str, payload) -> dict:
    """Ejecuta reader.mjs real (node) sobre datos reales de la API."""
    reader = Path(serve.__file__).resolve().parent / 'views' / 'workspace' / 'node' / 'reader.mjs'
    code = f"import * as R from {json.dumps(reader.as_uri())};\nconst D = JSON.parse(await new Response(process.stdin).text());\n{script}"
    res = subprocess.run(['node', '--input-type=module', '-e', code], input=json.dumps(payload), capture_output=True, text=True, timeout=60)
    assert res.returncode == 0, res.stderr
    return json.loads(res.stdout)


def test_edge_provenance_carries_owner_document(owner_env, server):
    p, q, r, s, u = owner_env
    status, node = get(server, f'/api/workspace/node?id=TaskDoc:{p}&depth=2')
    edges = node['projections']['graph']['edges']
    by = {(e['source'], e['target']): e for e in edges}
    out = by[(f'TaskDoc:{p}', f'TaskDoc:{q}')]
    assert [pr['owner'] for pr in out['provenance'] if pr.get('field') == 'depends_on'] == [f'TaskDoc:{p}']
    inc = by[(f'TaskDoc:{s}', f'TaskDoc:{p}')]
    assert [(pr['owner'], pr['field']) for pr in inc['provenance'] if pr.get('field') == 'depends_on'] == [(f'TaskDoc:{s}', 'depends_on')]
    two = by[(f'TaskDoc:{u}', f'TaskDoc:{s}')]
    assert two['provenance'][0]['owner'] == f'TaskDoc:{u}'
    # relation_doc y structural no tienen campo ni dueño
    for e in edges:
        for pr in e['provenance']:
            if pr.get('origin') != 'schema':
                assert pr['owner'] is None


def test_focus_uses_only_fields_owned_by_the_open_document(owner_env, server):
    p, q, r, s, u = owner_env
    pid = f'TaskDoc:{p}'
    status, node = get(server, f'/api/workspace/node?id={pid}&depth=2')
    status, src = get(server, src_id(pid))
    payload = {'edges': node['projections']['graph']['edges'], 'fields': src['fields'], 'docId': pid,
               'q': f'TaskDoc:{q}', 'r': f'TaskDoc:{r}', 's': f'TaskDoc:{s}', 'u': f'TaskDoc:{u}'}
    result = run_node('''
      const key = e => `${e.source}>${e.target}`;
      const edge = (a, b) => D.edges.find(e => e.source === a && e.target === b);
      const hl = (focus) => D.edges.filter(e => R.edgeHighlighted(e, focus, D.docId)).map(key).sort();
      const out = {};
      out.fieldFocus = hl(R.fieldFocus('depends_on'));
      out.edgeOut = R.correspondence(R.edgeFocus(edge(D.docId, D.q)), {fields: D.fields, edges: D.edges, docId: D.docId});
      out.edgeIn = R.correspondence(R.edgeFocus(edge(D.s, D.docId)), {fields: D.fields, edges: D.edges, docId: D.docId});
      out.edgeTwo = R.correspondence(R.edgeFocus(edge(D.u, D.s)), {fields: D.fields, edges: D.edges, docId: D.docId});
      out.fieldsHlIn = D.fields.filter(f => R.fieldHighlighted(f.field_path, R.edgeFocus(edge(D.s, D.docId)), D.edges, D.docId)).map(f => f.field_path);
      out.fieldsHlOut = D.fields.filter(f => R.fieldHighlighted(f.field_path, R.edgeFocus(edge(D.docId, D.q)), D.edges, D.docId)).map(f => f.field_path);
      out.ownedIn = R.edgeFields(edge(D.s, D.docId), D.docId);
      out.ownedOut = R.edgeFields(edge(D.docId, D.q), D.docId);
      out.decl = R.edgeDeclarations(edge(D.s, D.docId));
      console.log(JSON.stringify(out));
    ''', payload)
    key = lambda a, b: f'TaskDoc:{a}>TaskDoc:{b}'  # noqa: E731
    # el campo depends_on de P resalta solo las aristas que P declara; la entrante de S (mismo nombre) no
    assert result['fieldFocus'] == sorted([key(p, q), key(p, r)])
    assert result['edgeOut'] == {'document': 1, 'graph': 1, 'code': 0}
    # entrante y vecino a dos saltos: se muestran, no resaltan ningun campo propio
    assert result['edgeIn'] == {'document': 0, 'graph': 1, 'code': 0}
    assert result['edgeTwo'] == {'document': 0, 'graph': 1, 'code': 0}
    assert result['fieldsHlIn'] == [] and result['fieldsHlOut'] == ['depends_on']
    assert result['ownedIn'] == [] and result['ownedOut'] == ['depends_on']
    # la declaracion de otro documento se conserva y se atribuye a su dueño
    assert result['decl'] == [{'owner': f'TaskDoc:{s}', 'field': 'depends_on', 'declared': p}]
