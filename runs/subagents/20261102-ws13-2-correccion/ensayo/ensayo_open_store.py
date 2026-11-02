"""Ensayo del punto 1 (WS13.2-correccion): que hacen los GET /nodes y /explorer en un proceso real de
serve.py (hook_serve.py) sobre store canonico preparado, con la vista actual (modo A: _fresh_listing con
new_operation) y con sldb.api.open_store(readonly) (modo B). Uso: ensayo_open_store.py <A|B> <workdir>"""
import hashlib, json, os, socket, subprocess, sys, time
from pathlib import Path
from urllib.request import urlopen
from urllib.error import HTTPError

GRAPH_UI = Path(__file__).resolve().parents[4]
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(GRAPH_UI / 'tests'))
sys.path.insert(0, str(GRAPH_UI / 'frontends'))
import test_mindmap_workspace_explorer as T  # helpers reales de prueba (stores/repos reales)

mode, work = sys.argv[1], Path(sys.argv[2])
import shutil
shutil.rmtree(work, ignore_errors=True); work.mkdir(parents=True)
root = work / 'repo'; root.mkdir()
T.git_init(root)
(root / '.gitignore').write_text('desk/privado/\n')
ops = T.prepare_store(root)
task = ops.create_task_bundle(dict(title='Tarea sana', goal='Meta', scope='S', implementation_path='P',
                                   validation=['pytest'], done_when='listo')).task_id
T.add_bad_model(root, work)
T.write(root, 'desk/notas/uno.md'); T.write(root, 'docs/faq.md', '# FAQ\n')
T.commit_all(root)

def snapshot():
    d = {}
    for p in sorted(root.rglob('*')):
        rel = p.relative_to(root)
        if rel.parts[0] == '.git' or p.is_dir() or p.is_symlink():
            continue
        st = p.stat()
        d[str(rel)] = (hashlib.sha256(p.read_bytes()).hexdigest(), st.st_mtime_ns)
    porc = subprocess.run(['git', '-C', str(root), 'status', '--porcelain'], capture_output=True, text=True).stdout
    head = subprocess.run(['git', '-C', str(root), 'rev-parse', 'HEAD'], capture_output=True, text=True).stdout.strip()
    dirs = sorted(str(p.relative_to(root)) for p in root.rglob('*') if p.is_dir() and '.git' not in p.relative_to(root).parts)
    return {'files': d, 'dirs': dirs, 'git': (porc, head)}

def diff(a, b):
    out = []
    for k in sorted(set(a['files']) | set(b['files'])):
        if a['files'].get(k) != b['files'].get(k):
            out.append(('sha/mtime', k, a['files'].get(k), b['files'].get(k)))
    if a['dirs'] != b['dirs']:
        out.append(('dirs', sorted(set(a['dirs']) ^ set(b['dirs']))))
    if a['git'] != b['git']:
        out.append(('git', a['git'], b['git']))
    return out

s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close()
assert port not in (8090, 8091, 8092)
log = work / 'hook.jsonl'; log.write_text('')
ctl = work / 'control'
env = dict(os.environ, HOOK_LOG=str(log), CONTROL_TRIGGER=str(work / 'control.trigger'), CONTROL_DIR=str(ctl),
           GRAPH_UI=str(GRAPH_UI), SLDB_STORE=str(root / '.sldb'), TRIAL_OPEN_STORE='1' if mode == 'B' else '0')
env.pop('WORKSPACE_EXPLORER_ROOTS', None); env.pop('DESKOPS_ROOT', None)
errf = open(work / 'server.stderr', 'w')
srv = subprocess.Popen([sys.executable, str(HERE / 'hook_serve.py'), str(port)], env=env, cwd=str(work),
                       stdout=open(work / 'server.stdout', 'w'), stderr=errf)
url = f'http://127.0.0.1:{port}'
for _ in range(100):
    try:
        urlopen(url + '/api/workspace/nodes', timeout=5).read(); break
    except Exception:
        time.sleep(0.2)

