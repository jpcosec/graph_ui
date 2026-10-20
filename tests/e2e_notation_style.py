"""E2E: the Specs view draws the style spec2viz resolves (contract §13) — colours, icons, shapes, legend.

A real temporary store gets tests/fixtures/notation-style/component-infra.yml synced against the
notation tests/fixtures/notation-style/infra.yml (palette `default`). In Chromium:

- each styled glyph is painted with its resolved fill and stroke, in the light and the dark theme,
  with its label at WCAG AA contrast against that fill (a literal light fill keeps dark text in the
  dark theme), and the three precedence layers show: glyph style (hot), spec style.kinds (backend), palette kind;
- each glyph with an icon draws that lucide icon next to its label;
- cylinder, queue, cloud, package and note are drawn as an outline, with the label inside it;
- a link with `color` draws its line in that colour;
- the legend lists every glyph, kind and link of the view, with the same fill, shape, icon and colour,
  and does not cover the diagram.
"""
import shutil
import subprocess
from pathlib import Path

import pytest

from e2e_notation_legibility import _serve, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "tests" / "fixtures" / "notation-style"
SPEC = "component.style-infra"

COLOURS = r"""() => {
  const node = id => document.querySelector(`.notation-canvas .react-flow__node[data-id$=".${id}"] .glyph`);
  const paint = g => {
    const outline = g.querySelector(':scope > .glyph-outline path');
    const cs = getComputedStyle(outline || g);
    return {fill: outline ? cs.fill : cs.backgroundColor, stroke: outline ? cs.stroke : cs.borderTopColor,
            shape: [...g.classList].find(c => c.startsWith('shape-')), icon: g.querySelector('svg.glyph-icon')?.dataset.icon || null,
            iconDrawn: (g.querySelector('svg.glyph-icon')?.children.length || 0) > 0, outline: Boolean(outline),
            ink: getComputedStyle(g.querySelector('.glyph-label')).color};
  };
  const ids = ['api', 'db', 'jobs', 'payments', 'shared', 'memo', 'checkout', 'web'];
  const glyphs = Object.fromEntries(ids.map(id => [id, node(id) && paint(node(id))]));
  const rect = el => el.getBoundingClientRect();
  let spills = 0;
  for (const id of ids) { const g = node(id), l = g && g.querySelector('.glyph-label'); if (!l) continue;
    const a = rect(l), b = rect(g); if (a.left < b.left - 1 || a.right > b.right + 1 || a.top < b.top - 1 || a.bottom > b.bottom + 1) spills++; }
  const reads = [...document.querySelectorAll('.notation-canvas .react-flow__edge')]
    .find(e => (e.querySelector('.notation-edge-ends')?.dataset.target || '').endsWith('.db'));
  const legend = document.querySelector('.notation-legend');
  const canvas = rect(document.querySelector('.notation-canvas'));
  const lr = legend && rect(legend);
  return {glyphs, spills, readsStroke: reads && getComputedStyle(reads.querySelector('.react-flow__edge-path')).stroke,
    legend: legend && {
      glyphs: [...legend.querySelectorAll('.legend-glyph')].map(li => ({glyph: li.dataset.glyph, shape: li.dataset.shape, fill: li.dataset.fill || null,
        icon: li.dataset.icon || null, iconDrawn: (li.querySelector('svg.glyph-icon')?.children.length || 0) > 0})),
      kinds: [...legend.querySelectorAll('.legend-kind')].map(li => ({kind: li.dataset.kind, fill: li.dataset.fill || null})),
      links: [...legend.querySelectorAll('.legend-link')].map(li => ({link: li.dataset.link, color: li.dataset.color || null,
        stroke: li.querySelector('line') && getComputedStyle(li.querySelector('line')).stroke})),
      overlapsCanvas: !(lr.right <= canvas.left || lr.left >= canvas.right)}};
}"""


