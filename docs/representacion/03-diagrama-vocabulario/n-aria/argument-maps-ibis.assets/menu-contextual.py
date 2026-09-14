"""Deriva del mundo el menú contextual de gIBIS: con un nodo de una clase seleccionado, qué nodo nuevo se
puede crear y con qué enlace queda unido. Sale de source_types y target_types de los verbos, sin escribir
reglas a mano.

Uso: python3 menu-contextual.py vocabulario.mundo.yaml
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
classes = [m["name"] for m in world["modelos"]]
print("sin selección: crear", ", ".join(classes))
for selected in classes:
    options = []
    for rt in world["tipos_de_relacion"]:
        if selected in rt["target_types"]:
            options += [f"nuevo {s} que {rt['name']} este" for s in rt["source_types"]]
        if selected in rt["source_types"]:
            options += [f"este {rt['name']} un {t} nuevo" for t in rt["target_types"]]
    print(f"{selected} seleccionado: " + " · ".join(options))
