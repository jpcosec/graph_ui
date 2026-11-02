"""Esc.2: registro de open. s2.py <repo> <port> <log>"""
import json, sys, os, urllib.request, urllib.error
from pathlib import Path
root=Path(sys.argv[1]).resolve(); port=sys.argv[2]; log=Path(sys.argv[3]); ids=json.load(open(str(root)+'.json'))
def get(p):
    try:
        r=urllib.request.urlopen(f'http://127.0.0.1:{port}{p}',timeout=120); return r.status,json.loads(r.read())
    except urllib.error.HTTPError as e: return e.code,json.loads(e.read())
outside=Path(ids['outside']).resolve()
T=root/'desk'/'tasks'
forb={'P':T/f"{ids['P']}.md",'ENV':T/'.env.md','SYMlink':T/'enlace.md','SYMtarget':outside,'ign.md':root/'notes'/'ign.md'}
forb={k:os.path.realpath(v) for k,v in forb.items()}|{k+'(raw)':str(v) for k,v in forb.items()} if False else {k:str(v) for k,v in forb.items()}
forb_all={}
for k,v in forb.items(): forb_all[k]=v; forb_all[k+'~real']=os.path.realpath(v)
def opened_since(mark):
    data=log.read_bytes()[mark:].decode(errors='replace'); s=set()
    for l in data.splitlines():
        for part in l.split('\t'): s.add(part)
    return s
def req(label,path,expect_auth=()):
    mark=log.stat().st_size; st,d=get(path); op=opened_since(mark)
    bad=[k for k,v in forb_all.items() if v in op or os.path.abspath(v) in op]
    auth=[Path(x).name for x in expect_auth if str(x) in op or os.path.realpath(x) in op]
    print(f'{label:34s} {path[:70]:70s} -> {st} estado={d.get("estado")} PROHIBIDOS_ABIERTOS={bad} autorizados_abiertos={auth}')
    return st,d
N=T/f"{ids['N']}.md"; A=T/f"{ids['A']}.md"; B=T/f"{ids['B']}.md"
req('/nodes','/api/workspace/nodes',[A,B,N])
req('/node normal',f"/api/workspace/node?id=TaskDoc:{ids['N']}&depth=2",[N])
req('/node A d2 (vecinos: protegidos)',f"/api/workspace/node?id=TaskDoc:{ids['A']}&depth=2",[A])
req('/source normal',f"/api/workspace/source?id=TaskDoc:{ids['N']}",[N])
for k in ('P','ENV','SYM'):
    nm=ids[k]
    req(f'/source {k}',f"/api/workspace/source?id=TaskDoc:{nm}")
    req(f'/node {k}',f"/api/workspace/node?id=TaskDoc:{nm}&depth=1")
req('/source path= normal','/api/workspace/source?path=desk/tasks/%s.md'%ids['N'],[N])
for rel in ('desk/tasks/.env.md','desk/tasks/enlace.md','desk/tasks/%s.md'%ids['P'],'notes/ign.md','../r1-fuera.md'):
    req('/source path= '+rel[-20:],'/api/workspace/source?path='+rel)
req('/source notes/anclas.md (enlace a protegido)','/api/workspace/source?path=notes/anclas.md',[root/'notes'/'anclas.md'])
st,d=get(f'/api/workspace/nodes'); by={n['id']:n for n in d['nodes']}
for k in ('P','ENV','SYM'): print('catalogo',k,by[f"TaskDoc:{ids[k]}"]['estado'],by[f"TaskDoc:{ids[k]}"]['title'])
