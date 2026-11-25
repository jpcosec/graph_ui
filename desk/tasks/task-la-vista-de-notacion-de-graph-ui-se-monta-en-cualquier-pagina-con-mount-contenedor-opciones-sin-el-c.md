---
sldb:
  by: agent
  at: '2026-11-25T14:11:09Z'
  authority: generated
  via: create_document
id: task-la-vista-de-notacion-de-graph-ui-se-monta-en-cualquier-pagina-con-mount-contenedor-opciones-sin-el-c
status: draft
summary: ''
tags: []
current_node: ritual-execution
history: []
references: []
depends_on:
- task-las-vistas-de-mindmap-reciben-request-y-la-url-base-del-servidor-en-vez-de-importar-shell-api-js-con
pills: []
files: []
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# La vista de notacion de graph_ui se monta en cualquier pagina con mount(contenedor, opciones) sin el cascaron

## Rationale

_Explain why this task exists or the business driver behind it._

Pedido de JP (2026-11-25), brief de johanes en /mnt/ssd/proyectos/SLDB_1/IR/runs/coordinacion-johanes.md (G-A/G-B). G-A: un panel de edicion embebible en cualquier UI con las mismas funciones que en graph_ui. Paso 2 de G-A: punto de entrada embebible para la vista de notacion.

## Goal

_Describe the concrete result this task must produce._

Un modulo frontends/mindmap/embed/notation.js que exporte mount(container, {baseUrl, spec, view, theme}) y unmount, que monte la vista de notacion con su SourceProvider y request(baseUrl) sin shell, y una pagina de ejemplo ajena (tests/fixtures/embed/host.html) que lo usa con una llamada.

## Scope

_State what is in scope and what is out of scope._

frontends/mindmap/embed/ (nuevo), la pagina host de prueba y una e2e nueva. Fuera: tema/storage con alcance (G-A3), otras vistas (G-A4).

## Implementation Path

_Outline the expected implementation route or affected surface._

Repo /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui. El importmap que hoy pone index.html (react, @xyflow/react, ...) lo tiene que poner la pagina anfitriona: documentarlo en el modulo y en la pagina host. e2e nueva tests/e2e_embed_notation.py: sirve graph_ui (como hacen las e2e de notacion con _serve), abre host.html (otro origen o ruta fuera de mindmap), monta una spec de fixtures y comprueba lo mismo que tests/e2e_mindmap_notation.py en su caso basico (nodos dibujados, edicion de un label persiste).

## Validation

_List the checks required before this task can close._

- python -m pytest -q tests/e2e_embed_notation.py tests/e2e_mindmap_notation.py

## Done When

_Name the observable condition that makes the task complete._

Una pagina ajena monta la vista de notacion con una llamada a mount(...) y tests/e2e_embed_notation.py pasa junto con tests/e2e_mindmap_notation.py.
