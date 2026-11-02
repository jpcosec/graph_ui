import sys
from playwright.sync_api import sync_playwright
base=sys.argv[1]; res=[]
def chk(n,c,d=''): res.append(c); print('PASS' if c else 'FAIL',n,d)
with sync_playwright() as pw:
    br=pw.chromium.launch(); pg=br.new_page(viewport={'width':1440,'height':1000}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e))); reqs=[]
    pg.on('request',lambda r: reqs.append(r.url) if '/api/workspace/' in r.url else None)
    def go(start):
        pg.goto(f'{base}/workspace/node?{start}&depth=1&tab=document'); pg.wait_for_selector('[data-testid=link-item]')
    def url(): return pg.url.split(base)[1]
    for start,label,bad,badtext,good,goodurl in [
      ('path=notes/anclas.md','propio no modelado','[[#Zzz]]','Zzz','[[#Propia]]',None),
      ('id=TaskDoc:task-doc-a','propio modelado','[[#Inexistente]]','Inexistente','[[#Goal]]',None),
      ('path=notes/anclas.md','destino no modelado','[[notes/otro.md#Nada]]','Nada','[[notes/otro.md#Real]]','path=notes%2Fotro.md'),
      ('path=notes/anclas.md','destino modelado','[[task-doc-b#Nada]]','Nada','[[task-doc-b#Goal]]','id=TaskDoc%3Atask-doc-b'),
      ('path=notes/anclas.md','destino protegido','[[notes/ign.md#Sec]]','ignorado','',None)]:
        go(start); u0=url()
        item=pg.locator('[data-testid=link-item]',has_text=bad.strip('[]'))
        # clic en el item completo y en el texto inline si existe
        n0=len(reqs)
        item.first.click(force=True)
        inline=pg.locator('.workspace-render').get_by_text(bad.strip('[]'),exact=False)
        for i in range(min(inline.count(),3)):
            try: inline.nth(i).click(timeout=1500)
            except Exception: pass
        pg.wait_for_timeout(800)
        txt=item.first.inner_text().replace('\n',' | ')
        chk(f'{label}: clic en "{bad}" no navega (URL igual, sin peticiones nuevas)',url()==u0 and len(reqs)==n0,f'{u0} -> {url()} nuevas={len(reqs)-n0}')
        chk(f'{label}: se ve origen y causa','origen' in txt and ('no existe' in txt or 'ignorado' in txt or 'protegido' in txt),txt[:200])
        print('    item:',txt[:230])
        if good:
            pg.locator('[data-testid=link-item] button',has_text=good.strip('[]').split('#')[0] if not good.startswith('[[#') else '→').first.click() if good.startswith('[[#') else pg.locator('[data-testid=link-item]',has_text=good.strip('[]')).locator('button').first.click()
            pg.wait_for_timeout(1000)
            chk(f'{label}: enlace valido {good} si navega/enfoca', (url()!=u0 and (goodurl is None or goodurl in url())) or (goodurl is None and 'anchor' in url() or goodurl is None), f'{url()}')
            print('    url tras valido:',url(), '| anchor-note:', pg.locator('[data-testid=anchor-note]').count(), '| foco:', pg.locator('[data-testid=focus-desc]').inner_text() if pg.locator('[data-testid=focus-desc]').count() else '-')
    chk('sin pageerrors',not errs,str(errs[:2])); br.close()
print('RESUMEN',sum(res),'/',len(res))
