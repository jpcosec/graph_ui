"""Prueba manual en proceso real: serve.py sobre copias de store en /dev/shm.

uso: python manual.py <tree(new|old)> <repo_template> <workdir>
"""
import hashlib, json, os, shutil, socket, subprocess, sys, time, urllib.request, urllib.error
from pathlib import Path

PY = sys.executable
tree, template, work = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
work.mkdir(parents=True, exist_ok=True)


def state(store):
    out = {}
    for d in (store, store.parent / '.sldb_cache'):
        if d.exists():
            out.update(_state(d))
    return out


def sldb_only(st):
    return {k: v for k, v in st.items() if not k.startswith('.sldb_cache/')}


def _state(store):
    return {str(p.relative_to(store.parent)): (hashlib.sha256(p.read_bytes()).hexdigest(), p.stat().st_mtime_ns)
            for p in sorted(store.rglob('*')) if p.is_file()}


def free_port():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p


def start(store):
    port = free_port()
    env = dict(os.environ, SLDB_STORE=str(store), TMPDIR='/dev/shm', PYTHONPATH=str(tree / 'frontends'))
    env.pop('DESKOPS_ROOT', None); env.pop('WORKSPACE_EXPLORER_ROOTS', None)
    log = open(work / f'server-{port}.log', 'w')
    proc = subprocess.Popen([PY, 'frontends/mindmap/serve.py', str(port)], cwd=tree, env=env,
                            stdout=log, stderr=subprocess.STDOUT)
    for _ in range(300):
        try:
            socket.create_connection(('127.0.0.1', port), timeout=0.2).close(); break
        except OSError:
            if proc.poll() is not None:
                break
            time.sleep(0.1)
    return proc, port


def stop(proc):
    if proc.poll() is None:
        os.kill(proc.pid, 15)
        try: proc.wait(10)
        except subprocess.TimeoutExpired: os.kill(proc.pid, 9); proc.wait()


def get(port, path):
    try:
        with urllib.request.urlopen(f'http://127.0.0.1:{port}{path}', timeout=60) as r:
            body = r.read()
            return r.status, body
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def short(body):
    try:
        d = json.loads(body)
        if isinstance(d, dict):
            return {k: d[k] for k in ('ok', 'estado', 'error') if k in d} | {'keys': sorted(d)[:8]}
        return str(d)[:200]
    except Exception:
        return body[:200]


def make_unprepared(store):
    code = ("import sys;from pathlib import Path;from sldb.store.io import load_semantic_index;"
            "from sldb.store.io.utils import yaml_dump;from sldb.store.layout import semantic_index_path;"
            "s=Path(sys.argv[1]);p=semantic_index_path(s);assert not p.exists();p.parent.mkdir(parents=True,exist_ok=True);"
            "p.write_text(yaml_dump(load_semantic_index(s).model_dump(mode='json')),encoding='utf-8')")
    subprocess.run([PY, '-I', '-c', code, str(store)], check=True)


def prepared(store):
    r = subprocess.run([PY, '-I', '-c', 'import sys;from sldb.api import store_is_prepared as f;print(f(sys.argv[1]))', str(store)],
                       capture_output=True, text=True)
    return r.stdout.strip() or r.stderr.strip()[-200:]


out = {}
paths = ['/api/workspace/nodes', '/api/workspace/explorer']

def case(name, store, mutate_after_start=None):
    res = {'prepared_before_start': prepared(store) if store.exists() else 'no existe'}
    s0 = state(store)
    proc, port = start(store)
    s1 = state(store)
    res['startup_changed_store'] = s0 != s1
    res['startup_changed_files'] = sorted(k for k in set(s0) | set(s1) if s0.get(k) != s1.get(k))[:10]
    if mutate_after_start:
        mutate_after_start(store); res['prepared_after_mutation'] = prepared(store)
    before = state(store)
    res['gets'] = {}
    for p in paths:
        st, body = get(port, p)
        res['gets'][p] = {'status': st, 'body': short(body)}
    after = state(store)
    res['gets_changed_store'] = before != after
    res['gets_changed_files'] = sorted(k for k in set(before) | set(after) if before.get(k) != after.get(k))[:10]
    res['n_files'] = len(after)
    res['gets_changed_store_sldb_only'] = sldb_only(before) != sldb_only(after)
    res['n_files_sldb_only'] = len(sldb_only(after))
    res['sha_all_before'] = hashlib.sha256(json.dumps(before, sort_keys=True).encode()).hexdigest()
    res['sha_all_after'] = hashlib.sha256(json.dumps(after, sort_keys=True).encode()).hexdigest()
    res['prepared_after'] = prepared(store) if store.exists() else 'no existe'
    res['mindmap_file'] = None
    if mutate_after_start:
        req = urllib.request.Request(f'http://127.0.0.1:{port}/api/save', data=json.dumps({'changes': [], 'view': {}, 'viewRevision': None}).encode(),
                                     headers={'Content-Type': 'application/json'}, method='POST')
        b2 = state(store)
        try:
            with urllib.request.urlopen(req, timeout=60) as r: st, body = r.status, r.read()
        except urllib.error.HTTPError as e: st, body = e.code, e.read()
        res['post_save_empty'] = {'status': st, 'body': short(body), 'changed_store': state(store) != b2, 'prepared_after': prepared(store)}
    res['server_alive'] = proc.poll() is None
    stop(proc)
    out[name] = res


def fresh(name):
    d = work / name
    if d.exists(): shutil.rmtree(d)
    shutil.copytree(template, d, symlinks=True)
    return d / '.sldb'

# A: store no preparado ya antes de arrancar el servidor
st = fresh('unprep-at-start'); make_unprepared(st); case('A_unprepared_before_start', st)
# B: store preparado al arrancar, otro proceso lo deja no canonico despues
st = fresh('unprep-after-start'); case('B_unprepared_after_start', st, make_unprepared)
# C: store preparado
st = fresh('prepared'); case('C_prepared', st)
# D: store inexistente
case('D_missing_store', work / 'nope' / '.sldb')
# E: directorio .sldb vacio (existe, sin store_index)
d = work / 'emptydir'; shutil.rmtree(d, ignore_errors=True); (d / '.sldb').mkdir(parents=True)
subprocess.run(['git', 'init', '-q', str(d)])
case('E_empty_sldb_dir', d / '.sldb')

# F: store borrado (rm -r .sldb) con el servidor ya arrancado
st = fresh('deleted-after-start'); case('F_store_deleted_after_start', st, lambda s: shutil.rmtree(s))
# G: store_index.yaml borrado con el servidor arrancado (otro SLDBStoreError / store roto)
st = fresh('index-deleted-after-start'); case('G_store_index_deleted_after_start', st, lambda s: (s / 'core' / 'store_index.yaml').unlink())
print(json.dumps(out, indent=1, ensure_ascii=False))
