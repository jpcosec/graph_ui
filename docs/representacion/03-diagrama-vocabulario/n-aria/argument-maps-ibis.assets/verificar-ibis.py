"""Reglas retóricas de IBIS que el sustrato no declara: cada argumento apoya u objeta exactamente una
posición (no las dos cosas, no ninguna) y cada posición responde a una pregunta.

Uso: python3 verificar-ibis.py vocabulario.mundo.yaml
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
kind = {f"{d['model']}:{d['name']}": d["model"] for d in world["documentos"]}
out = {k: [] for k in kind}
for r in world["relaciones"]:
    out[r["source"]].append((r["type"], r["target"]))
problems = []
for node, k in kind.items():
    if k == "Argument":
        stance = [(t, g) for t, g in out[node] if t in ("supports", "objects_to")]
        if len(stance) != 1:
            problems.append(f"ARGUMENTO CON {len(stance)} POSTURAS: {node} -> " + ", ".join(f"{t} {g}" for t, g in stance))
    if k == "Position" and not any(t == "responds_to" for t, _ in out[node]):
        problems.append(f"POSICIÓN SIN PREGUNTA: {node}")
for line in problems:
    print(line)
print(f"{sum(k == 'Argument' for k in kind.values())} argumentos, {len(problems)} problema(s)")
