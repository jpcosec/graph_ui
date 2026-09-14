"""Traduce el subconjunto de UVL que usa graph-ui.uvl (árbol con mandatory, optional, or, alternative y
restricciones en líneas) a un mundo pron: Feature con variability y group, subfeature_of, y Constraint con la
fórmula como texto.

Uso: python3 mundo-desde-uvl.py graph-ui.uvl > graph-ui.mundo.yaml
"""
import re
import sys

import yaml

GROUPS = {"mandatory", "optional", "or", "alternative"}
lines = [l for l in open(sys.argv[1], encoding="utf-8").read().splitlines() if l.strip() and not l.strip().startswith("//")]
slug = lambda name: "f-" + re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
features, rels, constraints = {}, [], []
stack = []  # (indent, kind, name)
section = None
for line in lines:
    stripped = line.strip()
    if stripped in ("features", "constraints"):
        section = stripped
        continue
    if section == "constraints":
        constraints.append(stripped)
        continue
    indent = len(line) - len(line.lstrip())
    while stack and stack[-1][0] >= indent:
        stack.pop()
    if stripped in GROUPS:
        stack.append((indent, "group", stripped))
        continue
    name = stripped.strip('"')
    group = stack[-1][2] if stack and stack[-1][1] == "group" else None
    parent = next((n for _, k, n in reversed(stack) if k == "feature"), None)
    features[name] = {"name": name, "variability": "optional" if group in ("optional", "or", "alternative") else "mandatory", "group": "and"}
    if parent:
        rels.append({"type": "subfeature_of", "source": f"Feature:{slug(name)}", "target": f"Feature:{slug(parent)}"})
        if group in ("or", "alternative"):
            features[parent]["group"] = group
    stack.append((indent, "feature", name))
docs = [{"model": "Feature", "name": slug(n), "payload": p} for n, p in features.items()]
docs += [{"model": "Constraint", "name": f"c-{i}", "payload": {"formula": c}} for i, c in enumerate(constraints, 1)]
for i, c in enumerate(constraints, 1):
    for name in features:
        if re.search(rf"(?<![\w\"]){re.escape(name)}(?![\w\"])|\"{re.escape(name)}\"", c):
            rels.append({"type": "mentions", "source": f"Constraint:c-{i}", "target": f"Feature:{slug(name)}"})
world = {
    "modelos": [
        {"name": "Feature", "family": "variabilidad",
         "template": "---\nname: ⸢rev•name⸥\nvariability: ⸢rev•variability⸥\ngroup: ⸢rev•group⸥\n---\n\n# ⸢render•name⸥\n",
         "fields": [{"name": "name", "type": "str", "description": "Nombre de la feature."},
                    {"name": "variability", "type": "str", "description": "mandatory u optional respecto de su padre (en grupos or y alternative, optional)."},
                    {"name": "group", "type": "str", "default": "and", "description": "Cómo se eligen sus hijas: and (cada una por su variability), or (al menos una), alternative (exactamente una)."}]},
        {"name": "Constraint", "family": "variabilidad",
         "template": "---\nformula: ⸢rev•formula⸥\n---\n\n# Restricción\n",
         "fields": [{"name": "formula", "type": "str", "description": "Fórmula proposicional sobre nombres de features, en sintaxis UVL."}]},
    ],
    "tipos_de_relacion": [
        {"name": "subfeature_of", "cardinality": "many_to_one", "axis": "WHAT", "source_types": ["Feature"], "target_types": ["Feature"], "description": "La feature origen refina a la destino."},
        {"name": "mentions", "cardinality": "many_to_many", "axis": "WHAT", "source_types": ["Constraint"], "target_types": ["Feature"], "description": "La restricción nombra a la feature (la fórmula queda en el campo)."},
    ],
    "documentos": docs, "relaciones": rels,
}
print("# Modelo de variabilidad de graph-ui.uvl como mundo pron (generado por mundo-desde-uvl.py).")
print(yaml.safe_dump(world, allow_unicode=True, sort_keys=False, width=140), end="")
