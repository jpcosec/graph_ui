"""Deriva las relaciones de la vista de contexto a partir de las del nivel de contenedores.

Uso: python3 relaciones-implicitas.py graph-ui.mundo.yaml

Regla (Structurizr, "implied relationships"): cada extremo de una relación `uses` sube por `part_of`
hasta el elemento que se muestra en la vista de contexto (Person o SoftwareSystem); se descartan las
relaciones que quedan dentro del mismo elemento y las repetidas.
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
parent = {r["source"]: r["target"] for r in world["relaciones"] if r["type"] == "part_of"}
names = {f"{d['model']}:{d['name']}": d["payload"]["name"] for d in world["documentos"]}


def lift(element):
    while element.split(":")[0] not in ("Person", "SoftwareSystem"):
        element = parent[element]
    return element


print("Relaciones declaradas (nivel de contenedores):")
implied = {}
for r in world["relaciones"]:
    if r["type"] != "uses":
        continue
    label = r.get("notes", "").split(" | ")[0]
    print(f"   {names[r['source']]} -> {names[r['target']]}: {label}")
    s, t = lift(r["source"]), lift(r["target"])
    if s != t:
        implied.setdefault((s, t), []).append(label)

print("\nRelaciones implícitas en la vista de contexto:")
for (s, t), labels in implied.items():
    print(f"   {names[s]} -> {names[t]}   (de: {'; '.join(labels)})")
