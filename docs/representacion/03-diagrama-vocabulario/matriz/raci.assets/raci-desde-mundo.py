"""Escribe la matriz RACI desde el mundo: la tabla en Markdown (la notación habitual) por stdout y, con
--vega salida.vl.json, un spec de Vega-Lite con una letra por celda. Tareas en filas, roles en columnas.

Uso: python3 raci-desde-mundo.py reserva.mundo.yaml [--vega reserva.raci.vl.json]
"""
import json
import sys

import yaml

LETTER = {"responsible": "R", "accountable": "A", "consulted": "C", "informed": "I"}
world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
acts = sorted((d for d in world["documentos"] if d["model"] == "Activity"), key=lambda d: d["payload"]["position"])
roles = [d for d in world["documentos"] if d["model"] == "Role"]
cell = {}
for r in world["relaciones"]:
    key = (r["source"].split(":", 1)[1], r["target"].split(":", 1)[1])
    cell.setdefault(key, []).append(LETTER[r["type"]])
text = lambda a, ro: "/".join(sorted(cell.get((a, ro), []), key="ARCI".index))
print("| Tarea | " + " | ".join(r["payload"]["name"] for r in roles) + " |")
print("|---|" + "---|" * len(roles))
for a in acts:
    print(f"| {a['payload']['name']} | " + " | ".join(text(a["name"], r["name"]) for r in roles) + " |")
if "--vega" in sys.argv:
    values = [{"tarea": a["payload"]["name"], "rol": r["payload"]["name"], "letras": text(a["name"], r["name"]),
               "principal": (text(a["name"], r["name"]) or " ")[0]} for a in acts for r in roles]
    spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
        "title": "RACI del proceso de reserva",
        "config": {"font": "Liberation Sans", "view": {"stroke": None}},
        "width": 360, "height": 250, "data": {"values": values},
        "encoding": {"x": {"field": "rol", "type": "nominal", "sort": [r["payload"]["name"] for r in roles], "axis": {"orient": "top", "title": None, "labelAngle": 0}},
                     "y": {"field": "tarea", "type": "nominal", "sort": [a["payload"]["name"] for a in acts], "axis": {"title": None, "labelLimit": 260}}},
        "layer": [
            {"mark": {"type": "rect", "stroke": "#ffffff"},
             "encoding": {"color": {"field": "principal", "type": "nominal",
                                    "scale": {"domain": ["A", "R", "C", "I", " "], "range": ["#d62728", "#1f77b4", "#ff7f0e", "#bbbbbb", "#f2f2f2"]},
                                    "legend": None}}},
            {"mark": {"type": "text", "fontSize": 13, "fontWeight": "bold", "color": "white"}, "encoding": {"text": {"field": "letras"}}},
        ],
    }
    open(sys.argv[sys.argv.index("--vega") + 1], "w", encoding="utf-8").write(json.dumps(spec, ensure_ascii=False, indent=1))
