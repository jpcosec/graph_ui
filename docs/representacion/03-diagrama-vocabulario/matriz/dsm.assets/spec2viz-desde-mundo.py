"""Intenta expresar la DSM con el tipo component_view_matrix de spec2viz: una vista "depende de" cuyas etapas
son los componentes, y cada fila marca como pertenencia las columnas de las que depende. Sirve para ver qué
conserva el tipo matriz que ya existe y qué pierde.

Uso: python3 spec2viz-desde-mundo.py graph-ui.mundo.yaml > graph-ui.dsm.spec2viz.yml
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
names = {f"Component:{d['name']}": d["payload"]["path"] for d in world["documentos"]}
ORDER = ["shared", "source", "views/draft/tree", "dialogs", "shell", "views/documents/flow",
         "views/documents/map", "views/models/diagram", "app"]  # el orden particionado de dsm-desde-mundo.py
stage = lambda path: path.replace("/", "-")
deps = {n: [] for n in ORDER}
for r in world["relaciones"]:
    deps[names[r["source"]]].append(names[r["target"]])
spec = {
    "id": "matrix.graph-ui-dsm",
    "title": "DSM de graph_ui con spec2viz (component_view_matrix)",
    "type": "component_view_matrix",
    "version": "0.1",
    "data": {
        "views": [{"id": "depende", "label": "depende de", "stages": [{"id": stage(n), "label": n} for n in ORDER]}],
        "components": [{"name": stage(n), "label": n, "kind": "core", "stages": {"depende": [stage(t) for t in ORDER if t in deps[n]]}} for n in ORDER],
    },
}
print(yaml.safe_dump(spec, allow_unicode=True, sort_keys=False, width=140), end="")
