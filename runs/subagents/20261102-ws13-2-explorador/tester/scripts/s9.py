import sys
sys.path.insert(0,'/tmp/ws132t')
from lib import *
from playwright.sync_api import sync_playwright
SH='/tmp/ws132t/shots2/'
errs=[]
with sync_playwright() as pw:
    br = pw.chromium.launch()
    for name, repo, env in [('truncado','repo_big',{}),('sin_git','repo_nogit',{}),('ignorados_error','repo1',{'PATH':'/nonexistent'})]:
        s = Srv(Path('/tmp/ws132t')/repo, env=env); page = br.new_page(viewport={'width':1500,'height':950}); page.on('pageerror', lambda e: errs.append(str(e)))
        page.goto(s.url+'/workspace/node'); page.wait_for_selector('[data-testid="explorer-modeled"]'); page.wait_for_timeout(1000)
        tid={'truncado':'explorer-truncado','sin_git':'explorer-sin-git','ignorados_error':'explorer-ignorados-error'}[name]
        el = page.locator(f'[data-testid="{tid}"]'); print(name, el.count(), el.first.inner_text() if el.count() else None)
        page.screenshot(path=SH+f'd-{name}.png'); page.close(); s.close()
    s = Srv(Path('/tmp/ws132t/repo6'), env={'SLDB_PYTHONPATH':'/tmp/ws132t/models'}); page = br.new_page(viewport={'width':1500,'height':950}); page.on('pageerror', lambda e: errs.append(str(e)))
    page.goto(s.url+'/workspace/node?id=Diario%3Ad1&depth=1&tab=code'); page.wait_for_timeout(2500)
    print('codigo tab:', page.locator('main.workspace-main').inner_text()[:400].replace('\n',' | ')); page.screenshot(path=SH+'e-roto-codigo.png')
    page.get_by_role('button', name='Documento', exact=True).click(); page.wait_for_timeout(500); page.screenshot(path=SH+'f-roto-documento.png')
    print('doc tab banners:', page.locator('.workspace-degraded-banner, .workspace-alert').all_inner_texts()[:3])
    s.close(); br.close()
print('pageerrors', errs)
