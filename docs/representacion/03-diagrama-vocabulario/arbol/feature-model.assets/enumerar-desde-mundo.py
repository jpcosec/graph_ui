"""Cuenta las configuraciones válidas leyendo el mundo (fuerza bruta sobre las features): la raíz está, una
hija implica a su madre, una mandatory de una madre elegida está, un grupo or pide al menos una hija, un
alternative exactamente una, y las fórmulas de Constraint se evalúan como texto UVL traducido a Python.
Tiene que dar lo mismo que flamapy.

Uso: python3 enumerar-desde-mundo.py graph-ui.mundo.yaml
"""
import re
import sys
from itertools import product

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
feats = {f"Feature:{d['name']}": d["payload"] for d in world["documentos"] if d["model"] == "Feature"}
parent = {r["source"]: r["target"] for r in world["relaciones"] if r["type"] == "subfeature_of"}
children = {k: [c for c, p in parent.items() if p == k] for k in feats}
formulas = [d["payload"]["formula"] for d in world["documentos"] if d["model"] == "Constraint"]
keys = sorted(feats)
names = {feats[k]["name"]: k for k in keys}


def to_python(formula):
    tokens = re.findall(r'"[^"]+"|=>|<=>|[|&!()]|[\w]+', formula)
    out = []
    for t in tokens:
        out.append({"=>": " <= ", "<=>": " == ", "|": " or ", "&": " and ", "!": " not ", "(": "(", ")": ")"}.get(t) or f"s[{names[t.strip(chr(34))]!r}]")
    return "".join(out)


checks = [compile(to_python(f), f, "eval") for f in formulas]
valid, core, alive = 0, set(keys), set()
for bits in product((False, True), repeat=len(keys)):
    s = dict(zip(keys, bits))
    if not all(s[k] for k in keys if k not in parent):
        continue
    if any(s[k] and not s[parent[k]] for k in parent):
        continue
    ok = True
    for k, f in feats.items():
        if not s[k]:
            continue
        chosen = [c for c in children[k] if s[c]]
        if f["group"] == "and" and any(not s[c] for c in children[k] if feats[c]["variability"] == "mandatory"):
            ok = False
        if f["group"] == "or" and not chosen:
            ok = False
        if f["group"] == "alternative" and len(chosen) != 1:
            ok = False
    if not ok or not all(eval(c, {}, {"s": s}) for c in checks):
        continue
    valid += 1
    core &= {k for k in keys if s[k]}
    alive |= {k for k in keys if s[k]}
print(f"configuraciones: {valid}")
print(f"núcleo: {sorted(feats[k]['name'] for k in core)}")
print(f"muertas: {sorted(feats[k]['name'] for k in set(keys) - alive)}")
