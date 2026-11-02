import sys, json
sys.path.insert(0,'/tmp/ws132t')
from lib import *
R = Path('/tmp/ws132t/repo1'); AL='/tmp/ws132t/audit.log'
Path(AL).write_text('')
st0 = state(R)
s = Srv(R, audit=AL)
def opens(): return [l for l in Path(AL).read_text().splitlines()]
base = len(opens()); print('opens at startup', base)
tid = 'TaskDoc:task-tarea-modelada-a'
reqs = ['/api/workspace/explorer','/api/workspace/nodes','/api/workspace/source?id='+tid,'/api/workspace/source?path=desk/notas/uno.md','/api/workspace/node?id='+tid,'/api/workspace/explorer']
for r in reqs:
    b = state(R); n = len(opens())
    c,d = s.get(r)
    a = state(R); o = opens()[n:]
    print(c, r[:60], 'state_equal', a==b, 'opens:', len(o), [x for x in o if x.endswith('.md') or '/repo1/' in x][:6])
s.close()
print('total equal vs start', state(R)==st0)
# store inexistente
import shutil
R2 = Path('/tmp/ws132t/vacio'); shutil.rmtree(R2, ignore_errors=True); R2.mkdir()
s = Srv(R2, store=R2/'.sldb') if False else None
