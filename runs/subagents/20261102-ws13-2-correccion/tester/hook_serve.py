"""Tester WS13.2: proceso real de serve.py con sys.addaudithook (escrituras de filesystem).
Control positivo en ESTE mismo proceso, fuera de los GET: un hilo ejecuta una bateria conocida
en un sandbox cuando aparece CONTROL_TRIGGER. Uso: hook_serve.py <puerto>"""
import os, sys, json, threading, time, shutil, tempfile, sqlite3, subprocess, mmap
from pathlib import Path

LOG = os.environ['HOOK_LOG']
fd = os.open(LOG, os.O_WRONLY | os.O_CREAT | os.O_APPEND, 0o644)
WRITE_FLAGS = os.O_WRONLY | os.O_RDWR | os.O_CREAT | os.O_TRUNC | os.O_APPEND
EV = {'os.remove', 'os.rename', 'os.mkdir', 'os.rmdir', 'os.truncate', 'os.chmod', 'os.utime', 'os.link',
      'os.symlink', 'os.chown', 'shutil.copyfile', 'shutil.copymode', 'shutil.copystat', 'shutil.copytree',
      'shutil.move', 'shutil.rmtree', 'shutil.make_archive', 'shutil.unpack_archive', 'os.mkfifo', 'os.mknod',
      'os.truncate', 'os.setxattr', 'os.removexattr', 'os.lchown'}
cur = {'step': None}

def emit(kind, detail=None):
    os.write(fd, (json.dumps({'k': kind, 'd': detail, 't': threading.current_thread().name, 'step': cur['step']},
                             default=str) + '\n').encode())

def hook(event, args):
    if event == 'open':
        path, mode, flags = args
        m = mode or ''
        w = any(c in m for c in 'wax+') or (isinstance(flags, int) and bool(flags & WRITE_FLAGS))
        if not w and isinstance(path, str) and 'CENTINELA' in path:
            emit('read_sentinel', [path, m, flags])
        if w:
            tgt = str(path)
            if isinstance(path, int):
                try: tgt = os.readlink(f'/proc/self/fd/{path}')
                except OSError: tgt = '?'
            emit('pipe_write' if tgt.startswith('pipe:') else 'open_write', [tgt, m, flags])
    elif event in EV:
        emit(event, [str(a) for a in args])
    elif event in ('os.listdir', 'os.scandir') and args and args[0] is not None and any(
            t in str(args[0]) for t in ('.git', '.hidden', '__pycache__', 'node_modules', '.cache', '.venv', 'CENTINELA', '.oculto')):
        emit('enum_forbidden', [event, str(args[0])])
    elif event in ('subprocess.Popen', 'sqlite3.connect', 'mmap.__new__'):
        emit('INFO_' + event, [str(a) for a in args][:2])

sys.addaudithook(hook)

