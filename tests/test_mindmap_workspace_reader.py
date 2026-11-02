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
