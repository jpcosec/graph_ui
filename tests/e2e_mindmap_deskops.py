"""Real browser, HTTP server and disposable Deskops desk; no intercepted requests."""
import os
import threading
from pathlib import Path

import pytest
from playwright.sync_api import expect, sync_playwright
from deskops import doc_access
from deskops.bootstrap import SLDBBootstrap
from deskops.lifecycle import write_lifecycle_graph
from deskops.models import BoardDoc
from deskops.operations import DeskopsOperations
from deskops.workspace import seed_desk
from desk_receipts import accept_activation_receipts
from mindmap.serve import make_server


@pytest.fixture
def workflow_server(tmp_path, monkeypatch):
    root = tmp_path / "desk-browser"
    root.mkdir()
    assert SLDBBootstrap().init_local_store(root) == 0
    seed_desk(root)
    write_lifecycle_graph(root)
    ops = DeskopsOperations(root)
    ids = []
    for title in ("Revisar el contexto", "Preparar la entrega"):
        bundle = ops.create_task_bundle({
            "title": title, "goal": "Comprobar el trabajo con datos reales.",
            "scope": "Solo el sandbox temporal del navegador.",
            "implementation_path": "Leer contexto y comprobar el avance.",
            "validation": ["pytest"], "done_when": "Avance persistido y comprobado.",
        })
        ids.append(bundle.task_id)
        accept_activation_receipts(root, bundle.task_id)
    monkeypatch.setenv("DESKOPS_ROOT", str(root))
    server = make_server(0, root / ".sldb")
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}", ops, ids
    finally:
        expect.set_options(timeout=5000)
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


def _screenshot(page, name):
    target = os.environ.get("DESKOPS_SCREENSHOT_DIR")
    if target:
        directory = Path(target)
        directory.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(directory / name), full_page=True)


def test_workflow_board_context_filters_advance_and_real_empty_error(workflow_server):
    url, ops, ids = workflow_server
    with sync_playwright() as pw:
        expect.set_options(timeout=30000)
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 1000})
        errors = []
        page.on("pageerror", lambda error: (errors.append(str(error)), print("Browser error:", error)))
        page.goto(url + "/workflow/deskops")
        expect(page.locator(".desk-task")).to_have_count(2)
        expect(page.locator(".desk-detail h2")).to_have_text("Revisar el contexto")
        expect(page.locator(".desk-overview p")).to_be_visible()
        expect(page.locator(".desk-meta code")).to_be_visible()
        expect(page.locator(".desk-gates li code").first).to_be_visible()
        expect(page.locator(".desk-gates")).to_contain_text("ritual-testing")

        # Native buttons work with keyboard selection as well as pointer input.
        second = page.locator(".desk-task").filter(has_text="Preparar la entrega")
        second.focus()
        second.press("Enter")
        expect(page.locator(".desk-detail h2")).to_have_text("Preparar la entrega")
        page.get_by_role("searchbox", name="Buscar tareas").fill("Revisar")
        expect(page.locator(".desk-task")).to_have_count(1)
        page.locator(".desk-task").click()
        expect(page.locator(".desk-detail h2")).to_have_text("Revisar el contexto")
        page.get_by_role("searchbox", name="Buscar tareas").fill("")

        page.get_by_role("button", name="Avanzar", exact=True).click()
        expect(page.locator(".desk-meta")).to_contain_text("ritual-testing")
        assert ops.show_task(ids[0])[0].current_node == "ritual-testing"
        page.get_by_label("Estado", exact=True).select_option("active")
        expect(page.locator(".desk-task")).to_have_count(1)
        expect(page.locator(".desk-task")).to_contain_text("Revisar el contexto")
        page.get_by_label("Estado", exact=True).select_option("")
        _screenshot(page, "deskops-desktop.png")

        # A second genuine transition reaches closeout, which the UI cannot execute.
        page.get_by_role("button", name="Avanzar", exact=True).click()
        expect(page.locator(".desk-meta")).to_contain_text("ritual-closeout")
        expect(page.get_by_role("button", name="Avanzar", exact=True)).to_be_disabled()
        expect(page.locator(".desk-gates")).to_contain_text("deskops closeout commit")
        assert ops.show_task(ids[0])[0].current_node == "ritual-closeout"

        page.set_viewport_size({"width": 390, "height": 844})
        page.evaluate("localStorage.setItem('kb-skin', 'dark')")
        page.reload()
        expect(page.locator(".desk-detail h2")).to_have_text("Revisar el contexto")
        expect(page.locator("html")).to_have_attribute("data-skin", "dark")
        assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
        _screenshot(page, "deskops-mobile.png")

        # Change the actual disposable Board through the document operations layer.
        board_path = ops.root / "desk/tasks/Board.md"
        board = doc_access.read_doc(board_path, BoardDoc)
        board["tasks"] = []
        doc_access.write_doc(ops.root, board_path, BoardDoc, board)
        page.get_by_role("button", name="Actualizar", exact=True).click()
        expect(page.get_by_text("Este Board todavía no tiene tareas enrutadas.")).to_be_visible()
        expect(page.locator(".desk-task")).to_have_count(0)
        # Existing files are now unrouted and must remain absent from the board.
        assert all((ops.root / "desk/tasks" / f"{ident}.md").exists() for ident in ids)
        board["tasks"] = ["desk/tasks/task-does-not-exist.md"]
        doc_access.write_doc(ops.root, board_path, BoardDoc, board)
        page.get_by_role("button", name="Actualizar", exact=True).click()
        expect(page.get_by_role("alert")).to_contain_text("task-does-not-exist.md")
        expect(page.get_by_text("Este Board todavía no tiene tareas enrutadas.")).to_have_count(0)
        assert not errors, errors
        browser.close()
