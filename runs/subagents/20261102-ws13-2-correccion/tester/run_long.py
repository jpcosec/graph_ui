import json, subprocess, sys
from playwright.sync_api import sync_playwright
from common import *
CAP = HERE / 'capturas-renov'
w = fresh('long'); root = w / 'repo'; root.mkdir(); T.git_init(root); T.prepare_store(root)
T.add_bad_model(root, w)
F = 'desk/carpeta-muy-larga-numero-1/subcarpeta-con-un-nombre-igualmente-largo-numero-2'
S = 'documento-con-un-nombre-extremadamente-largo-que-no-cabe-en-la-columna'
unm = {f'{F}/{S}-alfa.md': 'alfa', f'{F}/{S}-beta.md': 'beta',
       'desk/seg/' + 'x'*95 + 'A.md': 'segA', 'desk/seg/' + 'x'*95 + 'B.md': 'segB',
       'desk/seg/' + 'tituloMuyLargoSinSeparadoresNiEspacios' * 3 + '.md': 'titulo'}
for r, t in unm.items(): T.write(root, r, f'# H\n\nFIN-{t}\n')
# modelados con id/ruta larga (bitacora, modelo no importable)
LONGID = 'bitacora-con-un-identificador-larguisimo-' + 'y'*60
code = ("import sys\nfrom pathlib import Path\nfrom sldb.api.documents.create_document import create_document\n"
        "root, models = Path(sys.argv[1]), sys.argv[2]\n"
        "for t in ('alfa','beta'):\n  create_document(root/'.sldb','Bitacora','bitacoras/subcarpeta-profunda-con-nombre-largo/'+sys.argv[3]+'-'+t+'.md',{'id':sys.argv[3]+'-'+t,'title':'T','entry':'x'}, pythonpath=models)\n")
r = subprocess.run([sys.executable, '-c', code, str(root), str(w/'modelos'), LONGID], capture_output=True, text=True); assert r.returncode == 0, r.stderr
T.write(root, 'desk/notas/uno.md', '# U\n'); T.commit_all(root)
OUT = {}
srv = Server(root, w/'srv')
JS = """(e) => { const aside = document.querySelector('[data-testid="explorer"]'); const ab = aside.getBoundingClientRect();
  const r = document.createRange(); r.selectNodeContents(e); const rects = Array.from(r.getClientRects());
  const btn = e.closest('button'); const cs = getComputedStyle(e);
  return {sw: e.scrollWidth - e.clientWidth, bsw: btn.scrollWidth - btn.clientWidth, asideSW: aside.scrollWidth - aside.clientWidth,
          left: Math.min(...rects.map(x=>x.left)), right: Math.max(...rects.map(x=>x.right)), aL: ab.left, aR: ab.right, lines: rects.length, text: e.innerText}; }"""
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        for vw, vh in ((1440, 900), (360, 800), (800, 700)):
            page = b.new_page(viewport={'width': vw, 'height': vh}); errs = []; page.on('pageerror', lambda e: errs.append(str(e)))
            page.goto(f'{srv.url}/workspace/node?path=desk/notas/uno.md'); page.wait_for_selector('[data-testid="explorer-item-path"]')
            page.wait_for_timeout(500)
            # abrir todas las carpetas
            for _ in range(6):
                fs = page.locator('[data-testid="explorer-folder"] > button')
                n = fs.count(); opened = False
                for i in range(n):
                    btn = fs.nth(i)
                    if btn.locator('xpath=..').locator(':scope > ul').count() == 0: btn.click(); opened = True
                if not opened: break
            res = []
            paths = page.locator('[data-testid="explorer-item-path"]')
            for i in range(paths.count()):
                el = paths.nth(i); el.scroll_into_view_if_needed(); m = el.evaluate(JS)
                m['ok'] = (m['sw'] <= 0 and m['bsw'] <= 0 and m['asideSW'] <= 0 and m['left'] >= m['aL'] - 0.5 and m['right'] <= m['aR'] + 0.5)
                m['title_attr'] = el.locator('xpath=ancestor::button').get_attribute('title'); res.append(m)
            titles = page.locator('.workspace-explorer-item-title'); tl = []
            for i in range(titles.count()):
                m = titles.nth(i).evaluate(JS); tl.append({'t': m['text'][:60], 'ok': m['sw'] <= 0 and m['right'] <= m['aR'] + 0.5 and m['left'] >= m['aL'] - 0.5})
            OUT[f'{vw}'] = {'paths': len(res), 'paths_bad': [(m['text'][:70], m['sw'], m['right'], m['aR']) for m in res if not m['ok']], 'titles_bad': [t for t in tl if not t['ok']],
                            'texts_complete': sorted(m['text'] for m in res if m['text'] in unm or 'bitacoras/' in m['text'])[:12], 'pageerrors': errs,
                            'unmodeled_expected_all_visible': all(any(m['text'] == r for m in res) for r in unm)}
            page.locator('[data-testid="explorer"]').evaluate("e => e.scrollTo(0,0)")
            page.screenshot(path=str(CAP / f'largo2-{vw}-pagina.png'))
            # captura del explorador completo (alto del contenido)
            page.locator('[data-testid="explorer"]').screenshot(path=str(CAP / f'largo2-{vw}-explorador.png'))
            # distinguibilidad: abrir cada una y comprobar origen
            if vw == 1440:
                ok = {}
                for r, t in unm.items():
                    page.locator(f'[data-testid="explorer-unmodeled"][data-path="{r}"]').scroll_into_view_if_needed()
                    page.locator(f'[data-testid="explorer-unmodeled"][data-path="{r}"]').click()
                    page.wait_for_selector(f'[data-testid="ctx-path"]:text-is("{r}")'); ok[t] = f'FIN-{t}' in page.locator('[data-testid="document-reader"]').inner_text()
                OUT['abre_origen'] = ok
            page.close()
        b.close()
finally: srv.close()
json.dump(OUT, open(HERE / 'result-long2.json', 'w'), indent=1, ensure_ascii=False); print(json.dumps(OUT, indent=1, ensure_ascii=False))
