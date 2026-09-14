"""Escribe un mapa mental de Mermaid desde el mundo, tratando varios verbos tipados como una sola jerarquía
y sin mostrar el tipo (el mapa mental de graph_ui como proyección con pérdida, no como datos sin tipo).

Uso: python3 mapa-desde-mundo.py manual.mundo.yaml axis_of folder_of chapter_of example_of > manual.mmd
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
hierarchy = set(sys.argv[2:])
title = {f"{d['model']}:{d['name']}": d["payload"]["title"] for d in world["documentos"]}
children = {}
has_parent = set()
for r in world["relaciones"]:
    if r["type"] in hierarchy:
        children.setdefault(r["target"], []).append(r["source"])
        has_parent.add(r["source"])
clean = lambda text: text.replace("(", "").replace(")", "").replace("[", "").replace("]", "").replace("`", "")
print("mindmap")


def emit(node, depth):
    label = clean(title[node])
    print("  " * (depth + 1) + (f"root(({label}))" if depth == 0 else label))
    for child in sorted(children.get(node, []), key=lambda c: title[c]):
        emit(child, depth + 1)


for root in sorted(k for k in title if k not in has_parent):
    emit(root, 0)
