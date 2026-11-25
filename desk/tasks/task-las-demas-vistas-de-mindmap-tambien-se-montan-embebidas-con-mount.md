---
sldb:
  by: agent
  at: '2026-11-25T14:11:19Z'
  authority: generated
  via: create_document
id: task-las-demas-vistas-de-mindmap-tambien-se-montan-embebidas-con-mount
status: draft
summary: ''
tags: []
current_node: ritual-execution
history: []
references: []
depends_on:
- task-el-panel-embebido-lleva-el-tema-y-el-localstorage-con-alcance-a-su-contenedor
pills: []
files: []
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# Las demas vistas de mindmap tambien se montan embebidas con mount(...)

## Rationale

_Explain why this task exists or the business driver behind it._

Pedido de JP (2026-11-25), brief de johanes en /mnt/ssd/proyectos/SLDB_1/IR/runs/coordinacion-johanes.md (G-A/G-B). G-A: un panel de edicion embebible en cualquier UI con las mismas funciones que en graph_ui. Paso 4 de G-A: lo mismo que la vista de notacion para documents, workspace, workflow/deskops y flow.

## Goal

_Describe the concrete result this task must produce._

Que frontends/mindmap/embed exponga mount para cada vista registrada (o mount(container, {view: <id>, ...}) generico), con request, base, tema y storage como la de notacion.

## Scope

_State what is in scope and what is out of scope._

frontends/mindmap/embed/ y una e2e. Fuera: vistas nuevas.

## Implementation Path

_Outline the expected implementation route or affected surface._

Repo /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui. Reusar lo de G-A2/G-A3. e2e: tests/e2e_embed_views.py monta en host.html al menos documents/map y workspace y comprueba que cargan datos del servidor por la base URL.

## Validation

_List the checks required before this task can close._

- python -m pytest -q tests/e2e_embed_views.py tests/e2e_embed_notation.py

## Done When

_Name the observable condition that makes the task complete._

Cada vista registrada se monta embebida y tests/e2e_embed_views.py pasa con tests/e2e_embed_notation.py.
