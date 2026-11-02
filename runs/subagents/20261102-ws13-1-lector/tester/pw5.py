import json,hashlib
from playwright.sync_api import sync_playwright
U='http://127.0.0.1:8123'; TA='task-tarea-a'
reqs=[];cons=[];perr=[]
def shot(page,n): page.screenshot(path=f'caps/{n}.png',full_page=True)
def tab(page,n): page.get_by_role('button',name=n,exact=True).click(); page.wait_for_timeout(800)
def T(page,t): return page.locator(f'[data-testid="{t}"]')
with sync_playwright() as pw:
    b=pw.chromium.launch(); page=b.new_page(viewport={'width':1440,'height':1000})
    page.on('request',lambda r:reqs.append((r.method,r.url))); page.on('console',lambda m:cons.append((m.type,m.text))); page.on('pageerror',lambda e:perr.append(str(e)))
    page.goto(U+'/workspace/node'); page.wait_for_timeout(3500)
    page.locator('select').nth(2).select_option(label='[TaskDoc] Tarea A'); page.wait_for_timeout(3500); shot(page,'03-catalogo-abre-modelado')
    print('A',page.url,page.locator('.workspace-header-title h1').inner_text(),T(page,'document-reader').count(),page.locator('.workspace-doc-header h2').inner_text())
    # B
    rv=T(page,'document-reader').get_attribute('data-revision'); raw=open('/tmp/t13/repo/desk/tasks/task-tarea-a.md','rb').read()
    src='\n'.join(T(page,'doc-source').locator('.workspace-src-line .workspace-code-line-text').all_text_contents())
    print('B rev==sha',rv==hashlib.sha256(raw).hexdigest(),'src==file',src==raw.decode().rstrip('\n'),'doc-revision',T(page,'doc-revision').inner_text(),'ctx-revision',T(page,'ctx-revision').inner_text(),'srcLinks',T(page,'doc-source').locator('a').count(),'renderLinks',T(page,'doc-render').locator('a').count())
    # J
    url0=page.url
    heads=T(page,'render-heading'); print('headings',heads.all_inner_texts())
    T(page,'section-focus').filter(has_text='Goal').first.click(); page.wait_for_timeout(400)
    print('J sec',T(page,'focus-desc').inner_text(),'srcFocused',page.locator('.workspace-src-line.is-focused').count()); shot(page,'09-foco-seccion')
    T(page,'field-focus').filter(has_text='depends_on').first.click(); page.wait_for_timeout(400)
    print('J field',T(page,'focus-desc').inner_text(),'fieldsFocused',page.locator('.workspace-payload-field.is-focused').count()); shot(page,'10-foco-campo')
    for t in ['Grafo Local','Código','Documento']:
        tab(page,t)
        print('  after',t,'urlSame',page.url==url0,'readers',T(page,'document-reader').count(),'rev',(T(page,'document-reader').get_attribute('data-revision')==rv) if T(page,'document-reader').count() else None,'focus',T(page,'focus-desc').inner_text() if T(page,'focus-desc').count() else None,'edgeFocused',T(page,'edge-item').and_(page.locator('[data-focused="true"]')).count(),'fieldFocused',page.locator('.workspace-payload-field.is-focused').count(),'codeFocused',page.locator('[data-testid="code-card"][data-focused="true"]').count(), 'corr',T(page,'focus-corr').inner_text() if T(page,'focus-corr').count() else None)
        shot(page,'11-foco-alterna-'+t[:3])
    # K edge provenance: select edge to B, observe prov items on graph
    tab(page,'Grafo Local'); T(page,'edge-item').filter(has_text='task-tarea-b').first.click(); page.wait_for_timeout(400)
    print('K desc',T(page,'focus-desc').inner_text(),'prov',[e.inner_text() for e in T(page,'edge-prov').all()],'focused edges',T(page,'edge-item').and_(page.locator('[data-focused="true"]')).count()); shot(page,'12-foco-arista')
    tab(page,'Documento'); print('K doc focused fields',[f.split('\n')[0] for f in page.locator('.workspace-payload-field.is-focused').all_inner_texts()],T(page,'focus-desc').inner_text()); shot(page,'13-arista-doc')
    tab(page,'Código'); print('K code focus corr',T(page,'focus-corr').inner_text() if T(page,'focus-corr').count() else None,T(page,'focus-desc').inner_text())
    # I: no modelado
    page.goto(U+'/workspace/node?path=guia.md&tab=document'); page.wait_for_timeout(3500)
    T(page,'outline').locator('[data-testid="section-focus"]',has_text='Primera').click(); page.wait_for_timeout(300)
    u0=page.url; r0=T(page,'document-reader').get_attribute('data-revision')
    print('I focus',T(page,'focus-desc').inner_text(),page.locator('.workspace-src-line.is-focused').count())
    for t in ['Grafo Local','Código','Documento']:
        tab(page,t); shot(page,'08-nomodelado-'+t[:3])
        print('  ',t,'urlSame',page.url==u0,'readers',T(page,'document-reader').count(),'rev',(T(page,'document-reader').get_attribute('data-revision')==r0) if T(page,'document-reader').count() else None,'no-graph',T(page,'no-graph').inner_text() if T(page,'no-graph').count() else None,'focusdesc',T(page,'focus-desc').inner_text() if T(page,'focus-desc').count() else None,'nocode',[x.inner_text() for x in page.locator('.workspace-empty, [role=status]').all()][:3])
    # invalid utf8
    page.goto(U+'/workspace/node?path=invalido.md&tab=document'); page.wait_for_timeout(3500); shot(page,'16-invalido')
    print('invalid body',page.locator('.workspace-main').first.inner_text()[:400].replace('\n','|') if page.locator('.workspace-main').count() else page.inner_text('body')[600:1200].replace('\n','|'))
    print('invalid enc visible', 'utf-8-replaced' in page.inner_text('body') or 'reemplaz' in page.inner_text('body').lower())
    # refresh same doc, readers
    page.get_by_role('button',name='Actualizar',exact=True).click(); page.wait_for_timeout(2000); print('refresh readers',T(page,'document-reader').count())
    b.close()
print('NON-GET',[r for r in reqs if r[0]!='GET']); print('CONS',cons); print('PERR',perr)
json.dump(reqs,open('pw5-reqs.json','w'))
