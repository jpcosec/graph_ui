import sys, shutil, subprocess
sys.path.insert(0,'/tmp/ws132t')
from lib import *
R = Path('/tmp/ws132t/repo6'); shutil.rmtree(R, ignore_errors=True)
ops = prepare(R)
ops.create_task_bundle(dict(title='Tarea sana', goal='G', scope='S', implementation_path='P', validation=['x'], done_when='d'))
ops.create_task_bundle(dict(title='Tarea corrupta', goal='G', scope='S', implementation_path='P', validation=['x'], done_when='d'))
PREP = '''
import sys
from pathlib import Path
from sldb.api.model_registry.add_model import add_model
from sldb.api.documents.create_document import create_document
root, models = Path(sys.argv[1]), sys.argv[2]
add_model(root/'.sldb','tst_diario:Diario',pythonpath=models)
create_document(root/'.sldb','Diario','diarios/d1.md',{'id':'d1','title':'Diario uno','apunte':'Texto del apunte.'},pythonpath=models)
add_model(root/'.sldb','tst_cuaderno:Cuaderno',pythonpath=models)
create_document(root/'.sldb','Cuaderno','cuadernos/c1.md',{'id':'c1','title':'Cuaderno uno','apunte':'Otro apunte.'},pythonpath=models)
'''
r = subprocess.run([sys.executable,'-c',PREP,str(R),'/tmp/ws132t/models'],capture_output=True,text=True); print(r.returncode, r.stderr[-500:])
write(R,'desk/notas/uno.md','# Uno\n\nTexto uno.\n')
# Diario: modulo borrado -> ImportError; Cuaderno: modulo existe pero lanza al importar, y el servidor lo ve en SLDB_PYTHONPATH
#Path('/tmp/ws132t/models/tst_diario.py').rename('/tmp/ws132t/models/tst_diario.py.off')
Path('/tmp/ws132t/models/tst_cuaderno.py').write_text('raise RuntimeError("boom-en-import-cuaderno")\n')
# documento corrupto bajo modelo sano
p = R/'desk/tasks/task-tarea-corrupta.md'; t = p.read_text(); p.write_text(t.replace('## Goal','## Meta rota',1) if '## Goal' in t else '---\nbasura: [\n---\n')
commit(R)
print(subprocess.run(['git','-C',str(R),'status','--short'],capture_output=True,text=True).stdout)
