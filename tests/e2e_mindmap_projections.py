"""E2E de proyecciones: pron's own ProjectionDoc (spec 01/05), reusado tal
cual en vez de un filtro inventado para la UI (ver docs/mindmap-developer.md).

1. Sobre el store del fixture pequeño (kb-small.json: 1 BoardDoc, 2 TaskDoc)
   se compila un modelo ProjectionDoc inline (no requiere el paquete pron:
   el filtrado es estructural por model_name, igual que RelationDoc/
   RelationTypeDoc en source/graph.mjs) con un documento de proyección
   `tasks` que declara `models: [TaskDoc]` y una plantilla `display`.
2. El selector del shell solo aparece cuando el store tiene ProjectionDoc, y
   ofrece «Todo» + esa proyección.
3. Activarla filtra KB y Flujo a solo TaskDoc (la fuente aplica la
   proyección, no cada vista) y aplica la plantilla `display` al título.
4. Schema sigue mostrando TODAS las clases (nunca oculta), pero atenúa la
   excluida (BoardDoc) y muestra la plantilla junto a la incluida (TaskDoc).
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

PORT = 8150


def _load_compiler():
    spec = importlib.util.spec_from_file_location("mc", MINDMAP / "compiler.py")
    compiler = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(compiler)
    return compiler


def _compile(store):
    _load_compiler().compile_json(
        json.loads((MINDMAP / "fixtures/kb-small.json").read_text(encoding="utf-8")), store)


# ProjectionDoc inline: solo los campos que source/projections.mjs lee
# (name/models/relations/display), tipados con el sistema de tipos simple
# del compilador (sin genéricos anidados: dict[str, Any] y list[Any], no
# list[dict[str, Any]]). El filtrado en la UI es nominal por model_name
# (ProjectionDoc es un modelo real y nombrado, no una convención estructural
# como RelationDoc/RelationTypeDoc de kgdb).
PROJECTION_SOURCE = {
    "version": 1,
    "models": [{
        "name": "ProjectionDoc",
        "fields": [
            {"name": "id", "type": "str", "description": "Identifier"},
            # `title` (not part of pron's real ProjectionDoc) works around a
            # quirk in this test compiler's default template generator: with
            # no `title` field it emits every field's rev marker twice (once
            # in the front matter, once in the body), same as LinkDoc's
            # fixture in e2e_mindmap_schema.py needs it for the same reason.
            {"name": "title", "type": "str", "description": "Title"},
            {"name": "name", "type": "str", "description": "Projection name"},
            {"name": "models", "type": "list[str]", "description": "Entity classes that enter", "default": []},
            {"name": "relations", "type": "list[Any]", "description": "Relation types that enter", "default": []},
            {"name": "display", "type": "dict[str, Any]", "description": "Per-model display templates", "default": {}},
        ],
    }],
    "documents": [{
        "id": "projection-tasks",
        "model": "ProjectionDoc",
        "payload": {
            "title": "tasks",
            "name": "tasks",
            "models": ["TaskDoc"],
            "relations": [],
            "display": {"TaskDoc": "📋 {title}"},
        },
    }],
}


def _compile_projection(store):
    # compile_json es idempotente: agrega ProjectionDoc/projection-tasks al
    # store del fixture sin tocar BoardDoc/TaskDoc ya compilados.
    _load_compiler().compile_json(PROJECTION_SOURCE, store)


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


def test_projection_selector_absent_without_a_projection_doc():
    """El store del fixture, sin ProjectionDoc, no cambia de comportamiento:
    cero selector en el topbar."""
    if sync_playwright is None:
        import pytest
        pytest.skip("playwright no está instalado")
    tmp = Path(tempfile.mkdtemp(prefix="kb-e2e-proj-none-"))
    store = tmp / ".sldb"
    _compile(store)
    server = _start_server(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1400, "height": 900})
            page.goto(f"http://127.0.0.1:{PORT}/")
            page.wait_for_selector(".document-node", timeout=10000)
            expect(page.locator(".projection-select")).to_have_count(0)
            browser.close()
    finally:
        server.terminate()
        server.wait(timeout=5)
        shutil.rmtree(tmp, ignore_errors=True)


def test_projection_filters_kb_and_flow_and_highlights_schema():
    if sync_playwright is None:
        import pytest
        pytest.skip("playwright no está instalado")
    tmp = Path(tempfile.mkdtemp(prefix="kb-e2e-proj-"))
    store = tmp / ".sldb"
    _compile(store)
    _compile_projection(store)
    server = _start_server(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1400, "height": 900})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"http://127.0.0.1:{PORT}/")
            page.wait_for_selector(".document-node", timeout=10000)

            # Selector: «Todo» + la proyección del store.
            select = page.locator(".projection-select")
            expect(select).to_have_count(1)
            expect(select.locator("option")).to_have_count(2)
            expect(select.locator("option").first).to_have_text("Todo")
            expect(select.locator("option").nth(1)).to_have_text("tasks")

            # KB sin proyección: los 3 documentos del fixture + el propio ProjectionDoc.
            expect(page.locator(".statusbar")).to_contain_text("4 documentos")

            select.select_option("tasks")
            # La fuente aplica el filtro: BoardDoc sale, quedan las 2 TaskDoc.
            expect(page.locator(".statusbar")).to_contain_text("2 documentos")
            # La plantilla display de la proyección se aplica al título del nodo.
            expect(page.locator(".node-title", has_text="📋")).to_have_count(2)

            # Flujo: mismo filtro (facet documents compartido) y misma plantilla.
            page.get_by_role("tab", name="Flujo").click()
            page.wait_for_selector(".flow-node", timeout=10000)
            expect(page.locator(".flow-count")).to_contain_text("2 documentos")
            expect(page.locator(".flow-node-title", has_text="📋")).to_have_count(2)

            # Schema: nunca oculta, solo resalta/atenúa; BoardDoc se atenúa,
            # TaskDoc no, y muestra la plantilla junto a la clase incluida.
            page.get_by_role("tab", name="Schema").click()
            page.wait_for_selector(".class-node", timeout=10000)
            # Schema sigue mostrando TODAS las clases del store, incluido
            # ProjectionDoc: nunca oculta, solo resalta/atenúa.
            expect(page.locator(".class-node")).to_have_count(3)
            board = page.locator(".class-node[data-class=BoardDoc]")
            task = page.locator(".class-node[data-class=TaskDoc]")
            proj = page.locator(".class-node[data-class=ProjectionDoc]")
            expect(board).to_have_class(re.compile(r"\bdim\b"))
            expect(proj).to_have_class(re.compile(r"\bdim\b"))
            expect(task).not_to_have_class(re.compile(r"\bdim\b"))
            expect(task.locator(".class-node-display")).to_have_text("📋 {title}")
            expect(board.locator(".class-node-display")).to_have_count(0)

            # Volver a «Todo» restaura el comportamiento sin proyección.
            page.get_by_role("tab", name="KB").click()
            page.wait_for_selector(".document-node", timeout=10000)
            select.select_option("")
            expect(page.locator(".statusbar")).to_contain_text("4 documentos")

            assert not errors, f"errores JS: {errors}"
            browser.close()
    finally:
        server.terminate()
        server.wait(timeout=5)
        shutil.rmtree(tmp, ignore_errors=True)


def test_projection_editor_stages_edits_live_before_any_save():
    """El panel dedicado en Schema («🎛 Editar proyección», solo habilitado
    con una proyección activa) edita el mismo documento ProjectionDoc que la
    ficha genérica de KB — vía documents.edit(), igual que cualquier otra
    mutación de la faceta documents (p. ej. applyConnection en map-view.js).
    El cambio se ve de inmediato en Schema/KB porque ambos leen el mismo
    working copy, sin necesidad de guardar en SLDB primero."""
    if sync_playwright is None:
        import pytest
        pytest.skip("playwright no está instalado")
    tmp = Path(tempfile.mkdtemp(prefix="kb-e2e-proj-editor-"))
    store = tmp / ".sldb"
    _compile(store)
    _compile_projection(store)
    server = _start_server(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1400, "height": 900})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"http://127.0.0.1:{PORT}/")
            page.wait_for_selector(".document-node", timeout=10000)
            page.locator(".projection-select").select_option("tasks")

            page.get_by_role("tab", name="Schema").click()
            page.wait_for_selector(".class-node", timeout=10000)
            edit_btn = page.locator(".schema-projection-edit")
            expect(edit_btn).to_be_enabled()
            board = page.locator(".class-node[data-class=BoardDoc]")
            expect(board).to_have_class(re.compile(r"\bdim\b"))

            edit_btn.click()
            page.wait_for_selector(".projection-editor", timeout=5000)
            # Todas las clases del schema aparecen (BoardDoc, TaskDoc,
            # ProjectionDoc), no solo las incluidas en la proyección activa.
            expect(page.locator(".projection-editor-row")).to_have_count(3)
            # Set a display template on the already-included TaskDoc row.
            page.locator(".projection-editor-row", has_text="Task").locator(".projection-editor-template").fill("📌 {title}")
            page.locator(".projection-editor .dialog-footer button.primary").click()

            # Staged, visible in KB before any save.
            page.get_by_role("tab", name="KB").click()
            page.wait_for_selector(".document-node", timeout=10000)
            expect(page.locator(".node-title", has_text="📌")).to_have_count(2)
            # El cambio quedó pendiente de guardar (dirty), no persistido aún.
            expect(page.locator(".save-state.unsaved")).to_have_count(1)

            assert not errors, f"errores JS: {errors}"
            browser.close()
    finally:
        server.terminate()
        server.wait(timeout=5)
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    test_projection_selector_absent_without_a_projection_doc()
    test_projection_filters_kb_and_flow_and_highlights_schema()
    test_projection_editor_stages_edits_live_before_any_save()
    print("OK")
