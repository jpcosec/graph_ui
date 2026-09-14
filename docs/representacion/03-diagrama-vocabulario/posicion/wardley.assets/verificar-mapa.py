"""Reglas del vocabulario Wardley que el sustrato no declara: posiciones dentro del mapa y cadena sin ciclos.

Uso: python3 verificar-mapa.py tea-shop.mundo.yaml
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
docs = {f"{d['model']}:{d['name']}": d for d in world["documentos"]}
problems = []
for key, doc in docs.items():
    for field in ("visibility", "maturity", "evolving_to"):
        value = doc["payload"].get(field)
        if value is not None and not 0 <= value <= 1:
            problems.append(f"FUERA DEL MAPA: {key}.{field} = {value}")

needs = {}
for rel in world["relaciones"]:
    if rel["type"] == "needs":
        needs.setdefault(rel["source"], []).append(rel["target"])


def cycle_from(node, path):
    for nxt in needs.get(node, []):
        if nxt in path:
            return path[path.index(nxt):] + [nxt]
        found = cycle_from(nxt, path + [nxt])
        if found:
            return found
    return None


for start in sorted(needs):
    cycle = cycle_from(start, [start])
    if cycle and cycle[0] == start:
        problems.append("CICLO EN LA CADENA: " + " -> ".join(cycle))
        break

for line in problems:
    print(line)
print(f"{len(docs)} elementos, {len(problems)} problema(s)")
