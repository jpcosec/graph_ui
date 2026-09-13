"""E2E de la fase D: la URL es la fuente de verdad para facet/vista.

1. Cada vista registrada vive en /{facet}/{view.id}: /documents/map,
   /models/diagram, /draft/tree. Abrir cualquiera de esas rutas directamente
   monta la vista correcta y marca su pestaña como activa.
2. Cambiar de pestaña empuja una entrada de historial real (pushState): el
   botón atrás del navegador vuelve a la vista anterior.
3. Recargar conserva la ruta (viene de location.pathname, no de estado en
   memoria); localStorage['kb-editor-route'] se mantiene en sync y es lo que
   resuelve un `/` sin ruta explícita (p. ej. tras cerrar y reabrir la app).
"""
import importlib.util
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

MINDMAP = Path(__file__).parents[1] / "frontends" / "mindmap"

try:
    from playwright.sync_api import sync_playwright
except ImportError:  # pragma: no cover
    sync_playwright = None

PORT = 8151


def _compile(store):
    spec = importlib.util.spec_from_file_location("mc", MINDMAP / "compiler.py")
    compiler = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(compiler)
    compiler.compile_json(
        json.loads((MINDMAP / "fixtures/kb-small.json").read_text(encoding="utf-8")), store)


def _start_server(store):
    server = subprocess.Popen(
        [sys.executable, str(MINDMAP / "serve.py"), str(PORT)],
        cwd=str(MINDMAP), env={**os.environ, "SLDB_STORE": str(store)},
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(40):
        time.sleep(0.25)
        try:
            urllib.request.urlopen(f"http://127.0.0.1:{PORT}/api/graph", timeout=1)
            return server
        except Exception:
            continue
    server.terminate()
    raise AssertionError("el servidor del editor nunca respondió")


def test_url_drives_facet_and_view():
    if sync_playwright is None:
        import pytest
        pytest.skip("playwright no está instalado")
    tmp = Path(tempfile.mkdtemp(prefix="kb-e2e-routes-"))
    store = tmp / ".sldb"
    _compile(store)
    server = _start_server(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1400, "height": 900})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))

            # Ir directo a /models/diagram monta Schema con esa pestaña activa.
            page.goto(f"http://127.0.0.1:{PORT}/models/diagram")
            page.wait_for_selector(".class-node", timeout=10000)
            schema_tab = page.get_by_role("tab", name="Schema")
            assert schema_tab.get_attribute("aria-selected") == "true"

            # Click en Brainstorm navega vía pushState a /draft/tree.
            page.get_by_role("tab", name="Brainstorm").click()
            page.wait_for_selector(".brainstorm", timeout=10000)
            assert page.url.endswith("/draft/tree")

            # Recargar conserva la ruta (viene de location.pathname).
            page.reload()
            page.wait_for_selector(".brainstorm", timeout=10000)
            assert page.url.endswith("/draft/tree")

            # Atrás del navegador vuelve a /models/diagram.
            page.go_back()
            page.wait_for_selector(".class-node", timeout=10000)
            assert page.url.endswith("/models/diagram")

            # `/` sin ruta explícita resuelve a la última ruta persistida.
            page.goto(f"http://127.0.0.1:{PORT}/")
            page.wait_for_selector(".brainstorm", timeout=10000)
            assert page.url.endswith("/draft/tree")
            stored_route = page.evaluate("localStorage.getItem('kb-editor-route')")
            assert stored_route == "/draft/tree"

            # /documents/map monta la vista KB directamente.
            page.goto(f"http://127.0.0.1:{PORT}/documents/map")
            page.wait_for_selector(".document-node", timeout=10000)

            assert not errors, f"errores JS: {errors}"
            browser.close()
    finally:
        server.terminate()
        server.wait(timeout=5)
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    test_url_drives_facet_and_view()
    print("OK")
