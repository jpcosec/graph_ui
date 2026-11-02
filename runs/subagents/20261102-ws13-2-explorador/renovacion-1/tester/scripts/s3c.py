import sys, shutil
sys.path.insert(0,'/tmp/ws132t')
from lib import *
R2 = Path('/tmp/ws132t/vacio'); shutil.rmtree(R2, ignore_errors=True); (R2/'desk').mkdir(parents=True); (R2/'desk/a.md').write_text('# a\n')
ls = lambda: sorted(str(p.relative_to(R2)) for p in R2.rglob('*'))
s = Srv(R2, store=R2/'.sldb'); print('tras arranque', ls())
shutil.rmtree(R2/'.sldb'); print('borrado', ls())
for p in ['/api/workspace/explorer','/api/workspace/nodes','/api/workspace/source?path=desk/a.md','/api/workspace/node?id=X:y']:
    c,d = s.get(p); print(p, c, str(d)[:150]); print('  fs', ls())
s.close()
