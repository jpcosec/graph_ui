"""Prueba E2E del paso 5a: capturar diez nodos con teclado y recargar sin pérdida.

Abre el editor contra un store temporal compilado desde el fixture canónico,
crea diez documentos solo con teclado (Enter/sibling + Tab/child en el modal
rápido), guarda, recarga y verifica que los diez sobreviven.
"""
import importlib.util
import json
import shutil
import subprocess
import sys
import threading
import time
from pathlib import Path

MINDMAP = Path(__file__).parents[1] / "frontends" / "mindmap"
sys.path.insert(0, str(MINDMAP))

try:
    from playwright.sync_api import sync_playwright  # noqa: E402
except ImportError:  # pragma: no cover
    sync_playwright = None


def main():
    import tempfile
    tmp = Path(tempfile.mkdtemp(prefix="kb-e2e-"))
    store = tmp / ".sldb"

    cspec = importlib.util.spec_from_file_location("mc", MINDMAP / "compiler.py")
    compiler = importlib.util.module_from_spec(cspec)
    cspec.loader.exec_module(compiler)
    fixture = json.loads((MINDMAP / "fixtures" / "kb-small.json").read_text())
    compiler.compile_json(fixture, store)
    print("store listo:", store)

    import os
    env = {**os.environ, "SLDB_STORE": str(store)}
    server = subprocess.Popen([sys.executable, str(MINDMAP / "serve.py"), "8123"],
                              cwd=str(MINDMAP), env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        up = False
        for _ in range(40):
            time.sleep(0.25)
            try:
                import urllib.request
                urllib.request.urlopen("http://127.0.0.1:8123/api/graph", timeout=1)
                up = True
                break
            except Exception:
                continue
        assert up, "el servidor del editor nunca respondió en /api/graph"
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page()
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto("http://127.0.0.1:8123/")
            page.wait_for_selector(".document-node", timeout=10000)

            # Asegura el foco en un documento raíz para que Enter funcione.
            page.click(".document-node", position={"x": 50, "y": 20})
            time.sleep(0.3)
            for i in range(10):
                page.keyboard.press("Enter")
                page.wait_for_selector("dialog.quick-create input", timeout=3000)
                page.fill("dialog.quick-create input", f"Idea {i+1} de diez")
                page.keyboard.press("Enter")
                time.sleep(0.25)

            unsaved = page.wait_for_selector(".save-state.unsaved", timeout=3000)
            assert unsaved, "no hay cambios sin guardar"
            page.keyboard.press("Control+s")
            page.wait_for_selector(".save-state:not(.unsaved)", timeout=15000)

            page.reload()
            page.wait_for_selector(".document-node", timeout=10000)
            nodes = page.locator(".document-node").count()
            # El fixture plega main-board: 10 ideas + main-board visible = 11.
            assert nodes == 11, f"esperaba 11 nodos visibles, hay {nodes}"
            import urllib.request
            graph = json.loads(urllib.request.urlopen("http://127.0.0.1:8123/api/graph").read())
            ids = [d["id"] for d in graph["documents"]]
            assert len(ids) == 13, f"esperaba 13 documentos en SLDB, hay {len(ids)}"
            assert sum(1 for i in ids if i.startswith("idea-")) == 10

            # Tab abre captura rápida de hijo en el contenedor seleccionado.
            # Selección determinista: el nodo de main-board por título, no por orden.
            board_node = page.locator(".document-node", has_text="Main board").first
            board_node.click(position={"x": 60, "y": 30})
            time.sleep(0.3)
            assert "Main board" in board_node.inner_text(), "no se encontró el contenedor main-board"
            page.keyboard.press("Tab")
            page.wait_for_selector("dialog.quick-create input", timeout=3000)
            page.fill("dialog.quick-create input", "Hijo rápido")
            page.keyboard.press("Enter")
            time.sleep(0.3)
            page.keyboard.press("Control+s")
            time.sleep(1.5)
            graph = json.loads(urllib.request.urlopen("http://127.0.0.1:8123/api/graph").read())
            assert "hijo-rapido" in [d["id"] for d in graph["documents"]], "el hijo rápido no se guardó"

            assert not errors, f"errores JS: {errors}"
            browser.close()
            print("OK: 10 nodos capturados con teclado, guardados y recargados sin pérdida")
    finally:
        server.terminate()
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()

# ---------------------------------------------------------------- pytest integration
def test_e2e_quick_capture():
    """Ejecuta el flujo E2E completo dentro de la suite de pytest."""
    if sync_playwright is None:
        import pytest
        pytest.skip("playwright no está instalado")
    main()
