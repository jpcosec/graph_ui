import sys, subprocess, os, json
from pathlib import Path
sys.path.insert(0, '/home/jp/proyectos/SLDB_1/UIs/graph_ui/frontends')
from deskops.bootstrap import SLDBBootstrap
from deskops.lifecycle import ensure_lifecycle_graph
from deskops.models import TaskDoc
from deskops.operations import DeskopsOperations
from deskops.workspace import scaffold_desk

base = Path(sys.argv[1]); base.mkdir(parents=True)
root = base / 'repo'; root.mkdir()
def git(*a): subprocess.run(['git','-C',str(root),*a],check=True,capture_output=True)
subprocess.run(['git','init',str(root)],check=True,capture_output=True)
git('config','user.name','t'); git('config','user.email','t@e.com')
(root/'.gitignore').write_text('oculto.md\n.env\n')
assert SLDBBootstrap().init_local_store(root)==0
scaffold_desk(root); ensure_lifecycle_graph(root)
ops = DeskopsOperations(root)
(root/'src').mkdir()
(root/'src'/'a.py').write_text(''.join(f'linea{i}\n' for i in range(1,21)))
(root/'src'/'b.py').write_text('b1\nb2\nb3\n')
tb = ops.create_task_bundle(dict(title='Tarea B',goal='Destino',scope='S',implementation_path='B',validation=['pytest'],done_when='B listo')).task_id
ta = ops.create_task_bundle(dict(title='Tarea A',goal=f'Meta con enlace [[{tb}]] y roto [[desk/tasks/no-existe.md]] y [[notes/otro.md]] ext [[https://example.com/x]]',
  scope='S',implementation_path='A',validation=['pytest'],done_when='A listo',
  depends_on=[tb],inherits_from=[tb],files=['src/a.py:5','src/b.py'],references=['src/b.py:2'])).task_id
# otro campo -> mismo destino
p = root/'desk'/'tasks'/f'{ta}.md'
(root/'notes').mkdir()
(root/'notes'/'sub').mkdir()
(root/'guia.md').write_text(
 '# Guia\n\nIntro [[notes/otro.md]] roto [[notes/nada.md]] ancla [[notes/otro.md#Segunda parte]] '
 'dospuntos [[deskops:task-x]] local [[local:notes/otro.md]] http [[http://example.com/a]] txt [[data.txt]] '
 f'a modelado [[{tb}]]\n\n## Primera\n\ntexto uno\n\n## Segunda\n\ntexto dos\n', encoding='utf-8')
(root/'notes'/'otro.md').write_text('# Otro\n\ncuerpo vuelve [[guia.md]]\n\n## Segunda parte\n\nfin ñandú\n',encoding='utf-8')
(root/'data.txt').write_text('plano\n')
(root/'oculto.md').write_text('# oculto\n')
(root/'.env').write_text('SECRET=1\n')
(root/'invalido.md').write_bytes(b'# Cafe\n\ncaf\xe9\n')
outside = base/'fuera.md'; outside.write_text('# fuera\n')
(root/'escape.md').symlink_to(outside)
print(json.dumps(dict(root=str(root),ta=ta,tb=tb)))
