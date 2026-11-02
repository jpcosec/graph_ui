import json, re, traceback
from playwright.sync_api import sync_playwright, expect
U='http://127.0.0.1:8123'; TA='task-tarea-a'; TB='task-tarea-b'
reqs=[]; cons=[]; perr=[]; results=[]
def shot(page,n): page.screenshot(path=f'caps/{n}.png',full_page=True)
def tab(page,n): page.get_by_role('button',name=n,exact=True).click()
def step(name):
    def deco(f):
        try:
            r=f(); results.append((name,'OK',r)); print('OK  ',name,'|',r)
        except Exception as e:
            results.append((name,'ERR',str(e)[:400])); print('ERR ',name,'|',str(e)[:500].replace('\n',' '))
    return deco
def T(page,t): return page.locator(f'[data-testid="{t}"]')
with sync_playwright() as pw:
    b=pw.chromium.launch(); page=b.new_page(viewport={'width':1440,'height':1000})
    page.on('request',lambda r:reqs.append((r.method,r.url)))
    page.on('console',lambda m:cons.append((m.type,m.text)))
    page.on('pageerror',lambda e:perr.append(str(e)))
    def settle(): page.wait_for_timeout(3500)

    @step('A catalogo->modelado')
    def _():
        page.goto(U+'/workspace/node'); settle()
        sel=page.locator('select').nth(1)
        opts=sel.locator('option').all_inner_texts()
        sel.select_option(label='[TaskDoc] Tarea A'); settle()
        shot(page,'03-catalogo-abre-modelado')
        return dict(url=page.url,h1=page.locator('.workspace-header-title h1').inner_text(),readers=T(page,'document-reader').count(),nopts=len(opts))
    @step('B modelado render+fuente+revision')
    def _():
        page.goto(U+f'/workspace/node?id=TaskDoc:{TA}&tab=document'); settle()
        rv=T(page,'document-reader').get_attribute('data-revision')
        src='\n'.join(T(page,'doc-source').locator('.workspace-src-line .workspace-code-line-text').all_text_contents())
        raw=open('/tmp/t13/repo/desk/tasks/task-tarea-a.md',encoding='utf-8').read()
        import hashlib
        return dict(rev=rv[:12],srcEqFile=src==raw.rstrip('\n') or src==raw, shaOk=hashlib.sha256(raw.encode()).hexdigest()==rv, links_in_source=T(page,'doc-source').locator('a').count(), outline=T(page,'outline').inner_text()[:200].replace('\n','|'))
    @step('C no modelado por URL ?path=')
    def _():
        page.goto(U+'/workspace/node?path=guia.md&tab=document'); settle(); shot(page,'04-nomodelado-guia')
        r=T(page,'doc-render')
        return dict(h2=page.locator('.workspace-doc-header h2').inner_text(), outline=T(page,'outline').inner_text().replace('\n','|'), ctxpath=T(page,'ctx-path').inner_text(), relabs=T(page,'rel-absent').inner_text(),
          statuses=[(a.get_attribute('data-status'),a.get_attribute('data-open'),a.inner_text(),a.evaluate('e=>e.tagName')) for a in r.locator('[data-status]').all()],
          srcLinks=T(page,'doc-source').locator('a').count(), srclines=T(page,'doc-source').locator('.workspace-src-line').count(),
          sidebar=page.locator('.workspace-sidebar').inner_text().replace('\n','|')[:1500])
    @step('D seguir enlace resuelto y volver')
    def _():
        page.locator('[data-testid="doc-render"] [data-open="path:notes/otro.md"]').first.click(); settle(); shot(page,'05-enlace-seguido')
        u1=page.url; h=page.locator('.workspace-doc-header h2').inner_text()
        page.go_back(); settle(); u2=page.url; h2=page.locator('.workspace-doc-header h2').inner_text()
        return dict(after=u1,h=h,back=u2,hback=h2,readers=T(page,'document-reader').count())
    @step('E enlace con ancla -> foco seccion')
    def _():
        page.goto(U+'/workspace/node?path=guia.md&tab=document'); settle()
        page.locator('[data-testid="doc-render"] [data-open="path:notes/otro.md"]',has_text='Segunda parte').first.click(); settle(); shot(page,'06-ancla')
        return dict(url=page.url,focus=T(page,'focus-desc').inner_text(),focused=page.locator('.workspace-src-line.is-focused').count())
    @step('F roto visible origen/causa; txt; dospuntos; externo')
    def _():
        page.goto(U+'/workspace/node?path=guia.md&tab=document'); settle()
        r=T(page,'doc-render'); 
        out=[]
        for a in r.locator('[data-status]').all(): out.append((a.get_attribute('data-status'),a.evaluate('e=>e.tagName'),a.inner_text(),a.get_attribute('title'),a.get_attribute('href')))
        sb=page.locator('.workspace-sidebar').inner_text()
        before=len(reqs)
        r.locator('[data-status="externo"]').first.click(force=True); page.wait_for_timeout(800)
        ext=[u for m,u in reqs[before:] if 'example.com' in u]
        return dict(items=out,sidebar_links=sb[sb.find('ENLACES'):][:900].replace('\n','|'),url_after_ext_click=page.url,ext_requests=ext,pages=len(b.contexts[0].pages))
    @step('G dos desks no modelado url->tracked')
    def _():
        page.goto(U+f'/workspace/node?path=desk/tasks/{TA}.md&tab=document'); settle()
        return dict(url=page.url,id=page.locator('.workspace-sidebar').inner_text()[:200].replace('\n','|'),h1=page.locator('.workspace-header-title h1').inner_text())
    @step('H error de guardia en UI')
    def _():
        o={}
        for p in ['.git/config','oculto.md','escape.md','data.txt','nada.md','invalido.md']:
            page.goto(U+f'/workspace/node?path={p}&tab=document'); settle()
            o[p]=(T(page,'source-error').inner_text().replace('\n','|') if T(page,'source-error').count() else 'NOERR readers=%d'%T(page,'document-reader').count())
        shot(page,'07-error-ultimo')
        return o
    @step('I Graph/Code no modelado')
    def _():
        page.goto(U+'/workspace/node?path=guia.md&tab=document'); settle()
        o={}
        for t in ['Grafo Local','Código']:
            tab(page,t); page.wait_for_timeout(800); o[t]=page.locator('.workspace-main, main').first.inner_text()[:300].replace('\n','|'); shot(page,'08-nomodelado-'+t.replace('ó','o').replace(' ','_'))
        o['url']=page.url; o['readers']=T(page,'document-reader').count()
        return o
    @step('J foco modelado: seccion, campo, ref, arista; alternar')
    def _():
        page.goto(U+f'/workspace/node?id=TaskDoc:{TA}&tab=document'); settle()
        url0=page.url; rev0=T(page,'document-reader').get_attribute('data-revision'); o={}
        T(page,'outline').locator('[data-testid="section-focus"]',has_text='Goal').click()
        o['sec']=T(page,'focus-desc').inner_text(); o['secLines']=page.locator('.workspace-src-line.is-focused').count()
        shot(page,'09-foco-seccion')
        T(page,'field-focus').filter(has_text='depends_on').first.click()
        o['field']=T(page,'focus-desc').inner_text(); o['fieldFocused']=page.locator('.workspace-payload-field.is-focused').count()
        shot(page,'10-foco-campo')
        for t in ['Grafo Local','Código','Documento']:
            tab(page,t); page.wait_for_timeout(700)
            o['after_'+t]=dict(url=page.url==url0,rev=T(page,'document-reader').get_attribute('data-revision')==rev0 if T(page,'document-reader').count() else None,readers=T(page,'document-reader').count(),focus=T(page,'focus-desc').inner_text() if T(page,'focus-desc').count() else None)
            shot(page,'11-foco-alterna-'+t[:3])
        return o
    @step('K arista con varias procedencias')
    def _():
        tab(page,'Grafo Local'); page.wait_for_timeout(1000)
        items=T(page,'edge-item')
        o=[]
        for i in range(items.count()):
            it=items.nth(i); o.append((it.inner_text().replace('\n','|'),it.get_attribute('data-focused')))
        # focus edge to TB
        T(page,'edge-item').filter(has_text=TB).first.click(); page.wait_for_timeout(500)
        shot(page,'12-foco-arista')
        foc=T(page,'edge-item').and_(page.locator('[data-focused="true"]'))
        d=T(page,'focus-desc').inner_text()
        tab(page,'Documento'); page.wait_for_timeout(600)
        fields=page.locator('.workspace-payload-field.is-focused').all_inner_texts()
        shot(page,'13-arista-en-documento')
        return dict(edges=o,desc=d,prov=[e.inner_text() for e in T(page,'edge-prov').all()],focusedFieldsInDoc=fields)
    @step('L ref de codigo foco y rango local')
    def _():
        tab(page,'Código'); page.wait_for_timeout(1000); shot(page,'14-code')
        cards=T(page,'code-card')
        info=[(c.get_attribute('data-field'),c.get_attribute('data-position'),c.get_attribute('data-focused')) for c in cards.all()]
        card=page.locator('[data-testid="code-card"][data-field="files"]').first
        card.locator('[data-testid="code-ref-focus"]').click(); page.wait_for_timeout(400)
        o=dict(cards=info,desc=T(page,'focus-desc').inner_text(),focusedCards=page.locator('[data-testid="code-card"][data-focused="true"]').count())
        card.locator('[data-testid="code-toggle-full"]').click(); page.wait_for_timeout(400)
        full=card.locator('[data-testid="code-full"]')
        o['rows']=full.locator('tr[data-line]').count()
        full.locator('tr[data-line="4"]').click(); o['l1']=full.locator('[data-testid="code-range-label"]').inner_text()
        full.locator('tr[data-line="9"]').click(modifiers=['Shift']); o['l2']=full.locator('[data-testid="code-range-label"]').inner_text(); o['inrange']=full.locator('tr.in-range').count()
        shot(page,'15-code-rango')
        o['fragment_still']=card.locator('.workspace-code-line').count()
        o['url']=page.url; return o
    @step('M ref posicion 2 (b.py tras omitidos)/references')
    def _():
        page.goto(U+f'/workspace/node?id=TaskDoc:{TA}&tab=code'); settle()
        o=[]
        for c in T(page,'code-card').all():
            c.locator('[data-testid="code-ref-focus"]').click(); page.wait_for_timeout(300)
            o.append((c.get_attribute('data-field'),c.get_attribute('data-position'),T(page,'focus-desc').inner_text()))
        tab(page,'Documento'); page.wait_for_timeout(500)
        return dict(refs=o,docfocus=page.locator('.workspace-payload-field.is-focused').all_inner_texts())
    @step('N vacios: texto vacio en etiquetas/refs')
    def _():
        o={}
        for u in [f'id=TaskDoc:{TA}','path=guia.md']:
            page.goto(U+f'/workspace/node?{u}&tab=document'); settle()
            for t in ['Documento','Grafo Local','Código']:
                tab(page,t); page.wait_for_timeout(500)
                empties=page.evaluate("""()=>[...document.querySelectorAll('.workspace-main *, .workspace-sidebar *, main *')].filter(e=>e.children.length===0 && /button|a|span|code|strong|h\\d|label|td|p|li|div/i.test(e.tagName) && (e.getAttribute('data-testid')||e.className) && e.textContent.trim()==='' && !['I','SVG'].includes(e.tagName) && e.getBoundingClientRect().width>0 && getComputedStyle(e).display!='none').map(e=>e.tagName+'.'+e.className+'['+(e.getAttribute('data-testid')||'')+']')""")
                o[u+'/'+t]=empties[:15]
        return o
    b.close()
json.dump(dict(reqs=reqs,cons=cons,perr=perr,results=results),open('pw3.json','w'),ensure_ascii=False,indent=1)
print('METHODS',sorted(set(m for m,_ in reqs)))
print('NON-GET',[r for r in reqs if r[0]!='GET'])
print('CONSOLE',cons); print('PAGEERR',perr)
print('API',sorted(set(u.split('127.0.0.1:8123')[1] for m,u in reqs if '/api/' in u)))
