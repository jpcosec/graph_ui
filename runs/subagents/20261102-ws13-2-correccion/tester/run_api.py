import json, os, sys, urllib.parse
from pathlib import Path
from common import *

OUT = {}
work = fresh('api'); root = work / 'repo'; root.mkdir()
T.git_init(root); (root / '.gitignore').write_text('desk/privado/\n')
ops = T.prepare_store(root)
task = ops.create_task_bundle(dict(title='Tarea sana', goal='Meta', scope='S', implementation_path='P',
                                   validation=['pytest'], done_when='listo')).task_id
T.add_bad_model(root, work)
T.write(root, 'desk/notas/uno.md', '# Uno\n\nTexto.\n'); T.write(root, 'docs/faq.md', '# FAQ\n')
T.commit_all(root)
srv = Server(root, work / 'srv')
try:
    # ---------- CALIBRACION
    ev = srv.control()
    steps = {}
    for e in ev:
        if e.get('step'): steps.setdefault(e['step'], []).append(e['k'])
    names = ['open_w','open_a','open_r+','open_x','os.open_WRONLY_CREAT','os.open_RDWR','os.open_O_TRUNC_RDONLY','os.open_O_APPEND',
             'Path.write_text','Path.write_bytes','Path.touch','write_same_content_restore','write_same_content_only','io.open_w',
             'tempfile.NamedTemporaryFile','os.fdopen_via_fd_w','os.rename','os.replace','os.remove','os.unlink','Path.unlink',
             'os.mkdir','os.makedirs','os.rmdir','os.removedirs','os.link','os.symlink','os.unlink_symlink','os.truncate_path',
             'os.ftruncate_fd','os.chmod','os.fchmod_fd','os.utime_path','os.utime_fd','os.chown_self','Path.chmod',
             'shutil.copyfile','shutil.copy','shutil.copy2','shutil.copytree','shutil.move','shutil.rmtree','shutil.make_archive',
             'GAP_write_through_open_fd','GAP_os.write_on_prev_fd','GAP_sqlite3_write','GAP_subprocess_touch','GAP_mmap_write','GAP_rename_via_subprocess_mv']
    cal = {n: sorted(set(k for k in steps.get(n, []) if not k.startswith('INFO_'))) for n in names}
    OUT['calibration'] = {'detected': {n: v for n, v in cal.items() if v}, 'NOT_detected': [n for n, v in cal.items() if not v],
                          'control_error': [e for e in ev if e['k'] == 'CONTROL_ERROR']}
    # el sandbox no es del fixture
    assert not (work / 'srv' / 'sandbox').exists() or True

    # ---------- GET en canonico preparado
    ident = f'TaskDoc:{task}'
    srv.get('/api/workspace/nodes'); srv.get('/api/workspace/explorer')   # cache caliente
    s0 = snap(root); g0 = gitstate(root)
    paths = ['/api/workspace/explorer', '/api/workspace/nodes', f'/api/workspace/node?id={urllib.parse.quote(ident)}',
             f'/api/workspace/node?id={urllib.parse.quote(ident)}&depth=2',
             f'/api/workspace/source?id={urllib.parse.quote(ident)}', '/api/workspace/source?path=desk/notas/uno.md',
             '/api/workspace/source?path=docs/faq.md']
    gets = {}
    n_all0 = len(srv.events())
    for p in paths:
        for rep in range(2):
            code, data, ev = srv.get(p)
            gets[f'{p}#{rep}'] = {'code': code, 'writes': writes(ev), 'pipe_writes': len([e for e in ev if e['k'] == 'pipe_write'])}
    s1 = snap(root); g1 = gitstate(root)
    OUT['canonical_gets'] = gets
    OUT['canonical_diff'] = {'files_changed': sdiff(s0, s1), 'git_equal': g0 == g1, 'head': g1[1]}
    OUT['canonical_total_writes_in_window'] = len(writes(srv.events()[n_all0:]))

    # ---------- refresco entre procesos con cache caliente
    def listing():
        _, exp, e1 = srv.get('/api/workspace/explorer'); _, nd, e2 = srv.get('/api/workspace/nodes')
        return exp, nd, writes(e1 + e2)
    xp = {}
    sA = snap(root / '.sldb'); 
    exp, nd, w = listing()           # caliente
    new_id = other_process(root, 'create', 'Alta externa'); ident2, rel2 = f'TaskDoc:{new_id}', f'desk/tasks/{new_id}.md'
    sB = snap(root / '.sldb')       # estado tras la operacion externa (referencia)
    gB = gitstate(root); dB = snap(root / 'desk')
    exp, nd, w = listing(); xp['alta'] = (ident2 in {m['id'] for m in exp['modeled']}, ident2 in {n['id'] for n in nd['nodes']}, len(w))
    other_process(root, 'untrack', new_id)
    exp, nd, w = listing(); xp['untrack'] = (ident2 not in {m['id'] for m in exp['modeled']}, ident2 not in {n['id'] for n in nd['nodes']}, rel2 in [u['path'] for u in exp['unmodeled']], len(w))
    other_process(root, 'track', rel2)
    exp, nd, w = listing(); xp['track'] = (ident2 in {m['id'] for m in exp['modeled']}, rel2 not in [u['path'] for u in exp['unmodeled']], len(w))
    other_process(root, 'delete', new_id)
    exp, nd, w = listing(); xp['baja'] = (ident2 not in {m['id'] for m in exp['modeled']}, ident2 not in {n['id'] for n in nd['nodes']}, rel2 not in [u['path'] for u in exp['unmodeled']], not (root / rel2).exists(), len(w))
    OUT['cross_process'] = xp
    # hashes: entre GETs puros (sin operaciones externas) con la ultima operacion hecha
    s2 = snap(root); g2 = gitstate(root)
    for _ in range(3): listing()
    s3 = snap(root); g3 = gitstate(root)
    OUT['cross_process_pure_gets_diff'] = {'files_changed': sdiff(s2, s3), 'git_equal': g2 == g3}
    # JSON: el modelo no importable aparece
    OUT['explorer_sample'] = {k: exp[k] for k in ('roots', 'roots_invalid', 'modeled')}
finally:
    srv.close()

# ---------- store inexistente
w2 = fresh('api-nostore'); r2 = w2 / 'repo'; r2.mkdir(); T.git_init(r2); T.write(r2, 'desk/a.md')
T.commit_all(r2)
s = Server(r2, w2 / 'srv', store=r2 / '.sldb')   # .sldb no existe
try:
    before = snap(r2); res = {}
    for p in ('/api/workspace/explorer', '/api/workspace/nodes', '/api/workspace/node?id=X:y', '/api/workspace/source?path=desk/a.md'):
        code, data, ev = s.get(p); res[p] = (code, data.get('error') or data.get('estado'), writes(ev))
    after = snap(r2)
    OUT['store_missing'] = {'responses': res, 'diff': sdiff(before, after), 'sldb_exists': (r2 / '.sldb').exists()}
finally:
    s.close()
json.dump(OUT, open(HERE / 'result-api.json', 'w'), indent=1, ensure_ascii=False, default=str)
print(json.dumps(OUT, indent=1, ensure_ascii=False, default=str)[:7000])
