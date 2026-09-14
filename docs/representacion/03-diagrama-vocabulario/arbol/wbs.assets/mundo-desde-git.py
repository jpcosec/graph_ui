"""Genera la WBS del trabajo ya hecho en el paso 2 de graph_ui (proyecciones, commits be1d695 y 363fe9b): un
paquete de trabajo por archivo, con el esfuerzo medido como líneas agregadas + borradas (git show --numstat),
agrupados en entregables. Los códigos (1, 1.1, 1.1.1) y el esfuerzo de los entregables se guardan como campos,
igual que en las herramientas de planificación que almacenan los totales.

Uso: python3 mundo-desde-git.py > paso-2.mundo.yaml   (desde la raíz del repositorio graph_ui)
"""
import subprocess

import yaml

COMMITS = ["be1d695", "363fe9b"]
DELIVERABLES = [  # (nombre, prefijos de ruta)
    ("Fuente: aplicar la proyección", ["frontends/mindmap/source/"]),
    ("Shell: selector de proyección", ["frontends/mindmap/shell/", "frontends/mindmap/styles/"]),
    ("Vistas KB y Flujo", ["frontends/mindmap/views/documents/"]),
    ("Schema: resaltar y editar", ["frontends/mindmap/views/models/"]),
    ("Pruebas", ["tests/"]),
    ("Documentación", ["docs/"]),
]
effort = {}
for commit in COMMITS:
    out = subprocess.run(["git", "show", "--numstat", "--format=", commit], capture_output=True, text=True, check=True).stdout
    for line in out.splitlines():
        if line.strip():
            added, deleted, path = line.split("\t")
            effort[path] = effort.get(path, 0) + int(added) + int(deleted)
docs = [{"model": "WorkItem", "name": "w-1", "payload": {"code": "1", "name": "Paso 2: proyecciones", "kind": "deliverable", "effort": sum(effort.values())}}]
rels = []
for i, (name, prefixes) in enumerate(DELIVERABLES, 1):
    files = sorted(p for p in effort if any(p.startswith(x) for x in prefixes))
    key = f"w-1-{i}"
    docs.append({"model": "WorkItem", "name": key, "payload": {"code": f"1.{i}", "name": name, "kind": "deliverable", "effort": sum(effort[f] for f in files)}})
    rels.append({"type": "part_of", "source": f"WorkItem:{key}", "target": "WorkItem:w-1"})
    for j, path in enumerate(files, 1):
        leaf = f"{key}-{j}"
        short = path.removeprefix("frontends/mindmap/")
        docs.append({"model": "WorkItem", "name": leaf, "payload": {"code": f"1.{i}.{j}", "name": short, "kind": "work_package", "effort": effort[path]}})
        rels.append({"type": "part_of", "source": f"WorkItem:{leaf}", "target": f"WorkItem:{key}"})
world = {
    "modelos": [{
        "name": "WorkItem", "family": "wbs",
        "template": "---\ncode: ⸢rev•code⸥\nkind: ⸢rev•kind⸥\neffort: ⸢rev•effort⸥\n---\n\n# ⸢render•name⸥\n\n⸢rev•name⸥\n",
        "fields": [{"name": "code", "type": "str", "description": "Código WBS (1.2.3): posición en la jerarquía."},
                   {"name": "name", "type": "str", "description": "Entregable o paquete de trabajo."},
                   {"name": "kind", "type": "str", "description": "deliverable (tiene hijos) o work_package (hoja)."},
                   {"name": "effort", "type": "int", "description": "Líneas agregadas + borradas; en un entregable, la suma de sus hijos."}],
    }],
    "tipos_de_relacion": [{"name": "part_of", "cardinality": "many_to_one", "axis": "WHAT", "source_types": ["WorkItem"], "target_types": ["WorkItem"],
                           "description": "El elemento es parte del entregable destino."}],
    "documentos": docs, "relaciones": rels,
}
print(f"# WBS del paso 2 de graph_ui (commits {', '.join(COMMITS)}), generada por mundo-desde-git.py.")
print(yaml.safe_dump(world, allow_unicode=True, sort_keys=False, width=140), end="")
