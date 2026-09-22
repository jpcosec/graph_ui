"""E2E del paso 7: editar una clase desde el diálogo y promover el draft.

1. Se abre el editor contra un store temporal con la KB pequeña compilada: sus
   clases las genera el compilador, el caso que exige --pythonpath al promover.
2. En «Editar clases» se añade a TaskDoc un campo con tipo y default.
3. Validar draft habilita Promover; promover (confirmando) instala el campo.
4. Tras promover, el diálogo no queda bloqueado ni con estado de draft obsoleto,
   y el store expone el campo nuevo en la versión 2 del modelo.
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

PORT = 8147


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


def _detail(model):
    req = urllib.request.Request(
        f"http://127.0.0.1:{PORT}/api/models/detail", data=json.dumps({"model": model}).encode(),
        headers={"Content-Type": "application/json"})
    return json.loads(urllib.request.urlopen(req, timeout=30).read())


def test_class_editor_add_field_validate_and_promote():
    if sync_playwright is None:
        import pytest
        pytest.skip("playwright no está instalado")
    tmp = Path(tempfile.mkdtemp(prefix="kb-e2e-classes-"))
    store = tmp / ".sldb"
    _compile(store)
    server = _start_server(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page()
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.on("dialog", lambda d: d.accept())  # confirmación de promover
            page.goto(f"http://127.0.0.1:{PORT}/")
            page.wait_for_selector(".document-node", timeout=10000)
            page.get_by_role("button", name="Editar clases").click()
            # La leyenda del sidebar también usa .class-item: se acota al diálogo.
            page.locator(".class-dialog .class-item", has_text="Task").first.click()

            # Los mensajes se limpian al iniciar cada operación: se espera el reporte, no el texto.
            report = page.locator(".class-dialog .compiler-report")
            promote = page.locator(".class-dialog button.primary")
            row = page.locator('tr:has(input[placeholder="name"])')
            row.locator('input[placeholder="name"]').fill("priority")
            row.locator("select").select_option("str")
            row.locator('input[placeholder="default"]').fill("normal")
            row.locator('input[placeholder="description"]').fill("Prioridad")
            row.get_by_role("button", name="+", exact=True).click()
            expect(report).to_contain_text("Added field draft", timeout=30000)
            expect(promote).to_be_disabled()  # el draft cambió: hay que validar

            page.get_by_role("button", name="Validar draft").click()
            expect(report).to_contain_text('"promoted": false', timeout=30000)
            expect(promote).to_have_text("Promover draft")
            expect(promote).to_be_enabled()

            promote.click()
            expect(report).to_contain_text('"promoted": true', timeout=60000)
            # Sin busy colgado ni draft obsoleto tras promover.
            expect(promote).to_have_text("Primero valida")
            expect(promote).to_be_disabled()
            expect(page.get_by_role("button", name="Validar draft")).to_be_enabled()
            assert page.locator('button[title="Quitar campo del draft"]:not(.hidden)').count() == 0

            detail = _detail("TaskDoc")
            # Shape estructurado (model_dump) desde vuelta 5: el yaml salió
            # del contrato; se asserta el dict, no el texto.
            assert detail.get("ok") is True, detail
            model = detail.get("model") or {}
            assert model.get("version") == 2, detail
            assert any(f.get("name") == "priority" for f in model.get("fields", [])), detail
            assert not errors, f"errores JS: {errors}"
            browser.close()
    finally:
        server.terminate()
        server.wait(timeout=5)
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    test_class_editor_add_field_validate_and_promote()
    print("OK")
