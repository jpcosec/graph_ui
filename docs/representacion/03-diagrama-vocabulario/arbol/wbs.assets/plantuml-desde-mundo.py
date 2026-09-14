"""Escribe la WBS en la sintaxis @startwbs de PlantUML desde el mundo: un asterisco por nivel, código, nombre
y esfuerzo. Los paquetes de trabajo (hojas) van en caja sin relleno.

Uso: python3 plantuml-desde-mundo.py paso-2.mundo.yaml > paso-2.puml
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
items = {f"WorkItem:{d['name']}": d["payload"] for d in world["documentos"]}
parent = {r["source"]: r["target"] for r in world["relaciones"] if r["type"] == "part_of"}
children = {}
for child, mother in parent.items():
    children.setdefault(mother, []).append(child)
code_key = lambda key: [int(x) for x in items[key]["code"].split(".")]
print("@startwbs")
print("<style>\nwbsDiagram {\n  .paquete {\n    BackgroundColor white\n  }\n}\n</style>")


def emit(key, depth):
    p = items[key]
    style = " <<paquete>>" if p["kind"] == "work_package" else ""
    print("*" * depth + f" {p['code']} {p['name']}\\n{p['effort']} líneas{style}")
    for child in sorted(children.get(key, []), key=code_key):
        emit(child, depth + 1)


for root in sorted(k for k in items if k not in parent):
    emit(root, 1)
print("@endwbs")
