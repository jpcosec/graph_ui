"""Dibuja el diagrama de features desde el mundo, con la convención de FODA/FeatureIDE aproximada en Graphviz:
punta llena en la hija mandatory, punta vacía en la optional, y el tipo de grupo (or, alternative) rotulado
en la madre en vez del arco que usa la notación. Las restricciones van en un recuadro aparte.

Uso: python3 diagrama-desde-mundo.py graph-ui.mundo.yaml > graph-ui.features.dot
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
feats = {d["name"]: d["payload"] for d in world["documentos"] if d["model"] == "Feature"}
parent = {r["source"].split(":", 1)[1]: r["target"].split(":", 1)[1] for r in world["relaciones"] if r["type"] == "subfeature_of"}
print("digraph features {")
print('  rankdir=TB; node [fontname="Liberation Sans", fontsize=11, shape=box]; edge [arrowsize=1.2];')
for name, f in feats.items():
    group = {"or": "\\n(or)", "alternative": "\\n(alternative)"}.get(f["group"], "")
    print(f'  "{name}" [label="{f["name"]}{group}"];')
for child, mother in parent.items():
    in_group = feats[mother]["group"] in ("or", "alternative")
    head = "none" if in_group else ("dot" if feats[child]["variability"] == "mandatory" else "odot")
    print(f'  "{mother}" -> "{child}" [arrowhead={head}];')
formulas = [d["payload"]["formula"].replace(">", "&gt;").replace("|", "&#124;") for d in world["documentos"] if d["model"] == "Constraint"]
if formulas:
    rows = "".join(f"<tr><td align='left'>{f}</td></tr>" for f in formulas)
    print(f'  restricciones [shape=plaintext, label=<<table border="1" cellborder="0"><tr><td><b>restricciones</b></td></tr>{rows}</table>>];')
print("}")
