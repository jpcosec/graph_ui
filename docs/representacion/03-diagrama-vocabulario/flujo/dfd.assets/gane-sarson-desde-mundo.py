"""Dibuja el DFD desde el mundo en notación Gane & Sarson: proceso como rectángulo redondeado con su
número arriba, almacén como rectángulo abierto a la derecha con su número en una celda, entidad externa
como rectángulo sombreado. Misma sintaxis abstracta que graph-ui.demarco.dot, otra sintaxis concreta.

Uso: python3 gane-sarson-desde-mundo.py graph-ui.mundo.yaml > graph-ui.gane-sarson.dot
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
print("digraph dfd_graph_ui {")
print('  rankdir=LR; node [fontname="Liberation Sans", fontsize=11]; edge [fontname="Liberation Sans", fontsize=9];')
for d in world["documentos"]:
    p, name = d["payload"], d["name"]
    if d["model"] == "ExternalEntity":
        print(f'  "{name}" [shape=box, style=filled, fillcolor="#dddddd", label="{p["name"]}"];')
    elif d["model"] == "Process":
        print(f'  "{name}" [shape=plaintext, label=<<table border="1" style="rounded" cellborder="0" cellspacing="0">'
              f'<tr><td border="1" sides="B">{p["number"]}</td></tr><tr><td>{p["name"]}</td></tr></table>>];')
    else:
        print(f'  "{name}" [shape=plaintext, label=<<table border="1" sides="LTB" cellborder="0" cellspacing="0">'
              f'<tr><td border="1" sides="R">{p["number"]}</td><td>{p["name"]}</td></tr></table>>];')
for r in world["relaciones"]:
    s, t = r["source"].split(":", 1)[1], r["target"].split(":", 1)[1]
    print(f'  "{s}" -> "{t}" [label="{r.get("notes", "")}"];')
print("}")
