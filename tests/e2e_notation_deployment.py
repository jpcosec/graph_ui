"""E2E: deployment specs in the Specs view (spec2viz contract §14), in Chromium.

tests/fixtures/notation-deployment/deployment-nested-paths.yml nests nodes four levels deep (account >
network > cluster > service > artifact), joins nodes by communication paths with a label and a
protocol, and has a «deploy» (artifact -> node) and a «manifest» (artifact -> artifact). It checks:

- each element is drawn inside the box of the node that contains it, at every level;
- each communication path is a solid line between its two nodes, labelled with its label and protocol,
  the label nearer its own edge than any other;
- «deploy» and «manifest» are dashed lines with an arrowhead, labelled with their stereotype;
- the flow reads from the outside in: the client, the registry and the chart (sources of the paths,
  the deploy and the manifest) are left of the account, so no edge has to come back around it;
- the usual legibility rules hold after «Ver todo».

tests/fixtures/notation-deployment/deployment-large.yml is too wide for ELK to read at >= 10 px (issue
R8): it gets the own deployment layout (data-layout="deployment") and must read at >= 10 px after «Ver
todo», with every element inside its container, the client left of the account (outside in), no edge
label over a node or a container title, and the usual legibility rules.

Small deployments must not get worse: this fixture and the dense one of the legibility e2e
(tests/fixtures/notation-legibility/deployment-dense.yml) keep the ELK layout and at least the zoom
they read at before the deployment layout existed (BASELINE). In every deployment, no container
title touches its container's border (>= 8 px to each side, >= 4 px to the top).
"""
import shutil
import subprocess
from pathlib import Path

import pytest

from e2e_notation_legibility import _measure, _round_two, _serve, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "tests" / "fixtures" / "notation-deployment"
DENSE = ROOT / "tests" / "fixtures" / "notation-legibility" / "deployment-dense.yml"
SPEC = "deployment.nested-paths"
# Antes del layout propio de despliegues (commit 5576e23): motor y zoom tras «Ver todo» a 1800x1200.
BASELINE = {"deployment.nested-paths": ("elk", 1.09), "deployment.legibility-dense": ("elk", 1.0)}

LARGE = "deployment.large-nested"
LARGE_CONTAINS = {"vpc": "account", "idp": "account", "queue_host": "account", "storage_host": "account", "model_host": "account",
                  "lb": "vpc", "cluster": "vpc", "db_host": "vpc", "svc_edge": "cluster", "svc_jobs": "cluster", "svc_gateway": "cluster",
                  "img_edge": "svc_edge", "img_tunnel": "svc_jobs", "img_gateway": "svc_gateway", "db_vault": "db_host", "model": "model_host",
                  "browsers": "internet"}

# Rótulos de arista encima de un nodo o del título de un contenedor (tapan texto).
COVERED = r"""() => { const r = e => e.getBoundingClientRect();
  const boxes = [...document.querySelectorAll('.notation-canvas .glyph:not(.is-container), .notation-canvas .glyph.is-container > .glyph-head')].map(r);
  return [...document.querySelectorAll('.notation-canvas .notation-edge-label')].filter(l => { const a = r(l);
    return boxes.some(b => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1); }).map(l => l.innerText); }"""

# Cada título de contenedor queda dentro de su caja, con margen (no toca el borde).
TITLES = r"""() => [...document.querySelectorAll('.notation-canvas .glyph.is-container')].map(g => {
  const box = g.getBoundingClientRect(), head = g.querySelector(':scope > .glyph-head');
  const texts = [...head.querySelectorAll('.glyph-keyword, .glyph-label, svg.glyph-icon')].map(t => t.getBoundingClientRect());
  const side = Math.min(...texts.map(t => Math.min(t.left - box.left, box.right - t.right)));
  const top = Math.min(...texts.map(t => t.top - box.top));
  return {title: head.innerText.replace(/\s+/g, ' ').trim(), side: +side.toFixed(1), top: +top.toFixed(1)};
})"""
CONTAINS = {"network": "account", "cluster": "network", "db_host": "network", "api_node": "cluster", "worker_node": "cluster",
            "api_container": "api_node", "worker_container": "worker_node", "orders_db": "db_host", "api_image": "registry"}

DEPLOYMENT = r"""() => {
  const rect = el => el.getBoundingClientRect();
  const boxes = {};
  for (const n of document.querySelectorAll('.notation-canvas .react-flow__node')) {
    const r = rect(n.querySelector('.glyph')); boxes[n.dataset.id.split('.').pop()] = {left: r.left, right: r.right, top: r.top, bottom: r.bottom};
  }
  const labels = new Map([...document.querySelectorAll('.notation-canvas .notation-edge-label')].map(l => [l.dataset.edge, l]));
  const edges = [...document.querySelectorAll('.notation-canvas .react-flow__edge')].map(e => {
    const path = e.querySelector('.react-flow__edge-path'), ends = e.querySelector('.notation-edge-ends');
    const label = labels.get(path.id);
    return {source: ends.dataset.source.split('.').pop(), target: ends.dataset.target.split('.').pop(),
            dash: getComputedStyle(path).strokeDasharray || '', marker: path.getAttribute('marker-end') || '',
            label: label ? label.innerText.replace(/\s+/g, ' ').trim() : ''};
  });
  return {boxes, edges};
}"""


