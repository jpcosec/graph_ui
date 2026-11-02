from playwright.sync_api import sync_playwright
U='http://127.0.0.1:8123'
with sync_playwright() as pw:
    b=pw.chromium.launch(); page=b.new_page(viewport={'width':1440,'height':1000})
    page.on('request',lambda r:print(r.method,r.url))
    page.goto(U+'/workspace/node?id=TaskDoc:task-tarea-a&tab=document')
    for t in (500,3000,8000):
        page.wait_for_timeout(t)
        print(t,page.locator('.workspace-identity-prop').all_inner_texts())
    b.close()
