"""E2E: projection views in review-workbench, against real servers and a real store.

A temporary store is built from spec2viz's pilots (``SpecNodeDoc`` documents joined by
``uses``/``inherits``/``reads``). Three real processes serve it: ``sldb serve`` (what
AntoniaFlowPage reads through ``/sldb``), the graph_ui server (``/api/views*``) and a production
build of review-workbench under ``vite preview``, whose proxy forwards both. In Chromium:

1. the sidebar's view query (model + where, relation types) redraws the canvas with exactly the
   nodes and edges ``evaluate_view`` computes on the server;
2. saving writes a ``ViewDoc`` to the store; after a reload, choosing it in "Saved views" redraws
   the same slice;
3. the same view pointed at a second store draws that store's slice;
4. a view's layout style places the nodes: ``rings`` by a payload field (every node of a ring at
   that ring's radius, inner ring first), ``layered`` top to bottom along the relations;
5. a view with a ``notation`` (a third store, synced from tests/fixtures/notation-style with a
   styled notation) draws each node with its glyph's resolved style: the fill, stroke and icon the
   server resolved with spec2viz's ``resolve_documents``, painted on the node; each edge with its
   link's colour and dash; and the notation's legend in a canvas panel that covers no node.
"""
import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
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
APP = ROOT / "apps" / "review-workbench"
MINDMAP = ROOT / "frontends" / "mindmap"
PILOTS = Path(spec2viz.__file__).resolve().parents[1] / "docs/architecture/spec2viz"
HERE = ["component-exception-hierarchy.yml", "component-type-system.yml"]
THERE = ["component-architecture.yml"]
STYLE = ROOT / "tests" / "fixtures" / "notation-style"
INFRA = {"nodes": [{"model": "SpecNodeDoc", "where": 'spec = "SpecDoc:component.style-infra"'}],
         "relations": ["reads", "calls", "publishes", "charges", "uses"], "direction": "both", "notation": "infra"}


def _free_port() -> int:
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        return probe.getsockname()[1]


def _wait(url: str, process=None, timeout=60) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        if process is not None and process.poll() is not None:
            raise RuntimeError(f"{url}: the process exited ({process.returncode})")
        try:
            urllib.request.urlopen(url, timeout=2)
            return
        except Exception:
            time.sleep(0.3)
    raise RuntimeError(f"{url} did not answer")


def _store(root: Path, pilots: list[str]) -> Path:
    for pilot in pilots:
        shutil.copy(PILOTS / pilot, root / pilot)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["spec2viz", "diagram", "sync", *pilots, "--store", ".sldb"], cwd=root, check=True, capture_output=True)
    return root / ".sldb"


@pytest.fixture(scope="module")
def stack():
    if sync_playwright is None:
        pytest.skip("playwright no está instalado")
    if not (shutil.which("npx") and (APP / "node_modules").is_dir()):
        pytest.skip("review-workbench needs node and `npm ci` in apps/review-workbench")
    if not all((PILOTS / p).exists() for p in HERE + THERE) or not shutil.which("spec2viz"):
        pytest.skip("sin los pilotos o el CLI de spec2viz")
    work = Path(tempfile.mkdtemp(prefix="rw-views-"))
    processes = []
    try:
        (work / "here").mkdir(), (work / "there").mkdir(), (work / "styled").mkdir()
        store, other = _store(work / "here", HERE), _store(work / "there", THERE)
        for spec in STYLE.glob("*.yml"):
            shutil.copy(spec, work / "styled" / spec.name)
        subprocess.run(["sldb", "stores", "init", "--path", str(work / "styled")], check=True, capture_output=True)
        subprocess.run(["spec2viz", "diagram", "sync", "component-infra.yml", "--notation", "infra.yml", "--store", ".sldb"],
                       cwd=work / "styled", check=True, capture_output=True)
        styled = work / "styled" / ".sldb"
        sldb_port, ui_port, app_port = _free_port(), _free_port(), _free_port()
        env = {**os.environ, "GRAPH_UI_BACKEND": "local", "SLDB_STORE": str(store)}
        processes.append(subprocess.Popen(["sldb", "serve", "--store", str(store), "--port", str(sldb_port)],
                                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))
        processes.append(subprocess.Popen([sys.executable, str(MINDMAP / "serve.py"), str(ui_port)], env=env,
                                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))
        _wait(f"http://127.0.0.1:{sldb_port}/health", processes[0])
        _wait(f"http://127.0.0.1:{ui_port}/api/views", processes[1])
        dist = work / "dist"
        subprocess.run(["npx", "vite", "build", "--outDir", str(dist), "--emptyOutDir"], cwd=APP, check=True,
                       capture_output=True, timeout=300)
        app_env = {**os.environ, "VITE_SLDB_URL": f"http://127.0.0.1:{sldb_port}", "VITE_GRAPH_UI_URL": f"http://127.0.0.1:{ui_port}"}
        processes.append(subprocess.Popen(["npx", "vite", "preview", "--outDir", str(dist), "--port", str(app_port), "--strictPort",
                                           "--host", "127.0.0.1"], cwd=APP, env=app_env,
                                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))
        _wait(f"http://127.0.0.1:{app_port}/", processes[2])
        yield {"store": store, "other": other, "styled": styled, "app": f"http://127.0.0.1:{app_port}", "ui": f"http://127.0.0.1:{ui_port}"}
    finally:
        for process in processes:
            process.terminate()
        for process in processes:
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                process.kill()
        shutil.rmtree(work, ignore_errors=True)


