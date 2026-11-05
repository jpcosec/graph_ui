---
id: task-ui06-pantalla-agentes-y-corridas
status: ready_for_testing
summary: ''
tags:
- workspace:desk
- artifact:task
current_node: ritual-closeout
history:
- task_activates
- task_hands_to_closeout
references:
- 5e4f347
- tests/test_desk_ui_routes.py
- tests/e2e_desk_ui.py
depends_on:
- task-ui05-pantallas-drawer-e-inbox
pills: []
files: []
task_type: code
inherits_from: []
inherit_acceptance_context: false
atoms: []
closeout_evidence:
- tests
- commit
---

# UI06: Pantalla Agentes y corridas

## Rationale

_Explain why this task exists or the business driver behind it._

Nodo UI06 del plan deskops-ui (desk deskops, desk/drawer/plans/deskops-ui): la UI de deskops es el producto.

## Goal

_Describe the concrete result this task must produce._

Pantalla Agentes y corridas, con datos de deskops view y escrituras solo por operaciones de deskops.

## Scope

_State what is in scope and what is out of scope._

Lista de workers vivos (runtime workers: pane, kind, status, cwd, título) y de las últimas corridas (task_id, run_dir, commit, modo) con enlace a la tarea si sigue en el Board. Sin métricas inventadas. Cierre del paquete: e2e común de las cuatro pantallas y la captura comparada de cada una con su referencia de Stitch anotada en el TaskDoc; README de frontends/desk con cómo levantarlo.

## Implementation Path

_Outline the expected implementation route or affected surface._



## Validation

_List the checks required before this task can close._

- pytest -q tests/test_desk_ui_routes.py tests/e2e_desk_ui.py

## Done When

_Name the observable condition that makes the task complete._

pytest y e2e: la lista coincide con deskops view agents; si herdr no está disponible, la pantalla muestra la causa en vez de una lista vacía muda; suite completa de graph_ui verde en robocop2; capturas de las cinco pantallas registradas.
