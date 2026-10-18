---
id: task-vista-specs-carriles-para-secuencias-y-grilla-para-matrices
status: active
summary: ''
tags:
- workspace:desk
- artifact:task
current_node: ritual-testing
history:
- task_activates
references: []
depends_on: []
pills: []
files: []
task_type: ''
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# Vista Specs: carriles para secuencias y grilla para matrices

## Rationale

_Explain why this task exists or the business driver behind it._

Hoy layout lanes y grid y draw cell salen como grafo con aviso; spec2viz ya trae datos reales (sequence.render-pipeline, matrix.quotation-view).

## Goal

_Describe the concrete result this task must produce._

Las secuencias se dibujan en carriles con los mensajes ordenados en el tiempo y las matrices en una grilla de celdas, desde lo que devuelve resolve_view.

## Scope

_State what is in scope and what is out of scope._

frontends/mindmap/views/specs/notation/*, sus tests en node y en E2E. Coordinado con spec2viz (w34:p3) sobre el contrato §5/§7/§8b; sin reinterpretar la notación en graph_ui.

## Implementation Path

_Outline the expected implementation route or affected surface._

Layouts lanes y grid en notation.mjs (puro, testeable) y en notation-view.js; draw lane/cell; quitar el aviso cuando ya se soporta.

## Validation

_List the checks required before this task can close._

- node --test tests/*.mjs
- python3 -m pytest tests/e2e_mindmap_notation.py -q

## Done When

_Name the observable condition that makes the task complete._

sequence.render-pipeline y matrix.quotation-view se ven en carriles y en grilla en el navegador, sin aviso, y con node y E2E en verde.