def _expected(store: Path, view: dict) -> tuple[int, int]:
    from mindmap.projection_views import evaluate_view

    result = evaluate_view(store, view)
    return len(result["nodes"]), len(result["edges"])


def _apply(page, model: str, where: str, relations: str) -> None:
    if not page.locator("[data-testid='view-query']").is_visible():
        page.get_by_role("button", name="Filters").click()
    page.wait_for_selector("[data-testid='view-query']")
    if page.locator("[data-testid='view-model-0']").count() == 0:
        page.click("[data-testid='view-add-model']")
    page.fill("[data-testid='view-model-0']", model)
    page.fill("[data-testid='view-where-0']", where)
    page.fill("[data-testid='view-relations']", relations)
    page.locator("[data-testid='view-relations']").blur()
    page.click("[data-testid='view-apply']")


def _drawn(page, nodes: int, edges: int) -> None:
    page.wait_for_function(
        "([n, e]) => document.querySelectorAll('.react-flow__node').length === n"
        " && document.querySelectorAll('.react-flow__edge').length === e",
        arg=[nodes, edges], timeout=20000)


def test_views_query_save_reload_and_point_at_another_store(stack):
    inherits = {"nodes": [{"model": "SpecNodeDoc", "where": ""}], "relations": ["inherits"]}
    boundary = {"nodes": [{"model": "SpecNodeDoc", "where": 'kind = "boundary"'}], "relations": []}
    n_inherits, e_inherits = _expected(stack["store"], inherits)
    n_boundary, e_boundary = _expected(stack["store"], boundary)
    n_there, e_there = _expected(stack["other"], {**inherits, "relations": []})
    assert e_inherits > 0 and 0 < n_boundary < n_inherits and n_there > 0

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1600, "height": 1000})
        errors = []
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        page.goto(stack["app"])
        page.wait_for_selector("[data-testid='views-section']", timeout=30000)

        _apply(page, "SpecNodeDoc", "", "inherits")
        _drawn(page, n_inherits, e_inherits)

        page.fill("[data-testid='view-name']", "Herencia")
        page.click("[data-testid='view-save']")
        page.wait_for_selector("[data-testid='saved-view-select'] option[value='ViewDoc:herencia']", state="attached", timeout=15000)
        from mindmap.projection_views import find_view
        assert find_view(stack["store"], "ViewDoc:herencia")["relations"] == ["inherits"]

        _apply(page, "SpecNodeDoc", 'kind = "boundary"', "")
        _drawn(page, n_boundary, e_boundary)

        page.reload()
        page.wait_for_selector("[data-testid='saved-view-select'] option[value='ViewDoc:herencia']", state="attached", timeout=30000)
        page.select_option("[data-testid='saved-view-select']", "ViewDoc:herencia")
        _drawn(page, n_inherits, e_inherits)

        page.fill("[data-testid='view-store-path']", str(stack["other"]))
        _apply(page, "SpecNodeDoc", "", "")
        _drawn(page, n_there, e_there)
        assert errors == []
        browser.close()


