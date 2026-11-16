"""Verificacion manual del tester: cargas cronometradas, consola, DOM, lineas y foco por seccion.
uso: verify_browser.py <base_url> <tree_root> <out_dir> <rel> [<rel> ...]"""
import json, re, sys, time, urllib.request, urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright

base, root, out = sys.argv[1], Path(sys.argv[2]), Path(sys.argv[3])
rels = sys.argv[4:]
report = {}
MARKERS = {
    'H': lambda l: l.lstrip().startswith('#'),
    'BLOCKQUOTE': lambda l: l.lstrip().startswith('>'),
    'PRE': lambda l: True,
    'LI': lambda l: re.match(r'^\s*(?:>\s*)*(?:[-*+]|\d+[.)])(\s|$)', l) is not None,
    'UL': lambda l: re.match(r'^\s*(?:>\s*)*(?:[-*+])(\s|$)', l) is not None,
    'OL': lambda l: re.match(r'^\s*(?:>\s*)*\d+[.)](\s|$)', l) is not None,
    'P': lambda l: l.strip() != '',
    'SPAN': lambda l: l.strip() != '',
    'HR': lambda l: re.match(r'^\s*([-*_])(\s*\1){2,}\s*$', l) is not None,
}
with sync_playwright() as pw:
    browser = pw.chromium.launch()
    for rel in rels:
        data = (root / rel).read_bytes()
        lines = data.decode('utf-8').split('\n')
        r = report[rel] = {'loads_ms': [], 'console_errors': [], 'page_errors': [], 'requests_failed': []}
        for k in range(3):
            ctx = browser.new_context(viewport={'width': 1440, 'height': 900})
            page = ctx.new_page()
            page.on('console', lambda m, r=r: m.type == 'error' and r['console_errors'].append(m.text))
            page.on('pageerror', lambda e, r=r: r['page_errors'].append(str(e)))
            page.on('requestfailed', lambda q, r=r: r['requests_failed'].append(q.url))
            t0 = time.monotonic()
            page.goto(f"{base}/workspace/node?path={urllib.parse.quote(rel)}&tab=document")
            page.wait_for_selector('[data-testid=doc-render] [data-line-start]', timeout=60000)
            r['loads_ms'].append(round((time.monotonic() - t0) * 1000))
            if k < 2:
                ctx.close(); continue
            page.wait_for_timeout(500)
            render = page.locator('[data-testid=doc-render]')
            r['dom'] = page.evaluate('''() => { const R = document.querySelector('[data-testid=doc-render]');
              const c = s => R.querySelectorAll(s).length;
              return {blockquote: c('blockquote.workspace-render-quote'), code_inline: c('code.workspace-render-code-inline'),
                strong: c('strong'), em: c('em'), no_clasificado: c('[data-status=no_clasificado]'), a: c('a'),
                a_nav: c('a[href]:not([href="#"])'), script: c('script'), img: c('img'), iframe: c('iframe'),
                sldb_links: [...R.querySelectorAll('[data-testid=doc-link]')].map(e => e.getAttribute('data-status')),
                headings: c('.workspace-render-heading'), heading_buttons: c('[data-testid=render-heading]'),
                pwned: window.__pwned === undefined ? null : String(window.__pwned)}; }''')
            # lineas: cada [data-line-start] cae en una linea real con la marca de su tipo
            els = page.evaluate('''() => [...document.querySelectorAll('[data-testid=doc-render] [data-line-start]')].map(e => ({tag: e.tagName, n: +e.getAttribute('data-line-start'), text: (e.innerText||'').split('\\n')[0].slice(0, 60)}))''')
            bad = []
            for e in els:
                tag = 'H' if re.match(r'H\d', e['tag']) else e['tag']
                line = lines[e['n'] - 1] if 0 < e['n'] <= len(lines) else None
                ok = line is not None and MARKERS.get(tag, lambda l: True)(line)
                if tag == 'H' and ok:
                    ok = e['text'].strip()[:15].replace('`', '') in re.sub(r'[`*_]', '', line)
                if not ok:
                    bad.append({**e, 'line': line})
            r['line_checks'] = {'elements': len(els), 'mismatches': bad}
            # foco por seccion: secciones del backend vs lineas reales del archivo y bloques resaltados
            src = json.load(urllib.request.urlopen(f"{base}/api/workspace/source?path={urllib.parse.quote(rel)}"))
            secs = src.get('sections') or []
            sec_bad = [s for s in secs if not lines[s['line_start'] - 1].lstrip().startswith('#')]
            r['sections'] = {'count': len(secs), 'heading_line_mismatch': sec_bad[:5]}
            btns = page.locator('[data-testid=render-heading]')
            focus_checks = []
            for i in [0, min(2, btns.count() - 1), btns.count() - 1]:
                if btns.count() == 0: break
                btns.nth(i).click()
                page.wait_for_timeout(200)
                n = int(btns.nth(i).locator('xpath=..').get_attribute('data-line-start'))
                sec = next(s for s in secs if s['line_start'] == n)
                foc = page.evaluate('''() => [...document.querySelectorAll('[data-testid=doc-render] > .is-focused')].map(e => +e.getAttribute('data-line-start'))''')
                tops = page.evaluate('''() => [...document.querySelectorAll('[data-testid=doc-render] > [data-line-start]')].map(e => +e.getAttribute('data-line-start'))''')
                expected_any = [t for t in tops if sec['line_start'] <= t <= sec['line_end']]
                focus_checks.append({'section': sec.get('path') or sec.get('title'), 'line_start': sec['line_start'], 'line_end': sec['line_end'],
                                     'focused_tops': foc, 'tops_in_range': expected_any,
                                     'ok': bool(foc) and all(sec['line_start'] <= f <= sec['line_end'] for f in foc)})
            r['focus_checks'] = focus_checks
            raw = '\n'.join(page.locator('[data-testid="doc-source"] .workspace-src-line .workspace-code-line-text').all_text_contents())
            if raw:
                r['raw_source_identical'] = (raw + ('\n' if data.endswith(b'\n') else '')).encode() == data
            page.screenshot(path=str(out / f"tester-{rel.replace('/', '-')}.png"), full_page=False)
            render.screenshot(path=str(out / f"tester-render-{rel.replace('/', '-')}.png"))
            ctx.close()
    browser.close()
print(json.dumps(report, indent=1, ensure_ascii=False))
