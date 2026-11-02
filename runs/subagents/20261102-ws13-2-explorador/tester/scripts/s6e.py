import sys, json
sys.path.insert(0,'/tmp/ws132t')
from lib import *
R = Path('/tmp/ws132t/repo6'); b=state(R)
s = Srv(R, env={'SLDB_PYTHONPATH':'/tmp/ws132t/models'})
for ident in ['Diario:d1','Cuaderno:c1','TaskDoc:task-tarea-sana']:
    c,x = s.get('/api/workspace/node?id='+ident)
    print(ident,c,'node.is_degraded',x['node']['is_degraded'],'| ctx',x['context']['is_degraded'], repr(x['context']['degraded_reason'])[:90], '| doc.ok',x['projections']['document']['ok'],'| code',json.dumps(x['projections']['code'],ensure_ascii=False)[:200])
print(state(R)==b); s.close()