def _save(ui: str, name: str, view: dict) -> None:
    request = urllib.request.Request(f"{ui}/api/views/save", data=json.dumps({"name": name, "view": view}).encode(),
                                     headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(request, timeout=60) as response:
        assert response.status == 200


CENTERS = """() => Object.fromEntries([...document.querySelectorAll('.react-flow__node')].map((el) => {
  const m = /translate\\(([-\\d.]+)px,\\s*([-\\d.]+)px\\)/.exec(el.style.transform);
  return [el.dataset.id, [Number(m[1]) + el.offsetWidth / 2, Number(m[2]) + el.offsetHeight / 2]];
}))"""


def _laid_out(page, ref: str, nodes: int, edges: int) -> dict:
    page.select_option("[data-testid='saved-view-select']", ref)
    _drawn(page, nodes, edges)
    page.wait_for_function("() => [...document.querySelectorAll('.react-flow__node')].some((el) => !/translate\\(0px, 0px\\)/.test(el.style.transform))", timeout=20000)
    page.wait_for_timeout(500)
    return page.evaluate(CENTERS)


def test_layout_style_rings_by_field_and_layered_by_relation(stack):
    from mindmap.projection_views import evaluate_view

    rings = {"nodes": [{"model": "SpecNodeDoc", "where": ""}], "relations": ["inherits"],
             "layout": {"kind": "graph", "style": "rings", "ring_field": "kind", "rings": ["core", "boundary"]}}
    layered = {"nodes": [{"model": "SpecNodeDoc", "where": ""}], "relations": ["inherits"],
               "layout": {"kind": "graph", "style": "layered", "direction": "TB"}}
    _save(stack["ui"], "anillos", rings)
    _save(stack["ui"], "capas", layered)
    result = evaluate_view(stack["store"], rings)
    kind = {n["id"].split("/", 3)[-1]: n["payload"]["kind"] for n in result["nodes"]}
    n, e = len(result["nodes"]), len(result["edges"])

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1600, "height": 1000})
        page.goto(stack["app"])
        page.wait_for_selector("[data-testid='saved-view-select'] option[value='ViewDoc:anillos']", state="attached", timeout=30000)

        centers = _laid_out(page, "ViewDoc:anillos", n, e)
        radius = {node: (x * x + y * y) ** 0.5 for node, (x, y) in centers.items()}
        core = [r for node, r in radius.items() if kind[node] == "core"]
        boundary = [r for node, r in radius.items() if kind[node] == "boundary"]
        assert core and boundary
        assert max(core) - min(core) < 2 and max(boundary) - min(boundary) < 2
        assert max(core) < min(boundary)

        centers = _laid_out(page, "ViewDoc:capas", n, e)
        for edge in result["edges"]:
            source, target = (edge[k].split("/", 3)[-1] for k in ("source", "target"))
            assert centers[source][1] < centers[target][1], (source, target)
        browser.close()


NOTATION = r"""() => {
  const nodes = [...document.querySelectorAll('.react-flow__node')].map((el) => {
    const shell = el.querySelector('[data-testid^="node-"]'), body = el.querySelector('[data-notation-body]');
    return {id: el.dataset.id, glyph: shell?.dataset.glyph || null, fill: shell?.dataset.fill || null, stroke: shell?.dataset.stroke || null,
            icon: shell?.dataset.icon || null, iconDrawn: Boolean(el.querySelector('[data-notation-icon] path, [data-notation-icon] rect, [data-notation-icon] circle')),
            background: body ? getComputedStyle(body).backgroundColor : null, border: body ? getComputedStyle(body).borderTopColor : null};
  });
  const edges = [...document.querySelectorAll('.react-flow__edge')].map((el) => {
    const path = el.querySelector('.react-flow__edge-path'); const cs = getComputedStyle(path);
    return {id: el.dataset.id || path.id, stroke: cs.stroke, dash: cs.strokeDasharray};
  });
  const legend = document.querySelector('[data-testid="view-legend"]');
  const lr = legend && legend.getBoundingClientRect();
  const covers = lr ? [...document.querySelectorAll('.react-flow__node')].filter((n) => { const r = n.getBoundingClientRect();
    return r.left < lr.right && lr.left < r.right && r.top < lr.bottom && lr.top < r.bottom; }).length : null;
  return {nodes, edges, covers, legend: legend && {
    notation: legend.dataset.notation,
    glyphs: [...legend.querySelectorAll('.legend-glyph')].map((li) => ({glyph: li.dataset.glyph, fill: li.dataset.fill, icon: li.dataset.icon})),
    kinds: legend.querySelectorAll('.legend-kind').length,
    links: [...legend.querySelectorAll('.legend-link')].map((li) => ({link: li.dataset.link, color: li.dataset.color}))}};
}"""


