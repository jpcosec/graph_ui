"""Dibuja el grafo AIF desde el mundo: I-nodes como cajas, RA-nodes (inferencias) y CA-nodes (conflictos)
como nodos propios. Una flecha que llega a un RA-node es un ataque a la inferencia, no a una afirmación.

Uso: python3 aif-desde-mundo.py vocabulario-aif.mundo.yaml > vocabulario-aif.dot
"""
import html
import sys
import textwrap

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
print("digraph aif {")
print('  rankdir=BT; node [fontname="Liberation Sans", fontsize=10]; edge [fontname="Liberation Sans", fontsize=9];')
for d in world["documentos"]:
    p = d["payload"]
    if d["model"] == "INode":
        text = "<br/>".join(html.escape(line) for line in textwrap.wrap(p["text"], 30))
        print(f'  "{d["name"]}" [shape=box, label=<{text}>];')
    else:
        color = "#b7e4b0" if d["model"] == "RANode" else "#f4b6b6"
        kind = "RA" if d["model"] == "RANode" else "CA"
        print(f'  "{d["name"]}" [shape=ellipse, style=filled, fillcolor="{color}", label="{kind}\\n{p["scheme"]}"];')
for r in world["relaciones"]:
    print(f'  "{r["source"].split(":", 1)[1]}" -> "{r["target"].split(":", 1)[1]}" [label="{r["type"]}"];')
print("}")
