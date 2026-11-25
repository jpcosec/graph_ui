"""Verificacion manual del lector sobre el serve.py real: tiempos, consola, DOM y captura."""
import json
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

base, run_dir = sys.argv[1], Path(sys.argv[2])
docs = ['README.md', 'docs/workspace-ui.md']
report = {}
with sync_playwright() as pw:
    browser = pw.chromium.launch()
    for rel in docs:
        entry = {'loads_ms': [], 'console_errors': [], 'page_errors': []}
        for n in range(3):
            ctx = browser.new_context(viewport={'width': 1440, 'height': 900})
            page = ctx.new_page()
            page.on('console', lambda m, e=entry: m.type == 'error' and e['console_errors'].append(m.text))
            page.on('pageerror', lambda err, e=entry: e['page_errors'].append(str(err)))
            t0 = time.perf_counter()
            page.goto(f'{base}/workspace/node?path={rel}&tab=document')
            page.wait_for_selector('[data-testid="doc-render"] [data-line-start]', timeout=60000)
            entry['loads_ms'].append(round((time.perf_counter() - t0) * 1000))
            if n == 2:
                r = page.locator('[data-testid="doc-render"]')
                entry['dom'] = {
                    'blockquote': r.locator('blockquote').count(),
                    'code_inline': r.locator('code.workspace-render-code-inline').count(),
                    'em': r.locator('em').count(),
                    'strong': r.locator('strong').count(),
                    'std_link_spans': r.locator('[data-status="no_clasificado"]').count(),
                    'a_total': r.locator('a').count(),
                    'a_navegable': r.locator('a[href]:not([href="#"])').count(),
                    'first_quote': r.locator('blockquote').first.inner_text() if r.locator('blockquote').count() else '',
                }
                if rel == 'README.md':
                    page.screenshot(path=str(run_dir / 'reader.png'), full_page=False)
                    r.screenshot(path=str(run_dir / 'reader-render-README.png'))
                else:
                    r.screenshot(path=str(run_dir / 'reader-render-workspace-ui.png'))
            ctx.close()
        report[rel] = entry
    browser.close()
(run_dir / 'timings.json').write_text(json.dumps(report, indent=2, ensure_ascii=False))
print(json.dumps(report, indent=2, ensure_ascii=False))
