"""Escribe el diagrama de clases del mundo (sus modelos y verbos) en PlantUML. Con --asociacion Modelo, ese
modelo se dibuja como clase de asociación entre los destinos de sus dos verbos many_to_one; sin la
opción, como una clase más con dos asociaciones.

Uso: python3 plantuml-desde-mundo.py reserva.mundo.yaml [--asociacion Reservation] > salida.puml
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
reified = sys.argv[sys.argv.index("--asociacion") + 1] if "--asociacion" in sys.argv else None
TYPES = {"str": "String", "int": "Integer", "float": "Real"}
print("@startuml")
print("hide empty methods")
for m in world["modelos"]:
    print(f"class {m['name']} {{")
    for f in m["fields"]:
        print(f"  {f['name']} : {TYPES.get(f['type'], f['type'])}")
    print("}")
ends = [rt for rt in world["tipos_de_relacion"] if reified in rt["source_types"] and rt["cardinality"] == "many_to_one"]
for rt in world["tipos_de_relacion"]:
    if rt in ends:
        continue
    many = {"many_to_one": ('"0..*"', '"1"'), "one_to_one": ('"1"', '"1"'), "one_to_many": ('"1"', '"0..*"'), "many_to_many": ('"0..*"', '"0..*"')}[rt["cardinality"]]
    for s in rt["source_types"]:
        for t in rt["target_types"]:
            print(f"{s} {many[0]} --> {many[1]} {t} : {rt['name']}")
if reified:
    a, b = ends[0]["target_types"][0], ends[1]["target_types"][0]
    print(f'{a} "0..*" -- "0..*" {b}')
    print(f"({a}, {b}) .. {reified}")
    print(f"note bottom of {reified}\n  extremos: {ends[0]['name']}, {ends[1]['name']}\nend note")
print("@enduml")
