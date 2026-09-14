"""El gesto Tab de un mapa mental crea un hijo. En un mundo tipado ese hijo necesita clase y verbo: este
script calcula, para cada clase de padre, qué pares (clase del hijo, verbo) ofrecen los verbos de jerarquía.
Uno solo: el gesto puede ocultar el tipo. Varios: el vocabulario tiene que declarar cuál usar.

Uso: python3 hijo-por-defecto.py manual.mundo.yaml axis_of folder_of chapter_of example_of
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
hierarchy = set(sys.argv[2:])
for model in [m["name"] for m in world["modelos"]]:
    options = [(s, rt["name"]) for rt in world["tipos_de_relacion"] if rt["name"] in hierarchy and model in rt["target_types"] for s in rt["source_types"]]
    verdict = "hoja (Tab no aplica)" if not options else ("sin ambigüedad" if len(options) == 1 else "AMBIGUO: el vocabulario debe elegir")
    print(f"{model}: {', '.join(f'{c} por {v}' for c, v in options) or '—'} → {verdict}")