def events():
    return [json.loads(l) for l in log.read_text().splitlines() if l]

def get(path):
    n0 = len(events())
    try:
        r = urlopen(url + path, timeout=120); code, body = r.status, r.read()
    except HTTPError as e:
        code, body = e.code, e.read()
    ev = events()[n0:]
    return code, json.loads(body), ev

print(f'=== MODO {mode} ({"open_store(readonly)" if mode=="B" else "new_operation actual"}) puerto {port} pid {srv.pid}')
print('repo:', root)
base = snapshot()
tot_w = 0
def run_get(path, label=None):
    global base, tot_w
    code, body, ev = get(path)
    now = snapshot()
    d = diff(base, now); base = now
    writes = [e for e in ev if e['k'] not in ('FRESH_LISTING_OPEN_STORE_BEGIN', 'FRESH_LISTING_OPEN_STORE_END', 'open_write_fd_pipe')]
    pipes = [e for e in ev if e['k'] == 'open_write_fd_pipe']
    called = sum(1 for e in ev if e['k'] == 'FRESH_LISTING_OPEN_STORE_BEGIN')
    tot_w += len(writes) + len(d)
    print(f'GET {label or path}: HTTP {code}; open_store llamado {called}x; eventos de escritura a archivo {len(writes)} (pipes a subprocesos {len(pipes)}); difs sha/mtime/dirs/git {len(d)}')
    for e in writes: print('   EVENTO', e)
    for x in d: print('   DIF', x)
    return code, body

for p in ['/api/workspace/explorer', '/api/workspace/nodes', '/api/workspace/explorer', '/api/workspace/nodes',
          f'/api/workspace/node?id=TaskDoc:{task}', '/api/workspace/source?path=docs/faq.md']:
    run_get(p)

# control positivo: el mismo proceso, fuera de un GET
n0 = len(events()); (work / 'control.trigger').write_text('1')
for _ in range(100):
    if any(e['k'] == 'CONTROL_END' for e in events()[n0:]): break
    time.sleep(0.05)
ctl_ev = [e for e in events()[n0:] if e['k'] not in ('CONTROL_BEGIN', 'CONTROL_END')]
print('CONTROL POSITIVO (fuera de GET, mismo proceso):', len(ctl_ev), 'eventos:', [e['k'] for e in ctl_ev])
base = snapshot()

# refresco entre procesos con el servidor vivo
def other(action, arg=''):
    return T.other_process(root, action, arg)
def ids(path, key):
    return {m['id'] if 'id' in m else m['path'] for m in get(path)[1][key]}
def exp():
    c, b = run_get('/api/workspace/explorer', 'explorer(refresco)')
    return {m['id'] for m in b['modeled']}, {u['path'] for u in b['unmodeled']}
def nodes():
    c, b = run_get('/api/workspace/nodes', 'nodes(refresco)')
    return {n['id'] for n in b['nodes']}
res = {}
new = other('create', 'Alta externa'); ident = f'TaskDoc:{new}'; rel = f'desk/tasks/{new}.md'
base = snapshot()  # el otro proceso escribio; la linea base se retoma tras su operacion
m, u = exp(); res['alta'] = ident in m and ident in nodes() and rel not in u
other('untrack', new); base = snapshot()
m, u = exp(); res['untrack'] = ident not in m and rel in u and ident not in nodes()
other('track', rel); base = snapshot()
m, u = exp(); res['track'] = ident in m and rel not in u and ident in nodes()
other('delete', new); base = snapshot()
m, u = exp(); res['baja'] = ident not in m and rel not in u and ident not in nodes()
print('REFRESCO ENTRE PROCESOS:', res)
# store inexistente: error sin crearlo
ghost = work / 'sin_store'; ghost.mkdir()
print('TOTAL escrituras/difs observadas durante GET:', tot_w)
srv.terminate(); srv.wait(timeout=20)
print('stderr servidor:', (work / 'server.stderr').read_text()[-400:] or '(vacio)')
