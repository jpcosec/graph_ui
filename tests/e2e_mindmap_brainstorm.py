"""E2E del paso 4: captura Brainstorm con teclado y conversión a SLDB.

1. Se abre el editor contra un store vacío y se cambia a la vista Brainstorm.
2. Se capturan 3 ideas con teclado: raíz + hijo (Tab) + hermano (Enter),
   eligiendo clase para cada una.
3. Convertir a SLDB: valida contra el store real vía /api/plan → /api/compile.
4. La KB recargada muestra los documentos convertidos y el store los contiene
   con la contención declarada (hijo referenciado desde el padre).
"""
import importlib.util
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

MINDMAP = Path(__file__).parents[1] / "frontends" / "mindmap"
sys.path.insert(0, str(MINDMAP))

try:
    from playwright.sync_api import sync_playwright
except ImportError:  # pragma: no cover
    sync_playwright = None

PORT = 8145


def _compile(store):
    _spec = importlib.util.spec_from_file_location("mc", MINDMAP / "compiler.py")
    compiler = importlib.util.module_from_spec(_spec)
    _spec.loader.exec_module(compiler)
    compiler.compile_json(
        json.loads((MINDMAP / "fixtures/kb-small.json").read_text(encoding="utf-8")), store)


PORT = 8145


def _compile(store):
    _spec = importlib.util.spec_from_file_location("mc", MINDMAP / "compiler.py")
    compiler = importlib.util.module_from_spec(_spec)
    _spec.loader.exec_module(compiler)
    compiler.compile_json(
        json.loads((MINDMAP / "fixtures/kb-small.json").read_text(encoding="utf-8")), store)


def _start_server(store):
    server = subprocess.Popen(
        [sys.executable, str(MINDMAP / "serve.py"), str(PORT)],
        cwd=str(MINDMAP), env={**os.environ, "SLDB_STORE": str(store)},
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    import urllib.request
    for _ in range(40):
        time.sleep(0.25)
        try:
            urllib.request.urlopen(f"http://127.0.0.1:{PORT}/api/graph", timeout=1)
            return server
        except Exception:
            continue
    server.terminate()
    raise AssertionError("el servidor del editor nunca respondió")


def test_brainstorm_capture_and_conversion():
    if sync_playwright is None:
        import pytest
        pytest.skip("playwright no está instalado")
    tmp = Path(tempfile.mkdtemp(prefix="kb-e2e-brainstorm-"))
    store = tmp / ".sldb"
    _compile(store)
    server = _start_server(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page()
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"http://127.0.0.1:{PORT}/")
            page.wait_for_selector(".document-node", timeout=10000)  # KB con datos del fixture
            page.get_by_role("tab", name="Brainstorm").click()
            page.wait_for_selector(".brainstorm", timeout=5000)
            page.get_by_role("button", name="＋ Primera idea").click()
            page.wait_for_selector(".idea-node .idea-input", timeout=5000)
            page.locator(".idea-node .idea-input").last.fill("Proyecto Tesis")
            page.locator(".idea-node .idea-input").last.press("Enter")  # cierra edición
            # Seleccionar la raíz y crear un hijo con Tab.
            page.locator(".idea-node", has_text="Proyecto").click()
            page.keyboard.press("Tab")
            page.locator(".idea-node .idea-input").last.fill("Escribir capítulo 1")
            page.locator(".idea-node .idea-input").last.press("Enter")
            # Hermano de la idea seleccionada con Enter.
            page.locator(".idea-node", has_text="Proyecto").click()
            page.keyboard.press("Enter")
            page.locator(".idea-node .idea-input").last.fill("Otra idea suelta")
            page.locator(".idea-node .idea-input").last.press("Enter")

            assert page.locator(".idea-node").count() == 3
            assert page.locator(".brainstorm-count").inner_text().startswith("3 ideas · 3 sin convertir")

            # El borrador sobrevive a una recarga (localStorage).
            page.reload()
            try:
                page.wait_for_selector(".idea-node", timeout=5000)
            except Exception as exc:
                mode_now = page.evaluate("localStorage.getItem('kb-editor-mode')")
                draft_now = page.evaluate("(JSON.parse(localStorage.getItem('kb-brainstorm-draft-v1')||'{}').ideas||[]).length")
                html_state = page.evaluate("document.querySelector('.kb-shell')?.className||'no-shell'")
                print(f"POST-RELOAD mode={mode_now} draft={draft_now} shell={html_state}")
                print("JS ERRORS:", errors)
                print("BRAINstorm present:", page.locator('.brainstorm').count())
                raise
            mode_now = page.evaluate("localStorage.getItem('kb-editor-mode')")
            draft_now = page.evaluate("JSON.parse(localStorage.getItem('kb-brainstorm-draft-v1')||'{}').ideas?.length")
            print(f"POST-RELOAD mode={mode_now} draft={draft_now} nodes={page.locator('.idea-node').count()}")

            # --- Elegir clase: BoardDoc raíz con TaskDoc dentro ---
            page.locator(".idea-node", has_text="Proyecto").locator("select.idea-class").select_option("BoardDoc")
            page.locator(".idea-node", has_text="capítulo").locator("select.idea-class").select_option("TaskDoc")
            page.locator(".idea-node", has_text="Otra idea").locator("select.idea-class").select_option("TaskDoc")

            # --- Convertir a SLDB ---
            page.get_by_role("button", name="Convertir a SLDB").click()
            # La conversión completa → switchMode('map') → recarga la KB
            page.wait_for_selector(".document-node", timeout=60000)
            assert page.locator(".document-node", has_text="Proyecto").count() >= 1, "La idea convertida no apareció en la KB"

            # Verificar round-trip real vía HTTP (más fiable que SldbAdapter directo)
            import urllib.request
            graph = json.loads(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/api/graph", timeout=10).read())
            ids = {d["id"] for d in graph["documents"]}
            assert "proyecto-tesis" in ids, f"proyecto-tesis no llegó al store: {ids}"
            parent_doc = next((d for d in graph["documents"] if d["id"] == "proyecto-tesis"), None)
            assert parent_doc is not None
            assert "escribir-capitulo-1" in parent_doc["payload"].get("tasks", []), \
                f"contención no persistida: {parent_doc['payload']}"
            # Las ideas convertidas quedan marcadas.
            page.locator(".document-node").first.click()
            assert not errors, f"errores JS: {errors}"
    finally:
        server.terminate()
        server.wait(timeout=5)
        shutil.rmtree(tmp, ignore_errors=True)
