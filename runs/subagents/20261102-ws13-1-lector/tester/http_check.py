import sys, json, hashlib, urllib.request, urllib.error, urllib.parse
from pathlib import Path
root=Path(sys.argv[1]); base=sys.argv[2]; ta,tb=sys.argv[3],sys.argv[4]
def snap(extra=None):
    d={}
    for p in sorted((root/'.sldb').rglob('*')):
        if p.is_file(): d[str(p)]=hashlib.sha256(p.read_bytes()).hexdigest()
    if extra:
        for e in extra:
            p=root/e
            if p.is_file(): d[str(p)]=hashlib.sha256(p.read_bytes()).hexdigest()
    return d
def get(q, extra=None, label=None):
    before=snap(extra)
    try:
        r=urllib.request.urlopen(base+q); code=r.status; body=r.read()
    except urllib.error.HTTPError as e:
        code=e.code; body=e.read()
    after=snap(extra)
    same = before==after
    try: j=json.loads(body)
    except Exception: j=None
    print(f'{code} {"STORE_SAME" if same else "STORE_CHANGED"} {q}')
    return code,j,body,same
res=[]
def show(j,keys=('ok','error','estado','id','path','revision','encoding','estado_lectura')):
    if isinstance(j,dict): print('   ',{k:j[k] for k in keys if k in j})
# modelado
c,j,b,s=get(f'/api/workspace/source?id=TaskDoc:{ta}', [f'desk/tasks/{ta}.md']); show(j); print('   keys',list(j)[:30])
raw=(root/f'desk/tasks/{ta}.md').read_bytes()
print('   sha file',hashlib.sha256(raw).hexdigest())
for k in ('text','source','texto'):
    if k in j: print('   text==file bytes:',j[k].encode()==raw,k)
get('/api/workspace/source?id=TaskDoc:'+ta+'&path=guia.md')
get('/api/workspace/source')
get('/api/workspace/source?id=')
get('/api/workspace/source?path=')
cases=['guia.md','notes/otro.md','data.txt','oculto.md','.env','escape.md','invalido.md','grande.md','d.md','no-existe.md','.git/config','../fuera.md','/etc/passwd','notes/../guia.md','notes/../../fuera.md','desk/tasks/%s.md'%ta,'desk/rituals/testing.md','src/a.py','%2e%2e/fuera.md','notes//otro.md','./guia.md']
for p in cases:
    c,j,b,s=get('/api/workspace/source?path='+urllib.parse.quote(p,safe='/'), [p] if not p.startswith(('/','.')) or p=='./guia.md' else None)
    show(j)
    if j and j.get('ok'):
        print('   keys',list(j))
get('/api/workspace/node?id=TaskDoc:'+ta, [f'desk/tasks/{ta}.md'])
get('/api/workspace/node?id=TaskDoc:'+tb)
get('/api/workspace/nodes')
get('/api/workspace/node?path=guia.md')
