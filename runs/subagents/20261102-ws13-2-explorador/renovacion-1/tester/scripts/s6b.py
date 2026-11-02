import sys, json
sys.path.insert(0,'/tmp/ws132t')
from lib import *
R = Path('/tmp/ws132t/repo6')
s = Srv(R, env={'SLDB_PYTHONPATH':'/tmp/ws132t/models'})
for ident in ['Diario:d1','TaskDoc:task-tarea-sana']:
    c,x = s.get('/api/workspace/node?id='+ident)
    def sk(o,d=0):
        if isinstance(o,dict): return {k:sk(v,d+1) if d<2 else '…' for k,v in o.items()}
        return o if not isinstance(o,(list,str)) or len(str(o))<80 else str(o)[:80]
    print(ident,c,json.dumps(sk(x),ensure_ascii=False)[:1800])
s.close()
