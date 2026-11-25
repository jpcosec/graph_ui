"""Tester IR13: cronometra cada pantalla del mindmap en Chromium headless contra un serve.py real.

Uso: ui_timing.py <base_url> <out_dir> <modo: real|synced|pilots> [runs]
(tester r2: "synced" exige que /specs/notation dibuje glifos, no el estado vacío)

ms = desde justo antes de page.goto hasta que el selector de «contenido dibujado» es visible y
pasaron dos requestAnimationFrame. Cada corrida usa un contexto nuevo (caché HTTP vacía: incluye
bajar React/htm del CDN). Errores = console.error + pageerror + requestfailed; 5xx aparte.
"""
import json
import statistics
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE, OUT, MODE = sys.argv[1], Path(sys.argv[2]), sys.argv[3]
RUNS = int(sys.argv[4]) if len(sys.argv) > 4 else 3
TASK = "task-ir13-migrar-graph-ui-de-spec2viz-a-sldb-api-notations-resolve-view-sync-de-specs-viewdoc-pilotos-com"
DRAWN = ".notation-canvas .glyph, .lane-head, .notation-grid"

REAL = [
    ("documents-map", "/documents/map", ".document-node"),
    ("documents-flow", "/documents/flow", ".flow-node"),
    ("draft-tree", "/draft/tree", ".brainstorm"),
    ("models-diagram", "/models/diagram", ".class-node"),
    ("specs-notation", "/specs/notation", f".notation .state h2, {DRAWN}"),
    ("workflow-deskops", "/workflow/deskops", ".desk-detail h2"),
    ("workspace-node", "/workspace/node", '[data-testid="explorer-modeled-item"]'),
    ("workspace-node-ir13", f"/workspace/node?id=TaskCodeDoc:{TASK}", '[data-testid="explorer-modeled-item"]'),
]


def measure(browser, name, path, selector, init_script=None, shot=None, timeout=60000):
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    if init_script:
        context.add_init_script(init_script)
    page = context.new_page()
    errors, s5xx, s4xx = [], [], []
    page.on("console", lambda m: errors.append(f"console.error: {m.text[:300]}") if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(f"pageerror: {str(e)[:300]}"))
    page.on("requestfailed", lambda r: errors.append(f"requestfailed: {r.method} {r.url[:160]} {r.failure}"))

    def on_response(r):
        if r.status >= 500:
            s5xx.append(f"{r.status} {r.request.method} {r.url[:200]}")
        elif r.status >= 400:
            s4xx.append(f"{r.status} {r.request.method} {r.url[:200]}")
    page.on("response", on_response)
    row = {"screen": name, "path": path, "selector": selector}
    t0 = time.perf_counter()
    try:
        page.goto(BASE + path, wait_until="commit", timeout=timeout)
        page.locator(selector).first.wait_for(state="visible", timeout=timeout)
        page.evaluate("() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))")
        row["ms"] = round((time.perf_counter() - t0) * 1000)
        row["drawn"] = True
    except Exception as exc:  # el contenido nunca se dibujó: se reporta, no se oculta
        row["ms"] = round((time.perf_counter() - t0) * 1000)
        row["drawn"] = False
        row["failure"] = str(exc)[:400]
    row["matched"] = page.locator(selector).count()
    row["url_final"] = page.url
    if shot:
        page.wait_for_timeout(900)  # fitView anima el zoom; la captura va después de medir
        row["extra"] = page.evaluate("""() => ({
            title: document.title,
            notices: [...document.querySelectorAll('.notation-notices li, .notation-notices')].map(e => e.innerText).slice(0, 5),
            state: [...document.querySelectorAll('.state h2')].map(e => e.innerText),
            meta: [...document.querySelectorAll('.notation-meta')].map(e => e.innerText),
            glyphs: document.querySelectorAll('.notation-canvas .glyph').length,
            lanes: document.querySelectorAll('.lane-head').length,
            grids: document.querySelectorAll('.notation-grid').length,
            edges: document.querySelectorAll('.react-flow__edge').length,
            catalog: document.querySelectorAll('.notation-catalog button').length,
            deskTasks: document.querySelectorAll('.desk-task').length,
            deskTitle: [...document.querySelectorAll('.desk-detail h2')].map(e => e.innerText),
            alerts: [...document.querySelectorAll('[role=alert]')].map(e => e.innerText.slice(0, 200)).slice(0, 5),
            mentionsSpec2viz: /spec2viz/i.test(document.body.innerText),
        })""")
        page.screenshot(path=str(OUT / shot))
        row["screenshot"] = shot
    row.update(errors=errors, http_5xx=s5xx, http_4xx=s4xx)
    context.close()
    return row


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    results = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        screens = list(REAL)
        if MODE == "synced":
            screens = [(n, p, DRAWN if n == "specs-notation" else s) for n, p, s in REAL]
        init = {}
        if MODE == "pilots":
            context = browser.new_context()
            page = context.new_page()
            page.goto(BASE + "/specs/notation")
            page.locator(".notation-catalog button").first.wait_for(timeout=30000)
            ids = page.eval_on_selector_all(".notation-catalog button", "els => els.map(e => e.dataset.spec)")
            context.close()
            screens = []
            for spec in ids:
                name = "pilot-" + spec.replace(".", "-")
                init[name] = f"localStorage.setItem('kb-notation-spec', {json.dumps(spec)})"
                sel = (f'.notation:has(.notation-catalog button.active[data-spec="{spec}"]) '
                       ':is(.notation-canvas .glyph, .lane-head, .notation-grid)')
                screens.append((name, "/specs/notation", sel))
        for name, path, selector in screens:
            runs = []
            for i in range(RUNS):
                last = i == RUNS - 1
                runs.append(measure(browser, name, path, selector, init.get(name), shot=f"{MODE}-{name}.png" if last else None))
            ms = [r["ms"] for r in runs]
            final = runs[-1]
            final["runs_ms"] = ms
            final["median_ms"] = round(statistics.median(ms))
            final["drawn"] = all(r["drawn"] for r in runs)
            final["errors"] = sorted({e for r in runs for e in r["errors"]})
            final["http_5xx"] = sorted({e for r in runs for e in r["http_5xx"]})
            final["http_4xx"] = sorted({e for r in runs for e in r["http_4xx"]})
            results.append(final)
            print(f"{name}: {ms} drawn={final['drawn']} errors={len(final['errors'])} 5xx={len(final['http_5xx'])}", flush=True)
        browser.close()
    (OUT / f"ui-timing-{MODE}.json").write_text(json.dumps(results, indent=2, ensure_ascii=False))
    lines = ["| pantalla | ruta | mediana ms | corridas ms | dibujado | errores consola | HTTP 5xx | HTTP 4xx | captura |", "|---|---|---:|---|---|---:|---:|---:|---|"]
    for r in results:
        lines.append(f"| {r['screen']} | `{r['path'][:60]}` | {r['median_ms']} | {r['runs_ms']} | {'sí' if r['drawn'] else 'NO'} | "
                     f"{len(r['errors'])} | {len(r['http_5xx'])} | {len(r['http_4xx'])} | {r.get('screenshot', '')} |")
    (OUT / f"ui-timing-{MODE}.md").write_text("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
