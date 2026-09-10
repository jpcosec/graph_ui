"""E2E del paso 8: importar un mapa JSON desde la UI del compilador.

Flujo en navegador (Playwright, sin pasos manuales):
1. Se abre el editor contra un store temporal vacío.
2. Se abre el diálogo "Importar JSON", se pega el fixture kb-small.json.
3. Validar → reporte ok. Calcular plan → plan aplicable con altas.
4. Aplicar → la KB se actualiza y los documentos aparecen en el mapa.
5. Exportar captura /api/export y verifica que el JSON exportado contiene
   los documentos importados (round-trip UI → SLDB → export).
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

PORT = 8143


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


def test_compiler_dialog_import_and_roundtrip():
    if sync_playwright is None:
        import pytest
        pytest.skip("playwright no está instalado")
    tmp = Path(tempfile.mkdtemp(prefix="kb-e2e-compiler-"))
    store = tmp / ".sldb"
    source = json.loads((MINDMAP / "fixtures/kb-small.json").read_text(encoding="utf-8"))
    server = _start_server(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page()
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"http://127.0.0.1:{PORT}/")
            page.wait_for_selector(".state", timeout=10000)  # KB vacía

            # --- Importar JSON: validar → plan → aplicar ---
            page.get_by_role("button", name="Importar JSON").click()
            page.wait_for_selector("dialog.compiler-dialog", timeout=5000)
            page.locator("dialog.compiler-dialog textarea").fill(json.dumps(source))
            page.get_by_role("button", name="Validar").click()
            page.wait_for_selector("dialog.compiler-dialog .compiler-report", timeout=15000)
            report_text = page.locator("dialog.compiler-dialog .compiler-report").text_content()
            assert '"ok": true' in report_text, f"reporte vacío o inesperado: {report_text!r}"

            page.get_by_role("button", name="Calcular plan").click()
            page.wait_for_selector("dialog.compiler-dialog .compiler-message", timeout=20000)
            assert "Plan listo" in page.locator("dialog.compiler-dialog .compiler-message").inner_text()
            # El plan contra un store vacío debe ser puro alta.
            report = json.loads(page.locator("dialog.compiler-dialog .compiler-report").text_content())
            created = set(report.get("creates", []))
            assert {d["id"] for d in source["documents"]} <= created, f"plan sin altas: {report}"

            page.get_by_role("button", name="Aplicar en SLDB").click()
            page.wait_for_selector("dialog.compiler-dialog .compiler-message", timeout=30000)
            assert "Compilación completada" in page.locator("dialog.compiler-dialog .compiler-message").inner_text()
            page.get_by_role("button", name="Cerrar importación").click()

            # Los documentos importados aparecen en el mapa.
            page.wait_for_selector(".document-node", timeout=15000)
            assert page.locator(".document-node", has_text="Main board").count() >= 1

            # --- Round-trip: export devuelve los documentos importados ---
            with page.expect_response(
                    lambda r: "/api/export" in r.url and r.request.method == "POST") as resp:
                page.get_by_role("button", name="Exportar").click()
            exported = resp.value.json()
            exported_ids = {d["id"] for d in exported["documents"]}
            assert {d["id"] for d in source["documents"]} <= exported_ids, \
                f"el export perdió documentos: {exported_ids}"
            assert exported["view"]["positions"], "el export no conserva layout"
            assert not errors, f"errores JS: {errors}"
    finally:
        server.terminate()
        server.wait(timeout=5)
        shutil.rmtree(tmp, ignore_errors=True)
