"""E2E: activity specs in the Specs view (spec2viz contract §14), in Chromium.

tests/fixtures/notation-activity/activity-notes-merge.yml has no partition, so it keeps the ELK
layout path. It checks:

- each UML note (`data.notes`) is a note glyph with that text, joined to its own step by a dotted
  line with no arrowhead;
- the merge (`kind: merge`) is a diamond with no label, where the two branches arrive and one flow
  leaves;
- no lane is drawn, and the usual legibility rules hold after «Ver todo»: text >= 10 px, no label
  overlaps or spills, no edge through a node, edge ends on their nodes, labels next to their edge.
"""
import shutil
import subprocess
from pathlib import Path

import pytest

from e2e_notation_legibility import _measure, _round_two, _serve, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "tests" / "fixtures" / "notation-activity"
NOTES = "activity.notes-merge"

ACTIVITY = r"""() => {
  const glyph = id => document.querySelector(`.notation-canvas .react-flow__node[data-id="${CSS.escape(id)}"] .glyph`);
  const edges = [...document.querySelectorAll('.notation-canvas .react-flow__edge')].map(e => {
    const path = e.querySelector('.react-flow__edge-path'), ends = e.querySelector('.notation-edge-ends');
    return {source: ends?.dataset.source, target: ends?.dataset.target, dash: path?.getAttribute('stroke-dasharray') || getComputedStyle(path).strokeDasharray,
            marker: path?.getAttribute('marker-end') || ''};
  });
  const notes = [...document.querySelectorAll('.notation-canvas .glyph[data-function="note"]')].map(g => {
    const id = g.closest('.react-flow__node').dataset.id;
    const link = edges.find(e => e.target === id);
    return {id, text: g.querySelector('.glyph-label').innerText.replace(/\s+/g, ' ').trim(), shape: [...g.classList].find(c => c.startsWith('shape-')),
            step: link?.source || null, dash: link?.dash || null, marker: link?.marker || null};
  });
  const merges = [...document.querySelectorAll('.notation-canvas .glyph.shape-diamond[data-function="merge"]')].map(g => {
    const id = g.closest('.react-flow__node').dataset.id;
    return {id, label: g.querySelector('.glyph-diamond-label')?.textContent || '',
            incoming: edges.filter(e => e.target === id).length, outgoing: edges.filter(e => e.source === id).length};
  });
  return {notes, merges, lanes: document.querySelectorAll('.notation-canvas .glyph.is-container').length};
}"""


@pytest.fixture(scope="module")
def store(tmp_path_factory):
    if sync_playwright is None:
        pytest.skip("playwright no está instalado")
    if not shutil.which("spec2viz"):
        pytest.skip("sin el CLI de spec2viz")
    root = tmp_path_factory.mktemp("activity")
    specs = sorted(FIXTURES.glob("*.yml"))
    for spec in specs:
        shutil.copy(spec, root / spec.name)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["spec2viz", "diagram", "sync", *[s.name for s in specs], "--store", ".sldb"], cwd=root, check=True, capture_output=True)
    return root / ".sldb"


def test_notes_and_merge_without_partitions_keep_the_elk_path(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            result = _measure(page, NOTES)
            assert result["minTextPx"] >= 10, result
            assert result["labelOverlaps"] == 0 and result["spills"] == 0 and result["crossings"] == 0, result
            _round_two(result)
            activity = page.evaluate(ACTIVITY)
            assert activity["lanes"] == 0, activity
            notes = {n["step"].split(".")[-1]: n for n in activity["notes"]}
            assert set(notes) == {"push", "review"}, activity["notes"]
            assert notes["push"]["text"] == "Never push straight to the main branch."
            assert notes["review"]["text"] == "A review looks at intent, not only at style."
            for note in notes.values():
                assert note["shape"] == "shape-note" and note["dash"] not in (None, "", "none") and not note["marker"], note
            assert len(activity["merges"]) == 1, activity["merges"]
            merge = activity["merges"][0]
            assert merge["label"] == "" and merge["incoming"] == 2 and merge["outgoing"] == 1, merge
            page.screenshot(path=str(store.parent / "notes-merge.png"))
            assert not errors, errors
            browser.close()
    finally:
        process.terminate()
        process.wait()
