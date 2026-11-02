import sys, json, subprocess, time
sys.path.insert(0,'/tmp/ws132t')
from lib import *
from playwright.sync_api import sync_playwright, expect
R = Path('/tmp/ws132t/repo4'); SH='/tmp/ws132t/shots/'
s = Srv(R, env={'SLDB_PYTHONPATH':'/tmp/ws132t/models2'})
reqs=[]; errs=[]; cons=[]
res = {}
def ck(name, cond, extra=''):
    res[name]=bool(cond); print(('PASS ' if cond else 'FAIL ')+name, extra)
try:
  with sync_playwright() as pw:
    b = pw.chromium.launch(); page = b.new_page(viewport={'width':1500,'height':950})
    page.on('request', lambda r: reqs.append((r.method, r.url)))
    page.on('pageerror', lambda e: errs.append(str(e)))
    page.on('console', lambda m: cons.append((m.type, m.text)) if m.type=='error' else None)
    page.goto(s.url+'/workspace/node'); page.wait_for_selector('[data-testid="explorer-modeled"]')
    page.wait_for_timeout(800)
    page.screenshot(path=SH+'01-inicial.png')
    mods = page.locator('[data-testid="explorer-modeled-item"]')
    ids = [mods.nth(i).get_attribute('data-id') for i in range(mods.count())]
    print('modeled ids', ids)
    bad = page.locator('[data-testid="explorer-modeled-item"][data-id="Diario:d1"]')
    ck('badge modelo_no_carga en explorador', bad.get_attribute('data-estado')=='modelo_no_carga', bad.get_attribute('title'))
    ck('badge visible texto', 'modelo_no_carga' in bad.inner_text().lower(), bad.inner_text())
    ck('causa en title', 'Failed to import module' in (bad.get_attribute('title') or ''))
    # abrir no modelado sin ID
    page.locator('[data-testid="explorer-folder"] >> text=notas').first.click() if page.locator('[data-testid="explorer-unmodeled"][data-path="desk/notas/libre.md"]').count()==0 else None
    item = page.locator('[data-testid="explorer-unmodeled"][data-path="desk/notas/libre.md"]')
    if item.count()==0:
        # expand all folders
        for _ in range(4):
            for f in page.locator('[data-testid="explorer-folder"] > button[aria-expanded="false"]').all(): f.click()
    item = page.locator('[data-testid="explorer-unmodeled"][data-path="desk/notas/libre.md"]'); item.click()
    expect(page.locator('[data-testid="document-reader"]')).to_be_visible(); page.wait_for_timeout(600)
    ck('no modelado: header', 'Libre' in page.locator('.workspace-doc-header h2').inner_text(), page.url)
    ck('no modelado: url path', 'path=desk' in page.url and 'id=' not in page.url, page.url)
    ck('no modelado: un lector', page.locator('[data-testid="document-reader"]').count()==1)
    src = page.locator('[data-testid="doc-source"]').inner_text(); ck('no modelado: fuente literal', 'Texto libre sin modelo.' in src)
    page.screenshot(path=SH+'02-no-modelado.png')
    # foco: elegir seccion
    page.locator('[data-testid="outline"] [data-testid="section-focus"]').first.click(); page.wait_for_timeout(300)
    foco_desc = page.locator('[data-testid="focus-desc"]').inner_text(); url_before = page.url
    # pestañas
    for tab in ('Grafo Local','Código','Documento'):
        page.get_by_role('button', name=tab, exact=True).click(); page.wait_for_timeout(300)
        ck(f'tab {tab}: path intacto', 'path=desk%2Fnotas%2Flibre.md' in page.url and 'id=' not in page.url, page.url)
        ck(f'tab {tab}: un lector o sin', page.locator('[data-testid="document-reader"]').count()<=1)
    ck('foco intacto', page.locator('[data-testid="focus-desc"]').inner_text()==foco_desc, foco_desc)
    # modelado sano sin ID
    page.locator('[data-testid="explorer-modeled-item"][data-id="Nota:nota1"]').click(); page.wait_for_timeout(1000)
    expect(page.locator('[data-testid="document-reader"]')).to_be_visible()
    ck('modelado: url id', 'id=Nota' in page.url, page.url); ck('modelado un lector', page.locator('[data-testid="document-reader"]').count()==1)
    ck('modelado: fuente', 'Apunte sano.' in page.locator('[data-testid="doc-source"]').inner_text())
    page.screenshot(path=SH+'03-modelado.png')
    # URL comparada con carga directa
    url_exp = page.url
    p2 = b.new_page(); p2.goto(url_exp); p2.wait_for_selector('[data-testid="document-reader"]'); ck('url reproducible por carga directa', p2.locator('.workspace-doc-header h2').inner_text()==page.locator('.workspace-doc-header h2').inner_text()); p2.close()
    # grafo y contexto: aviso
    page.get_by_role('button', name='Grafo Local', exact=True).click(); page.wait_for_timeout(500)
    n = page.locator('[data-testid="relations-notice"]')
    print('notices', [n.nth(i).get_attribute('data-where') for i in range(n.count())])
    ck('aviso grafo visible', page.locator('[data-testid="relations-notice"][data-where="graph"]').is_visible())
    ck('aviso contexto visible', page.locator('[data-testid="relations-notice"][data-where="context"]').is_visible())
    body = page.locator('body').inner_text().lower()
    ck('sin texto al dia', not any(t in body for t in ['al día','al dia','actualizado','up to date','sin cambios pendientes']))
    stale_txt = [l for l in body.splitlines() if 'stale' in l or 'vigente' in l]; print('lineas stale/vigente:', stale_txt)
    page.screenshot(path=SH+'04-grafo-aviso.png')
    # modelo roto
    page.locator('[data-testid="explorer-modeled-item"][data-id="Diario:d1"]').click(); page.wait_for_timeout(1000)
    page.get_by_role('button', name='Documento', exact=True).click(); page.wait_for_timeout(500)
    ck('roto: fuente legible', 'Texto del diario.' in page.locator('[data-testid="doc-source"]').inner_text())
    page.screenshot(path=SH+'05-modelo-roto.png')
    print('roto texto cabecera:', page.locator('.workspace-doc-header').inner_text().replace('\n',' | ')[:300])
    print('degraded banner:', [t for t in page.locator('.workspace-degraded-banner, .workspace-alert').all_inner_texts()][:5])
    # filtro
    f = page.locator('[data-testid="explorer-filter"]'); f.fill('libre'); f.dispatch_event('change'); page.wait_for_timeout(300)
    page.screenshot(path=SH+'06-filtro.png')
    ck('filtro: no modelado visible', page.locator('[data-testid="explorer-unmodeled"][data-path="desk/notas/libre.md"]').count()==1)
    ck('filtro: oculta modelados', page.locator('[data-testid="explorer-modeled-item"]').count()==0, str(page.locator('[data-testid="explorer-modeled-item"]').count()))
    f.fill('zzzz'); f.dispatch_event('change'); page.wait_for_timeout(200)
    ck('filtro sin coincidencias', 'Sin coincidencias' in page.locator('[data-testid="explorer"]').inner_text())
    f.fill(''); f.dispatch_event('change'); page.wait_for_timeout(200)
    # refresco
    def expand():
        for _ in range(30):
            l = page.locator('[data-testid="explorer-folder"] > button[aria-expanded="false"]')
            if l.count()==0: break
            l.first.click()
    pre_new = 'Tarea nueva' 
    code = '''
import sys
from deskops.operations import DeskopsOperations
from pathlib import Path
ops = DeskopsOperations(Path(sys.argv[1]))
print(ops.create_task_bundle(dict(title='Tarea nueva alta', goal='G', scope='S', implementation_path='P', validation=['x'], done_when='d')).task_id)
'''
    out = subprocess.run([sys.executable,'-c',code,str(R)],capture_output=True,text=True,env={k:v for k,v in os.environ.items() if k!='DESKOPS_ROOT'}); print('alta:', out.stdout.strip()[-80:], out.returncode, out.stderr[-200:])
    write(R,'desk/notas/nuevo-md.md','# Nuevo md\n')
    page.wait_for_timeout(1500); expand()
    txt = page.locator('[data-testid="explorer"]').inner_text()
    ck('sin refrescar: no aparece tarea', 'Tarea nueva alta' not in txt and 'nueva-alta' not in txt, '')
    ck('sin refrescar: no aparece md', 'nuevo-md.md' not in txt)
    reqs_before = len(reqs)
    page.locator('[data-testid="explorer-refresh"]').click(); page.wait_for_timeout(1500)
    new_reqs = [u for m,u in reqs[reqs_before:]]; print('reqs al refrescar', new_reqs)
    ck('refresco recarga nodes y explorer', any('/api/workspace/nodes' in u for u in new_reqs) and any('/api/workspace/explorer' in u for u in new_reqs))
    expand()
    txt = page.locator('[data-testid="explorer"]').inner_text()
    ck('tras refrescar: tarea nueva COMO MODELADA', page.locator('[data-testid="explorer-modeled-item"][data-id="TaskDoc:task-tarea-nueva-alta"]').count()==1)
    print('   tarea nueva como no modelada (duplicada por obsoleto):', page.locator('[data-testid="explorer-unmodeled"][data-path="desk/tasks/task-tarea-nueva-alta.md"]').count())
    ck('tras refrescar: md nuevo', 'nuevo-md.md' in txt)
    page.screenshot(path=SH+'07-tras-refresco.png')
    # baja de md
    (R/'desk/notas/nuevo-md.md').unlink(); 
    page.locator('[data-testid="explorer-refresh"]').click(); page.wait_for_timeout(1200)
    expand(); ck('baja md desaparece tras refrescar', 'nuevo-md.md' not in page.locator('[data-testid="explorer"]').inner_text())
    # rastreado: untrack nota1 y track
    ops_code = '''
import sys
from sldb.api.documents.untrack_document import untrack_document
from sldb.api.documents.track_document_file import track_document_file
R=sys.argv[1]; mode=sys.argv[2]
if mode=='untrack': untrack_document(R+'/.sldb','nota1',pythonpath='/tmp/ws132t/models2')
else: track_document_file(R+'/.sldb','Nota','desk/notas/nota1.md',pythonpath='/tmp/ws132t/models2')
'''
    o = subprocess.run([sys.executable,'-c',ops_code,str(R),'untrack'],capture_output=True,text=True); print('untrack',o.returncode,o.stderr[-300:])
    page.locator('[data-testid="explorer-refresh"]').click(); page.wait_for_timeout(1200)
    expand(); ck('destrackeado aparece como no modelado', page.locator('[data-testid="explorer-unmodeled"][data-path="desk/notas/nota1.md"]').count()==1)
    ck('destrackeado ya no esta en modelados', page.locator('[data-testid="explorer-modeled-item"][data-id="Nota:nota1"]').count()==0)
    o = subprocess.run([sys.executable,'-c',ops_code,str(R),'track'],capture_output=True,text=True); print('track',o.returncode,o.stderr[-300:])
    page.locator('[data-testid="explorer-refresh"]').click(); page.wait_for_timeout(1200)
    expand(); ck('rastreado: no duplicado', page.locator('[data-testid="explorer-unmodeled"][data-path="desk/notas/nota1.md"]').count()==0)
    ck('rastreado: Model:name', page.locator('[data-testid="explorer-modeled-item"][data-id="Nota:nota1"]').count()==1)
    page.screenshot(path=SH+'08-rastreado.png')
    b.close()
finally:
    s.close()
print('request methods', sorted(set(m for m,u in reqs)), 'non-GET:', [(m,u) for m,u in reqs if m!='GET'])
print('pageerrors', errs); print('console errors', cons)
print('FAILS', [k for k,v in res.items() if not v])
