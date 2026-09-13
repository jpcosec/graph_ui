"""E2E de la vista Flujo: los documentos del store real como grafo dirigido.

1. `/documents/flow` dibuja un nodo compacto por documento y una arista por
   relación — contención Y referencia, a diferencia del mapa KB que anida la
   contención (esa lectura la tenía el `flow_editor` retirado, aquí sobre
   documentos SLDB reales).
2. El filtro de clase restringe a una clase y solo conserva aristas entre
   nodos visibles; el filtro de texto atenúa lo que no coincide; seleccionar
   un nodo abre el inspector de solo lectura.
3. El orden de pestañas del topbar es el que fija `VIEWS` en
   shell/registry.js: KB, Flujo, Brainstorm, Schema.
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
    from playwright.sync_api import expect, sync_playwright
except ImportError:  # pragma: no cover
    sync_playwright = None

PORT = 8155


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


def test_flow_view_draws_documents_as_a_directed_graph():
    if sync_playwright is None:
        import pytest
        pytest.skip("playwright no está instalado")
    tmp = Path(tempfile.mkdtemp(prefix="kb-e2e-flow-"))
    store = tmp / ".sldb"
    _compile(store)
    server = _start_server(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1400, "height": 900})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"http://127.0.0.1:{PORT}/documents/flow")
            page.wait_for_selector(".flow-node", timeout=10000)

            # Pestaña activa y orden del topbar: KB, Flujo, Brainstorm, Schema.
            tabs = page.locator("[role=tab]")
            expect(tabs).to_have_count(4)
            assert [t.strip() for t in tabs.all_inner_texts()] == ["🗺 KB", "⇢ Flujo", "💡 Brainstorm", "📐 Schema"]
            flow_tab = page.get_by_role("tab", name="Flujo")
            expect(flow_tab).to_have_attribute("aria-selected", "true")

            # Un nodo por documento del fixture (main-board, task-onboarding, task-review).
            expect(page.locator(".flow-node")).to_have_count(3)
            expect(page.locator(".flow-count")).to_contain_text("3 documentos")

            # Contención (board.tasks -> cada tarea) Y referencia (blocks) son
            # aristas dibujadas, sin anidar: 2 de tasks + 1 de blocks.
            expect(page.locator(".react-flow__edge")).to_have_count(3)
            expect(page.locator(".react-flow__edge", has_text="tasks")).to_have_count(2)

            # El filtro de clase restringe a TaskDoc: solo las 2 tareas.
            page.locator(".flow-class").select_option("TaskDoc")
            expect(page.locator(".flow-node")).to_have_count(2)
            page.locator(".flow-class").select_option("")
            expect(page.locator(".flow-node")).to_have_count(3)

            # Seleccionar un nodo abre el inspector de solo lectura con su título.
            page.locator(".flow-node[data-doc=main-board]").click()
            page.wait_for_selector("aside.flow-inspector", timeout=5000)
            expect(page.locator("aside.flow-inspector")).to_contain_text("Main board")
            page.locator("aside.flow-inspector button").click()
            expect(page.locator("aside.flow-inspector")).to_have_count(0)

            # El filtro de texto atenúa lo que no coincide, no lo quita.
            page.locator(".flow-filter").fill("review")
            expect(page.locator(".flow-node.dim")).to_have_count(2)
            expect(page.locator(".flow-node")).to_have_count(3)
            page.locator(".flow-filter").fill("")
            expect(page.locator(".flow-node.dim")).to_have_count(0)

            assert not errors, f"errores JS: {errors}"
            browser.close()
    finally:
        server.terminate()
        server.wait(timeout=5)
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    test_flow_view_draws_documents_as_a_directed_graph()
    print("OK")
