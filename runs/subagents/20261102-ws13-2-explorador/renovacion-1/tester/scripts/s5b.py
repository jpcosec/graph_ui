import sys
sys.path.insert(0,'/tmp/ws132t')
from lib import *
R = Path('/tmp/ws132t/repo4')
s = Srv(R, env={'SLDB_PYTHONPATH':'/tmp/ws132t/models2'})
c,d = s.get('/api/workspace/explorer'); print([m['id'] for m in d['modeled'] if m['model_name']=='TaskDoc'], [u['path'] for u in d['unmodeled']])
c,d = s.get('/api/workspace/nodes'); print([m['id'] for m in d['nodes'] if m['model_name']=='TaskDoc'])
s.close()
