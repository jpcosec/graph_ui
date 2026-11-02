import sys
sys.path.insert(0,'/tmp/ws132t')
import lib
lib.SERVE='/tmp/basecopy/frontends/mindmap/serve.py'
from lib import *
R=Path('/tmp/ws132t/repo6'); b=state(R)
s=Srv(R, env={'SLDB_PYTHONPATH':'/tmp/ws132t/models','PYTHONPATH':'/tmp/basecopy/frontends'})
for p in ['/api/workspace/explorer','/api/workspace/nodes','/api/workspace/source?id=Diario:d1','/api/workspace/node?id=Diario:d1']:
    c,d=s.get(p); print('BASE',p,c,str(d)[:140])
s.close(); print(state(R)==b)
s=Srv(R, env={'SLDB_PYTHONPATH':'/tmp/ws132t/models','PYTHONPATH':'/tmp/basecopy/frontends'})
c,d=s.get('/api/workspace/source?id=Diario:d1'); print({k:d.get(k) for k in('degraded','degraded_reason','ir_error')}, 'text' in d)
c,d=s.get('/api/workspace/source?id=Cuaderno:c1'); print({k:d.get(k) for k in('degraded','degraded_reason','ir_error')})
s.close()
