import sys
sys.path.insert(0,'/tmp/ws132t')
from lib import *
R = Path('/tmp/ws132t/repo1'); AL='/tmp/ws132t/audit2.log'; Path(AL).write_text('')
s = Srv(R, audit=AL)
n = len(Path(AL).read_text().splitlines())
c,d = s.get('/api/workspace/explorer'); o = Path(AL).read_text().splitlines()[n:]
print(c, 'opens', len(o), '.md opens:', [x for x in o if x.lower().endswith('.md')], 'non-sldb:', [x for x in o if '/.sldb/' not in x])
s.close()
# store inexistente
import shutil
R2 = Path('/tmp/ws132t/vacio'); shutil.rmtree(R2, ignore_errors=True); (R2/'desk').mkdir(parents=True); (R2/'desk/a.md').write_text('# a\n')
s = Srv(R2, store=R2/'.sldb')
for p in ['/api/workspace/explorer','/api/workspace/nodes','/api/workspace/source?path=desk/a.md','/api/workspace/node?id=X:y']:
    print(p, s.get(p))
s.close()
print(sorted(str(p.relative_to(R2)) for p in R2.rglob('*')))
