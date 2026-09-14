"""Dibuja la red desde el mundo con Graphviz: lugares como círculos con sus marcas, transiciones como
rectángulos negros, arcos con su peso cuando es mayor que 1.

Uso: python3 dot-desde-mundo.py mesas.mundo.yaml > mesas.dot && dot -Tsvg mesas.dot -o mesas.svg
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
print("digraph mesas {")
print('  rankdir=LR; node [fontname="Helvetica"]; edge [fontname="Helvetica"];')
for doc in world["documentos"]:
    p = doc["payload"]
    if doc["model"] == "Place":
        tokens = "●" * p["tokens"]
        print(f'  "{doc["name"]}" [shape=circle, width=1.55, fixedsize=true, fontsize=11, label="{p["label"]}\\n{tokens}"];')
    else:
        print(f'  "{doc["name"]}" [shape=box, style=filled, fillcolor=black, fontcolor=white, fontsize=11, label="{p["label"]}"];')
for rel in world["relaciones"]:
    source, target = rel["source"].split(":", 1)[1], rel["target"].split(":", 1)[1]
    weight = rel.get("notes", "peso=1").split("=")[1]
    label = f' [label="{weight}"]' if weight != "1" else ""
    print(f'  "{source}" -> "{target}"{label};')
print("}")
