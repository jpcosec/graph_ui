import json, shutil
from common import *
w2 = fresh('api-nostore'); r2 = w2 / 'repo'; r2.mkdir(); T.git_init(r2); T.write(r2, 'desk/a.md'); T.commit_all(r2)
s = Server(r2, w2 / 'srv', store=r2 / '.sldb')
out = {'sldb_creado_por_arranque_de_serve': (r2 / '.sldb').exists()}
try:
    shutil.rmtree(r2 / '.sldb')            # el store NO existe al momento del request
    before = snap(r2); res = {}
    for p in ('/api/workspace/explorer', '/api/workspace/nodes', '/api/workspace/node?id=X:y', '/api/workspace/source?path=desk/a.md'):
        code, data, ev = s.get(p); res[p] = (code, data.get('error'), writes(ev))
    after = snap(r2)
    out.update(responses=res, diff=sdiff(before, after), sldb_existe_despues=(r2 / '.sldb').exists())
finally: s.close()
json.dump(out, open(HERE / 'result-nostore.json', 'w'), indent=1, ensure_ascii=False); print(json.dumps(out, indent=1, ensure_ascii=False))
