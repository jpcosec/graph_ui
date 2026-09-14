"""Dibuja la actividad desde el mundo con los símbolos de UML 2.5.1 (15.3.4): inicial como círculo lleno,
final como diana, fork y join como barra, decision y merge como rombo, acción redondeada, objeto rectangular.

Uso: python3 dot-desde-mundo.py pedido.mundo.yaml > pedido.dot && dot -Tsvg pedido.dot -o pedido.desde-mundo.svg
"""
import sys

import yaml

SHAPES = {
    "initial": 'shape=circle, style=filled, fillcolor=black, width=0.25, label=""',
    "activity_final": 'shape=doublecircle, style=filled, fillcolor=black, width=0.2, label=""',
    "flow_final": 'shape=circle, width=0.25, label="X"',
    "fork": 'shape=box, style=filled, fillcolor=black, width=1.6, height=0.06, label=""',
    "join": 'shape=box, style=filled, fillcolor=black, width=1.6, height=0.06, label=""',
    "decision": 'shape=diamond, width=0.35, height=0.35, label=""',
    "merge": 'shape=diamond, width=0.35, height=0.35, label=""',
}
world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
print("digraph actividad {")
print('  node [fontname="Helvetica", fontsize=11]; edge [fontname="Helvetica", fontsize=10];')
for d in world["documentos"]:
    p = d["payload"]
    if d["model"] == "ControlNode":
        attrs = SHAPES[p["kind"]]
        if p.get("label"):
            attrs += f', xlabel="{p["label"]}"'
    elif d["model"] == "ObjectNode":
        attrs = f'shape=box, label="{p["name"]}"'
    else:
        attrs = f'shape=box, style=rounded, label="{p["name"]}"'
    print(f'  "{d["name"]}" [{attrs}];')
for r in world["relaciones"]:
    s, t = r["source"].split(":", 1)[1], r["target"].split(":", 1)[1]
    label = f' [label="{r["notes"]}"]' if r.get("notes") else ""
    print(f'  "{s}" -> "{t}"{label};')
print("}")
