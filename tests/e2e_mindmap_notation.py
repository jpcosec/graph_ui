"""E2E de la vista Specs: un spec de spec2viz dibujado según su notación.

1. Store temporal real: `spec2viz diagram sync` de dos pilotos del repo de
   spec2viz (statechart con estado compuesto y diagrama de clases UML).
2. La pestaña Specs lista los SpecDoc agrupados por `category` (vacía aquí).
3. El statechart se dibuja con los subestados DENTRO del compuesto (nest como
   contención de React Flow, no como arista), la marca `initial` y la
   transición que sale del compuesto.
4. El diagrama de clases muestra compartimentos con los atributos reales y
   terminales propias (triángulo hueco de la herencia).
5. Una secuencia se dibuja en carriles (mensajes bajando por `order`, la
   autollamada como bucle) y una matriz en grilla (celda en la intersección
   fila × columna, filas indentadas por anidado).
"""
import os
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

import pytest

MINDMAP = Path(__file__).parents[1] / "frontends" / "mindmap"
spec2viz = pytest.importorskip("spec2viz")
PILOTS = Path(spec2viz.__file__).resolve().parents[1] / "docs/architecture/spec2viz"
MATRIX = Path(spec2viz.__file__).resolve().parents[1] / "tests/fixtures/matrix.quotation-view.yml"

try:
    from playwright.sync_api import sync_playwright
except ImportError:  # pragma: no cover
    sync_playwright = None

PORT = 8157
LANES_PORT = 8159


def _store(pilots=None):
    pilots = pilots or [PILOTS / "state-diagram-sync-lifecycle.yml", PILOTS / "class-sldb-models.yml"]
    if not all(p.exists() for p in pilots) or not shutil.which("spec2viz"):
        pytest.skip("sin los pilotos o el CLI de spec2viz")
    root = Path(tempfile.mkdtemp(prefix="kb-e2e-notation-"))
    for pilot in pilots:
        shutil.copy(pilot, root / pilot.name)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["spec2viz", "diagram", "sync", *(p.name for p in pilots), "--store", ".sldb"],
                   cwd=root, check=True, capture_output=True)
    return root / ".sldb"


def _start_server(store, port=PORT):
    server = subprocess.Popen(
        [sys.executable, str(MINDMAP / "serve.py"), str(port)],
        cwd=str(MINDMAP), env={**os.environ, "SLDB_STORE": str(store), "GRAPH_UI_BACKEND": "local"},
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(60):
        time.sleep(0.25)
        try:
            urllib.request.urlopen(f"http://127.0.0.1:{port}/api/graph", timeout=1)
            return server
        except Exception:
            continue
    server.terminate()
    raise AssertionError("el servidor del editor nunca respondió")


def test_specs_view_draws_nest_markers_compartments_and_terminals():
    if sync_playwright is None:
        pytest.skip("playwright no está instalado")
    server = _start_server(_store())
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1400, "height": 900})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"http://127.0.0.1:{PORT}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=15000)
            headings = page.locator(".notation-catalog h3").all_inner_texts()
            # `diagram sync` no escribe `category` (lo hace `catalog sync`): sin categoría.
            assert [h.lower() for h in headings] == ["sin categoría"], headings
            assert page.locator(".notation-catalog button").count() == 2

            page.click('[data-spec="state.diagram-sync-lifecycle"]')
            page.wait_for_selector(".glyph", timeout=15000)
            page.wait_for_timeout(700)  # fitView anima el zoom: medir cajas a mitad mezcla escalas
            assert page.locator(".glyph").count() == 7
            # Los subestados son hijos del compuesto en React Flow (parentId).
            for child in ("validating", "writing", "indexing"):
                node = page.locator(f'.react-flow__node[data-id="SpecNodeDoc:state.diagram-sync-lifecycle.{child}"]')
                assert node.count() == 1
            container = page.locator('[data-doc="SpecNodeDoc:state.diagram-sync-lifecycle.syncing"]')
            assert "is-container" in container.get_attribute("class")
            cbox = container.bounding_box()
            for child in ("validating", "writing", "indexing"):
                box = page.locator(f'[data-doc="SpecNodeDoc:state.diagram-sync-lifecycle.{child}"]').bounding_box()
                assert cbox["x"] <= box["x"] and box["x"] + box["width"] <= cbox["x"] + cbox["width"] + 1, child
                assert cbox["y"] <= box["y"] and box["y"] + box["height"] <= cbox["y"] + cbox["height"] + 1, child
            assert page.locator('[data-doc="SpecNodeDoc:state.diagram-sync-lifecycle.idle"] [data-marker="initial"]').count() == 1
            # 11 links: 3 nest se vuelven contención, 8 transiciones se dibujan.
            assert page.locator(".react-flow__edge").count() == 8
            assert page.locator(".notation-notices").count() == 0

            page.click('[data-spec="class.sldb-models"]')
            page.wait_for_selector('[data-doc="SpecNodeDoc:class.sldb-models.SpecDoc"]', timeout=15000)
            attrs = page.locator('[data-doc="SpecNodeDoc:class.sldb-models.SpecDoc"] .glyph-compartment li').all_inner_texts()
            assert "id: str" in attrs and any(a.startswith("nodes:") for a in attrs), attrs
            assert page.locator('.react-flow__edge path[marker-end*="nv-hollow-triangle"]').count() >= 1
            # Rótulos de extremo (§8d): las multiplicidades de la agregación y las composiciones.
            ends = page.locator(".notation-end-label")
            texts = ends.all_inner_texts()
            assert {"1", "*", "1..*"} <= set(texts), texts
            assert page.locator('.notation-end-label[data-end="source"]').count() >= 1
            assert not errors, errors
            browser.close()
    finally:
        server.terminate()
        server.wait(timeout=10)


