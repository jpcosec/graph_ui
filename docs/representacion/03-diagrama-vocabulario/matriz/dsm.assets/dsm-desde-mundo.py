"""Construye la DSM desde el mundo: ordena los componentes por particionamiento (componentes fuertemente
conexos en orden topológico, las dependencias hacia arriba de la diagonal quedan dentro de bloques) y
escribe un spec de Vega-Lite con la cantidad de imports en cada celda.

Convención: la fila i marca la columna j si i depende de j (importa algo de j).

Uso: python3 dsm-desde-mundo.py graph-ui.mundo.yaml > graph-ui.dsm.vl.json
"""
import json
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
names = {f"Component:{d['name']}": d["payload"]["path"] for d in world["documentos"]}
deps = {n: {} for n in names.values()}
for r in world["relaciones"]:
    deps[names[r["source"]]][names[r["target"]]] = int(r["notes"].split("=")[1])

# Tarjan: componentes fuertemente conexos; salen en orden topológico inverso (dependencias primero)
index, low, stack, on_stack, sccs, counter = {}, {}, [], set(), [], [0]


def strongconnect(v):
    index[v] = low[v] = counter[0]
    counter[0] += 1
    stack.append(v)
    on_stack.add(v)
    for w in sorted(deps[v]):
        if w not in index:
            strongconnect(w)
            low[v] = min(low[v], low[w])
        elif w in on_stack:
            low[v] = min(low[v], index[w])
    if low[v] == index[v]:
        scc = []
        while True:
            w = stack.pop()
            on_stack.discard(w)
            scc.append(w)
            if w == v:
                break
        sccs.append(sorted(scc))


for v in sorted(deps):
    if v not in index:
        strongconnect(v)
order = [n for scc in sccs for n in scc]
blocks = [scc for scc in sccs if len(scc) > 1]
print(f"orden: {order}", file=sys.stderr)
print(f"bloques (ciclos): {blocks}", file=sys.stderr)
above = [(a, b) for a in order for b in deps[a] if order.index(b) > order.index(a)]
print(f"marcas sobre la diagonal: {len(above)}", file=sys.stderr)

in_block = {n for scc in blocks for n in scc}
cells = []
for a in order:
    for b in order:
        n = deps[a].get(b, 0)
        if a == b:
            kind = "diagonal"
        elif a in in_block and b in in_block and any(a in scc and b in scc for scc in blocks):
            kind = "bloque (ciclo)" if n else "bloque, sin marca"
        else:
            kind = "dependencia" if n else "sin dependencia"
        cells.append({"fila": a, "columna": b, "imports": n or "", "clase": kind})
axis = {"sort": order}
spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
    "title": "DSM de componentes de graph_ui (la fila depende de la columna; imports)",
    "width": 460, "height": 460,
    "config": {"font": "Liberation Sans", "view": {"stroke": None}},
    "data": {"values": cells},
    "encoding": {"x": {"field": "columna", "type": "nominal", **axis, "axis": {"labelAngle": -45, "title": None, "orient": "top"}},
                 "y": {"field": "fila", "type": "nominal", **axis, "axis": {"title": None}}},
    "layer": [
        {"mark": {"type": "rect", "stroke": "#ffffff", "strokeWidth": 1},
         "encode": None,
         "encoding": {"color": {"field": "clase", "type": "nominal",
                                "scale": {"domain": ["diagonal", "dependencia", "bloque (ciclo)", "bloque, sin marca", "sin dependencia"],
                                          "range": ["#555555", "#6baed6", "#d62728", "#f7c6c6", "#f2f2f2"]},
                                "legend": {"title": None, "orient": "bottom"}}}},
        {"mark": {"type": "text", "fontSize": 12},
         "encoding": {"text": {"field": "imports"}}},
    ],
}
for layer in spec["layer"]:
    layer.pop("encode", None)
print(json.dumps(spec, ensure_ascii=False, indent=1))
