"""The representation manual (docs/representacion/) stays navigable.

Every relative Markdown link resolves, and every index.md links each document and subfolder
index that sits next to it, so a document is never written without being reachable.
"""
import re
from pathlib import Path

ROOT = Path(__file__).parents[1] / "docs" / "representacion"
LINK = re.compile(r"\]\(([^)\s]+)\)")


def _relative_links(md: Path):
    for target in LINK.findall(md.read_text(encoding="utf-8")):
        if re.match(r"^[a-z]+:", target) or target.startswith("#"):
            continue
        yield target.split("#", 1)[0]


def test_relative_links_resolve():
    broken = []
    for md in ROOT.rglob("*.md"):
        for target in _relative_links(md):
            if target and not (md.parent / target).exists():
                broken.append(f"{md.relative_to(ROOT)} -> {target}")
    assert not broken, "enlaces rotos:\n" + "\n".join(broken)


def test_every_index_links_its_documents():
    missing = []
    for index in ROOT.rglob("index.md"):
        linked = {(index.parent / t).resolve() for t in _relative_links(index) if t}
        expected = [p for p in index.parent.glob("*.md") if p.name != "index.md"]
        expected += [d / "index.md" for d in index.parent.iterdir() if (d / "index.md").exists()]
        missing += [f"{index.relative_to(ROOT)} no enlaza {p.relative_to(ROOT)}"
                    for p in expected if p.resolve() not in linked]
    assert not missing, "\n".join(missing)
