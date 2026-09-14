"""Reglas de WBS que el sustrato no declara: regla del 100 % (el esfuerzo de un entregable es la suma de sus
hijos), códigos únicos y coherentes con la posición (el código del hijo extiende el de su madre), y las hojas
son paquetes de trabajo.

Uso: python3 verificar-wbs.py paso-2.mundo.yaml
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
items = {f"WorkItem:{d['name']}": d["payload"] for d in world["documentos"]}
parent = {r["source"]: r["target"] for r in world["relaciones"] if r["type"] == "part_of"}
children = {}
for child, mother in parent.items():
    children.setdefault(mother, []).append(child)
problems, seen = [], {}
for key, p in sorted(items.items()):
    if p["code"] in seen:
        problems.append(f"CÓDIGO REPETIDO: {p['code']} en {seen[p['code']]} y {key}")
    seen.setdefault(p["code"], key)
    if key in parent and not p["code"].startswith(items[parent[key]]["code"] + "."):
        problems.append(f"CÓDIGO FUERA DE LUGAR: {key} tiene {p['code']} y su madre {items[parent[key]]['code']}")
    kids = children.get(key, [])
    if kids:
        total = sum(items[k]["effort"] for k in kids)
        if total != p["effort"]:
            problems.append(f"REGLA DEL 100 %: {p['code']} dice {p['effort']} y sus hijos suman {total}")
    elif p["kind"] != "work_package":
        problems.append(f"HOJA QUE NO ES PAQUETE: {p['code']}")
for line in problems:
    print(line)
print(f"{len(items)} elementos, {len(problems)} problema(s)")
