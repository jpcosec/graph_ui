"""Reglas de árbol sobre la unión de varios verbos de jerarquía: un solo padre por nodo, una sola raíz,
sin ciclos. Cada verbo many_to_one por separado no alcanza para ninguna de las tres.

Uso: python3 verificar-arbol.py manual.mundo.yaml axis_of folder_of chapter_of example_of
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
hierarchy = set(sys.argv[2:])
nodes = {f"{d['model']}:{d['name']}" for d in world["documentos"]}
parents = {}
for r in world["relaciones"]:
    if r["type"] in hierarchy:
        parents.setdefault(r["source"], []).append((r["type"], r["target"]))
problems = [f"DOS PADRES: {n} -> " + ", ".join(f"{t} {p}" for t, p in ps) for n, ps in sorted(parents.items()) if len(ps) > 1]
roots = sorted(nodes - parents.keys())
if len(roots) != 1:
    problems.append(f"{len(roots)} RAÍCES: {', '.join(roots)}")
for n in sorted(parents):
    seen, current = {n}, parents[n][0][1]
    while current in parents:
        if current in seen:
            problems.append(f"CICLO desde {n}")
            break
        seen.add(current)
        current = parents[current][0][1]
for line in problems:
    print(line)
print(f"{len(nodes)} nodos, {len(problems)} problema(s)")
