"""E2E: class specs in the Specs view, in Chromium.

- R9: tests/fixtures/notation-class/class-records.yml has associations with multiplicities at both ends,
  several converging on one class. Every multiplicity sits next to its own edge's end (within 24 px of
  it), outside every class box, and clear of edge labels and other multiplicities.
"""
import shutil
import subprocess
from pathlib import Path

import pytest

from e2e_notation_legibility import _measure, _round_two, _serve, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "tests" / "fixtures" / "notation-class"
RECORDS = "class.records-multiplicities"

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
    if not shutil.which("spec2viz"):
        pytest.skip("sin el CLI de spec2viz")
    root = tmp_path_factory.mktemp("class")
    specs = sorted(FIXTURES.glob("*.yml"))
    for spec in specs:
        shutil.copy(spec, root / spec.name)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["spec2viz", "diagram", "sync", *[s.name for s in specs], "--store", ".sldb"], cwd=root, check=True, capture_output=True)
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
