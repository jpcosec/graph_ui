"""Muestra por qué una relación ternaria no es tres binarias: proyecta las tuplas de ABASTECE en los tres
pares (proveedor-ingrediente, ingrediente-local, proveedor-local), las vuelve a juntar y lista las tuplas
que aparecen sin haber existido.

Uso: python3 trampa-de-conexion.py abastece.mundo.yaml
"""
import sys
from itertools import product

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
role = {}
for r in world["relaciones"]:
    role.setdefault(r["source"], {})[r["type"]] = r["target"].split(":", 1)[1]
tuples = {(v["supplier"], v["ingredient"], v["branch"]) for v in role.values()}
si = {(s, i) for s, i, _ in tuples}
il = {(i, l) for _, i, l in tuples}
sl = {(s, l) for s, _, l in tuples}
suppliers, ingredients, branches = ({t[k] for t in tuples} for k in range(3))
rejoined = {(s, i, l) for s, i, l in product(suppliers, ingredients, branches) if (s, i) in si and (i, l) in il and (s, l) in sl}
print("tuplas:", len(tuples), "· reconstruidas desde las tres binarias:", len(rejoined))
for t in sorted(rejoined - tuples):
    print("ESPURIA:", " / ".join(t))
