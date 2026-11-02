import sys, subprocess
sys.path.insert(0,'/tmp/ws132t')
from lib import *
R = Path('/tmp/ws132t/repo4')
code = '''
import sys
from deskops.operations import DeskopsOperations
from pathlib import Path
ops = DeskopsOperations(Path(sys.argv[1]))
print(ops.create_task_bundle(dict(title=sys.argv[2], goal='G', scope='S', implementation_path='P', validation=['x'], done_when='d')).task_id)
'''
s = Srv(R, env={'SLDB_PYTHONPATH':'/tmp/ws132t/models2'})
def tasks():
    c,d = s.get('/api/workspace/explorer'); c2,n = s.get('/api/workspace/nodes')
    return [m['id'] for m in d['modeled'] if m['model_name']=='TaskDoc'], [u['path'] for u in d['unmodeled'] if 'tasks' in u['path']], [m['id'] for m in n['nodes'] if m['model_name']=='TaskDoc']
print('antes', tasks())
o = subprocess.run([sys.executable,'-c',code,str(R),'Tarea segunda'],capture_output=True,text=True); print(o.stdout.strip()[-60:], o.returncode)
print('despues', tasks())
s.close()
