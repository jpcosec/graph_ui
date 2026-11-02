import sys, json, subprocess, os
sys.path.insert(0,'/tmp/ws132t')
from lib import *
from playwright.sync_api import sync_playwright
R = Path('/tmp/ws132t/repo4'); AL='/tmp/ws132t/audit_h1.log'; SH='/tmp/ws132t/shots2/'; os.makedirs(SH,exist_ok=True); Path(AL).write_text('')
# archivos prohibidos para la prueba de aperturas
write(R,'desk/.env.md','# secreto\n'); write(R,'desk/priv/p.md','# priv\n'); (R/'.gitignore').write_text('desk/priv/\n'); 
Path('/tmp/ws132t/ext2').mkdir(exist_ok=True); Path('/tmp/ws132t/ext2/leak.md').write_text('# leak\n')
(R/'desk/salida').symlink_to('/tmp/ws132t/ext2', target_is_directory=True); (R/'desk/escapa.md').symlink_to('/tmp/ws132t/ext2/leak.md'); (R/'desk/interno.md').symlink_to(R/'docs/guia.md')
commit(R)
MP='/tmp/ws132t/models2'
OP='''
import sys
from pathlib import Path
R=Path(sys.argv[1]); mode=sys.argv[2]
if mode=='alta':
    from deskops.operations import DeskopsOperations
    print(DeskopsOperations(R).create_task_bundle(dict(title='Tarea alta viva '+__import__('uuid').uuid4().hex[:6], goal='G', scope='S', implementation_path='P', validation=['x'], done_when='d')).task_id)
elif mode=='alta_nota':
    from sldb.api.documents.create_document import create_document
    create_document(R/'.sldb','Nota','desk/notas/nota2.md',{'id':'n2','title':'Nota dos','apunte':'Segunda.'},pythonpath='%s')
elif mode=='baja_nota':
    from sldb.api.documents.delete_document import delete_document
    delete_document(R/'.sldb','nota2',pythonpath='%s')
elif mode=='untrack':
    from sldb.api.documents.untrack_document import untrack_document
    untrack_document(R/'.sldb','nota1',pythonpath='%s')
elif mode=='track':
    from sldb.api.documents.track_document_file import track_document_file
    track_document_file(R/'.sldb','Nota','desk/notas/nota1.md',pythonpath='%s')
''' % (MP,MP,MP,MP)
def op(m):
    o = subprocess.run([sys.executable,'-c',OP,str(R),m],capture_output=True,text=True,env={k:v for k,v in os.environ.items() if k!='DESKOPS_ROOT'}); assert o.returncode==0, o.stderr[-400:]; return o.stdout.strip()
s = Srv(R, env={'SLDB_PYTHONPATH':MP}, audit=AL)
def ids():
    c,d = s.get('/api/workspace/explorer'); c2,n = s.get('/api/workspace/nodes')
    return set(m['id'] for m in d['modeled']), set(u['path'] for u in d['unmodeled']), set(m['id'] for m in n['nodes'])
