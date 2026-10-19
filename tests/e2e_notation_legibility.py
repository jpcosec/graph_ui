"""E2E: the Specs view reads whole, at 1800x1200 after «Ver todo» (issues G1-G6).

A real temporary store gets two specs: tests/fixtures/notation-legibility/component-containers.yml
(two containers with long titles, nine unlinked children in one, labelled edges between
containers) and spec2viz's activity pilot (decisions and a loop back). In Chromium, for each:

- every diagram text renders at >= 10 px at the zoom «Ver todo» leaves;
- no two edge/pseudostate labels overlap, no node label spills out of its box;
- a container's title sits above its children (G2), and the nine children use more than one row (G3);
- a decision's label is inside its diamond (G6);
- no edge passes through a node other than its two ends (G5, G6).

G1: with a model whose module does not import, the shell names the model and its error and the
catalog still lists the specs; started with --pythonpath, the error is gone.
"""
import os
import shutil
import socket
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

import pytest

try:
    from playwright.sync_api import sync_playwright
except ImportError:  # pragma: no cover
    sync_playwright = None

spec2viz = pytest.importorskip("spec2viz")

ROOT = Path(__file__).resolve().parents[1]
MINDMAP = ROOT / "frontends" / "mindmap"
FIXTURE = ROOT / "tests" / "fixtures" / "notation-legibility" / "component-containers.yml"
ACTIVITY = Path(spec2viz.__file__).resolve().parents[1] / "docs/architecture/spec2viz/activity-render-error-handling.yml"
COMPONENT, FLOW = "component.legibility-containers", "activity.render-error-handling"

MEASURE = r"""() => {
  const vp = document.querySelector('.react-flow__viewport');
  const zoom = Number((/scale\(([\d.]+)\)/.exec(vp.style.transform) || [0, 1])[1]);
  const visible = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const rect = el => el.getBoundingClientRect();
  const overlap = (a, b, m = 0) => !(a.right <= b.left + m || b.right <= a.left + m || a.bottom <= b.top + m || b.bottom <= a.top + m);
  const texts = [...document.querySelectorAll('.notation-canvas .glyph-label, .notation-canvas .glyph-point-label, .notation-canvas .glyph-diamond-label, .notation-canvas .notation-edge-label, .notation-canvas .glyph-keyword, .notation-canvas .glyph-compartment li')].filter(visible);
  const minTextPx = Math.min(...texts.map(el => parseFloat(getComputedStyle(el).fontSize) * zoom));
  const labels = [...document.querySelectorAll('.notation-canvas .notation-edge-label, .notation-canvas .glyph-point-label')].filter(visible).map(rect);
  let labelOverlaps = 0;
  for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++) if (overlap(labels[i], labels[j], 1)) labelOverlaps++;
  const leaves = [...document.querySelectorAll('.notation-canvas .react-flow__node')].filter(n => !n.querySelector('.glyph.is-container'));
  let spills = 0;
  for (const n of leaves) { const g = n.querySelector('.glyph'), l = n.querySelector('.glyph-label, .glyph-diamond-label');
    if (l && g) { const a = rect(l), b = rect(g); if (a.left < b.left - 1 || a.right > b.right + 1 || a.top < b.top - 1 || a.bottom > b.bottom + 1) spills++; } }
  const containers = [...document.querySelectorAll('.notation-canvas .react-flow__node')].filter(n => n.querySelector(':scope > .glyph.is-container')).map(n => {
    const id = n.dataset.id, head = rect(n.querySelector('.glyph-head')), box = rect(n);
    // Hijos directos: nodos hoja dentro de la caja del contenedor (React Flow no expone el padre en el DOM).
    const kids = leaves.filter(k => { const r = rect(k); return r.left >= box.left - 1 && r.right <= box.right + 1 && r.top >= box.top - 1 && r.bottom <= box.bottom + 1; });
    return {id, headBottom: head.bottom, kidsTop: Math.min(...kids.map(k => rect(k).top)), rows: new Set(kids.map(k => Math.round(rect(k).top))).size, kids: kids.length};
  });
  const diamonds = [...document.querySelectorAll('.notation-canvas .glyph.shape-diamond')].map(g => {
    const b = rect(g), l = rect(g.querySelector('.glyph-diamond-label'));
    const cx = (b.left + b.right) / 2, cy = (b.top + b.bottom) / 2, a = b.width / 2, h = b.height / 2;
    const inside = (x, y) => Math.abs(x - cx) / a + Math.abs(y - cy) / h <= 1.001;
    return inside(l.left, l.top) && inside(l.right, l.top) && inside(l.left, l.bottom) && inside(l.right, l.bottom);
  });
  const nodeRects = leaves.map(n => ({id: n.dataset.id, r: rect(n)}));
  let crossings = 0;
  for (const edge of document.querySelectorAll('.notation-canvas .react-flow__edge')) {
    const path = edge.querySelector('.react-flow__edge-path'); if (!path) continue;
    const ctm = path.getScreenCTM(), total = path.getTotalLength();
    const [source, target] = [edge.dataset.source, edge.dataset.target];
    for (let s = 6; s < total - 6; s += 4) {
      const p = path.getPointAtLength(s), x = p.x * ctm.a + ctm.e, y = p.y * ctm.d + ctm.f;
      const hit = nodeRects.find(({id, r}) => id !== source && id !== target && x > r.left + 2 && x < r.right - 2 && y > r.top + 2 && y < r.bottom - 2);
      if (hit) { crossings++; break; }
    }
  }
  return {zoom, minTextPx, texts: texts.length, labelOverlaps, spills, containers, diamonds, crossings};
}"""


