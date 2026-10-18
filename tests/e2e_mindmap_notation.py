"""E2E de la vista Specs: un spec de spec2viz dibujado según su notación.

1. Store temporal real: `spec2viz diagram sync` de dos pilotos del repo de
   spec2viz (statechart con estado compuesto y diagrama de clases UML).
2. La pestaña Specs lista los SpecDoc agrupados por `category` (vacía aquí).
3. El statechart se dibuja con los subestados DENTRO del compuesto (nest como
   contención de React Flow, no como arista), la marca `initial` y la
   transición que sale del compuesto.
4. El diagrama de clases muestra compartimentos con los atributos reales y
   terminales propias (triángulo hueco de la herencia).
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

try:
    from playwright.sync_api import sync_playwright
except ImportError:  # pragma: no cover
    sync_playwright = None

PORT = 8157


def _store():
    pilots = [PILOTS / "state-diagram-sync-lifecycle.yml", PILOTS / "class-sldb-models.yml"]
    if not all(p.exists() for p in pilots) or not shutil.which("spec2viz"):
        pytest.skip("sin los pilotos o el CLI de spec2viz")
    root = Path(tempfile.mkdtemp(prefix="kb-e2e-notation-"))
    for pilot in pilots:
        shutil.copy(pilot, root / pilot.name)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["spec2viz", "diagram", "sync", *(p.name for p in pilots), "--store", ".sldb"],
                   cwd=root, check=True, capture_output=True)
    return root / ".sldb"


def _start_server(store):
    server = subprocess.Popen(
        [sys.executable, str(MINDMAP / "serve.py"), str(PORT)],
        cwd=str(MINDMAP), env={**os.environ, "SLDB_STORE": str(store), "GRAPH_UI_BACKEND": "local"},
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(60):
        time.sleep(0.25)
        try:
            urllib.request.urlopen(f"http://127.0.0.1:{PORT}/api/graph", timeout=1)
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
            assert not errors, errors
            browser.close()
    finally:
        server.terminate()
        server.wait(timeout=10)
