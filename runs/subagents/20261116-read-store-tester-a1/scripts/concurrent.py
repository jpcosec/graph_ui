"""Dos procesos sobre el mismo store: A (largo) cachea; B (otro proceso) crea, actualiza y borra.
A debe ver las altas/bajas y rechazar (409) un update con `expected` viejo.

uso: python concurrent.py <tree> <workdir>
"""
import importlib.util, json, subprocess, sys
from pathlib import Path

tree, work = Path(sys.argv[1]), Path(sys.argv[2])
work.mkdir(parents=True, exist_ok=True)
PY = sys.executable


def load(tree):
    spec = importlib.util.spec_from_file_location('mindmap_persistence', tree / 'frontends/mindmap/persistence.py')
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

B_SCRIPT = r'''
import importlib.util, json, sys
from pathlib import Path
spec = importlib.util.spec_from_file_location('p', Path(sys.argv[1]) / 'frontends/mindmap/persistence.py')
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
st = m.EditorStore(Path(sys.argv[2]))
req = json.loads(sys.argv[3])
docs = {d['id']: d for d in st.graph()['documents']} if hasattr(st, 'graph') else None
if req.get('kind') == 'update_title':
    cur = [d for d in st.adapter.documents() if d.name == req['id']][0]
    import copy
    exp = st.document(req['id'])['payload'] if hasattr(st, 'document') else None
req.pop('kind', None)
print(json.dumps(st.save({'changes': req['changes'], 'view': {}, 'viewRevision': st.view()['revision']}), default=str)[:300])
'''

from sldb.cli import main as cli
root = work / 'repo'
if not root.exists():
    root.mkdir()
    assert cli(['stores', 'init', '--path', str(root)]) == 0
    assert cli(['models', 'add', 'deskops.models.step:StepDoc', '--store', str(root / '.sldb')]) == 0
store = root / '.sldb'
p = load(tree)
import os
if os.environ.get('NOREFRESH'):
    import mindmap.sldb_adapter as _sa; _sa.SldbAdapter.refresh_for_concurrent_sessions = lambda self: None
A = p.EditorStore(store)


def a_save(changes):
    return A.save({'changes': changes, 'view': {}, 'viewRevision': A.view()['revision']})


def b_save(changes):
    r = subprocess.run([PY, '-c', B_SCRIPT, str(tree), str(store), json.dumps({'changes': changes})],
                       capture_output=True, text=True)
    assert r.returncode == 0, r.stderr[-2000:]
    return r.stdout.strip()

out = {}
# A crea s1 y lo cachea
res = a_save([{'action': 'create', 'id': 's1', 'model': 'StepDoc', 'payload': {'id': 's1', 'title': 'S1', 'action': 'a', 'outcome': 'o'}}])
doc_a = [d for d in res['documents'] if d['id'] == 's1'][0]
old_payload = doc_a['payload']
names = lambda: sorted(d.name for d in A.adapter.documents())
out['A_names_initial'] = names()
# B (otro proceso) actualiza s1 y crea s2
new_payload = dict(old_payload, title='S1-por-B')
out['B_update_create'] = b_save([
    {'action': 'update', 'id': 's1', 'model': 'StepDoc', 'expected': old_payload, 'payload': new_payload},
    {'action': 'create', 'id': 's2', 'model': 'StepDoc', 'payload': {'id': 's2', 'title': 'S2', 'action': 'a', 'outcome': 'o'}},
])
# A intenta pisar s1 con expected viejo: debe dar 409
try:
    a_save([{'action': 'update', 'id': 's1', 'model': 'StepDoc', 'expected': old_payload, 'payload': dict(old_payload, title='S1-por-A')}])
    out['A_stale_update'] = 'ACEPTADO (pisó el cambio ajeno)'
except p.SaveError as e:
    out['A_stale_update'] = f'SaveError {e.status}: {e}'
out['A_names_after_B_create'] = names()
# B borra s2 (untrack)
cur2 = subprocess.run([PY, '-c', 'import json,sys;print("x")'], capture_output=True, text=True)
s2 = [d for d in a_save([])['documents'] if d['id'] == 's2']
out['B_delete'] = b_save([{'action': 'delete', 'id': 's2', 'expected': s2[0]['payload']}]) if s2 else 'A no veía s2'
a_save([])  # refresca A (save vacio)
out['A_names_after_B_delete'] = names()
print(json.dumps(out, indent=1, ensure_ascii=False, default=str))
