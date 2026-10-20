"""E2E: the Specs view reads whole, at 1800x1200 after «Ver todo» (issues G1-G6).

A real temporary store gets two specs: tests/fixtures/notation-legibility/component-containers.yml
(two containers with long titles, nine unlinked children in one, labelled edges between
containers) and spec2viz's activity pilot (decisions and a loop back). In Chromium, for each:

- every diagram text renders at >= 10 px at the zoom «Ver todo» leaves;
- no two edge/pseudostate labels overlap, no node label spills out of its box;
- a container's title sits above its children (G2), and the nine children use more than one row (G3);
- a decision's label is inside its diamond (G6);
- no edge passes through a node other than its two ends (G5, G6);
- round 2: the initial node is above its first step (R1); every edge starts and ends on its source
  and target (R2); every edge label is within 20 px of its edge (R3); with the minimap shown, it
  covers no node after «Ver todo» (R4); no edge crosses a container's title (R5);
- round 3: every guard (label of a branch leaving a decision) is at least 8 px closer to its own
  branch than to any other edge, so parallel branches cannot swap their guards (R6); hovering an
  edge's label highlights that edge and dims the others, to follow one line in a bundle (R7).

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
FIXTURES = ROOT / "tests" / "fixtures" / "notation-legibility"
FIXTURE, DENSE = FIXTURES / "component-containers.yml", FIXTURES / "deployment-dense.yml"
ACTIVITY = Path(spec2viz.__file__).resolve().parents[1] / "docs/architecture/spec2viz/activity-render-error-handling.yml"
COMPONENT, FLOW, DEPLOYMENT = "component.legibility-containers", "activity.render-error-handling", "deployment.legibility-dense"

# R13: lo que se ve del lienzo es su caja recortada por la ventana; un lienzo más alto que la ventana
# (estirado por la leyenda) deja fuera lo que pasa de window.innerHeight aunque «quepa» en el lienzo.
VISIBLE_CANVAS = r"""const visibleCanvas = () => { const c = document.querySelector('.notation-canvas').getBoundingClientRect();
    return {left: Math.max(c.left, 0), top: Math.max(c.top, 0), right: Math.min(c.right, window.innerWidth), bottom: Math.min(c.bottom, window.innerHeight)}; };"""

MEASURE = r"""() => {
  """ + VISIBLE_CANVAS + r"""
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
  const allNodes = new Map([...document.querySelectorAll('.notation-canvas .react-flow__node')].map(n => [n.dataset.id, rect(n)]));
  const heads = [...document.querySelectorAll('.notation-canvas .glyph.is-container > .glyph-head')].filter(visible).map(rect);
  const onBorder = (p, r) => r && p.x >= r.left - 2 && p.x <= r.right + 2 && p.y >= r.top - 2 && p.y <= r.bottom + 2
    && Math.min(Math.abs(p.x - r.left), Math.abs(p.x - r.right), Math.abs(p.y - r.top), Math.abs(p.y - r.bottom)) <= 2;
  const toRect = (p, r) => Math.hypot(Math.max(r.left - p.x, 0, p.x - r.right), Math.max(r.top - p.y, 0, p.y - r.bottom));
  let crossings = 0, looseEnds = 0, headerCrossings = 0;
  const samples = new Map();
  for (const edge of document.querySelectorAll('.notation-canvas .react-flow__edge')) {
    const path = edge.querySelector('.react-flow__edge-path'), ends = edge.querySelector('.notation-edge-ends'); if (!path || !ends) continue;
    const ctm = path.getScreenCTM(), total = path.getTotalLength();
    const at = s => { const p = path.getPointAtLength(s); return {x: p.x * ctm.a + ctm.e, y: p.y * ctm.d + ctm.f}; };
    const {source, target} = ends.dataset;
    const pts = []; for (let s = 0; s <= total; s += 3) pts.push(at(s)); pts.push(at(total));
    samples.set(edge.dataset.id || path.id, pts);
    if (!onBorder(pts[0], allNodes.get(source)) || !onBorder(pts[pts.length - 1], allNodes.get(target))) looseEnds++;
    const inner = pts.slice(2, -2);
    if (inner.some(p => nodeRects.some(({id, r}) => id !== source && id !== target && p.x > r.left + 2 && p.x < r.right - 2 && p.y > r.top + 2 && p.y < r.bottom - 2))) crossings++;
    if (inner.some(p => heads.some(h => p.x > h.left + 1 && p.x < h.right - 1 && p.y > h.top + 1 && p.y < h.bottom - 1))) headerCrossings++;
  }
  // Cada rótulo contra el recorrido de SU arista (data-edge = id de la arista).
  const pathById = new Map([...document.querySelectorAll('.notation-canvas .react-flow__edge')].map(e => [e.querySelector('.react-flow__edge-path')?.id, e.querySelector('.react-flow__edge-path')]));
  const distanceToPath = (path, r) => {
    const ctm = path.getScreenCTM(), total = path.getTotalLength();
    let best = Infinity; for (let s = 0; s <= total; s += 2) { const p = path.getPointAtLength(s); best = Math.min(best, toRect({x: p.x * ctm.a + ctm.e, y: p.y * ctm.d + ctm.f}, r)); }
    return best;
  };
  const labelDistances = [...document.querySelectorAll('.notation-canvas .notation-edge-label')].filter(visible).map(l => {
    const path = pathById.get(l.dataset.edge); return path ? distanceToPath(path, rect(l)) : Infinity;
  });
  // R6: guardas = rótulos de aristas que salen de un rombo; margen = (otra arista más cercana) - (la propia).
  const diamondIds = new Set([...document.querySelectorAll('.notation-canvas .glyph.shape-diamond')].map(g => g.closest('.react-flow__node').dataset.id));
  const sourceOf = new Map([...document.querySelectorAll('.notation-canvas .react-flow__edge')].map(e => [e.querySelector('.react-flow__edge-path')?.id, e.querySelector('.notation-edge-ends')?.dataset.source]));
  const guardMargins = [...document.querySelectorAll('.notation-canvas .notation-edge-label')].filter(visible)
    .filter(l => diamondIds.has(sourceOf.get(l.dataset.edge))).map(l => {
      const r = rect(l), own = distanceToPath(pathById.get(l.dataset.edge), r);
      const other = Math.min(Infinity, ...[...pathById.entries()].filter(([id]) => id !== l.dataset.edge).map(([, path]) => distanceToPath(path, r)));
      return other - own;
    });
  const initial = document.querySelector('.notation-canvas .glyph.shape-filled-circle');
  let initialAbove = null;
  if (initial) {
    const id = initial.closest('.react-flow__node').dataset.id;
    const first = [...document.querySelectorAll('.notation-canvas .notation-edge-ends')].find(g => g.dataset.source === id);
    const a = rect(initial), b = first && allNodes.get(first.dataset.target);
    initialAbove = Boolean(b) && (a.top + a.bottom) / 2 < (b.top + b.bottom) / 2;
  }
  // Encuadre: cada nodo (su caja y lo que dibuja dentro) completo en el lienzo, con margen.
  const canvas = visibleCanvas();
  const minMargin = Math.min(...[...document.querySelectorAll('.notation-canvas .react-flow__node')].map(n => {
    const boxes = [rect(n), ...[...n.querySelectorAll('.glyph, .glyph > *')].map(rect)];
    return Math.min(...boxes.map(b => Math.min(b.left - canvas.left, canvas.right - b.right, b.top - canvas.top, canvas.bottom - b.bottom)));
  }));
  const minimap = document.querySelector('.notation-canvas .react-flow__minimap');
  const minimapCovers = minimap ? [...allNodes.values()].filter(r => overlap(r, rect(minimap))).length : null;
  return {zoom, minTextPx, texts: texts.length, labelOverlaps, spills, containers, diamonds, crossings, looseEnds, headerCrossings,
          maxLabelDistance: labelDistances.length ? Math.max(...labelDistances) : 0, labels: labelDistances.length, initialAbove, minimapCovers,
          guards: guardMargins.length, minGuardMargin: guardMargins.length ? Math.min(...guardMargins) : null, minMargin};
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
    for spec in (FIXTURE, DENSE, ACTIVITY):
        shutil.copy(spec, root / spec.name)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["spec2viz", "diagram", "sync", FIXTURE.name, DENSE.name, ACTIVITY.name, "--store", ".sldb"], cwd=root, check=True, capture_output=True)
    return root / ".sldb"