# calentar caches
for p in ['/api/workspace/explorer','/api/workspace/nodes','/api/workspace/node?id=TaskDoc:task-tarea-base','/api/workspace/source?id=Nota:nota1','/api/workspace/explorer']: s.get(p)
m0,u0,n0 = ids(); print('base', len(m0), len(u0), 'nota1' , 'Nota:nota1' in m0)
st0 = state(R); nlog = len(Path(AL).read_text().splitlines())
def chk(name, cond): print(('PASS ' if cond else 'FAIL ')+name)
# ALTA modelado (task)
t = op('alta'); m,u,n = ids(); chk('alta task en modeled /explorer', f'TaskDoc:{t}' in m); chk('alta task en /nodes', f'TaskDoc:{t}' in n); chk('alta task no duplicada como no modelado', f'desk/tasks/{t}.md' not in u)
# ALTA nota (modelo importable) y baja
op('alta_nota'); m,u,n = ids(); chk('alta nota modeled', 'Nota:nota2' in m and 'Nota:nota2' in n); chk('nota2 no en unmodeled', 'desk/notas/nota2.md' not in u)
op('baja_nota'); m,u,n = ids(); chk('baja nota: sale de modeled y nodes', 'Nota:nota2' not in m and 'Nota:nota2' not in n); print('   nota2.md tras delete_document esta en unmodeled:', 'desk/notas/nota2.md' in u, '(archivo existe:', (R/'desk/notas/nota2.md').exists(),')')
# rastreado
op('untrack'); m,u,n = ids(); chk('untrack: sale de modeled', 'Nota:nota1' not in m); chk('untrack: aparece como no modelado', 'desk/notas/nota1.md' in u)
op('track'); m,u,n = ids(); chk('track: vuelve a modeled', 'Nota:nota1' in m); chk('track: no duplicado', 'desk/notas/nota1.md' not in u)
# md
write(R,'desk/notas/nuevo.md'); m,u,n = ids(); chk('md nuevo', 'desk/notas/nuevo.md' in u); (R/'desk/notas/nuevo.md').unlink(); m,u,n=ids(); chk('md baja', 'desk/notas/nuevo.md' not in u)
chk('interno.md no listado', 'desk/interno.md' not in u); chk('destino docs/guia.md listado', 'docs/guia.md' in u)
# aperturas
log = Path(AL).read_text().splitlines()[nlog:]
forb = [l for l in log if any(x in l for x in ['.env.md','priv/p.md','leak.md','interno.md','escapa.md'])]
print('aperturas prohibidas durante el recorrido (incluye /nodes):', forb)
writes_outside = [l for l in log if '\tW' in l and '/repo4/' in l]
print('escrituras observadas en el proceso del servidor (log W):', writes_outside[:10])
# solo /explorer: aperturas .md
n1=len(Path(AL).read_text().splitlines()); s.get('/api/workspace/explorer'); l2 = Path(AL).read_text().splitlines()[n1:]
print('GET /explorer: opens', len(l2), '.md:', [x for x in l2 if '.md' in x], 'W:', [x for x in l2 if '\tW' in x]); 
# hashes: el store cambia solo por las operaciones externas; comprobar GET a GET
for p in ['/api/workspace/explorer','/api/workspace/nodes']:
    b=state(R); s.get(p); chk(f'hash igual tras GET {p}', state(R)==b)
# navegador
reqs=[]; errs=[]
with sync_playwright() as pw:
    br = pw.chromium.launch(); page = br.new_page(viewport={'width':1500,'height':950})
    page.on('request', lambda r: reqs.append((r.method,r.url))); page.on('pageerror', lambda e: errs.append(str(e)))
    page.goto(s.url+'/workspace/node'); page.wait_for_selector('[data-testid="explorer-modeled"]'); page.wait_for_timeout(800)
    def expand():
        for _ in range(30):
            l = page.locator('[data-testid="explorer-folder"] > button[aria-expanded="false"]')
            if l.count()==0: break
            l.first.click()
    def refresh(): page.locator('[data-testid="explorer-refresh"]').click(); page.wait_for_timeout(1500); expand()
    mod = lambda i: page.locator(f'[data-testid="explorer-modeled-item"][data-id="{i}"]').count()
    unm = lambda p: page.locator(f'[data-testid="explorer-unmodeled"][data-path="{p}"]').count()
    t2 = op('alta_nota'); expand()
    chk('UI: sin refrescar no aparece Nota:nota2', mod('Nota:nota2')==0)
    refresh(); chk('UI: tras refrescar Nota:nota2 modelado', mod('Nota:nota2')==1); chk('UI: nota2 no duplicada', unm('desk/notas/nota2.md')==0); page.screenshot(path=SH+'a-alta.png')
    page.locator('[data-testid="explorer-modeled-item"][data-id="Nota:nota2"]').click(); page.wait_for_timeout(1000); chk('UI: abrir nota2 recien creada', 'Segunda.' in page.locator('[data-testid="doc-source"]').inner_text())
    op('baja_nota'); refresh(); chk('UI: baja nota2 desaparece', mod('Nota:nota2')==0)
    op('untrack'); refresh(); chk('UI: untrack nota1 -> no modelado', mod('Nota:nota1')==0 and unm('desk/notas/nota1.md')==1); page.screenshot(path=SH+'b-untrack.png')
    op('track'); refresh(); chk('UI: track nota1 -> modelado sin duplicar', mod('Nota:nota1')==1 and unm('desk/notas/nota1.md')==0); page.screenshot(path=SH+'c-track.png')
    tt = op('alta'); refresh(); chk('UI: alta task modelada', mod(f'TaskDoc:{tt}')==1 and unm(f'desk/tasks/{tt}.md')==0)
    chk('UI: interno.md no listado', unm('desk/interno.md')==0)
    br.close()
print('non-GET', [(m,u) for m,u in reqs if m!='GET'], 'pageerrors', errs)
s.close()
print('FIN')
