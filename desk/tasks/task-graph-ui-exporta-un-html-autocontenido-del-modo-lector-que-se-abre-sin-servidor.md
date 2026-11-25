---
sldb:
  by: agent
  at: '2026-11-25T14:11:29Z'
  authority: generated
  via: create_document
id: task-graph-ui-exporta-un-html-autocontenido-del-modo-lector-que-se-abre-sin-servidor
status: draft
summary: ''
tags: []
current_node: ritual-execution
history: []
references: []
depends_on:
- task-de-un-spec-del-store-sale-un-svg-del-modo-lector-con-el-mismo-layout-que-la-vista-de-notacion
pills: []
files: []
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# graph_ui exporta un HTML autocontenido del modo lector que se abre sin servidor

## Rationale

_Explain why this task exists or the business driver behind it._

Pedido de JP (2026-11-25), brief de johanes en /mnt/ssd/proyectos/SLDB_1/IR/runs/coordinacion-johanes.md (G-A/G-B). G-B: exportar el modo lector como HTML o SVG estatico, como los que tenia spec2viz, con el mismo dibujo que la vista interactiva. Paso 2 de G-B: el HTML que envuelve el SVG, como la pagina de spec2viz.

## Goal

_Describe the concrete result this task must produce._

Un HTML autocontenido (SVG inline, css inline, sin fetch ni importmap) con zoom/arrastre basico y titulo, generado desde un spec del store por una ruta GET /api/notation/export?spec=..&format=svg|html y un boton de exportar en la vista de notacion.

## Scope

_State what is in scope and what is out of scope._

frontends/mindmap (ruta de export en el servidor python, boton en notation-view.js) y una e2e. Fuera: el layout (G-B1).

## Implementation Path

_Outline the expected implementation route or affected surface._

Repo /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui. La ruta corre exportSvg de G-B1 (via node en el servidor, o el cliente genera y descarga; elegir lo mas simple y anotarlo). e2e tests/e2e_notation_export.py: exporta el HTML de una fixture, lo abre como file:// sin servidor y comprueba que el SVG esta y que los nodos estan en las mismas posiciones relativas que en la vista interactiva.

## Validation

_List the checks required before this task can close._

- python -m pytest -q tests/e2e_notation_export.py

## Done When

_Name the observable condition that makes the task complete._

De un spec sale un .svg y un .html que se abren sin servidor con el mismo dibujo; tests/e2e_notation_export.py pasa.