def _round_two(result):
    """R2, R3, R5 on any graph spec: ends on their nodes, labels on their edge, titles uncrossed; and after
    «Ver todo» every node, with everything it draws inside, fully in the canvas with >= 8 px of margin."""
    assert result["texts"] > 0, result  # something was drawn and measured
    assert result["minMargin"] >= 8, result
    assert result["looseEnds"] == 0, result
    assert result["maxLabelDistance"] <= 20, result
    assert result["headerCrossings"] == 0, result


FRAMED = r"""() => {
  """ + VISIBLE_CANVAS + r"""
  const rect = (e) => e.getBoundingClientRect(), canvas = visibleCanvas();
  const nodes = [...document.querySelectorAll('.notation-canvas .react-flow__node, .notation-canvas .lane-head, .notation-canvas .lane-message')];
  return nodes.length ? Math.min(...nodes.map((n) => [rect(n), ...[...n.querySelectorAll('.glyph, .glyph > *, .message-label')].map(rect)]
    .reduce((m, b) => Math.min(m, b.left - canvas.left, canvas.right - b.right, b.top - canvas.top, canvas.bottom - b.bottom), Infinity))) : null;
}"""


def assert_nodes_framed(page, margin=8):
    """Every node (and what it draws inside) fully in the visible canvas — the canvas clipped by the window —
    with >= `margin` px: as the view stands (its automatic framing) and again after «Ver todo». The canvas
    itself ends inside the window (R13)."""
    canvas_bottom = page.evaluate("() => document.querySelector('.notation-canvas').getBoundingClientRect().bottom - window.innerHeight")
    assert canvas_bottom <= 0.5, canvas_bottom
    before = page.evaluate(FRAMED)
    page.get_by_role("button", name="⛶ Ver todo").click()
    page.wait_for_timeout(500)
    least = page.evaluate(FRAMED)
    assert before is not None and before >= margin and least >= margin, (before, least)
    return least