def battery(sb: Path):
    steps = []
    def step(name):
        cur['step'] = name
    P = lambda n: sb / n
    sb.mkdir(exist_ok=True)
    # --- apertura con escritura
    step('open_w'); open(P('a'), 'w').write('1')
    step('open_a'); open(P('a'), 'a').write('2')
    step('open_r+'); f = open(P('a'), 'r+'); f.write('3'); f.close()
    step('open_x'); open(P('x'), 'x').close()
    step('os.open_WRONLY_CREAT'); os.close(os.open(P('b'), os.O_WRONLY | os.O_CREAT))
    step('os.open_RDWR'); os.close(os.open(P('b'), os.O_RDWR))
    step('os.open_O_TRUNC_RDONLY'); os.close(os.open(P('b'), os.O_RDONLY | os.O_TRUNC))
    step('os.open_O_APPEND'); os.close(os.open(P('b'), os.O_WRONLY | os.O_APPEND))
    step('Path.write_text'); P('c').write_text('hola')
    step('Path.write_bytes'); P('c').write_bytes(b'hola')
    step('Path.touch'); P('t').touch()
    step('write_same_content_restore')
    orig = P('c').read_bytes(); P('c').write_bytes(b'otro'); P('c').write_bytes(orig)
    step('write_same_content_only'); P('c').write_bytes(orig)
    step('io.open_w'); import io; io.open(P('i'), 'w').close()
    step('tempfile.NamedTemporaryFile'); tempfile.NamedTemporaryFile(dir=sb).close()
    step('os.fdopen_via_fd_w'); fdx = os.open(P('fd'), os.O_WRONLY | os.O_CREAT); os.fdopen(fdx, 'w').close()
    # --- nombres
    step('os.rename'); os.rename(P('t'), P('t2'))
    step('os.replace'); os.replace(P('t2'), P('t3'))
    step('os.remove'); os.remove(P('t3'))
    step('os.unlink'); os.unlink(P('i'))
    step('Path.unlink'); P('fd').unlink()
    step('os.mkdir'); os.mkdir(P('d'))
    step('os.makedirs'); os.makedirs(P('e/f/g'))
    step('os.rmdir'); os.rmdir(P('d'))
    step('os.removedirs'); os.removedirs(P('e/f/g'))
    step('os.link'); os.link(P('c'), P('hard'))
    step('os.symlink'); os.symlink(P('c'), P('sym'))
    step('os.unlink_symlink'); os.unlink(P('sym'))
    # --- atributos
    step('os.truncate_path'); os.truncate(P('c'), 1)
    step('os.ftruncate_fd'); fdt = os.open(P('c'), os.O_RDWR); os.ftruncate(fdt, 0); os.close(fdt)
    step('os.chmod'); os.chmod(P('c'), 0o600)
    step('os.fchmod_fd'); fdc = os.open(P('c'), os.O_RDONLY); os.fchmod(fdc, 0o644); os.close(fdc)
    step('os.utime_path'); os.utime(P('c'), (1, 1))
    step('os.utime_fd'); fdu = os.open(P('c'), os.O_RDONLY); os.utime(fdu, (2, 2)); os.close(fdu)
    step('os.chown_self'); os.chown(P('c'), os.getuid(), os.getgid())
    step('Path.chmod'); P('c').chmod(0o600)
    # --- shutil
    step('shutil.copyfile'); shutil.copyfile(P('c'), P('cp1'))
    step('shutil.copy'); shutil.copy(P('c'), P('cp2'))
    step('shutil.copy2'); shutil.copy2(P('c'), P('cp3'))
    step('shutil.copytree'); (sb/'src').mkdir(); (sb/'src'/'z').write_text('z'); shutil.copytree(P('src'), P('dst'))
    step('shutil.move'); shutil.move(P('cp1'), P('cp1m'))
    step('shutil.rmtree'); shutil.rmtree(P('dst'))
    step('shutil.make_archive'); shutil.make_archive(str(P('arch')), 'zip', str(P('src')))
    # --- lo que probablemente NO se ve (se informa)
    step('GAP_write_through_open_fd'); fw = open(P('c'), 'r+'); fw.write('A'); fw.flush(); fw.close()
    step('GAP_os.write_on_prev_fd'); fdw = os.open(P('gap'), os.O_WRONLY | os.O_CREAT); os.write(fdw, b'x'); os.close(fdw)
    step('GAP_sqlite3_write'); cx = sqlite3.connect(str(P('db.sqlite'))); cx.execute('create table t(a)'); cx.commit(); cx.close()
    step('GAP_subprocess_touch'); subprocess.run(['touch', str(P('child'))])
    step('GAP_mmap_write'); fm = os.open(P('m'), os.O_RDWR | os.O_CREAT); os.write(fm, b'0000'); mm = mmap.mmap(fm, 4); mm[0:1] = b'1'; mm.flush(); mm.close(); os.close(fm)
    step('GAP_rename_via_subprocess_mv'); subprocess.run(['mv', str(P('child')), str(P('child2'))])
    step('enum_listdir_forbidden'); (sb/'.hidden').mkdir(); os.listdir(sb/'.hidden')
    step('enum_scandir_forbidden'); list(os.scandir(sb/'.hidden'))
    step('enum_Path_rglob_forbidden'); list((sb/'.hidden').rglob('*'))
    step(None)

def control():
    trig = Path(os.environ['CONTROL_TRIGGER']); sb = Path(os.environ['CONTROL_DIR'])
    while True:
        if trig.exists():
            os.remove(trig)
            cur['step'] = 'CONTROL'
            emit('CONTROL_BEGIN')
            try:
                battery(sb)
            except Exception as e:
                emit('CONTROL_ERROR', repr(e))
            emit('CONTROL_END'); cur['step'] = None
            shutil.rmtree(sb, ignore_errors=True)
        time.sleep(0.05)

threading.Thread(target=control, daemon=True, name='control').start()
sys.path.insert(0, str(Path(os.environ['GRAPH_UI']) / 'frontends'))
from mindmap import serve
emit('SERVER_START')
serve.main([sys.argv[1]])
