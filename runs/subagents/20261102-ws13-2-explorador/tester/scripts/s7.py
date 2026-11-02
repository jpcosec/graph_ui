import sys
sys.path.insert(0,'/tmp/ws132t')
from lib import *
from playwright.sync_api import sync_playwright, expect
R = Path('/tmp/ws132t/repo7')
sh = R/'.sldb/runtime/edges/TaskDoc/task-tarea-base.yaml'; print(sh.exists()); sh.unlink()
b0 = state(R)
s = Srv(R, env={'SLDB_PYTHONPATH':'/tmp/ws132t/models2'})
errs=[]; reqs=[]
with sync_playwright() as pw:
    b = pw.chromium.launch(); page = b.new_page(viewport={'width':1500,'height':950})
    page.on('pageerror', lambda e: errs.append(str(e))); page.on('request', lambda r: reqs.append(r.method))
    page.goto(s.url+'/workspace/node?id=TaskDoc%3Atask-tarea-base&depth=1&tab=graph'); page.wait_for_timeout(3000)
    print('store-no-preparado rel:', page.locator('[data-testid="store-no-preparado-rel"]').count(), 'aviso grafo:', page.locator('[data-testid="relations-notice"][data-where="graph"]').count(), 'aviso ctx:', page.locator('[data-testid="relations-notice"][data-where="context"]').count())
    t = page.locator('body').inner_text().lower(); print('al dia?', 'al día' in t or 'al dia' in t)
    print([x for x in page.locator('.workspace-alert').all_inner_texts()][:3])
    page.screenshot(path='/tmp/ws132t/shots/09-no-preparado.png')
    b.close()
s.close(); print('pageerrors',errs,'methods',set(reqs),'estado igual', state(R)==b0)
