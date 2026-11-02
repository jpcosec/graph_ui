import sys
sys.path.insert(0,'/tmp/ws132t')
from lib import *
R = Path('/tmp/ws132t/repo1')
s = Srv(R, env={'PATH':'/nonexistent'})
c,d = s.get('/api/workspace/explorer'); print(c,d['ignorados_error'],len(d['unmodeled']),len(d['modeled']), set(m['estado'] for m in d['modeled']))
c,d = s.get('/api/workspace/nodes'); print('nodes',c,len(d.get('nodes',[])))
s.close()
