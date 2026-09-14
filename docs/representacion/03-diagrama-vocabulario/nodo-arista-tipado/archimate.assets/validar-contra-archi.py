"""Contrasta un mundo ArchiMate de pron con la gramática de relaciones de Archi.

Uso: python3 validar-contra-archi.py restaurante.mundo.yaml

Archi (herramienta ArchiMate de código abierto, MIT) guarda qué relaciones permite ArchiMate 3.2
entre cada par de tipos de elemento en model/relationships.xml; cada letra es un tipo de relación
(model/relationships-keys.xml). Se descargan de un commit fijo.

Reporta:
1. si cada relación del mundo está permitida por ArchiMate;
2. cuántos pares (origen, destino) acepta kgdb por source_types × target_types que ArchiMate no permite.
"""
import sys
import urllib.request
import xml.etree.ElementTree as ET

import yaml

COMMIT = "24b1f22d651d05937faa53dd9edf6128d9552dd0"
BASE = f"https://raw.githubusercontent.com/archimatetool/archi/{COMMIT}/com.archimatetool.model/model"
NAME = {"assignment": "AssignmentRelationship", "realization": "RealizationRelationship",
        "serving": "ServingRelationship"}


def fetch(name):
    return ET.fromstring(urllib.request.urlopen(f"{BASE}/{name}", timeout=60).read())


keys = {k.get("char"): k.get("relationship") for k in fetch("relationships-keys.xml")}
matrix = {}
for source in fetch("relationships.xml"):
    for target in source:
        letters = target.get("relations")
        matrix[(source.get("concept"), target.get("concept"))] = {keys[c.lower()] for c in letters}

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))

print("1. Relaciones del mundo contra ArchiMate 3.2 (Archi):")
for rel in world["relaciones"] + world.get("relaciones_invalidas", []):
    s, t = rel["source"].split(":")[0], rel["target"].split(":")[0]
    ok = NAME[rel["type"]] in matrix.get((s, t), set())
    print(f"   {'permitida' if ok else 'NO PERMITIDA'}: {s} -[{rel['type']}]-> {t}")

print("\n2. Pares que kgdb acepta por source_types × target_types y ArchiMate no permite:")
for rt in world["tipos_de_relacion"]:
    pairs = [(s, t) for s in rt["source_types"] for t in rt["target_types"]]
    bad = [(s, t) for s, t in pairs if NAME[rt["name"]] not in matrix.get((s, t), set())]
    print(f"   {rt['name']}: {len(bad)} de {len(pairs)}")
    for s, t in bad:
        print(f"      {s} -> {t}")
