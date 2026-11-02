from playwright.sync_api import sync_playwright
from urllib.parse import urlparse, parse_qs
U='http://127.0.0.1:8123'
def tab(page,n): page.get_by_role('button',name=n,exact=True).click(); page.wait_for_timeout(800)
with sync_playwright() as pw:
    b=pw.chromium.launch(); page=b.new_page()
    for start in ['id=TaskDoc:task-tarea-a','path=guia.md']:
        page.goto(U+'/workspace/node?'+start+'&tab=document'); page.wait_for_timeout(3500)
        for t in ['Grafo Local','Código','Documento']:
            tab(page,t); q=parse_qs(urlparse(page.url).query); print(start,t,{k:q.get(k) for k in('id','path','tab')},page.locator('[data-testid="document-reader"]').count(),page.locator('.workspace-tab-btn.active').inner_text())
    b.close()
