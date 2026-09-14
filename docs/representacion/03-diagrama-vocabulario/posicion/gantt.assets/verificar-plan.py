"""Verifica las reglas de un Gantt sobre el mundo: fin >= inicio, y una tarea no empieza antes de que
terminen las tareas de las que depende.

Uso: python3 verificar-plan.py manual.mundo.yaml

Estas reglas no las puede expresar kgdb (comparan campos de dos documentos unidos por una arista, o
dos campos del mismo documento); si existen, las aplica el vocabulario.
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
tasks = {f"Task:{d['name']}": d["payload"] for d in world["documentos"] if d["model"] == "Task"}
problemas = 0
for key, t in tasks.items():
    if t["end"] < t["start"]:
        problemas += 1
        print(f"FIN ANTES DEL INICIO: {key} ({t['start']} -> {t['end']})")
for r in world["relaciones"]:
    if r["type"] == "depends_on" and tasks[r["source"]]["start"] < tasks[r["target"]]["end"]:
        problemas += 1
        print(f"EMPIEZA ANTES QUE SU DEPENDENCIA: {r['source']} empieza {tasks[r['source']]['start']}, "
              f"{r['target']} termina {tasks[r['target']]['end']}")
print(f"{len(tasks)} tareas, {problemas} problema(s)")
