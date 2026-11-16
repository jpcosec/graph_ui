"""E2E: class specs in the Specs view, in Chromium.

- R9: tests/fixtures/notation-class/class-records.yml has associations with multiplicities at both ends,
  several converging on one class. Every multiplicity sits next to its own edge's end (within 24 px of
  it), outside every class box, and clear of edge labels and other multiplicities.
- R10: tests/fixtures/notation-class/class-large.yml has 26 records, only 8 of them related (15
  associations). With «Ver todo» it reads at >= 10 px: the 18 unrelated ones go in a grid (more than one
  row and one column) beside or below the related ones, and every class is inside the canvas.
- Framing: opening a spec straight away (as a reload with it chosen does), the automatic framing and
  «Ver todo» keep every class box, with all its compartments, inside the canvas with >= 8 px of margin.
"""
import shutil
import subprocess
from pathlib import Path

import pytest

from e2e_notation_legibility import FRAMED, _measure, _round_two, _serve, assert_nodes_framed, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "tests" / "fixtures" / "notation-class"
RECORDS, LARGE = "class.records-multiplicities", "class.large-schema"
UNRELATED = 18

ENDS = r"""() => {
  const r = (e) => e.getBoundingClientRect();
  const overlap = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
  const boxes = [...document.querySelectorAll('.notation-canvas .glyph:not(.is-container)')].map(r);
  const labels = [...document.querySelectorAll('.notation-canvas .notation-edge-label')].map(r);
  const ends = [...document.querySelectorAll('.notation-canvas .notation-end-label')];
  const toRect = (p, b) => Math.hypot(Math.max(b.left - p.x, 0, p.x - b.right), Math.max(b.top - p.y, 0, p.y - b.bottom));
  return ends.map((l, i) => {
    const b = r(l), path = l.dataset.edge ? document.getElementById(l.dataset.edge) : null;
    let distance = Infinity;  // sin su arista no se puede ubicar: cuenta como lejos
    if (path) {
      const ctm = path.getScreenCTM(), total = path.getTotalLength();
      const at = (s) => { const p = path.getPointAtLength(s); return {x: p.x * ctm.a + ctm.e, y: p.y * ctm.d + ctm.f}; };
      distance = +toRect(l.dataset.end === 'source' ? at(0) : at(total), b).toFixed(1);
    }
    return {text: l.textContent, end: l.dataset.end, distance,
            onBox: boxes.some((x) => overlap(x, b)), onLabel: labels.some((x) => overlap(x, b)),
            onEnd: ends.some((o, j) => j !== i && overlap(r(o), b))};
  });
}"""


@pytest.fixture(scope="module")
def store(tmp_path_factory):
    if sync_playwright is None:
        pytest.skip("playwright no está instalado")
    root = tmp_path_factory.mktemp("class")
    specs = sorted(FIXTURES.glob("*.yml"))
    for spec in specs:
        shutil.copy(spec, root / spec.name)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["sldb", "notations", "sync", *[a for s in specs for a in ("--spec", s.name)], "--store", ".sldb"], cwd=root, check=True, capture_output=True)
    return root / ".sldb"


