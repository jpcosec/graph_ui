"""Reglas RACI que el sustrato no declara: al menos un R por tarea (el A único sí lo hace cumplir
accountable many_to_one), exactamente un A, y una sola letra por celda salvo A/R.

Uso: python3 verificar-raci.py reserva.mundo.yaml
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
acts = [d["name"] for d in world["documentos"] if d["model"] == "Activity"]
by_act = {a: {} for a in acts}
cells = {}
for r in world["relaciones"]:
    a, role = r["source"].split(":", 1)[1], r["target"].split(":", 1)[1]
    by_act[a].setdefault(r["type"], []).append(role)
    cells.setdefault((a, role), set()).add(r["type"])
problems = []
for a in acts:
    if not by_act[a].get("responsible"):
        problems.append(f"SIN R: {a}")
    if len(by_act[a].get("accountable", [])) != 1:
        problems.append(f"A != 1: {a} tiene {len(by_act[a].get('accountable', []))}")
for (a, role), verbs in sorted(cells.items()):
    if len(verbs) > 1 and verbs != {"responsible", "accountable"}:
        problems.append(f"CELDA CON {'/'.join(sorted(verbs))}: {a} × {role}")
for line in problems:
    print(line)
print(f"{len(acts)} tareas, {len(problems)} problema(s)")
