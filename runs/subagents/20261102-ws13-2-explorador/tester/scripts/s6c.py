import sys, json
sys.path.insert(0,'/tmp/ws132t')
from lib import *
R = Path('/tmp/ws132t/repo6')
s = Srv(R, env={'SLDB_PYTHONPATH':'/tmp/ws132t/models'})
for ident in ['Diario:d1','Cuaderno:c1']:
    c,x = s.get('/api/workspace/node?id='+ident)
    print(ident, json.dumps(x['projections']['document'],ensure_ascii=False)[:600])
    print(' graph', {k:(v if k not in('nodes','edges') else len(v)) for k,v in x['projections']['graph'].items()})
    print(' ctx summary', x['context']['summary'], x['context']['documents_error'], x['context']['relations_state'])
s.close()
