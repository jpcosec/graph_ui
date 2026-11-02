import sys, json, os, shutil
sys.path.insert(0,'/tmp/ws132t')
from lib import *
def brief(d): return {k:(v if k not in('modeled','unmodeled') else len(v)) for k,v in d.items()}
# sin git
R = Path('/tmp/ws132t/repo_nogit'); shutil.rmtree(R, ignore_errors=True)
ops = prepare(R, git=False)
write(R,'desk/a.md'); write(R,'desk/ign.md'); (R/'.gitignore').write_text('desk/ign.md\n')
s = Srv(R)
c,d = s.get('/api/workspace/explorer'); print('nogit',c,brief(d), [u['path'] for u in d['unmodeled']]); s.close()
# truncado
R = Path('/tmp/ws132t/repo_big'); shutil.rmtree(R, ignore_errors=True)
ops = prepare(R)
for i in range(5100): (R/'desk/big').mkdir(parents=True, exist_ok=True); (R/f'desk/big/f{i:05d}.md').write_text('# x\n')
commit(R)
s = Srv(R); import time; t=time.time()
c,d = s.get('/api/workspace/explorer'); print('big',c,brief(d), len(d['unmodeled']), round(time.time()-t,1),'s'); s.close()
# fail closed: PATH sin git
R = Path('/tmp/ws132t/repo1')
s = Srv(R, env={'PATH':'/nonexistent'})
