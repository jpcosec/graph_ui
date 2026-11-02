"""Esc.1: sin mutacion. s1.py <repo> <port>"""
import hashlib, json, subprocess, sys, urllib.request, urllib.error, os
from pathlib import Path
root=Path(sys.argv[1]); port=sys.argv[2]; ids=json.load(open(str(root)+'.json')); A,B,C=ids['A'],ids['B'],ids['C']; MA=ids.get('MA','TaskDoc'); MB=ids.get('MB','TaskDoc')
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def snap():
    d={str(p.relative_to(root)):sha(p) for p in sorted((root/'.sldb').rglob('*')) if p.is_file()}
    for rel in [x for x in (ids.get('docA','desk/tasks/%s.md'%A),ids.get('docB','desk/tasks/%s.md'%B),'notes/otro.md') if (root/x).exists()]: d[rel]=sha(root/rel)
    g=subprocess.run(['git','-C',str(root),'status','--porcelain'],capture_output=True,text=True).stdout
    h=subprocess.run(['git','-C',str(root),'rev-parse','HEAD'],capture_output=True,text=True).stdout
    return d,g,h
def get(path):
    try:
        r=urllib.request.urlopen(f'http://127.0.0.1:{port}{path}',timeout=60); return r.status,json.loads(r.read())
    except urllib.error.HTTPError as e: return e.code,json.loads(e.read())
def probe(label):
    out={}
    for path in ['/api/workspace/nodes',f'/api/workspace/node?id={MA}:{A}&depth=2',f'/api/workspace/source?id={MA}:{A}',f'/api/workspace/node?id={MB}:{B}&depth=1',f'/api/workspace/source?id={MB}:{B}']:
        b=snap(); st,d=get(path); a=snap()
        same = b==a
        info=''
        if '/node?' in path:
            g=d['projections']['graph']; info=f"graph.ok={g.get('ok')} estado={g.get('estado')} stale={g.get('stale')} nodes={len(g.get('nodes',[]))} rel_state={d['context']['relations_state'].get('estado')} incoming={'None' if d['context']['incoming_relations'] is None else len(d['context']['incoming_relations'])} doc_ok={d['projections']['document'].get('ok')}"
        elif '/source?' in path:
            c=d.get('context') or {}
            info=f"ok={d.get('ok')} text_len={len(d.get('text') or '')} ctx.ok={ (c.get('relations_state') or {}).get('estado') or c.get('estado')} ctxkeys={sorted(c.keys())[:8]}"
        else: info=f"n={len(d['nodes'])} " + str({n['title'] for n in d['nodes'] if n['id']==f'{MA}:{A}'})
        print(f'[{label}] {path} -> {st} SIN_CAMBIOS={same} {info}')
        if not same:
            for k in set(b[0])|set(a[0]):
                if b[0].get(k)!=a[0].get(k): print('   CAMBIO',k)
            print('   git',b[1],'->',a[1])
probe(sys.argv[3] if len(sys.argv)>3 else 'x')
