---
id: task-graph-ui-instalable-pyproject-con-dependencias-reales-y-sin-hacks-de-sys-path
status: ready_for_testing
summary: ''
tags:
- workspace:desk
- artifact:task
current_node: ritual-closeout
history:
- task_activates
- task_hands_to_closeout
references: []
depends_on: []
pills: []
files: []
task_type: ''
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# graph_ui instalable: pyproject con dependencias reales y sin hacks de sys.path

## Rationale

_Explain why this task exists or the business driver behind it._

Auditoría del bundle: graph_ui no se puede instalar; los módulos del mindmap se importan entre sí manipulando sys.path.

## Goal

_Describe the concrete result this task must produce._

pyproject.toml con [project] y [build-system] que declare structuredLanguageDB, kgdb y pron; frontends/mindmap importable como paquete sin inserciones en sys.path.

## Scope

_State what is in scope and what is out of scope._

pyproject.toml; imports de frontends/mindmap (compiler.py, serve.py, persistence.py, sldb_adapter.py) y los tests que los cargan. Fuera de alcance: arreglar la metadata de kgdb, que pide 'sldb' en vez de 'structuredLanguageDB'.

## Implementation Path

_Outline the expected implementation route or affected surface._

Convertir frontends/mindmap en paquete importable (imports relativos o paquete declarado), seguir arrancando serve.py como script, pip install -e . en un entorno limpio.

## Validation

_List the checks required before this task can close._

- python3 -m pytest tests -q
- node --test tests/*.mjs
- grep -rn 'sys.path' frontends/mindmap --include=*.py

## Done When

_Name the observable condition that makes the task complete._

pip install -e . resuelve (o se documenta el bloqueo de kgdb con el comando exacto), no quedan sys.path.insert en frontends/mindmap y la suite completa sigue verde.
