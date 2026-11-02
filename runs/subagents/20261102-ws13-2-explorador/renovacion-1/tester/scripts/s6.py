import sys, json
sys.path.insert(0,'/tmp/ws132t')
from lib import *
R = Path('/tmp/ws132t/repo6')
s = Srv(R, env={'SLDB_PYTHONPATH':'/tmp/ws132t/models'})
b = state(R)
c,d = s.get('/api/workspace/nodes'); print('nodes',c,len(d.get('nodes',[])))
for n in d.get('nodes',[]):
    if n.get('estado')!='ok' and n.get('estado') or n['id'].startswith(('Diario','Cuaderno','TaskDoc')): print('  ',json.dumps(n,ensure_ascii=False)[:400])
c,e = s.get('/api/workspace/explorer'); print('explorer',c)
for m in e['modeled']:
    if m['model_name'] in('Diario','Cuaderno','TaskDoc'): print('  ',json.dumps(m,ensure_ascii=False)[:300])
print([u['path'] for u in e['unmodeled']])
for ident in ['Diario:d1','Cuaderno:c1','TaskDoc:task-tarea-corrupta','TaskDoc:task-tarea-sana']:
    c,x = s.get('/api/workspace/source?id='+ident)
    print('SOURCE',ident,c,{k:(v if k in('ok','error','estado','degraded','degraded_reason','ir_error') else '...') for k,v in x.items()}, 'text' in x and len(x['text']), 'sections', len(x.get('sections') or []))
    c,x = s.get('/api/workspace/node?id='+ident)
    print('NODE  ',ident,c,{k:x.get(k) for k in ('ok','error','is_degraded','degraded_reason')} )
print('state equal', state(R)==b)
s.close()
