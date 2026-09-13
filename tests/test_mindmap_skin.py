"""Skin layer: theme tokens as CSS custom properties, class identity as
stable slots. Real files on disk, no mocks — this is the acceptance check
for Phase A of the skin refactor.
"""
import re
from pathlib import Path

MINDMAP = Path(__file__).parents[1] / "frontends" / "mindmap"
SKINS_DIR = MINDMAP / "skins"

HEX_RE = re.compile(r'#[0-9a-fA-F]{3,8}')
VAR_DEF_RE = re.compile(r'--[a-zA-Z0-9-]+(?=\s*:)')
VAR_USE_RE = re.compile(r'var\(\s*(--[a-zA-Z0-9-]+)')


def _source_files():
    files = []
    for pattern in ("*.js", "*.mjs"):
        files.extend(MINDMAP.glob(pattern))
        files.extend((MINDMAP / "shell").glob(pattern))
        files.extend((MINDMAP / "shared").glob(pattern))
    # CSS now lives split across styles/ and views/**/*.css (Phase E), not
    # just the top-level file — scan the whole mindmap tree for it.
    files.extend(MINDMAP.rglob("*.css"))
    return files


def test_no_hardcoded_hex_outside_skins():
    offenders = {}
    for path in _source_files():
        if SKINS_DIR in path.parents:
            continue
        hits = HEX_RE.findall(path.read_text(encoding="utf-8"))
        if hits:
            offenders[str(path)] = hits
    assert not offenders, f"hex literals leaked outside skins/: {offenders}"


def test_light_and_dark_skins_define_the_same_tokens():
    light = VAR_DEF_RE.findall((SKINS_DIR / "light.css").read_text(encoding="utf-8"))
    dark = VAR_DEF_RE.findall((SKINS_DIR / "dark.css").read_text(encoding="utf-8"))
    light_set, dark_set = set(light), set(dark)
    assert light_set == dark_set, (
        f"only in light: {light_set - dark_set}; only in dark: {dark_set - light_set}"
    )
    for n in range(1, 24):
        assert f"--class-color-{n}" in light_set, f"missing --class-color-{n}"
    # no duplicated definitions inside a single skin
    assert len(light) == len(light_set), "duplicate token definitions in light.css"
    assert len(dark) == len(dark_set), "duplicate token definitions in dark.css"


def test_every_var_reference_is_defined_in_the_skins():
    light_tokens = set(VAR_DEF_RE.findall((SKINS_DIR / "light.css").read_text(encoding="utf-8")))
    missing = {}
    for path in _source_files():
        if SKINS_DIR in path.parents:
            continue
        text = path.read_text(encoding="utf-8")
        used = set(VAR_USE_RE.findall(text))
        # --class-color and --idea-color are set inline (per-element style), not skin tokens.
        used = {u for u in used if not u.startswith("--class-color") and u != "--idea-color"}
        gap = used - light_tokens
        if gap:
            missing[str(path)] = gap
    assert not missing, f"var(--x) referenced but not defined by the skins: {missing}"


def test_class_slots_and_fallback_slots_are_in_range():
    text = (MINDMAP / "shared" / "classes.mjs").read_text(encoding="utf-8")
    slots = [int(n) for n in re.findall(r'slot\s*:\s*(\d+)', text)]
    assert slots, "no se encontraron slots en shared/classes.mjs"
    for s in slots:
        assert 1 <= s <= 23, f"slot fuera de rango: {s}"
    fallback_match = re.search(r'FALLBACK_SLOTS\s*=\s*\[([^\]]+)\]', text)
    assert fallback_match, "FALLBACK_SLOTS no encontrado"
    fallback_slots = [int(n) for n in re.findall(r'\d+', fallback_match.group(1))]
    assert fallback_slots, "FALLBACK_SLOTS está vacío"
    for s in fallback_slots:
        assert 1 <= s <= 23, f"slot de fallback fuera de rango: {s}"
