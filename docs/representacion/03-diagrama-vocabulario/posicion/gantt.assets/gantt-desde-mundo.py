"""Genera un Gantt de Mermaid desde el mundo: eje x = tiempo (start, end), secciones = part_of.

Uso: python3 gantt-desde-mundo.py manual.mundo.yaml > manual.mmd
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
docs = {f"{d['model']}:{d['name']}": d for d in world["documentos"]}
phase_of = {r["source"]: r["target"] for r in world["relaciones"] if r["type"] == "part_of"}
print("gantt")
print("    title Plan real del manual de representación (un commit por tarea)")
print("    dateFormat YYYY-MM-DD HH:mm")
print("    axisFormat %H:%M")
current = None
for key, doc in docs.items():
    if doc["model"] != "Task":
        continue
    phase = phase_of[key]
    if phase != current:
        print(f"    section {docs[phase]['payload']['name']}")
        current = phase
    p = doc["payload"]
    title = p["title"].replace(":", " ").replace("#", "")[:60]
    if p["start"] == p["end"]:
        print(f"    {title} :milestone, {doc['name']}, {p['start']}, 0m")
    else:
        print(f"    {title} :{doc['name']}, {p['start']}, {p['end']}")
