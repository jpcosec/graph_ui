"""Escribe el statechart en PlantUML desde el mundo: estados, subestados (substate_of), transiciones.

Muestra lo que el mundo guarda y lo que no: no hay estado inicial declarado, y la transición de grupo
`cancel` sale aplanada, una vez por subestado.

Uso: python3 plantuml-desde-mundo.py reserva.mundo.yaml > reserva.desde-mundo.puml
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
states = {f"State:{d['name']}": d["payload"] for d in world["documentos"] if d["model"] == "State"}
parent = {r["source"]: r["target"] for r in world["relaciones"] if r["type"] == "substate_of"}
name = lambda key: states[key]["name"]

print("@startuml")
print("title Ciclo de vida de una reserva (desde el mundo pron)")
print("hide empty description")


def emit(key: str, indent: str) -> None:
    children = [k for k, p in parent.items() if p == key]
    if children:
        print(f"{indent}state {name(key)} {{")
        for child in children:
            emit(child, indent + "  ")
        print(f"{indent}}}")
    elif states[key].get("entry"):
        print(f"{indent}{name(key)} : entry / {states[key]['entry']}")
    else:
        print(f"{indent}state {name(key)}")


for key in states:
    if key not in parent:
        emit(key, "")
for rel in world["relaciones"]:
    if rel["type"] != "transitions_to":
        continue
    event = rel.get("notes", "").split(" (")[0].removeprefix("evento ")
    guard = f" [{rel['condition']}]" if rel.get("condition") else ""
    print(f"{name(rel['source'])} --> {name(rel['target'])} : {event}{guard}")
for key, payload in states.items():
    if payload.get("kind") == "final":
        print(f"{name(key)} --> [*]")
print("@enduml")