def _measure(page, spec):
    page.click(f'[data-spec="{spec}"]')
    # Wait for THIS spec's diagram: the previous one stays on screen while the new layout runs.
    page.wait_for_function("spec => { const ids = [...document.querySelectorAll('.notation-canvas .react-flow__node')].map(n => n.dataset.id);"
                           " return ids.length > 0 && ids.every(id => id.includes(spec + '.') || id.includes(spec + '#'))"
                           " && document.querySelectorAll('.notation-canvas .react-flow__edge-path').length > 0; }", arg=spec, timeout=60000)
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
            _round_two(component)

            flow = _measure(page, FLOW)
            assert flow["minTextPx"] >= 10, flow
            assert flow["labelOverlaps"] == 0 and flow["spills"] == 0, flow
            assert flow["diamonds"] and all(flow["diamonds"]), flow["diamonds"]
            assert flow["crossings"] == 0, flow
            _round_two(flow)
            assert flow["labels"] >= 4 and flow["initialAbove"] is True, flow
            # R6: every guard reads as its own branch's.
            assert flow["guards"] >= 4 and flow["minGuardMargin"] >= 8, flow

            # R7: hovering a label highlights its own edge and dims the rest.
            label = page.locator(".notation-canvas .notation-edge-label").first
            edge_id = label.get_attribute("data-edge")
            label.hover()
            page.wait_for_selector(".notation-canvas .notation-edge-label.is-hovered")
            styles = page.evaluate('''id => [...document.querySelectorAll('.notation-canvas .react-flow__edge-path')]
                .map(p => [p.id === id, Number(getComputedStyle(p).opacity), parseFloat(getComputedStyle(p).strokeWidth)])''', edge_id)
            mine = [s for s in styles if s[0]]
            others = [s for s in styles if not s[0]]
            assert mine and mine[0][1] == 1 and mine[0][2] > 2, styles
            assert others and all(o[1] < 0.5 for o in others), styles
            page.mouse.move(5, 5)
            page.wait_for_function("() => !document.querySelector('.notation-canvas .notation-edge-label.is-hovered')")

            # Dense deployment (13 nodes, 18 artifacts, 21 labelled connections between nodes): with the
            # workers panel collapsed, as the Specs view starts, it still reads at >= 10 px.
            assert page.locator(".workers-panel.is-collapsed").count() == 1
            dense = _measure(page, DEPLOYMENT)
            assert dense["minTextPx"] >= 10, dense
            assert dense["labelOverlaps"] == 0 and dense["spills"] == 0, dense
            assert len(dense["containers"]) == 13 and all(c["headBottom"] <= c["kidsTop"] + 0.5 for c in dense["containers"]), dense["containers"]
            _round_two(dense)

            # R4: the minimap starts hidden; shown, «Ver todo» frames the diagram clear of it.
            assert dense["minimapCovers"] is None
            page.click(".notation-minimap-toggle")
            page.wait_for_selector(".notation-canvas .react-flow__minimap")
            for spec in (DEPLOYMENT, COMPONENT, FLOW):
                shown = _measure(page, spec)
                assert shown["minimapCovers"] == 0, (spec, shown["minimapCovers"])
            page.click(".notation-minimap-toggle")
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


def test_the_workers_panel_folds_per_view_and_remembers(store):
    """The Specs view starts with the workers panel collapsed (the diagram gets the whole width);
    a visible control unfolds it; the choice is remembered per view and the KB view keeps its own."""
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            assert page.locator(".workers-panel.is-collapsed").count() == 1
            canvas_folded = page.locator(".notation-canvas").bounding_box()["width"]

            page.get_by_role("button", name="Mostrar workers").click()
            page.wait_for_selector(".workers-panel:not(.is-collapsed) .workers-panel-head")
            assert page.locator(".notation-canvas").bounding_box()["width"] < canvas_folded - 200

            page.reload()
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            assert page.locator(".workers-panel.is-collapsed").count() == 0

            page.goto(f"{base}/documents/map")
            page.wait_for_selector(".workers-panel-head", timeout=30000)
            page.get_by_role("button", name="Plegar workers").click()
            page.wait_for_selector(".workers-panel.is-collapsed")
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            assert page.locator(".workers-panel.is-collapsed").count() == 0
            browser.close()
    finally:
        process.terminate()
        process.wait(timeout=10)
