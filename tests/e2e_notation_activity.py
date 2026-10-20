"""E2E: activity specs in the Specs view (spec2viz contract §14), in Chromium.

tests/fixtures/notation-activity/activity-lanes.yml has partitions: UML swimlanes, one column per
partition in order of first appearance, with the flow going down. It checks that every step sits in
its partition's column, that the lanes are side by side in that order, that each forward step is
below the one before, that notes sit beside their step in the same lane, and the legibility rules
(including R6: each guard closer to its own branch).

tests/fixtures/notation-activity/activity-notes-merge.yml has no partition, so it keeps the ELK
layout path (no regression). It checks:

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
NOTES, LANES = "activity.notes-merge", "activity.lanes-notes-merge"
# Partition of each step of activity-lanes.yml (the fixture's own data).
PARTITION = {"write": "Author", "push": "Author", "build": "Build server", "green": "Build server", "fix": "Author",
             "review": "Reviewer", "verdict": "Reviewer", "merge_now": "Reviewer", "queue": "Reviewer", "announce": "Author"}

SWIMLANES = r"""() => {
  const rect = el => el.getBoundingClientRect();
  const lanes = [...document.querySelectorAll('.notation-canvas .glyph.shape-partition')].map(g => {
    const r = rect(g); return {name: g.querySelector('.glyph-head').innerText.trim(), left: r.left, right: r.right, top: r.top, bottom: r.bottom};
  }).sort((a, b) => a.left - b.left);
  const steps = {};
  for (const n of document.querySelectorAll('.notation-canvas .react-flow__node')) {
    const g = n.querySelector('.glyph'); if (!g || g.classList.contains('shape-partition')) continue;
    const r = rect(g); steps[n.dataset.id.split('.').pop()] = {left: r.left, right: r.right, top: r.top, bottom: r.bottom, cy: (r.top + r.bottom) / 2};
  }
  return {lanes, steps};
}"""

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


def test_partitions_are_uml_swimlanes(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            result = _measure(page, LANES)
            assert result["minTextPx"] >= 10, result
            assert result["labelOverlaps"] == 0 and result["spills"] == 0 and result["crossings"] == 0, result
            _round_two(result)
            assert result["guards"] >= 4 and result["minGuardMargin"] >= 8, result
            lanes = page.evaluate(SWIMLANES)
            # Una columna por partición, en orden de aparición, lado a lado y de la misma altura.
            assert [l["name"] for l in lanes["lanes"]] == ["Author", "Build server", "Reviewer"], lanes["lanes"]
            for a, b in zip(lanes["lanes"], lanes["lanes"][1:]):
                assert a["right"] <= b["left"] + 1 and abs(a["top"] - b["top"]) < 1 and abs(a["bottom"] - b["bottom"]) < 1, (a, b)
            column = {l["name"]: l for l in lanes["lanes"]}
            steps = lanes["steps"]
            for step, partition in PARTITION.items():
                box, lane = steps[step], column[partition]
                assert lane["left"] - 1 <= box["left"] and box["right"] <= lane["right"] + 1, (step, partition, box, lane)
            # El flujo baja: cada paso hacia adelante, más abajo que el anterior.
            for a, b in [("write", "push"), ("push", "build"), ("build", "green"), ("green", "review"), ("review", "verdict"),
                         ("verdict", "merge_now"), ("verdict", "queue"), ("merge_now", "join"), ("join", "announce"), ("announce", "end")]:
                assert steps[b]["top"] >= steps[a]["bottom"], (a, b)
            # Cada nota al lado de su paso, en su misma fila y carril.
            activity = page.evaluate(ACTIVITY)
            for note in activity["notes"]:
                step = note["step"].split(".")[-1]
                nb, sb, lane = steps[note["id"].split(".")[-1]], steps[step], column[PARTITION[step]]
                assert nb["left"] >= sb["right"] and abs(nb["cy"] - sb["cy"]) < 2 and nb["right"] <= lane["right"] + 1, (note, nb, sb)
                assert note["dash"] not in (None, "", "none") and not note["marker"], note
            assert [m["label"] for m in activity["merges"]] == [""], activity["merges"]
            page.screenshot(path=str(store.parent / "lanes.png"))
            assert not errors, errors
            browser.close()
    finally:
        process.terminate()
        process.wait()