def _rgb(hex_colour: str) -> str:
    h = hex_colour.lstrip("#")
    return "rgb({}, {}, {})".format(*(int(h[i:i + 2], 16) for i in (0, 2, 4)))


def test_a_view_with_a_notation_draws_glyph_styles_link_colours_and_the_legend(stack, tmp_path):
    from mindmap.projection_views import evaluate_view

    request = urllib.request.Request(f"{stack['ui']}/api/views/save", headers={"Content-Type": "application/json"},
                                     data=json.dumps({"name": "infra", "view": INFRA, "store": str(stack["styled"])}).encode())
    with urllib.request.urlopen(request, timeout=60) as response:
        assert response.status == 200
    expected = evaluate_view(stack["styled"], INFRA)
    styles = {key.removeprefix("sldb://document/"): value for key, value in expected["notation"]["nodes"].items()}
    dark = lambda themed: themed and (themed.get("dark") or themed.get("light"))  # noqa: E731  (review-workbench es oscuro)

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1600, "height": 1000})
        errors = []
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        page.goto(stack["app"])
        page.wait_for_selector("[data-testid='views-section']", timeout=30000)
        page.fill("[data-testid='view-store-path']", str(stack["styled"]))
        page.locator("[data-testid='view-store-path']").blur()
        page.wait_for_selector("[data-testid='saved-view-select'] option[value='ViewDoc:infra']", state="attached", timeout=30000)
        _laid_out(page, "ViewDoc:infra", len(expected["nodes"]), len(expected["edges"]))
        page.wait_for_function("() => document.querySelectorAll('[data-notation-icon]').length >= 5", timeout=20000)
        page.wait_for_timeout(500)
        drawn = page.evaluate(NOTATION)

        # Cada nodo con el glifo y el estilo que resolvió el servidor, pintado en el nodo.
        nodes = {n["id"]: n for n in drawn["nodes"]}
        assert set(nodes) == set(styles)
        for ref, style in styles.items():
            node, fill, stroke, icon = nodes[ref], dark(style["style"].get("fill")), dark(style["style"].get("stroke")), style["style"].get("icon")
            assert node["glyph"] == style["glyph"], (ref, node)
            assert node["fill"] == fill and node["stroke"] == stroke and node["icon"] == icon, (ref, node, style)
            if fill:
                assert node["background"] == _rgb(fill), (ref, node)
            if stroke:
                assert node["border"] == _rgb(stroke), (ref, node)
            if icon:
                assert node["iconDrawn"], (ref, node)
        assert nodes["SpecNodeDoc:component.style-infra.checkout"]["fill"] == "#fff1c2"

        # Cada arista con el color y el trazo de su link: reads es punteada y azul.
        links = expected["notation"]["edges"]
        reads = [i for i, e in enumerate(expected["edges"]) if e["relation_type"] == "reads"]
        assert reads and all(links[i]["line"] == "dashed" for i in reads)
        dashed = [e for e in drawn["edges"] if e["dash"] not in ("none", "")]
        assert len(dashed) == len(reads) and all(e["stroke"] == _rgb("#0072b2") for e in dashed), drawn["edges"]

        # La leyenda de la notación, en un panel que no tapa nodos.
        legend = drawn["legend"]
        assert legend and legend["notation"] == "NotationDoc:infra", drawn
        assert len(legend["glyphs"]) == len(expected["notation"]["legend"]["glyphs"])
        assert len(legend["links"]) == len(expected["notation"]["legend"]["links"])
        assert legend["kinds"] == len(expected["notation"]["legend"]["kinds"])
        hot = next(g for g in legend["glyphs"] if g["glyph"] == "GlyphDoc:infra.hot")
        assert hot["fill"] == "#fff1c2" and hot["icon"] == "workflow"
        assert next(l for l in legend["links"] if l["link"] == "LinkDoc:infra.reads")["color"] == "#0072b2"
        assert drawn["covers"] == 0, drawn["covers"]
        page.click(".react-flow__controls-fitview")
        page.locator("[data-testid='view-legend']").scroll_into_view_if_needed()
        page.wait_for_timeout(600)
        page.screenshot(path=str(tmp_path / "view-notation.png"))
        assert errors == []
        browser.close()
