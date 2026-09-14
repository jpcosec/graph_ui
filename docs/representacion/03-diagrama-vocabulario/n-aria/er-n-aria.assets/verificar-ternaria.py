"""Reglas de ABASTECE que el sustrato no declara: cada Supply tiene los tres roles, no hay dos Supply con la
misma tupla, y (ingrediente, local) determina el proveedor (el "1" de proveedor en la notación de Chen).

Uso: python3 verificar-ternaria.py abastece.mundo.yaml
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
role = {d["name"]: {} for d in world["documentos"] if d["model"] == "Supply"}
for r in world["relaciones"]:
    role[r["source"].split(":", 1)[1]][r["type"]] = r["target"].split(":", 1)[1]
problems, seen, supplier_of = [], {}, {}
for name, roles in sorted(role.items()):
    missing = {"supplier", "ingredient", "branch"} - roles.keys()
    if missing:
        problems.append(f"ROL FALTANTE: {name} sin {', '.join(sorted(missing))}")
        continue
    t = (roles["supplier"], roles["ingredient"], roles["branch"])
    if t in seen:
        problems.append(f"TUPLA REPETIDA: {name} repite {seen[t]} ({' / '.join(t)})")
    seen.setdefault(t, name)
    key = (roles["ingredient"], roles["branch"])
    if key in supplier_of and supplier_of[key][1] != roles["supplier"]:
        problems.append(f"DOS PROVEEDORES: {key[1]} recibe {key[0]} de {supplier_of[key][1]} ({supplier_of[key][0]}) y de {roles['supplier']} ({name})")
    supplier_of.setdefault(key, (name, roles["supplier"]))
for line in problems:
    print(line)
print(f"{len(role)} tuplas, {len(problems)} problema(s)")
