"""E2E: sequence specs in the Specs view, in Chromium.

tests/fixtures/notation-sequence/sequence-wide.yml has eleven participants (an actor, a boundary and
nine components), more than fit across the canvas at 100 %, grouped messages, self calls and replies.

- R12: every sample of the notation's legend stays in its own row: inside the row's box, clear of the
  legend's title, and the actor figure no taller than its sample.
"""
import shutil
import subprocess
from pathlib import Path

import pytest

from e2e_notation_legibility import _serve, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "tests" / "fixtures" / "notation-sequence"
SPEC = "sequence.wide-request"

LEGEND = r"""() => {
  const legend = document.querySelector('.notation-legend'), title = legend.querySelector('h3').getBoundingClientRect();
  return [...legend.querySelectorAll('li')].map((li) => {
    const row = li.getBoundingClientRect(), swatch = li.querySelector('.legend-swatch');
    const s = (swatch || li).getBoundingClientRect(), before = swatch ? getComputedStyle(swatch, '::before') : null;
    return {item: li.innerText.replace(/\s+/g, ' ').trim(), shape: li.dataset.shape || null,
            inside: s.top >= row.top - 0.5 && s.bottom <= row.bottom + 0.5 && s.left >= row.left - 0.5 && s.right <= row.right + 0.5,
            clearOfTitle: s.top >= title.bottom - 0.5,
            clipped: swatch ? getComputedStyle(swatch).overflow === 'hidden' : true,
            figure: before && before.content !== 'none' ? parseFloat(before.fontSize) <= s.height + 0.5 : true};
  });
}"""


@pytest.fixture(scope="module")
def store(tmp_path_factory):
    if sync_playwright is None:
        pytest.skip("playwright no está instalado")
    if not shutil.which("spec2viz"):
        pytest.skip("sin el CLI de spec2viz")
    root = tmp_path_factory.mktemp("sequence")
    specs = sorted(FIXTURES.glob("*.yml"))
    for spec in specs:
        shutil.copy(spec, root / spec.name)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["spec2viz", "diagram", "sync", *[s.name for s in specs], "--store", ".sldb"], cwd=root, check=True, capture_output=True)
    return root / ".sldb"


def _open(page, base):
    page.goto(f"{base}/specs/notation")
    page.wait_for_selector(".notation-catalog button", timeout=30000)
    page.click(f'[data-spec="{SPEC}"]')
    page.wait_for_selector(".notation-lanes", timeout=30000)
    page.wait_for_timeout(600)


def test_r12_legend_samples_stay_in_their_rows(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            _open(page, base)
            rows = page.evaluate(LEGEND)
            assert any(r["shape"] == "stick-figure" for r in rows), rows
            bad = [r for r in rows if not (r["inside"] and r["clearOfTitle"] and r["clipped"] and r["figure"])]
            assert not bad, bad
            browser.close()
    finally:
        process.terminate()
        process.wait()
