"""E2E del modo Schema: diagrama de clases a partir de /api/schema real.

1. Se abre el editor contra un store temporal con la KB pequeña compilada
   (BoardDoc contiene TaskDoc por `tasks`; TaskDoc referencia por `blocks`,
   que en el fixture apunta a otra TaskDoc: una auto-relación inferida).
2. La pestaña «Schema» dibuja una card por clase y tres tipos de arista:
   contención declarada (◆, etiquetada con el campo), relación kgdb
   (RelationTypeDoc declarado y/u observado en RelationDoc, cabecera a
   cabecera) y referencia inferida (⇢, destino deducido de los documentos
   reales cuando el schema no declara la clase destino).
3. Todos los campos son visibles y cada arista de contención/referencia sale
   del puerto de su campo; el filtro atenúa lo que no coincide; el doble
   clic abre «Editar clases» ya en esa clase.
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


def _load_compiler():
    spec = importlib.util.spec_from_file_location("mc", MINDMAP / "compiler.py")
    compiler = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(compiler)
    return compiler


def _compile(store):
    _load_compiler().compile_json(
        json.loads((MINDMAP / "fixtures/kb-small.json").read_text(encoding="utf-8")), store)


# Modelo inline sin containment/references declarados, igual que en
# tests/e2e_mindmap_flow.py: la convención kgdb RelationDoc (source_id/
# target_id string, aquí además relation_type) se reconoce estructuralmente
# (isRelationDocument en source/graph.mjs), nunca por nombre de clase ni
# metadatos de schema. Sin un RelationTypeDoc que lo declare, `depends` solo
# existe porque esta instancia lo prueba (`declared:false` en schemaGraph).
LINK_SOURCE = {
    "version": 1,
    "models": [{
        "name": "LinkDoc",
        "fields": [
            {"name": "id", "type": "str", "description": "Identifier"},
            {"name": "title", "type": "str", "description": "Title"},
            {"name": "source_id", "type": "str", "description": "Origin document"},
            {"name": "target_id", "type": "str", "description": "Target document"},
            {"name": "relation_type", "type": "str", "description": "Relation kind"},
        ],
    }],
    "documents": [{
        "id": "link-1",
        "model": "LinkDoc",
        "payload": {
            "title": "task-onboarding depends on task-review",
            "source_id": "TaskDoc:task-onboarding",
            "target_id": "TaskDoc:task-review",
            "relation_type": "depends",
        },
    }],
}


def _compile_link(store):
    # compile_json es idempotente: agrega LinkDoc y link-1 al store del
    # fixture sin tocar los documentos ya compilados.
    _load_compiler().compile_json(LINK_SOURCE, store)


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

            # Una card por clase registrada; la contención declarada (tasks) Y
            # la referencia inferida de los datos reales (blocks, TaskDoc ->
            # TaskDoc porque task-onboarding.blocks apunta a otra tarea) son
            # aristas.
            expect(page.locator(".class-node")).to_have_count(2)
            expect(page.locator(".react-flow__edge")).to_have_count(2)
            expect(page.locator(".react-flow__edge", has_text="tasks")).to_have_count(1)
            expect(page.locator(".react-flow__edge", has_text="blocks")).to_have_count(1)
            expect(page.locator(".schema-count")).to_contain_text("2 clases")
            expect(page.locator(".schema-count")).to_contain_text("1 contenciones")
            expect(page.locator(".schema-count")).to_contain_text("1 referencias")
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

            # Todos los campos visibles; la arista sale del puerto del campo `tasks`
            # (contención) y del campo `blocks` (referencia inferida, mismo patrón
            # de puerto por fila, pero coloreado con --edge en vez de --class-color).
            expect(board.locator("li")).to_have_count(4)
            expect(board.locator("li .react-flow__handle[data-handleid=tasks]")).to_have_count(1)
            expect(board.locator("li .react-flow__handle")).to_have_count(1)
            expect(task.locator("li .react-flow__handle[data-handleid=blocks]")).to_have_count(1)
            expect(task.locator("li .react-flow__handle")).to_have_count(1)
            expect(page.locator("[data-testid='rf__edge-BoardDoc.tasks>TaskDoc']")).to_have_count(1)
            expect(page.locator("[data-testid='rf__edge-ref:TaskDoc.blocks>TaskDoc']")).to_have_count(1)

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


def test_schema_view_draws_relation_and_reference_edges_from_kgdb_documents():
    """Sobre el mismo store, se agrega LinkDoc/link-1 (ver LINK_SOURCE arriba):
    un documento-relación kgdb sin RelationTypeDoc que lo declare. La Schema
    view debe dibujar la relación observada (cabecera a cabecera, con su
    conteo) aunque nadie la haya declarado, y seguir mostrando la referencia
    inferida `blocks` (TaskDoc -> TaskDoc) del fixture base.

    Desviación esperada: LinkDoc es una clase registrada más (a diferencia de
    la vista Flujo, que colapsa sus documentos en una arista y no le da
    nodo), así que `.class-node` pasa de 2 a 3.
    """
    if sync_playwright is None:
        import pytest
        pytest.skip("playwright no está instalado")
    tmp = Path(tempfile.mkdtemp(prefix="kb-e2e-schema-rel-"))
    store = tmp / ".sldb"
    _compile(store)
    _compile_link(store)
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

            # LinkDoc es una clase más del schema (deviación anotada arriba).
            expect(page.locator(".class-node")).to_have_count(3)

            # `depends` no lo declara ningún RelationTypeDoc: la instancia
            # (link-1) sola basta para dibujar la relación, con su conteo.
            expect(page.locator(".react-flow__edge", has_text="depends ×1")).to_have_count(1)

            # La referencia inferida del fixture base sigue ahí.
            expect(page.locator(".react-flow__edge", has_text="blocks")).to_have_count(1)

            expect(page.locator(".schema-count")).to_contain_text("relaciones")

            assert not errors, f"errores JS: {errors}"
            browser.close()
    finally:
        server.terminate()
        server.wait(timeout=5)
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    test_schema_view_draws_classes_and_containment()
    test_schema_view_draws_relation_and_reference_edges_from_kgdb_documents()
    print("OK")
