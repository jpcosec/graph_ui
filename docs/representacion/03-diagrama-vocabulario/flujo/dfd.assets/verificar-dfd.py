"""Reglas del DFD sobre el mundo: todo flujo toca un proceso, cada proceso tiene entradas y salidas (sin
"agujeros negros" ni "milagros"), cada almacén se lee y se escribe; y compara con el .dot escrito a mano.

Uso: python3 verificar-dfd.py graph-ui.mundo.yaml [graph-ui.demarco.dot]
"""
import re
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
kind = {d["name"]: d["model"] for d in world["documentos"]}
flows = [(r["source"].split(":", 1)[1], r["target"].split(":", 1)[1], r.get("notes", "")) for r in world["relaciones"]]
problems = []
for s, t, label in flows:
    if "Process" not in (kind[s], kind[t]):
        problems.append(f"FLUJO SIN PROCESO: {s} -> {t} ({label})")
    if not label:
        problems.append(f"FLUJO SIN NOMBRE: {s} -> {t}")
for name, k in kind.items():
    ins = [f for f in flows if f[1] == name]
    outs = [f for f in flows if f[0] == name]
    if k == "Process" and not outs:
        problems.append(f"AGUJERO NEGRO: el proceso {name} no produce nada")
    if k == "Process" and not ins:
        problems.append(f"MILAGRO: el proceso {name} produce sin entradas")
    if k == "DataStore" and (not ins or not outs):
        problems.append(f"ALMACÉN {'SIN ESCRITURA' if not ins else 'SIN LECTURA'}: {name}")
if len(sys.argv) > 2:
    dot = open(sys.argv[2], encoding="utf-8").read()
    drawn = set(re.findall(r'"([^"]+)" -> "([^"]+)" \[label="([^"]*)"\]', dot))
    modeled = set(flows)
    for f in sorted(drawn - modeled):
        problems.append(f"DIBUJADO Y NO MODELADO: {f}")
    for f in sorted(modeled - drawn):
        problems.append(f"MODELADO Y NO DIBUJADO: {f}")
for line in problems:
    print(line)
print(f"{sum(k == 'Process' for k in kind.values())} procesos, {len(flows)} flujos, {len(problems)} problema(s)")