def test_r9_multiplicities_sit_at_their_edge_end_outside_the_boxes(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            result = _measure(page, RECORDS)
            assert result["minTextPx"] >= 10 and result["labelOverlaps"] == 0 and result["spills"] == 0, result
            _round_two(result)
            ends = page.evaluate(ENDS)
            assert len(ends) == 18, ends
            bad = [e for e in ends if e["onBox"] or e["onLabel"] or e["onEnd"] or e["distance"] > 24]
            assert not bad, bad
            assert not errors, errors
            browser.close()
    finally:
        process.terminate()
        process.wait()


def test_r10_unrelated_classes_go_in_a_grid_and_the_whole_reads(store):
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
            assert result["minTextPx"] >= 10, result
            assert result["labelOverlaps"] == 0 and result["spills"] == 0 and result["crossings"] == 0, result
            _round_two(result)
            grid = page.evaluate("""() => {
              const c = document.querySelector('.notation-canvas').getBoundingClientRect();
              const linked = new Set([...document.querySelectorAll('.notation-canvas .notation-edge-ends')].flatMap(g => [g.dataset.source, g.dataset.target]));
              const nodes = [...document.querySelectorAll('.notation-canvas .react-flow__node')].map(n => ({id: n.dataset.id, r: n.getBoundingClientRect()}));
              const loose = nodes.filter(n => !linked.has(n.id));
              return {loose: loose.length, rows: new Set(loose.map(n => Math.round(n.r.top))).size, cols: new Set(loose.map(n => Math.round(n.r.left + n.r.width / 2))).size,
                      outside: nodes.filter(n => n.r.left < c.left || n.r.right > c.right || n.r.top < c.top || n.r.bottom > c.bottom).length};
            }""")
            assert grid["loose"] == UNRELATED and grid["rows"] > 1 and grid["cols"] > 1 and grid["outside"] == 0, grid
            assert not errors, errors
            browser.close()
    finally:
        process.terminate()
        process.wait()


def test_opening_a_spec_frames_every_box_with_its_compartments(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            for spec in (RECORDS, LARGE):
                page.goto(f"{base}/specs/notation")
                page.wait_for_selector(".notation-catalog button", timeout=30000)
                page.evaluate("id => localStorage.setItem('kb-notation-spec', id)", spec)
                page.goto(f"{base}/specs/notation")
                page.wait_for_function("s => [...document.querySelectorAll('.notation-canvas .react-flow__node')].some(n => n.dataset.id.includes(s + '.'))",
                                       arg=spec, timeout=60000)
                page.wait_for_timeout(2500)
                assert page.evaluate(FRAMED) >= 8, spec
                assert_nodes_framed(page)
            browser.close()
    finally:
        process.terminate()
        process.wait()


# ---- Paquetes UML (contrato de notación uml-class: glifo package + link contains con draw nest) ----
# tests/fixtures/notation-packages/class.packages.yml es copia literal de sldb/tests/fixtures/specs/class.packages.yml:
# core > billing > Invoice, Payment; core > identity > User; shared > AuditLog. Dos niveles de paquetes; las clases son hojas.
PACKAGES = ROOT / "tests" / "fixtures" / "notation-packages"
PACKAGES_SPEC = "class.packages"

PACKAGE_GEOMETRY = r"""() => {
  const rect = (e) => e.getBoundingClientRect();
  const out = {};
  for (const n of document.querySelectorAll('.notation-canvas .react-flow__node')) {
    const g = n.querySelector(':scope > .glyph'), head = g && g.querySelector(':scope > .glyph-head');
    const label = head && head.querySelector('.glyph-label'), outline = g && g.querySelector(':scope > .glyph-outline path');
    let title = null;
    if (label) {
      const l = rect(label), x = (l.left + l.right) / 2, y = (l.top + l.bottom) / 2, hit = document.elementFromPoint(x, y);
      title = {left: l.left, right: l.right, top: l.top, bottom: l.bottom, text: label.textContent, onTop: Boolean(hit && head.contains(hit))};
    }
    // Forma dibujada: el contorno muestreado en pantalla. El lado derecho de la carpeta empieza en la línea de arriba
    // del cuerpo; la pestaña es lo que sube por encima de ella, pegado al borde de arriba.
    let folder = null;
    if (outline) {
      const ctm = outline.getScreenCTM(), total = outline.getTotalLength(), pts = [];
      for (let s = 0; s <= total; s += 1) { const p = outline.getPointAtLength(s); pts.push({x: p.x * ctm.a + ctm.e, y: p.y * ctm.d + ctm.f}); }
      const xs = pts.map(p => p.x), ys = pts.map(p => p.y), right = Math.max(...xs), top = Math.min(...ys);
      const bodyTop = Math.min(...pts.filter(p => p.x >= right - 1).map(p => p.y));
      folder = {left: Math.min(...xs), right, top, bottom: Math.max(...ys), bodyTop, tabRight: Math.max(...pts.filter(p => p.y <= top + 1).map(p => p.x))};
    }
    const r = rect(n);
    out[n.dataset.id] = {left: r.left, top: r.top, right: r.right, bottom: r.bottom, container: g.classList.contains('is-container'),
      shape: [...g.classList].find(c => c.startsWith('shape-')) || '', head: head ? {top: rect(head).top, bottom: rect(head).bottom} : null, title, folder,
      outlineFill: outline ? getComputedStyle(outline).fill : null, boxFill: getComputedStyle(g).backgroundColor};
  }
  return out;
}"""

# R13: tras «Ver todo», todo lo dibujado (nodos, aristas y sus rótulos) dentro de la ventana, sin margen.
WHOLE_IN_WINDOW = r"""() => {
  const parts = [...document.querySelectorAll('.notation-canvas .react-flow__node, .notation-canvas .react-flow__edge-path, .notation-canvas .notation-edge-label, .notation-canvas .notation-end-label')];
  const out = parts.map(e => e.getBoundingClientRect()).filter(r => r.width > 0 || r.height > 0)
    .filter(r => r.left < -0.5 || r.top < -0.5 || r.right > window.innerWidth + 0.5 || r.bottom > window.innerHeight + 0.5);
  return {parts: parts.length, outside: out.map(r => [r.left, r.top, r.right, r.bottom])};
}"""

# Todo texto visible del lienzo, medido en pantalla (tamaño de fuente por el zoom del viewport).
MIN_TEXT = r"""() => {
  const vp = document.querySelector('.react-flow__viewport');
  const zoom = Number((/scale\(([\d.]+)\)/.exec(vp.style.transform) || [0, 1])[1]);
  const texts = [];
  const walker = document.createTreeWalker(document.querySelector('.notation-canvas .react-flow'), NodeFilter.SHOW_TEXT);
  for (let t = walker.nextNode(); t; t = walker.nextNode()) {
    const el = t.parentElement;
    if (!t.textContent.trim() || !el.closest('.react-flow__viewport') || el.closest('svg')) continue;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) texts.push({text: t.textContent.trim(), px: parseFloat(getComputedStyle(el).fontSize) * zoom});
  }
  return texts;
}"""


def _rgb(color):
    color = color.lstrip("#")
    return "rgb({}, {}, {})".format(*(int(color[i:i + 2], 16) for i in (0, 2, 4)))


def _inside(inner, outer):
    return inner["left"] >= outer["left"] - 0.5 and inner["right"] <= outer["right"] + 0.5 \
        and inner["top"] >= outer["top"] - 0.5 and inner["bottom"] <= outer["bottom"] + 0.5


@pytest.fixture(scope="module")
def packages_store(tmp_path_factory):
    if sync_playwright is None:
        pytest.skip("playwright no está instalado")
    root = tmp_path_factory.mktemp("packages")
    shutil.copy(PACKAGES / "class.packages.yml", root / "class.packages.yml")
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["sldb", "notations", "sync", "--spec", "class.packages.yml", "--store", ".sldb"], cwd=root, check=True, capture_output=True)
    return root / ".sldb"


def test_packages_nest_their_classes_with_a_readable_tab_and_their_kind_style(packages_store):
    import yaml
    spec = yaml.safe_load((PACKAGES / "class.packages.yml").read_text(encoding="utf-8"))
    packages = spec["data"]["packages"]
    doc = lambda name: f"SpecNodeDoc:{PACKAGES_SPEC}.{name}"
    process, base = _serve(packages_store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            view = page.evaluate("s => fetch('/api/notation/view?spec=' + encodeURIComponent(s)).then(r => r.json())", PACKAGES_SPEC)
            styles = {n["doc"]: n.get("style") or {} for n in view["nodes"]}
            _measure(page, PACKAGES_SPEC)  # abre el spec y pulsa «Ver todo»
            geo = page.evaluate(PACKAGE_GEOMETRY)
            # (a) cada clase dentro de su paquete y cada subpaquete dentro del suyo: dos niveles (core > billing/identity).
            for name, package in packages.items():
                box = geo[doc(name)]
                assert box["container"] and box["shape"] == "shape-package", (name, box)
                for child in package["contains"]:
                    assert _inside(geo[doc(child)], box), (name, child, geo[doc(child)], box)
            assert set(packages["core"]["contains"]) == {"billing", "identity"}
            assert all(not geo[doc(c)]["container"] for c in spec["data"]["classes"])
            # (b) G2: la cabecera del paquete reserva su alto, el primer hijo empieza debajo y el título no queda tapado.
            for name, package in packages.items():
                box = geo[doc(name)]
                assert box["title"] and box["title"]["text"] == package["label"] and box["title"]["onTop"], (name, box)
                first = min(geo[doc(c)]["top"] for c in package["contains"])
                assert box["head"]["bottom"] <= first + 0.5 and box["title"]["bottom"] <= first + 0.5, (name, box, first)
                # La carpeta UML envuelve la caja entera del contenedor; su pestaña sobresale arriba a la izquierda y el
                # título va en la pestaña o en una cabecera bajo ella; los hijos empiezan dentro del cuerpo, bajo el título.
                folder, title = box["folder"], box["title"]
                assert folder and abs(folder["left"] - box["left"]) <= 2 and abs(folder["right"] - box["right"]) <= 2, (name, box)
                assert abs(folder["top"] - box["top"]) <= 2 and abs(folder["bottom"] - box["bottom"]) <= 2, (name, box)
                assert folder["top"] < folder["bodyTop"] - 4 and folder["tabRight"] < folder["right"] - 4, (name, folder)
                in_tab = title["left"] >= folder["left"] - 0.5 and title["right"] <= folder["tabRight"] + 0.5 \
                    and title["top"] >= folder["top"] - 0.5 and title["bottom"] <= folder["bodyTop"] + 0.5
                under_tab = title["top"] >= folder["bodyTop"] - 0.5
                assert in_tab or under_tab, (name, title, folder)
                assert first >= folder["bodyTop"] - 0.5, (name, first, folder)
            # (c) R13: tras «Ver todo», todo el diagrama dentro de window.innerWidth x window.innerHeight.
            whole = page.evaluate(WHOLE_IN_WINDOW)
            assert whole["parts"] > 0 and not whole["outside"], whole
            # (d) todo texto visible mide al menos 10 px.
            texts = page.evaluate(MIN_TEXT)
            assert texts and min(t["px"] for t in texts) >= 10, sorted(texts, key=lambda t: t["px"])[:5]
            # (e) el contorno de billing e identity lleva el fill de su kind (style.kinds del spec, resuelto por
            # sldb) y las clases de adentro no lo heredan.
            for name in ("billing", "identity"):
                style = styles[doc(name)]
                assert style.get("source", {}).get("fill") == "spec", style
                fill = _rgb(style["fill"]["light"])
                kind_fill = spec["style"]["kinds"][packages[name]["kind"]]["fill"]
                if isinstance(kind_fill, dict):
                    assert style["fill"]["light"] == kind_fill["light"], (style, kind_fill)
                assert geo[doc(name)]["outlineFill"] == fill, (name, geo[doc(name)], fill)
                for child in packages[name]["contains"]:
                    assert geo[doc(child)]["boxFill"] != fill and geo[doc(child)]["outlineFill"] != fill, (child, geo[doc(child)])
            assert not errors, errors
            browser.close()
    finally:
        process.terminate()
        process.wait()
