import json, sys
from playwright.sync_api import sync_playwright, expect
U='http://127.0.0.1:8123'; TA='task-tarea-a'; TB='task-tarea-b'
reqs=[]; cons=[]; perr=[]
def tab(page,n): page.get_by_role('button',name=n,exact=True).click()
def shot(page,n): page.screenshot(path=f'caps/{n}.png',full_page=True)
def readers(page): return page.locator('[data-testid="document-reader"]').count()
out=[]
def rec(k,v): out.append((k,v)); print(k,'=>',v)
with sync_playwright() as pw:
    b=pw.chromium.launch(); page=b.new_page(viewport={'width':1440,'height':1000})
    page.on('request',lambda r:reqs.append((r.method,r.url)))
    page.on('console',lambda m:cons.append((m.type,m.text)))
    page.on('pageerror',lambda e:perr.append(str(e)))
    # 1 catalogo -> modelado
    page.goto(U+'/workspace/node'); page.wait_for_timeout(1500); shot(page,'01-catalogo')
    rec('body-catalog', page.inner_text('body')[:600].replace('\n',' | '))
    page.goto(U+f'/workspace/node?id=TaskDoc:{TA}&tab=document'); page.wait_for_timeout(1500); shot(page,'02-modelado-doc')
    rec('readers',readers(page))
    rec('src-lines',page.locator('[data-testid="doc-source"] .workspace-src-line .workspace-code-line-text').count())
    rec('render',page.locator('[data-testid="doc-render"]').inner_text()[:800].replace('\n',' | '))
    rec('sidebar',page.locator('.workspace-sidebar').inner_text()[:1500].replace('\n',' | '))
    b.close()
json.dump(dict(reqs=reqs,cons=cons,perr=perr),open('pw1.json','w'))
print(set(m for m,_ in reqs),cons,perr)