def _free_port():
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        return probe.getsockname()[1]


def _serve(store, *args, pythonpath=None):
    port = _free_port()
    env = {**os.environ, "GRAPH_UI_BACKEND": "local", "SLDB_STORE": str(store)}
    env.pop("SLDB_PYTHONPATH", None)
    if pythonpath is None:
        env.pop("PYTHONPATH", None)
    process = subprocess.Popen([sys.executable, str(MINDMAP / "serve.py"), *args, str(port)], env=env,
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(100):
        try:
            urllib.request.urlopen(f"http://127.0.0.1:{port}/api/graph", timeout=2)
            return process, f"http://127.0.0.1:{port}"
        except Exception:
            time.sleep(0.2)
    process.terminate()
    raise RuntimeError("graph-ui did not start")


@pytest.fixture(scope="module")
def store(tmp_path_factory):
    if sync_playwright is None:
        pytest.skip("playwright no está instalado")
    if not ACTIVITY.exists() or not shutil.which("spec2viz"):
        pytest.skip("sin el piloto de actividad o el CLI de spec2viz")
    root = tmp_path_factory.mktemp("legibility")
    for spec in (FIXTURE, ACTIVITY):
        shutil.copy(spec, root / spec.name)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["spec2viz", "diagram", "sync", FIXTURE.name, ACTIVITY.name, "--store", ".sldb"], cwd=root, check=True, capture_output=True)
    return root / ".sldb"


def _measure(page, spec):
    page.click(f'[data-spec="{spec}"]')
    page.wait_for_selector(".notation-canvas .react-flow__node", timeout=30000)
    page.wait_for_function("() => [...document.querySelectorAll('.notation-canvas .react-flow__edge-path')].length > 0", timeout=30000)
    page.wait_for_timeout(600)
    page.click(".notation-bar button")
    page.wait_for_timeout(500)
    return page.evaluate(MEASURE)


def test_specs_read_whole_after_fit(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            errors = []
            page.on("pageerror", lambda exc: errors.append(str(exc)))
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)

            component = _measure(page, COMPONENT)
            assert component["minTextPx"] >= 10, component
            assert component["labelOverlaps"] == 0 and component["spills"] == 0, component
            assert component["crossings"] == 0, component
            assert len(component["containers"]) == 2, component["containers"]
            for container in component["containers"]:
                assert container["headBottom"] <= container["kidsTop"] + 0.5, container
            assert all(c["kids"] > 0 for c in component["containers"]), component["containers"]
            kit = max(component["containers"], key=lambda c: c["kids"])
            assert kit["kids"] == 9 and kit["rows"] >= 2, kit

            flow = _measure(page, FLOW)
            assert flow["minTextPx"] >= 10, flow
            assert flow["labelOverlaps"] == 0 and flow["spills"] == 0, flow
            assert flow["diamonds"] and all(flow["diamonds"]), flow["diamonds"]
            assert flow["crossings"] == 0, flow
            assert errors == []
            browser.close()
    finally:
        process.terminate()
        process.wait(timeout=10)


def test_an_unimportable_model_is_named_and_pythonpath_fixes_it(store, tmp_path):
    from sldb.api import add_model

    package = tmp_path / "legibility_models"
    package.mkdir()
    (package / "__init__.py").write_text("")
    (package / "models.py").write_text(
        "from pydantic import Field\nfrom sldb.models import StructuredNLDoc\n\n"
        "class LegibilityNoteDoc(StructuredNLDoc):\n"
        "    __template__ = '---\\nid: ⸢rev•id⸥\\n---\\n'\n"
        "    id: str = Field(description='Note id.')\n", encoding="utf-8")
    add_model(store, "legibility_models.models:LegibilityNoteDoc", pythonpath=str(tmp_path))

    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            banner = page.locator(".error-banner").inner_text()
            assert "LegibilityNoteDoc" in banner and "legibility_models" in banner and "--pythonpath" in banner, banner
            assert page.locator(f'[data-spec="{COMPONENT}"]').count() == 1
            browser.close()
    finally:
        process.terminate()
        process.wait(timeout=10)

    process, base = _serve(store, "--pythonpath", str(tmp_path))
    try:
        schema = urllib.request.urlopen(f"{base}/api/schema", timeout=30).read().decode()
        assert "import_error" not in schema
    finally:
        process.terminate()
        process.wait(timeout=10)
