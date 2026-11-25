"""E2E: la vista de notación lista los ViewDoc del store junto a los SpecDoc y dibuja uno con su notación.

Store temporal sincronizado con `sldb notations sync` (tests/fixtures/notation-style: un spec y la
notación propia `infra`), más un ViewDoc con esa notación guardado por POST /api/views/save. La vista
de notación lista el spec y el ViewDoc (grupo «Vistas»); al elegir el ViewDoc se dibujan sus nodos con
el glifo de la notación (el mismo camino de dibujo que un spec) y las aristas del grafo.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
MINDMAP = ROOT / "frontends" / "mindmap"
STYLE = ROOT / "tests" / "fixtures" / "notation-style"
PORT = 8161

try:
    from playwright.sync_api import sync_playwright
except ImportError:  # pragma: no cover
    sync_playwright = None


def _store() -> Path:
    root = Path(tempfile.mkdtemp(prefix="kb-e2e-notation-viewdoc-"))
    for spec in STYLE.glob("*.yml"):
        shutil.copy(spec, root / spec.name)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["sldb", "notations", "sync", "--spec", "component-infra.yml", "--notation", "infra.yml", "--store", ".sldb"],
                   cwd=root, check=True, capture_output=True)
    return root / ".sldb"


def _start_server(store: Path) -> subprocess.Popen:
    server = subprocess.Popen([sys.executable, str(MINDMAP / "serve.py"), str(PORT)], cwd=str(MINDMAP),
                              env={**os.environ, "SLDB_STORE": str(store), "GRAPH_UI_BACKEND": "local"},
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(60):
        time.sleep(0.25)
        try:
            urllib.request.urlopen(f"http://127.0.0.1:{PORT}/api/graph", timeout=1)
            return server
        except Exception:
            continue
    server.terminate()
    raise AssertionError("el servidor del editor nunca respondió")


def _call(path: str, body: dict | None = None) -> dict:
    request = urllib.request.Request(f"http://127.0.0.1:{PORT}{path}", data=json.dumps(body).encode() if body else None,
                                     headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.loads(response.read())


def test_notation_view_lists_a_viewdoc_and_draws_it_with_its_notation():
    if sync_playwright is None:
        pytest.skip("playwright no está instalado")
    server = _start_server(_store())
    try:
        view = {"title": "Lecturas", "nodes": [{"model": "SpecNodeDoc", "where": ""}], "relations": ["reads", "calls", "publishes", "charges", "uses"],
                "direction": "both", "notation": "infra"}
        _call("/api/views/save", {"name": "lecturas", "view": view})
        expected = _call("/api/views/evaluate?view=ViewDoc:lecturas")
        assert expected["nodes"] and "error" not in expected["notation"]
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1400, "height": 900})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"http://127.0.0.1:{PORT}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=15000)
            assert page.locator('[data-kind="spec"]').count() >= 1
            item = page.locator('[data-spec="ViewDoc:lecturas"]')
            assert item.count() == 1 and item.get_attribute("data-kind") == "view"
            assert "vistas" in [h.lower() for h in page.locator(".notation-catalog section:not(.notation-legend) > h3").all_inner_texts()]

            item.click()
            page.wait_for_selector(".notation-canvas .glyph", timeout=15000)
            page.wait_for_timeout(700)
            drawn = page.locator(".notation-canvas .react-flow__node .glyph").count()
            assert drawn == len(expected["nodes"]) - len(expected["notation"]["skipped"]), drawn
            # El glifo sale de la notación de la vista: la forma que resolvió sldb para cada nodo.
            shapes = {n["shape"] for n in expected["notation"]["nodes"].values()}
            assert shapes and all(page.locator(f".notation-canvas .shape-{s}").count() >= 1 for s in shapes), shapes
            assert page.locator(".react-flow__edge").count() >= 1
            assert "infra" in page.locator(".notation-meta").inner_text()
            assert not errors, errors
            browser.close()
    finally:
        server.terminate()
        server.wait(timeout=10)
