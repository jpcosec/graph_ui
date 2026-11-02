import sys, json
sys.path.insert(0,'/tmp/ws132t')
from lib import *
R = Path('/tmp/ws132t/repo6b')
s = Srv(R, env={'SLDB_PYTHONPATH':'/tmp/ws132t/models'})
b=state(R)
c,d = s.get('/api/workspace/nodes'); print('nodes',c,len(d.get('nodes',[])), d.get('error'))
for n in d.get('nodes',[]):
    if n['estado']!='ok': print('  ',json.dumps(n,ensure_ascii=False)[:300])
c,e = s.get('/api/workspace/explorer'); print('explorer',c,len(e['modeled']))
for ident in ['TaskDoc:task-tarea-corrupta','TaskDoc:task-tarea-sana']:
    c,x = s.get('/api/workspace/source?id='+ident); print('src',ident,c,{k:x.get(k) for k in('error','estado','degraded','degraded_reason')}, repr(x.get('text'))[:80])
    c,x = s.get('/api/workspace/node?id='+ident); print('node',ident,c,str(x)[:300])
print(state(R)==b)
s.close()
