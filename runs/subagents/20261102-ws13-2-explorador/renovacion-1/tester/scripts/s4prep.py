import sys, shutil, subprocess
sys.path.insert(0,'/tmp/ws132t')
from lib import *
R = Path('/tmp/ws132t/repo4')
ops = prepare(R)
ops.create_task_bundle(dict(title='Tarea base', goal='G', scope='S', implementation_path='P', validation=['x'], done_when='d'))
PREP = '''
import sys
from pathlib import Path
from sldb.api.model_registry.add_model import add_model
from sldb.api.documents.create_document import create_document
root = Path(sys.argv[1])
add_model(root/'.sldb','tst_nota:Nota',pythonpath='/tmp/ws132t/models2')
create_document(root/'.sldb','Nota','desk/notas/nota1.md',{'id':'n1','title':'Nota uno','apunte':'Apunte sano.'},pythonpath='/tmp/ws132t/models2')
add_model(root/'.sldb','tst_diario:Diario',pythonpath='/tmp/ws132t/models')
create_document(root/'.sldb','Diario','desk/diarios/d1.md',{'id':'d1','title':'Diario roto','apunte':'Texto del diario.'},pythonpath='/tmp/ws132t/models')
'''
import os
# restore diario module temporarily
shutil.copy('/tmp/ws132t/models/tst_diario.py.off','/tmp/ws132t/models/tst_diario.py')
r = subprocess.run([sys.executable,'-c',PREP,str(R)],capture_output=True,text=True); print(r.returncode,r.stderr[-400:])
os.remove('/tmp/ws132t/models/tst_diario.py')
write(R,'desk/notas/libre.md','# Libre\n\n## Parte\n\nTexto libre sin modelo.\n')
write(R,'docs/guia.md','# Guia\n\nTexto de guia.\n')
commit(R)
