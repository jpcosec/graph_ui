"""Prueba E2E del paso 6: edición modal con referencias y conflicto de revisión.

1. Edita un documento en el modal resolviendo una referencia mediante búsqueda
   (campo `blocks` de TaskDoc) y verifica el round-trip en SLDB.
2. Simula una sesión concurrente: modifica el documento server-side mientras
   la UI tiene una baseline vieja; el guardado debe rechazarse con 409 y la UI
   debe mostrar la versión actual en el diálogo de conflicto.
"""
import importlib.util
import json
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

_spec = importlib.util.spec_from_file_location("sldb_adapter", MINDMAP / "sldb_adapter.py")
adapter_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(adapter_mod)
SldbAdapter = adapter_mod.SldbAdapter

PORT = 8141


def _start_server(store, env):
    import os
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


def _compile(store, tmp):
    cspec = importlib.util.spec_from_file_location("mc", MINDMAP / "compiler.py")
    compiler = importlib.util.module_from_spec(cspec)
    cspec.loader.exec_module(compiler)
    compiler.compile_json(json.loads((MINDMAP / "fixtures/kb-small.json").read_text()), store)


def test_reference_search_roundtrip_and_conflict():
    if sync_playwright is None:
        import pytest
        pytest.skip("playwright no está instalado")
    tmp = Path(tempfile.mkdtemp(prefix="kb-e2e-doc-"))
    store = tmp / ".sldb"
    _compile(store, tmp)
    server = _start_server(store, tmp)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page()
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"http://127.0.0.1:{PORT}/")
            page.wait_for_selector(".document-node", timeout=10000)
            # El fixture plega main-board: expandir para ver las tareas.
            page.locator(".document-node", has_text="Main board").locator("button.collapse").click()
            time.sleep(0.4)

            # --- 1. Editar task-onboarding resolviendo blocks por búsqueda ---
            page.locator(".document-node", has_text="Onboarding").first.dblclick()
            page.wait_for_selector("dialog.document-dialog:not(.quick-create)", timeout=5000)
            # blocks es un campo de referencia: aparece en Más campos.
            page.locator("dialog.document-dialog details summary").click()
            field = page.locator(".reference-field[data-field=blocks] input").first
            field.wait_for(timeout=3000)
            # El fixture ya trae task-review como chip de referencia.
            chips = page.locator(".reference-field[data-field=blocks] .reference-chip").all_inner_texts()
            assert any("Review plan" in c for c in chips), f"chip existente no visible: {chips}"
            # Agregar una referencia nueva resolviéndola por búsqueda.
            field.fill("Main")
            page.locator(".reference-matches button", has_text="main-board").first.click()
            time.sleep(0.2)
            chips = page.locator(".reference-field[data-field=blocks] .reference-chip").all_inner_texts()
            assert any("Main board" in c for c in chips), f"chip nuevo no agregado: {chips}"
            page.locator("dialog.document-dialog button.primary").click()
            time.sleep(0.3)
            page.keyboard.press("Control+s")
            page.wait_for_selector(".save-state:not(.unsaved)", timeout=15000)

            adapter = SldbAdapter(store)
            doc = adapter.find("task-onboarding")
            assert doc.payload["blocks"] == ["task-review", "main-board"], f"referencias no persistidas: {doc.payload['blocks']}"
            assert not errors, f"errores JS: {errors}"

            # --- 2. Conflicto: sesión concurrente modifica el mismo doc ---
            adapter.update_document(doc, {**doc.payload, "title": "Cambiado por otra sesión"})
            # La UI sigue con su baseline; editar localmente y guardar.
            page.locator(".document-node", has_text="Onboarding").first.dblclick()
            page.wait_for_selector("dialog.document-dialog:not(.quick-create)", timeout=5000)
            title_input = page.locator("dialog.document-dialog textarea").first
            title_input.fill("Edit local en conflicto")
            page.locator("dialog.document-dialog button.primary").click()
            time.sleep(0.3)
            page.keyboard.press("Control+s")
            page.wait_for_selector("dialog.conflict-dialog", timeout=15000)
            dialog_text = page.locator("dialog.conflict-dialog").inner_text()
            assert page.locator("dialog.conflict-dialog code").first.text_content() == "task-onboarding", "el conflicto no nombra el documento"
            assert "Cambiado por otra sesión" in dialog_text, "no muestra la versión actual de SLDB"
            assert "Edit local en conflicto" in dialog_text, "no muestra la versión local"
            # Mantener mis cambios: el diálogo se cierra y los cambios siguen.
            page.locator("dialog.conflict-dialog button.primary").click()
            time.sleep(0.2)
            assert page.locator("dialog.conflict-dialog").count() == 0
            assert page.wait_for_selector(".save-state.unsaved", timeout=3000)
            # Reintentar tras decidir mantener: sobrescribe explícitamente.
            page.keyboard.press("Control+s")
            page.wait_for_selector(".save-state:not(.unsaved)", timeout=15000)
            assert SldbAdapter(store).find("task-onboarding").payload["title"] == "Edit local en conflicto"

            # --- 3. Segunda ronda: conflicto + descartar y recargar ---
            ad2 = SldbAdapter(store)
            doc2 = ad2.find("task-onboarding")
            ad2.update_document(doc2, {**doc2.payload, "title": "Otra vez cambiado afuera"})
            page.locator(".document-node", has_text="Edit local").first.dblclick()
            page.wait_for_selector("dialog.document-dialog:not(.quick-create)", timeout=5000)
            page.locator("dialog.document-dialog textarea").first.fill("Segunda edición local")
            page.locator("dialog.document-dialog button.primary").click()
            time.sleep(0.3)
            page.keyboard.press("Control+s")
            page.wait_for_selector("dialog.conflict-dialog", timeout=15000)
            page.locator("dialog.conflict-dialog button", has_text="Descartar mis cambios").click()
            page.wait_for_selector(".save-state:not(.unsaved)", timeout=15000)
            reloaded = SldbAdapter(store).find("task-onboarding")
            assert reloaded.payload["title"] == "Otra vez cambiado afuera"
            assert not errors, f"errores JS: {errors}"
            browser.close()
            print("OK: referencia por búsqueda persiste; conflicto muestra versión actual y ambas salidas funcionan")
    finally:
        server.terminate()
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    test_reference_search_roundtrip_and_conflict()
