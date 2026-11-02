from playwright.sync_api import sync_playwright
U='http://127.0.0.1:8123'
with sync_playwright() as pw:
    b=pw.chromium.launch(); page=b.new_page(viewport={'width':1440,'height':1000})
    page.goto(U+'/workspace/node'); page.wait_for_timeout(3500)
    print('selects',[ (s.get_attribute('aria-label'), s.locator('option').count()) for s in page.locator('select').all()])
    print('opts',[o for o in page.locator('select').nth(1).locator('option').all_inner_texts() if 'Tarea' in o][:5])
    print('testids',sorted(set(page.evaluate("()=>[...document.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid)"))))
    page.goto(U+'/workspace/node?id=TaskDoc:task-tarea-a&tab=document'); page.wait_for_timeout(3500)
    print('modeled testids',sorted(set(page.evaluate("()=>[...document.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid)"))))
    print(page.locator('[data-testid="focus-desc"]').count())
    page.goto(U+'/workspace/node?path=guia.md&tab=graph'); page.wait_for_timeout(3500)
    print('unm graph testids',sorted(set(page.evaluate("()=>[...document.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid)"))))
    print(page.url, [x for x in page.locator('.workspace-tab-btn').all_inner_texts()])
    b.close()