def _contrast(a, b):
    """WCAG contrast of two computed `rgb(r, g, b)` colours."""
    def lum(colour):
        r, g, b = (int(x) / 255 for x in colour[colour.index("(") + 1:colour.index(")")].split(",")[:3])
        return sum(w * (c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4) for w, c in zip((0.2126, 0.7152, 0.0722), (r, g, b)))
    hi, lo = sorted((lum(a), lum(b)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


def _legible(glyphs):
    """Every glyph with a declared fill keeps its label at WCAG AA contrast against that fill."""
    for id_, g in glyphs.items():
        if g["fill"].startswith("rgb("):
            assert _contrast(g["fill"], g["ink"]) >= 4.5, (id_, g)


def _rgb(hex_colour):
    h = hex_colour.lstrip("#")
    return "rgb({}, {}, {})".format(*(int(h[i:i + 2], 16) for i in (0, 2, 4)))


@pytest.fixture(scope="module")
def store(tmp_path_factory):
    if sync_playwright is None:
        pytest.skip("playwright no está instalado")
    if not shutil.which("spec2viz"):
        pytest.skip("sin el CLI de spec2viz")
    root = tmp_path_factory.mktemp("style")
    for spec in FIXTURES.glob("*.yml"):
        shutil.copy(spec, root / spec.name)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["spec2viz", "diagram", "sync", "component-infra.yml", "--notation", "infra.yml", "--store", ".sldb"],
                   cwd=root, check=True, capture_output=True)
    return root / ".sldb"


def _view(base):
    import json
    import urllib.request
    with urllib.request.urlopen(f"{base}/api/notation/view?spec={SPEC}") as response:
        return json.load(response)


def _open(page, base):
    page.goto(f"{base}/specs/notation")
    page.wait_for_function("() => document.querySelectorAll('.notation-canvas .react-flow__node').length >= 8"
                           " && document.querySelectorAll('.notation-canvas svg.glyph-icon').length >= 6", timeout=60000)
    page.wait_for_timeout(800)
    return page.evaluate(COLOURS)


def test_glyphs_wear_the_resolved_style_and_the_legend_explains_it(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.add_init_script("localStorage.setItem('kb-skin', 'light')")
            light = _open(page, base)
            glyphs = light["glyphs"]
            # Precedencia: glifo (hot) > style.kinds del spec (backend) > kind de la paleta (database...).
            assert glyphs["checkout"]["fill"] == _rgb("#fff1c2") and glyphs["checkout"]["stroke"] == _rgb("#b35900"), glyphs["checkout"]
            assert glyphs["checkout"]["icon"] == "workflow" and glyphs["checkout"]["iconDrawn"]
            assert glyphs["api"]["fill"] == _rgb("#e8f4e8") and glyphs["api"]["stroke"] == _rgb("#2e7d32"), glyphs["api"]
            assert glyphs["api"]["icon"] == "cpu" and glyphs["api"]["iconDrawn"]
            assert glyphs["db"]["icon"] == "database" and glyphs["db"]["fill"] not in ("rgba(0, 0, 0, 0)", "none"), glyphs["db"]
            # Formas: contorno SVG con el rótulo dentro.
            for id_, shape in (("db", "cylinder"), ("jobs", "queue"), ("payments", "cloud"), ("shared", "package"), ("memo", "note")):
                assert glyphs[id_]["shape"] == f"shape-{shape}" and glyphs[id_]["outline"], (id_, glyphs[id_])
            assert light["spills"] == 0, light
            _legible(glyphs)
            # Color de relación.
            assert light["readsStroke"] == _rgb("#0072b2"), light["readsStroke"]
            # Leyenda: todo glifo, kind y link de la vista, con el mismo estilo; no tapa el diagrama.
            legend = light["legend"]
            assert legend and not legend["overlapsCanvas"], legend
            expected = _view(base)["legend"]
            assert len(legend["glyphs"]) == len(expected["glyphs"]) == 7, legend["glyphs"]
            assert len(legend["kinds"]) == len(expected["kinds"]) == 2, legend["kinds"]
            assert len(legend["links"]) == len(expected["links"]) == 3, legend["links"]
            hot = next(g for g in legend["glyphs"] if g["glyph"].endswith("hot"))
            assert hot["fill"] == "#fff1c2" and hot["icon"] == "workflow" and hot["iconDrawn"], hot
            assert {g["shape"] for g in legend["glyphs"]} >= {"cylinder", "queue", "cloud", "package", "note", "box"}
            assert {k["kind"]: k["fill"] for k in legend["kinds"]}["backend"] == "#e8f4e8"
            reads = next(link for link in legend["links"] if link["link"].endswith("reads"))
            assert reads["color"] == "#0072b2" and reads["stroke"] == _rgb("#0072b2"), reads
            page.screenshot(path=str(store.parent / "style-light.png"))

            # Tema oscuro: cada color resuelto por tema cambia con el tema.
            page.click(".skin-toggle")
            page.wait_for_timeout(600)
            dark = page.evaluate(COLOURS)
            assert dark["glyphs"]["db"]["fill"] != glyphs["db"]["fill"], (dark["glyphs"]["db"], glyphs["db"])
            assert dark["glyphs"]["db"]["icon"] == "database"
            # Un relleno literal (#fff1c2, igual en los dos temas) conserva su texto oscuro en el tema oscuro.
            assert dark["glyphs"]["checkout"]["fill"] == _rgb("#fff1c2")
            _legible(dark["glyphs"])
            page.screenshot(path=str(store.parent / "style-dark.png"))
            assert not errors, errors
            browser.close()
    finally:
        process.terminate()
        process.wait()
