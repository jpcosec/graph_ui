import sys, json, os, subprocess, shutil
sys.path.insert(0,'/tmp/ws132t')
from lib import *
R = Path('/tmp/ws132t/repo1'); shutil.rmtree(R, ignore_errors=True); shutil.rmtree('/tmp/ws132t/ext', ignore_errors=True)
ops = prepare(R)
tid = ops.create_task_bundle(dict(title='Tarea modelada A', goal='G', scope='S', implementation_path='P', validation=['x'], done_when='d')).task_id
(R/'.gitignore').write_text('desk/priv/\nign.md\n*.log\n')
write(R,'desk/notas/uno.md'); write(R,'desk/notas/sub/dos.md')
write(R,'desk/con espacios/a b.md'); write(R,'desk/notas/ñandú café ✓.md')
try: write(R,'desk/salto\nlinea.md')
except Exception as e: print('nl fail',e)
write(R,'desk/.env.md'); write(R,'desk/.oculto/x.md'); write(R,'desk/__pycache__/y.md'); write(R,'desk/node_modules/z.md')
write(R,'desk/priv/p.md'); write(R,'desk/ign.md'); write(R,'docs/faq.md'); write(R,'fuera/otro.md'); write(R,'desk/notas/x.txt')
ext = Path('/tmp/ws132t/ext'); ext.mkdir(); (ext/'leak.md').write_text('# leak\n')
(R/'desk/salida').symlink_to(ext, target_is_directory=True)
(R/'desk/enl').symlink_to(R/'desk/notas', target_is_directory=True)
(R/'desk/escapa.md').symlink_to(ext/'leak.md')
(R/'desk/interno.md').symlink_to(R/'docs/faq.md')
(R/'enlaceraiz').symlink_to(R/'desk/notas', target_is_directory=True)
commit(R)
cases = {
 'sin_definir': None,
 'valida': 'desk/notas',
 'mixta': 'desk,/etc,../x,enlaceraiz,,docs,nope,desk/notas/..,./docs,C:\\x, ,desk/notas/../../docs',
 'vacia': '',
}
for name, val in cases.items():
    env = {} if val is None else {'WORKSPACE_EXPLORER_ROOTS': val}
    s = Srv(R, env)
    try:
        c, d = s.get('/api/workspace/explorer')
        print('==', name, repr(val), c)
        print(' roots', d.get('roots'), '\n invalid', json.dumps(d.get('roots_invalid'), ensure_ascii=False))
        print(' unmodeled', [repr(u['path']) for u in d['unmodeled']])
        print(' modeled', [(m['id'],m['estado'],m['path']) for m in d['modeled']], 'sin_git',d['sin_git'],'trunc',d['truncado'])
        if name == 'sin_definir':
            base = d
            for q in ['?root=/etc','?path=..','?root=fuera&path=../..','?roots=fuera','?id=x','?limit=1']:
                c2,d2 = s.get('/api/workspace/explorer'+q)
                print(' query',q,c2, d2==base)
    finally: s.close()
