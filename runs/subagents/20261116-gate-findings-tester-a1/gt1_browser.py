"""Tester gt1: browser check of gate findings over the real deskops desk (no interception)."""
import json
import sys
import time
from playwright.sync_api import sync_playwright

base, out_dir, view_json, nofind_id = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
task = json.load(open(view_json))['task']
tid = task['id']
finding = task['gates'][0]['findings'][0]
LABELS = {'error': 'error', 'warning': 'aviso', 'info': 'info'}
report = {}
timings = []


def check_items(scope):
    items = scope.locator('[data-testid="gate-finding"]')
    res = []
    for i in range(items.count()):
        it = items.nth(i)
        res.append({
            'class': it.get_attribute('class'),
            'level_text': it.locator('.finding-level').inner_text(),
            'code': it.locator('code').first.inner_text(),
            'what_full': finding['what'] in it.text_content(),
            'subject_shown': it.locator('.finding-subject').count(),
        })
    return res


with sync_playwright() as pw:
    browser = pw.chromium.launch()
    for screen in ('task', 'board'):
        for n in (1, 2, 3):
            ctx = browser.new_context(viewport={'width': 1600, 'height': 1000})
            page = ctx.new_page()
            console, errors = [], []
            page.on('console', lambda m: console.append(f'{m.type}: {m.text}') if m.type in ('error', 'warning') else None)
            page.on('pageerror', lambda e: errors.append(str(e)))
            t0 = time.monotonic()
            if screen == 'task':
                page.goto(f'{base}#/task?id={tid}')
                scope = page
            else:
                page.goto(base)
                page.locator(f'.card[data-task-id="{tid}"]').click(timeout=120000)
                scope = page.get_by_test_id('inspector')
            sel = scope.locator('[data-testid="gate-finding"]').filter(has=page.locator('code', has_text=finding['code']))
            sel.first.wait_for(state='visible', timeout=120000)
            ms = int((time.monotonic() - t0) * 1000)
            timings.append(f'{screen} load {n}: {ms} ms until gate finding visible')
            report[f'{screen}-{n}'] = {'ms': ms, 'checks': check_items(scope), 'console': console, 'pageerror': errors}
            if n == 1:
                target = page.get_by_test_id('inspector-gate').first if screen == 'task' else scope
                target.screenshot(path=f'{out_dir}/gate-findings-{screen}.png')
            ctx.close()
    # gate without findings, both screens
    for screen in ('task', 'board'):
        ctx = browser.new_context(viewport={'width': 1600, 'height': 1000})
        page = ctx.new_page()
        console = []
        page.on('console', lambda m: console.append(f'{m.type}: {m.text}') if m.type in ('error', 'warning') else None)
        if screen == 'task':
            page.goto(f'{base}#/task?id={nofind_id}')
            scope = page
        else:
            page.goto(base)
            page.locator(f'.card[data-task-id="{nofind_id}"]').click(timeout=120000)
            scope = page.get_by_test_id('inspector')
        scope.get_by_test_id('inspector-gate').first.wait_for(state='visible', timeout=120000)
        report[f'nofindings-{screen}'] = {
            'task': nofind_id, 'gates': scope.get_by_test_id('inspector-gate').count(),
            'ul_gate_findings': scope.locator('ul.gate-findings').count(),
            'gate_finding_li': scope.get_by_test_id('gate-finding').count(), 'console': console,
        }
        if screen == 'task':
            page.get_by_test_id('inspector-gate').first.screenshot(path=f'{out_dir}/gate-nofindings-task.png')
        ctx.close()
    browser.close()

open(f'{out_dir}/timings.txt', 'w').write('\n'.join(timings) + '\n')
json.dump(report, open(f'{out_dir}/browser-report.json', 'w'), indent=1, ensure_ascii=False)
print('\n'.join(timings))
print(json.dumps(report, ensure_ascii=False)[:3000])
