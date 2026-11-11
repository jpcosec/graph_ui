"""E2E: el diálogo de documento crea un AtomDoc con el id que el modelo exige.

deskops CC38 (4a1aae81) exige ids ``atom-<slug>`` en el propio AtomDoc. El adaptador publica
``id_prefix`` y el diálogo (``+ Documento``) lo antepone al auto-id, como la captura rápida.
Navegador real, servidor HTTP real y desk de deskops desechable; sin peticiones interceptadas.
"""
import re
import threading

import pytest
from playwright.sync_api import expect, sync_playwright
from deskops.bootstrap import SLDBBootstrap
from deskops.lifecycle import write_lifecycle_graph
from deskops.workspace import seed_desk
from mindmap.serve import make_server
from mindmap.sldb_adapter import SldbAdapter


@pytest.fixture
def editor_server(tmp_path, monkeypatch):
    root = tmp_path / "desk-dialog"
    root.mkdir()
    assert SLDBBootstrap().init_local_store(root) == 0
    seed_desk(root)
    write_lifecycle_graph(root)
    monkeypatch.setenv("DESKOPS_ROOT", str(root))
    server = make_server(0, root / ".sldb")
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}", root
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


def _atoms(root):
    return {d.name for d in SldbAdapter(root / ".sldb").documents() if d.model_name == "AtomDoc"}


def test_document_dialog_creates_an_atomdoc_with_the_model_id_prefix(editor_server):
    url, root = editor_server
    before = _atoms(root)
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(url + "/")
        page.wait_for_selector(".document-node", timeout=15000)
        page.locator(".toolbar .add-button").click()
        dialog = page.locator("dialog.document-dialog:not(.quick-create)")
        expect(dialog).to_be_visible()
        dialog.get_by_role("button", name="⚛️ Atom", exact=True).click()
        expect(dialog.locator(".class-choice.selected")).to_have_text("⚛️Atom")
        # El ID que el diálogo muestra ya lleva el prefijo que publica el adaptador.
        shown_id = dialog.locator(".doc-meta code").first
        expect(shown_id).to_have_text(re.compile(r"^atom-"))
        new_id = shown_id.inner_text()
        dialog.locator("[data-field=title]").fill("Átomo desde el diálogo")
        dialog.locator("details summary").click()
        dialog.locator("[data-field=answer]").fill("Respuesta del átomo creado en el diálogo.")
        dialog.locator("button.primary").click()
        expect(dialog).to_have_count(0)
        page.keyboard.press("Control+s")
        page.wait_for_selector(".save-state:not(.unsaved)", timeout=20000)
        expect(page.locator(".document-node", has_text="Átomo desde el diálogo")).to_be_visible()
        assert not errors, f"errores JS: {errors}"
        browser.close()
    created = _atoms(root) - before
    assert created == {new_id}, f"AtomDoc creados: {created}, esperado {new_id}"
    assert new_id.startswith("atom-")
