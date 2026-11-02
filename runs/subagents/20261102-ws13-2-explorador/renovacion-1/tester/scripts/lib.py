import hashlib, json, os, subprocess, sys, time, socket
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from deskops.bootstrap import SLDBBootstrap
from deskops.lifecycle import ensure_lifecycle_graph
from deskops.operations import DeskopsOperations
from deskops.workspace import scaffold_desk

GU = '/home/jp/proyectos/SLDB_1/UIs/graph_ui'
SERVE = GU + '/frontends/mindmap/serve.py'
HOOK = '''
import sys, runpy, os
log = os.open(os.environ['AUDIT_LOG'], os.O_WRONLY|os.O_CREAT|os.O_APPEND)
def h(ev, args):
    if ev in ('open',) and args and isinstance(args[0], (str, bytes)):
        p = args[0] if isinstance(args[0], str) else args[0].decode('utf-8','replace')
        os.write(log, (p + "\\n").encode('utf-8','replace'))
sys.addaudithook(h)
sys.argv = [os.environ['SERVE']] + sys.argv[1:]
runpy.run_path(os.environ['SERVE'], run_name='__main__')
'''
def sha(b): return hashlib.sha256(b).hexdigest()
def free_port():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p
def git_init(root):
    subprocess.run(['git','init','-q',str(root)],check=True)
    subprocess.run(['git','-C',str(root),'config','user.name','t'],check=True)
    subprocess.run(['git','-C',str(root),'config','user.email','t@e.com'],check=True)
def write(root, rel, text='# t\n'):
    p = Path(root)/rel; p.parent.mkdir(parents=True, exist_ok=True); p.write_text(text, encoding='utf-8'); return p
def prepare(root, git=True):
    root = Path(root); root.mkdir(parents=True, exist_ok=True)
    if git: git_init(root)
    assert SLDBBootstrap().init_local_store(root) == 0
    scaffold_desk(root); ensure_lifecycle_graph(root)
    return DeskopsOperations(root)
def commit(root):
    subprocess.run(['git','-C',str(root),'add','-A'],check=True,capture_output=True)
    subprocess.run(['git','-C',str(root),'commit','-q','-m','b'],check=True,capture_output=True)
def state(root):
    root = Path(root); st = {}
    for p in sorted(root.rglob('*')):
        rel = p.relative_to(root)
        if rel.parts[0] == '.git' or p.is_dir() or p.is_symlink(): continue
        st[str(rel)] = sha(p.read_bytes())
    g = None
    if (root/'.git').exists():
        a = subprocess.run(['git','-C',str(root),'status','--porcelain'],capture_output=True,text=True).stdout
        h = subprocess.run(['git','-C',str(root),'rev-parse','HEAD'],capture_output=True,text=True).stdout
        g = (a,h)
    return st, g
class Srv:
    def __init__(self, root, env=None, audit=None, store=None):
        self.port = free_port(); e = dict(os.environ)
        e.pop('DESKOPS_ROOT', None); e.pop('WORKSPACE_EXPLORER_ROOTS', None); e.pop('SLDB_PYTHONPATH', None)
        e['SLDB_STORE'] = str(store or (Path(root)/'.sldb'))
        e.update(env or {})
        cmd = [sys.executable, SERVE, str(self.port)]
        if audit:
            e['AUDIT_LOG'] = audit; e['SERVE'] = SERVE
            cmd = [sys.executable, '-c', HOOK, str(self.port)]
        self.p = subprocess.Popen(cmd, env=e, cwd='/tmp', stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        self.url = f'http://127.0.0.1:{self.port}'
        for _ in range(100):
            try: urlopen(self.url + '/', timeout=1); break
            except Exception: time.sleep(0.2)
        else: raise RuntimeError('server no arranca')
    def get(self, path, method='GET'):
        try: r = urlopen(Request(self.url+path, method=method, data=b'{}' if method!='GET' else None), timeout=60)
        except HTTPError as x: r = x
        with r:
            b = r.read()
            try: return r.status, json.loads(b)
            except ValueError: return r.status, {'raw': b.decode('utf-8','replace')}
    def close(self):
        self.p.terminate()
        try: self.p.wait(5)
        except Exception: self.p.kill()
