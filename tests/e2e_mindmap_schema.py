"""E2E del modo Schema: diagrama de clases a partir de /api/schema real.

1. Se abre el editor contra un store temporal con la KB pequeña compilada
   (BoardDoc contiene TaskDoc por `tasks`; TaskDoc referencia por `blocks`).
2. La pestaña «Schema» dibuja una card por clase y una arista por contención
   declarada, etiquetada con el campo; las referencias se anotan sin arista.
3. Todos los campos son visibles y cada arista sale del puerto de su campo;
   el filtro atenúa lo que no coincide; el doble clic abre «Editar clases»
   ya en esa clase.
"""
import importlib.util
import json
import os
import re
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

PORT = 8149


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


def test_schema_view_draws_classes_and_containment():
    if sync_playwright is None:
        import pytest
        pytest.skip("playwright no está instalado")
    tmp = Path(tempfile.mkdtemp(prefix="kb-e2e-schema-"))
    store = tmp / ".sldb"
    _compile(store)
    server = _start_server(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1400, "height": 900})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"http://127.0.0.1:{PORT}/")
            page.wait_for_selector(".document-node", timeout=10000)
            page.get_by_role("tab", name="Schema").click()
            page.wait_for_selector(".class-node", timeout=10000)

            # Una card por clase registrada; solo la contención declarada es arista.
            expect(page.locator(".class-node")).to_have_count(2)
            expect(page.locator(".react-flow__edge")).to_have_count(1)
            expect(page.locator(".react-flow__edge")).to_contain_text("tasks")
            expect(page.locator(".schema-count")).to_contain_text("2 clases")
            board = page.locator(".class-node[data-class=BoardDoc]")
            task = page.locator(".class-node[data-class=TaskDoc]")
            expect(board.locator("li.contains")).to_contain_text("tasks")
            expect(board.locator("li.contains")).to_contain_text("TaskDoc")
            expect(task.locator("li.reference")).to_contain_text("blocks")
            expect(task.locator("li.contains")).to_have_count(0)
            # Documentos por clase, del store real (1 board, 2 tasks).
            expect(board.locator(".class-node-count")).to_have_text("1")
            expect(task.locator(".class-node-count")).to_have_text("2")
            # Obligatorio marcado con *; el tipo viene del schema.
            expect(task.locator("li", has_text="status")).to_contain_text("str")
            expect(task.locator("li", has_text="title")).to_contain_text("*")

            # Filtro: atenúa lo que no coincide (campo `blocks` solo está en Task).
            page.locator(".schema-filter").fill("blocks")
            expect(page.locator(".class-node.dim")).to_have_count(1)
            expect(board).to_have_class(re.compile(r"\bdim\b"))
            page.locator(".schema-filter").fill("")
            expect(page.locator(".class-node.dim")).to_have_count(0)

            # Todos los campos visibles; la arista sale del puerto del campo `tasks`.
            expect(board.locator("li")).to_have_count(4)
            expect(board.locator("li .react-flow__handle[data-handleid=tasks]")).to_have_count(1)
            expect(board.locator("li .react-flow__handle")).to_have_count(1)
            expect(task.locator("li .react-flow__handle")).to_have_count(0)
            expect(page.locator("[data-testid='rf__edge-BoardDoc.tasks>TaskDoc']")).to_have_count(1)

            # Doble clic abre el editor de clases posicionado en esa clase.
            task.locator(".class-node-head").dblclick()
            page.wait_for_selector("dialog.class-dialog", timeout=5000)
            expect(page.locator(".class-dialog h3")).to_contain_text("Task")
            expect(page.locator(".class-dialog tbody tr", has_text="blocks")).to_have_count(1)
            page.keyboard.press("Escape")

            assert not errors, f"errores JS: {errors}"
            browser.close()
    finally:
        server.terminate()
        server.wait(timeout=5)
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    test_schema_view_draws_classes_and_containment()
    print("OK")