def test_specs_view_draws_sequences_in_lanes_and_matrices_in_a_grid():
    if sync_playwright is None:
        pytest.skip("playwright no está instalado")
    server = _start_server(_store([PILOTS / "sequence-render-pipeline.yml", PILOTS / "sequence-sync-pipeline.yml",
                                   MATRIX, PILOTS / "matrix-pipeline-coverage.yml"]), LANES_PORT)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1400, "height": 900})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
            page.goto(f"http://127.0.0.1:{LANES_PORT}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=15000)

            page.click('[data-spec="sequence.render-pipeline"]')
            # Wait for this spec's own lanes: the spec drawn before the click also has
            # .lane-message, and reading the heads then races the swap.
            page.wait_for_selector('.lane-head[data-lane^="SpecNodeDoc:sequence.render-pipeline."]', timeout=15000)
            assert page.locator(".notation-notices").count() == 0
            heads = page.locator(".lane-head").evaluate_all("els => els.map(e => [e.dataset.lane.split('.').pop(), e.getBoundingClientRect().x])")
            assert [h[0] for h in heads] == ["User", "CLI", "Facade", "Loader", "Validator", "Compiler", "Renderer", "Disk"]
            assert all(heads[i][1] < heads[i + 1][1] for i in range(len(heads) - 1))
            messages = page.locator(".lane-message").evaluate_all(
                "els => els.map(e => [Number(e.dataset.order), e.getBoundingClientRect().y, e.dataset.from === e.dataset.to])")
            assert [m[0] for m in messages] == list(range(1, 15))
            assert all(messages[i][1] < messages[i + 1][1] for i in range(len(messages) - 1)), "el tiempo baja"
            assert [m[0] for m in messages if m[2]] == [4], "la autollamada del Loader es el mensaje 4"
            ret = page.locator('.lane-message[data-order="5"] .message-line')
            assert ret.get_attribute("stroke-dasharray") == "6 4" and "nv-open-arrow" in ret.get_attribute("marker-end")
            assert page.locator(".lane-frame").count() == 0, "render-pipeline no tiene fragmentos"

            # Fragmentos (§8c/§11): pestaña con el operador, condición al lado, marco
            # de la primera a la última fila y sobre las líneas de vida que tocan.
            page.click('[data-spec="sequence.sync-pipeline"]')
            page.wait_for_selector('.lane-head[data-lane^="SpecNodeDoc:sequence.sync-pipeline."]', timeout=15000)
            page.wait_for_selector(".lane-frame", timeout=15000)
            frames = page.locator(".lane-frame")
            assert frames.count() == 3
            svg_text = "els => els.map(e => e.textContent)"  # <text> de SVG no tiene innerText
            assert page.locator(".lane-frame .frame-label").evaluate_all(svg_text) == ["loop", "alt", "loop"]
            assert page.locator(".lane-frame .frame-guard").evaluate_all(svg_text) == [
                "[for each spec]", "[the diagram type has a notation]", "[for each spec]"]
            box = frames.nth(0).locator(".frame-box").bounding_box()
            lanes = dict(page.locator(".lane-head").evaluate_all(
                "els => els.map(e => [e.dataset.lane.split('.').pop(), e.getBoundingClientRect().x + e.getBoundingClientRect().width / 2])"))
            for p in ("CLI", "SpecSync", "Loader"):
                assert box["x"] < lanes[p] < box["x"] + box["width"], p
            assert lanes["User"] < box["x"]
            rows = page.locator(".lane-message").evaluate_all(
                "els => Object.fromEntries(els.map(e => [e.dataset.order, e.getBoundingClientRect().y]))")
            assert box["y"] < rows["2"] and rows["4"] < box["y"] + box["height"]
            assert not (box["y"] < rows["5"] < box["y"] + box["height"]), "el mensaje 5 ya es del alt"

            page.click('[data-spec="matrix.quotation-view"]')
            page.wait_for_selector(".notation-grid", timeout=15000)
            assert page.locator(".notation-notices").count() == 0
            assert page.locator(".notation-grid caption").inner_text() == "Quotation View"
            cols = page.locator(".notation-grid thead th[data-col]").all_inner_texts()
            assert [c.strip() for c in cols] == ["browse", "client", "basket", "validation", "completed"]
            depths = page.locator(".notation-grid tbody th").evaluate_all("els => els.map(e => [e.textContent, Number(e.dataset.depth)])")
            assert depths == [["QuotationFlow", 0], ["Store", 1], ["Basket", 1], ["BasketItem", 2]]
            # La celda marcada está en la columna de su stage y la fila de su componente.
            row = page.locator('.notation-grid tr[data-row$=".BasketItem"]')
            filled = row.locator("td").evaluate_all("tds => tds.map(td => td.classList.contains('is-filled'))")
            assert filled == [False, False, True, True, False]
            cell = row.locator("td.is-filled").first.bounding_box()
            head = page.locator('.notation-grid thead th[data-col$=".quotation__basket"]').bounding_box()
            assert abs((cell["x"] + cell["width"] / 2) - (head["x"] + head["width"] / 2)) < 2
            assert page.locator("td.is-filled").count() == 12

            # Piloto real de dos vistas: una tabla por vista, las filas vacías no se omiten.
            page.click('[data-spec="matrix.pipeline-coverage"]')
            page.wait_for_selector(".notation-grid caption >> text=Store sync", timeout=15000)
            assert page.locator(".notation-grid caption").all_inner_texts() == ["Render pipeline", "Store sync"]
            assert page.locator(".notation-grid").nth(0).locator("tbody tr").count() == 12
            assert page.locator(".notation-grid").nth(1).locator("tbody tr").count() == 12
            assert page.locator("td.is-filled").count() == 30
            # G7: a filled cell is a mark, not the view's name; the detail stays in its title.
            marks = page.locator("td.is-filled").evaluate_all("tds => tds.map(td => [td.textContent, Boolean(td.title)])")
            assert all(text == "●" and titled for text, titled in marks), marks[:3]
            assert page.locator(".notation-notices").count() == 0
            assert not errors, errors
            browser.close()
    finally:
        server.terminate()
        server.wait(timeout=10)
