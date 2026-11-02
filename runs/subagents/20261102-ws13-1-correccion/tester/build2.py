import subprocess, sys, json
from pathlib import Path
from sldb import api
base=Path('/tmp/tst'); root=base/'r2'
subprocess.run(['rm','-rf',str(root)]); root.mkdir()
(base/'mods'/'t2models.py').write_text('''from pydantic import Field
from sldb import StructuredNLDoc

class Note(StructuredNLDoc):
    __semantics__ = {"type": ["knowledge", "note"]}
    __template__ = "# ⸢rev•title⸥\\n\\n⸢rev•body⸥"
    title: str = Field(description="Title.")
    body: str = Field(default="", description="Body.")

class Linked(StructuredNLDoc):
    __semantics__ = {"type": ["knowledge", "linked"]}
    __references__ = ["about"]
    __template__ = "---\\nabout: ⸢rev•about⸥\\nalso: ⸢rev•also⸥\\n---\\n\\n# ⸢rev•title⸥"
    title: str = Field(description="Title.")
    about: str = Field(default="", description="Ref.")
    also: str = Field(default="", description="Plain str for now.")
''')
def git(*a): subprocess.run(['git','-C',str(root),*a],check=True,capture_output=True)
subprocess.run(['git','init',str(root)],check=True,capture_output=True); git('config','user.name','t'); git('config','user.email','t@e')
store=api.init_store(root).store_path; py=str(base/'mods')
for m in ('Note','Linked'): api.add_model(store,f't2models:{m}',py)
api.init_relations(store,py)
api.create_document(store,'Note',root/'n1.md',{'title':'n1','body':'x'},'n1',py)
api.create_document(store,'Note',root/'n2.md',{'title':'n2','body':'x'},'n2',py)
api.create_document(store,'Linked',root/'l1.md',{'title':'l1','about':'Note:n1','also':'Note:n2'},'l1',py)
api.rebuild_edges(store,pythonpath=py,wait=True)
git('add','-A'); git('commit','-qm','b')
print(api.load_edge_index(store,include_linked=False).stale)
