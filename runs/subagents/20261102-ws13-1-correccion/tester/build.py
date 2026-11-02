"""Construye un repo git temporal real con store sldb. Uso: build.py <dir>"""
import json, subprocess, sys
from pathlib import Path
from deskops.bootstrap import SLDBBootstrap
from deskops.lifecycle import ensure_lifecycle_graph
from deskops.models import TaskDoc
from deskops.operations import DeskopsOperations
from deskops.workspace import scaffold_desk
from sldb.api import rebuild_edges

root = Path(sys.argv[1]).resolve()
if root.exists():
    subprocess.run(['rm','-rf',str(root)],check=True)
root.mkdir(parents=True)
def git(*a): subprocess.run(['git','-C',str(root),*a],check=True,capture_output=True)
subprocess.run(['git','init',str(root)],check=True,capture_output=True)
git('config','user.name','t'); git('config','user.email','t@e.com')
(root/'.gitignore').write_text('.env*\ndesk/tasks/gi-*.md\n.sldb_cache/\n')
assert SLDBBootstrap().init_local_store(root)==0
scaffold_desk(root); ensure_lifecycle_graph(root)
ops=DeskopsOperations(root)
def mk(title, **kw):
    return ops.create_task_bundle(dict(title=title, goal=f'{title} meta', scope='s', implementation_path='x',
        validation=['pytest'], done_when='ok', **kw)).task_id
C=mk('Doc C'); A=mk('Doc A', depends_on=[C], inherits_from=[C])
B=mk('Doc B', depends_on=[A]); D=mk('Doc D', depends_on=[B]); N=mk('Doc N normal')
(root/'src').mkdir(); (root/'src'/'x.py').write_text('print(1)\n')
# A tambien referencia codigo
p=root/'desk'/'tasks'/f'{A}.md'; pl=ops._read_doc(p,TaskDoc); pl['files']=['src/x.py']; pl['references']=['src/x.py','%s'%N]; ops._write_doc(p,TaskDoc,pl)

from sldb.api import untrack_document, track_document_file
store=root/'.sldb'
def relocate(title, newrel, symlink_to=None):
    t=mk(title); old=root/'desk'/'tasks'/f'{t}.md'
    untrack_document(store, t)
    new=root/newrel; new.parent.mkdir(parents=True,exist_ok=True)
    if symlink_to:
        symlink_to.write_text(old.read_text()); old.unlink(); new.symlink_to(symlink_to)
    else:
        old.rename(new)
    track_document_file(store,'TaskDoc',new,name=t,force=True)
    return t
P=mk('Secreto P')  # task-secreto-p ignorado por gitignore (se agrega luego)
ENV=relocate('Env protegido','desk/tasks/.env.md')
outside=root.parent/(root.name+'-fuera.md'); 
SYM=relocate('Symlink fuera','desk/tasks/enlace.md',symlink_to=outside)
with open(root/'.gitignore','a') as f: f.write(f'desk/tasks/{P}.md\n')
# markdown no modelado
(root/'notes').mkdir()
(root/'notes'/'otro.md').write_text('# Otro\n\n## Real\n\ntexto\n')
(root/'notes'/'ign.md').write_text('# ign\n## Sec\n'); open(root/'.gitignore','a').write('notes/ign.md\n')
(root/'notes'/'anclas.md').write_text(
 '# Anclas\n\n## Propia\n\n'
 'ok propia [[#Propia]]; falta propia [[#Zzz]]; '
 'nomod ok [[notes/otro.md#Real]]; nomod falta [[notes/otro.md#Nada]]; '
 f'mod ok [[{B}#Goal]]; mod falta [[{B}#Nada]]; '
 'protegido [[notes/ign.md#Sec]].\n')
# modeled doc B with link to anchor
json.dump(dict(root=str(root),A=A,B=B,C=C,D=D,N=N,P=P,ENV=ENV,SYM=SYM,outside=str(outside)),open(root.parent/(root.name+'.json'),'w'))
rebuild_edges(store, pythonpath=str(root), wait=True)
git('add','-A'); git('commit','-qm','base')
print(open(root.parent/(root.name+'.json')).read())
