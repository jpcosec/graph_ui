"""E2E de teclado por vista: cada vista escucha solo sus teclas, sin fugas.

Antes de separar el shell de las vistas, KB y Brainstorm instalaban sus
listeners a la vez: con una selección de KB rancia, Enter en Brainstorm abría
la captura rápida de KB. Este test fija el contrato:

1. KB: Enter/Tab sobre un nodo seleccionado abren la captura rápida (hermano/
   hijo), Escape la cierra, Delete quita el nodo y Ctrl+Z lo devuelve.
2. Brainstorm: Enter/Tab crean ideas; nunca aparece un diálogo de KB.
3. Schema: Enter/Tab/Delete no hacen nada (ni diálogo, ni cambios).
4. Ctrl+S solo actúa en KB (la única vista con acción primaria).
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

PORT = 8153


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


def test_keyboard_is_scoped_per_view():
    if sync_playwright is None:
        import pytest
        pytest.skip("playwright no está instalado")
    tmp = Path(tempfile.mkdtemp(prefix="kb-e2e-keys-"))
    store = tmp / ".sldb"
    _compile(store)
    server = _start_server(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1400, "height": 900})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"http://127.0.0.1:{PORT}/documents/map")
            page.wait_for_selector(".document-node", timeout=10000)
            board = page.locator(".document-node", has_text="Main board").first
            board.locator("button.collapse").click()
            expect(page.locator(".document-node")).to_have_count(3)

            # --- KB: Enter = hermano, Tab = hijo, Escape cierra, Delete + Ctrl+Z ---
            task = page.locator(".document-node", has_text="Onboarding").first
            task.click(position={"x": 50, "y": 20})
            page.keyboard.press("Enter")
            expect(page.locator("dialog.quick-create")).to_have_count(1)
            page.keyboard.press("Escape")
            expect(page.locator("dialog.quick-create")).to_have_count(0)
            page.keyboard.press("Escape")  # limpia la selección: su mini barra taparía el board
            expect(page.locator(".node-toolbar")).to_have_count(0)
            board.click(position={"x": 60, "y": 30})
            page.keyboard.press("Tab")
            expect(page.locator("dialog.quick-create")).to_have_count(1)
            page.keyboard.press("Escape")
            expect(page.locator("dialog.quick-create")).to_have_count(0)
            task.click(position={"x": 50, "y": 20})
            page.keyboard.press("Delete")
            expect(page.locator(".document-node")).to_have_count(2)
            expect(page.locator(".save-state.unsaved")).to_have_count(1)
            page.keyboard.press("Control+z")
            expect(page.locator(".document-node")).to_have_count(3)
            expect(page.locator(".document-node", has_text="Onboarding")).to_have_count(1)
            # (sigue "sin guardar": expandir el board ya cambió la vista persistida)

            # --- Brainstorm: sus teclas crean ideas; nada de KB se cuela ---
            task.click(position={"x": 50, "y": 20})  # selección de KB viva al cambiar de vista
            page.get_by_role("tab", name="Brainstorm").click()
            page.wait_for_selector(".brainstorm", timeout=10000)
            page.get_by_role("button", name="＋ Primera idea").click()
            page.locator(".idea-node .idea-input").last.fill("Raíz")
            page.keyboard.press("Escape")
            page.locator(".idea-node .idea-title").first.click()  # no el select de clase
            page.keyboard.press("Enter")
            expect(page.locator(".idea-node")).to_have_count(2)
            page.keyboard.press("Escape")
            page.locator(".idea-node .idea-title").first.click()
            page.keyboard.press("Tab")
            expect(page.locator(".idea-node")).to_have_count(3)
            assert page.locator("dialog").count() == 0, "una tecla de Brainstorm abrió un diálogo de KB"
            page.keyboard.press("Escape")
            page.keyboard.press("Control+s")  # sin acción primaria: no debe hacer nada
            assert page.locator("dialog").count() == 0

            # --- Schema: teclado inerte ---
            page.get_by_role("tab", name="Schema").click()
            page.wait_for_selector(".class-node", timeout=10000)
            page.locator(".class-node[data-class=TaskDoc] .class-node-head").click()
            for key in ("Enter", "Tab", "Delete", "Control+s"):
                page.keyboard.press(key)
            page.wait_for_timeout(300)
            assert page.locator("dialog").count() == 0
            expect(page.locator(".class-node")).to_have_count(2)

            # --- De vuelta en KB, nada quedó roto y el borrador sigue ---
            page.get_by_role("tab", name="KB").click()
            page.wait_for_selector(".document-node", timeout=10000)
            expect(page.locator(".document-node")).to_have_count(3)
            assert not errors, f"errores JS: {errors}"
            browser.close()
    finally:
        server.terminate()
        server.wait(timeout=5)
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    test_keyboard_is_scoped_per_view()
    print("OK")
