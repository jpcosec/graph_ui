"""Sonda del tester: documento hostil en una COPIA del store. uso: verify_hostil.py <base> <out>"""
import json, sys
from pathlib import Path
from playwright.sync_api import sync_playwright
base, out = sys.argv[1], Path(sys.argv[2])
res = {'dialogs': [], 'page_errors': [], 'console_errors': [], 'requests': []}
with sync_playwright() as pw:
    b = pw.chromium.launch(); p = b.new_page(viewport={'width': 1440, 'height': 900})
    p.on('dialog', lambda d: (res['dialogs'].append(d.message), d.dismiss()))
    p.on('pageerror', lambda e: res['page_errors'].append(str(e)))
    p.on('console', lambda m: m.type == 'error' and res['console_errors'].append(m.text))
    p.on('request', lambda q: res['requests'].append(q.url) if ('example.com' in q.url or q.url.endswith('/x') or 'javascript' in q.url) else None)
    p.goto(f"{base}/workspace/node?path=docs/hostil.md&tab=document")
    R = p.locator('[data-testid=doc-render]'); R.locator('[data-line-start]').first.wait_for(timeout=60000)
    p.wait_for_timeout(1500)
    res['dom'] = p.evaluate('''() => { const R = document.querySelector('[data-testid=doc-render]'); const c = s => R.querySelectorAll(s).length;
      return {script: c('script'), img: c('img'), b: c('b'), iframe: c('iframe'), a: c('a'), a_nav: c('a[href]:not([href="#"])'),
       a_list: [...R.querySelectorAll('a')].map(a => [a.getAttribute('href'), a.dataset.status, a.textContent]),
       no_clasificado: [...R.querySelectorAll('[data-status=no_clasificado]')].map(e => [e.tagName, e.textContent, e.getAttribute('title')]),
       links: [...R.querySelectorAll('[data-testid=doc-link]')].map(e => [e.tagName, e.dataset.status, e.textContent, e.closest('em,strong,blockquote,code')?.tagName || '']),
       code: [...R.querySelectorAll('code.workspace-render-code-inline')].map(e => [e.textContent, e.querySelectorAll('[data-testid=doc-link]').length]),
       onattrs: [...R.querySelectorAll('*')].filter(e => [...e.attributes].some(a => a.name.startsWith('on'))).length,
       pwned: window.__pwned === undefined ? null : String(window.__pwned), text: R.innerText}; }''')
    # hover y clic sobre todo lo que parece enlace o html: nada debe navegar ni ejecutar
    url0 = p.url
    for loc in [R.locator('[data-status=no_clasificado]'), R.get_by_text('negrita html')]:
        for i in range(loc.count()):
            loc.nth(i).hover(); loc.nth(i).click(); p.wait_for_timeout(150)
    res['url_unchanged'] = p.url == url0
    res['pwned_after_clicks'] = p.evaluate('window.__pwned === undefined ? null : String(window.__pwned)')
    R.screenshot(path=str(out / 'tester-render-hostil.png'))
    b.close()
print(json.dumps(res, indent=1, ensure_ascii=False))
