"""Genera un treemap de Mermaid desde el mundo: jerarquía por in_folder, área por SourceFile.lines.

Uso: python3 treemap-desde-mundo.py mindmap.mundo.yaml > mindmap.mmd

Las carpetas no tienen tamaño en el mundo; el renderer lo suma desde las hojas, que es la regla de
Shneiderman (1992): cada nodo interior tiene el tamaño total de su subárbol.
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
docs = {f"{d['model']}:{d['name']}": d for d in world["documentos"]}
children = {}
for r in world["relaciones"]:
    if r["type"] == "in_folder":
        children.setdefault(r["target"], []).append(r["source"])


def emit(node, depth):
    d = docs[node]
    indent = "    " * depth
    if d["model"] == "SourceFile":
        print(f'{indent}"{d["payload"]["name"]}": {d["payload"]["lines"]}')
        return
    print(f'{indent}"{d["payload"]["name"]}"')
    for child in sorted(children.get(node, [])):
        emit(child, depth + 1)


print("treemap-beta")
emit("Folder:mindmap", 0)
