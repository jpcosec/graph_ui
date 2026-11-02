import hashlib, json, os, socket, subprocess, sys, time, shutil
from pathlib import Path
from urllib.request import urlopen
from urllib.error import HTTPError

GRAPH_UI = Path('/home/jp/proyectos/SLDB_1/UIs/graph_ui')
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(GRAPH_UI / 'tests')); sys.path.insert(0, str(GRAPH_UI / 'frontends'))
import test_mindmap_workspace_explorer as T   # solo helpers de fixture reales

def freeport():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close()
    assert p not in (8090, 8091, 8092); return p

class Server:
    def __init__(self, root, work, extra_env=None, store=None):
        self.root = Path(root); self.work = Path(work); self.work.mkdir(parents=True, exist_ok=True)
        self.port = freeport()
        self.log = self.work / 'hook.jsonl'; self.log.write_text('')
        self.trigger = self.work / 'control.trigger'
        env = dict(os.environ, HOOK_LOG=str(self.log), CONTROL_TRIGGER=str(self.trigger), GRAPH_UI=str(GRAPH_UI),
                   CONTROL_DIR=str(self.work / 'sandbox'), SLDB_STORE=str(store or self.root / '.sldb'))
        for k in ('DESKOPS_ROOT', 'WORKSPACE_EXPLORER_ROOTS', 'SLDB_PYTHONPATH'): env.pop(k, None)
        env.update(extra_env or {})
        self.err = open(self.work / 'server.stderr', 'w')
        self.proc = subprocess.Popen([sys.executable, str(HERE / 'hook_serve.py'), str(self.port)], env=env,
                                     cwd=str(self.work), stdout=open(self.work / 'server.stdout', 'w'), stderr=self.err)
        self.url = f'http://127.0.0.1:{self.port}'
        for _ in range(150):
            if any(e['k'] == 'SERVER_START' for e in self.events()):
                try: urlopen(self.url + '/', timeout=5).read(); break
                except Exception: pass
            time.sleep(0.2)
        else: raise SystemExit('serve no arranco')
    def events(self): return [json.loads(l) for l in self.log.read_text().splitlines() if l]
    def get(self, path):
        n0 = len(self.events())
        try: r = urlopen(self.url + path, timeout=120); code, body = r.status, r.read()
        except HTTPError as e: code, body = e.code, e.read()
        try: data = json.loads(body)
        except Exception: data = {'raw': body[:200].decode('utf-8', 'replace')}
        return code, data, self.events()[n0:]
    def control(self):
        n0 = len(self.events()); self.trigger.write_text('1')
        for _ in range(200):
            if any(e['k'] in ('CONTROL_END',) for e in self.events()[n0:]): break
            time.sleep(0.05)
        return self.events()[n0:]
    def close(self):
        self.proc.terminate()
        try: self.proc.wait(timeout=20)
        except Exception: self.proc.kill()

def writes(events):
    """Eventos de escritura de filesystem (excluye marcadores, INFO y pipes a subprocesos)."""
    return [e for e in events if e['k'] not in ('SERVER_START', 'CONTROL_BEGIN', 'CONTROL_END', 'CONTROL_ERROR', 'pipe_write', 'read_sentinel', 'enum_forbidden')
            and not e['k'].startswith('INFO_')]

def snap(root):
    """sha256+mtime_ns de TODO archivo (incluido .git y .sldb), directorios, sin ejecutar git."""
    d = {}
    for p in sorted(Path(root).rglob('*')):
        rel = str(p.relative_to(root))
        if p.is_symlink(): d[rel] = ('link', os.readlink(p))
        elif p.is_dir(): d[rel] = 'dir'
        else:
            st = p.stat(); d[rel] = (hashlib.sha256(p.read_bytes()).hexdigest(), st.st_mtime_ns, st.st_mode)
    return d

def gitstate(root):
    env = dict(os.environ, GIT_OPTIONAL_LOCKS='0')
    if not (Path(root) / '.git').exists(): return None
    s = subprocess.run(['git', '-C', str(root), 'status', '--porcelain'], capture_output=True, text=True, env=env).stdout
    h = subprocess.run(['git', '-C', str(root), 'rev-parse', 'HEAD'], capture_output=True, text=True, env=env).stdout.strip()
    return (s, h)

def sdiff(a, b):
    return [k for k in sorted(set(a) | set(b)) if a.get(k) != b.get(k)]

def other_process(root, action, arg):
    return T.other_process(Path(root), action, arg)

def fresh(name):
    w = Path('/tmp') / f'tester-ws132-{name}'
    shutil.rmtree(w, ignore_errors=True); w.mkdir(parents=True); return w
