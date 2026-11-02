import json,sys,time,urllib.request,urllib.error,urllib.parse
port=sys.argv[1]
def get(p):
    t=time.time()
    try: r=urllib.request.urlopen(f'http://127.0.0.1:{port}{p}',timeout=300); d=json.loads(r.read()); st=r.status
    except urllib.error.HTTPError as e: d=json.loads(e.read()); st=e.code
    return st,d,time.time()-t
for i in range(3):
    st,d,t=get('/api/workspace/nodes'); print(f'/nodes #{i+1}: {st} {t:.2f}s nodos={len(d.get("nodes",[]))} err={str(d.get("error"))[:80]}')
ids=[n['id'] for n in d.get('nodes',[]) if n['id'].startswith('TaskDoc:')][:3]+[n['id'] for n in d.get('nodes',[]) if n['id'].startswith('ModelDoc')][:1]
from collections import Counter
print(Counter(n.get('estado') for n in d.get('nodes',[])))
for dep in (1,2):
    for i in ids:
        st,x,t=get(f'/api/workspace/node?id={urllib.parse.quote(i)}&depth={dep}'); print(f'/node {i} depth={dep}: {st} {t:.2f}s graph.ok={x.get("projections",{}).get("graph",{}).get("ok")}')
        st,x,t=get(f'/api/workspace/source?id={urllib.parse.quote(i)}'); print(f'/source {i}: {st} {t:.2f}s')
