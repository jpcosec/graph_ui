import sys
from playwright.sync_api import sync_playwright
base, out, tid = sys.argv[1:4]
with sync_playwright() as pw:
    b = pw.chromium.launch(); p = b.new_page(viewport={'width': 1600, 'height': 1000})
    p.goto(base); p.locator(f'.card[data-task-id="{tid}"]').click(timeout=120000)
    g = p.get_by_test_id('inspector').get_by_test_id('inspector-gate').first
    g.get_by_test_id('gate-finding').first.wait_for(state='visible', timeout=120000)
    g.scroll_into_view_if_needed(); g.screenshot(path=f'{out}/gate-findings-board.png')
    p.screenshot(path=f'{out}/board-full.png'); b.close()
