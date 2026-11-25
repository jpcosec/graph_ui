FILE:desk/tasks/task-el-modo-local-de-mindmap-abre-el-store-por-sldb-api-y-graph-ui-deja-de-depender-de-pron.md
---
sldb:
  by: agent
  at: '2026-11-25T17:44:50Z'
  authority: generated
  via: create_document
id: task-el-modo-local-de-mindmap-abre-el-store-por-sldb-api-y-graph-ui-deja-de-depender-de-pron
status: draft
summary: ''
tags: []
current_node: ritual-execution
history: []
references: []
depends_on: []
pills: []
files: []
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# el modo local de mindmap abre el store por sldb.api y graph_ui deja de depender de pron

## Rationale

_Explain why this task exists or the business driver behind it._

ADR sldb/docs/architecture/pron-is-archived.md (JP, 2026-11-25): pron se archiva y la puerta a un store es sldb. El modo local, que es el default, abre el store con pron.world.store.Store (frontends/mindmap/sldb_adapter.py:87) y el editor de clases también (models_service.py). Todo lo que le piden existe en sldb.api, y el modo remoto ya funciona sin pron.

## Goal

_Describe the concrete result this task must produce._

Que mindmap lea, cree, reemplace y quite documentos, registre modelos y edite clases en modo local llamando a sldb.api, sin importar pron.

## Scope

_State what is in scope and what is out of scope._

Dentro: frontends/mindmap/sldb_adapter.py, models_service.py, serve.py, pyproject.toml y .github/requirements-suite.txt. Fuera: la edición por gestos, el modo remoto, reescribir docs/ (tarea aparte).

## Implementation Path

_Outline the expected implementation route or affected surface._

Leer docs/mindmap-developer.md. sldb serve ya implementa las mismas operaciones sobre sldb.api (sldb/src/sldb/cli/serve/): se usan esas funciones, sin una capa nueva.

## Validation

_List the checks required before this task can close._

- ! grep -rnE '^(from|import) pron|pron\.world' frontends src
- python -m pytest -q tests

## Done When

_Name the observable condition that makes the task complete._

En un entorno sin pron instalado, la suite completa de tests/ pasa en modo local. Ningún archivo de frontends/ ni de src/ importa pron. pyproject.toml y requirements-suite.txt no lo nombran.

FILE:instruccion
Preflight solo-TaskDoc de la tarea task-el-modo-local-de-mindmap-abre-el-store-por-sldb-api-y-graph-ui-deja-de-depender-de-pron: reformula el encargo tal como lo leería un ejecutor sin ningún otro contexto, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

