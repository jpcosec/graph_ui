import json
from common import *
w = fresh('sentctl'); root = w / 'repo'; root.mkdir(); T.git_init(root); T.prepare_store(root)
T.write(root, 'desk/notas/CENTINELA_legit.md'); T.write(root, 'desk/.hidden/CENTINELA.md'); T.commit_all(root)
s = Server(root, w / 'srv', {'WORKSPACE_EXPLORER_ROOTS': 'desk/notas'})
try:
    c, d, ev = s.get('/api/workspace/explorer'); c2, d2, ev2 = s.get('/api/workspace/source?path=desk/notas/CENTINELA_legit.md')
    a = s.events()
    print('listado:', [u['path'] for u in d['unmodeled']], 'read_sentinel:', [e['d'][0] for e in a if e['k']=='read_sentinel'],
          'enum:', [e['d'] for e in a if e['k']=='enum_forbidden'])
    # control: enumeracion de un arbol prohibido por una raiz que lo contuviera (sandbox del propio proceso)
    s.control()
finally: s.close()
