"""Lanzador instrumentado de serve.py (ensayo WS13.2-correccion). Proceso real de serve.py con
sys.addaudithook que registra efectos de escritura en JSONL. Con TRIAL_OPEN_STORE=1 reemplaza
solo _fresh_listing por sldb.api.open_store(<.sldb explicito>, mode='readonly') (el open_store real).
Control positivo: en este mismo proceso, FUERA de los GET, un hilo ejecuta escrituras conocidas en
un sandbox cuando aparece el archivo CONTROL_TRIGGER. Uso: hook_serve.py <puerto>"""
import os, sys, json, threading, time, shutil
from pathlib import Path

LOG = os.environ['HOOK_LOG']
fd = os.open(LOG, os.O_WRONLY | os.O_CREAT | os.O_APPEND, 0o644)
WRITE_FLAGS = os.O_WRONLY | os.O_RDWR | os.O_CREAT | os.O_TRUNC | os.O_APPEND
EVENTS = {'os.remove', 'os.rename', 'os.mkdir', 'os.rmdir', 'os.truncate', 'os.chmod', 'os.utime', 'os.link',
          'os.symlink', 'os.chown', 'shutil.copyfile', 'shutil.copymode', 'shutil.copystat', 'shutil.copytree',
          'shutil.move', 'shutil.rmtree', 'shutil.make_archive', 'shutil.unpack_archive'}
counts = {'read_open': 0}

def emit(kind, detail):
    os.write(fd, (json.dumps({'k': kind, 'd': detail, 't': threading.current_thread().name}, default=str) + '\n').encode())

def hook(event, args):
    if event == 'open':
        path, mode, flags = args
        m = mode or ''
        is_write = any(c in m for c in 'wax+') or (isinstance(flags, int) and flags & WRITE_FLAGS)
        if is_write and isinstance(path, int):
            # open(<fd>, ...) envuelve un descriptor ya abierto; se resuelve a lo que apunta.
            try:
                target = os.readlink(f'/proc/self/fd/{path}')
            except OSError:
                target = '?'
            emit('open_write_fd_pipe' if target.startswith('pipe:') else 'open_write', [str(path), m, flags, target])
        elif is_write:
            emit('open_write', [str(path), m, flags])
        else:
            counts['read_open'] += 1
    elif event in EVENTS:
        emit(event, [str(a) for a in args])

sys.addaudithook(hook)

def control():
    trig = Path(os.environ['CONTROL_TRIGGER'])
    sandbox = Path(os.environ['CONTROL_DIR'])
    while True:
        if trig.exists():
            os.remove(trig)  # tambien lo registra el hook: forma parte del control
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

threading.Thread(target=control, daemon=True, name='control').start()

FRONT = str(Path(os.environ['GRAPH_UI']) / 'frontends')
sys.path.insert(0, FRONT)
import mindmap.workspace_routes as wr
if os.environ.get('TRIAL_OPEN_STORE') == '1':
    def _fresh_listing(self):
        from sldb.api import open_store
        emit('FRESH_LISTING_OPEN_STORE_BEGIN', str(self.store_path))
        open_store(self.store_path, mode='readonly')
        emit('FRESH_LISTING_OPEN_STORE_END', '')
    wr.WorkspaceRoutes._fresh_listing = _fresh_listing
emit('SERVER_START', {'trial_open_store': os.environ.get('TRIAL_OPEN_STORE') == '1'})
from mindmap import serve
serve.main([sys.argv[1]])