@pytest.fixture(scope="module")
def store(tmp_path_factory):
    if sync_playwright is None:
        pytest.skip("playwright no está instalado")
    if not shutil.which("spec2viz"):
        pytest.skip("sin el CLI de spec2viz")
    root = tmp_path_factory.mktemp("deployment")
    specs = [*sorted(FIXTURES.glob("*.yml")), DENSE]
    for spec in specs:
        shutil.copy(spec, root / spec.name)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["spec2viz", "diagram", "sync", *[s.name for s in specs], "--store", ".sldb"], cwd=root, check=True, capture_output=True)
    return root / ".sldb"


def test_nested_nodes_paths_deploy_and_manifest(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            result = _measure(page, SPEC)
            assert result["minTextPx"] >= 10, result
            assert result["labelOverlaps"] == 0 and result["spills"] == 0 and result["crossings"] == 0, result
            _round_two(result)
            drawn = page.evaluate(DEPLOYMENT)
            boxes = drawn["boxes"]
            # Anidado a cualquier profundidad: cada elemento dentro de la caja de su contenedor.
            for child, parent in CONTAINS.items():
                c, p = boxes[child], boxes[parent]
                assert p["left"] - 1 <= c["left"] and c["right"] <= p["right"] + 1 and p["top"] - 1 <= c["top"] and c["bottom"] <= p["bottom"] + 1, (child, parent)
            edges = {(e["source"], e["target"]): e for e in drawn["edges"]}
            # Communication paths de nodo a nodo: línea sólida con su rótulo (label y protocolo).
            for (source, target), text in {("users", "api_node"): "public API HTTPS", ("api_node", "worker_node"): "jobs AMQP",
                                           ("api_node", "db_host"): "queries :5432", ("worker_node", "db_host"): ":5432"}.items():
                edge = edges[(source, target)]
                assert edge["dash"] in ("", "none") and edge["label"] == text, edge
            # «deploy» y «manifest»: punteadas, con punta y su estereotipo.
            for (source, target), stereotype in {("api_image", "api_node"): "«deploy»", ("api_chart", "api_container"): "«manifest»"}.items():
                edge = edges[(source, target)]
                assert edge["dash"] not in ("", "none") and edge["marker"] and edge["label"] == stereotype, edge
            # De afuera hacia adentro: las fuentes externas a la izquierda de la cuenta.
            for outside in ("users", "registry", "api_chart"):
                assert boxes[outside]["right"] <= boxes["account"]["left"], (outside, boxes[outside], boxes["account"])
            page.screenshot(path=str(store.parent / "deployment.png"))
            assert not errors, errors
            browser.close()
    finally:
        process.terminate()
        process.wait()


def test_small_deployments_do_not_get_worse_and_titles_stay_inside(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            for spec, (engine, zoom) in BASELINE.items():
                result = _measure(page, spec)
                assert page.get_attribute(".notation-canvas", "data-layout") == engine, spec
                assert result["zoom"] >= zoom and result["minTextPx"] >= 10, (spec, result)
                titles = page.evaluate(TITLES)
                assert titles and all(t["side"] >= 8 and t["top"] >= 4 for t in titles), (spec, [t for t in titles if t["side"] < 8 or t["top"] < 4])
            browser.close()
    finally:
        process.terminate()
        process.wait()


def test_a_large_nested_deployment_reads_whole_with_its_own_layout(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            result = _measure(page, LARGE)
            assert page.get_attribute(".notation-canvas", "data-layout") == "deployment"
            assert result["minTextPx"] >= 10, result
            assert result["labelOverlaps"] == 0 and result["spills"] == 0 and result["crossings"] == 0, result
            _round_two(result)
            assert page.evaluate(COVERED) == []
            titles = page.evaluate(TITLES)
            assert all(t["side"] >= 8 and t["top"] >= 4 for t in titles), [t for t in titles if t["side"] < 8 or t["top"] < 4]
            boxes = page.evaluate(DEPLOYMENT)["boxes"]
            for child, parent in LARGE_CONTAINS.items():
                c, p = boxes[child], boxes[parent]
                assert p["left"] - 1 <= c["left"] and c["right"] <= p["right"] + 1 and p["top"] - 1 <= c["top"] and c["bottom"] <= p["bottom"] + 1, (child, parent)
            assert boxes["internet"]["right"] <= boxes["account"]["left"], (boxes["internet"], boxes["account"])
            page.screenshot(path=str(store.parent / "deployment-large.png"))
            assert not errors, errors
            browser.close()
    finally:
        process.terminate()
        process.wait()
