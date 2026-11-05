---
id: task-ui03-pantalla-board
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
- task-ui02-servidor-y-shell-de-la-ui-de-deskops-en-graph-ui
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

# UI03: Pantalla Board

## Rationale

_Explain why this task exists or the business driver behind it._

Nodo UI03 del plan deskops-ui (desk deskops, desk/drawer/plans/deskops-ui): la UI de deskops es el producto.

## Goal

_Describe the concrete result this task must produce._

Pantalla Board, con datos de deskops view y escrituras solo por operaciones de deskops.

## Scope

_State what is in scope and what is out of scope._

Board al estilo de "The Desk - Active Board": una columna por nodo del ciclo de vida con su nombre y conteo; tarjetas con id mono, título, checklist de gates (verde cumple, ámbar pendiente, rojo si la evidencia declarada falla), conteo n/m, pills (chips) y atoms (con icono de candado); al seleccionar, panel derecho con objetivo, gates con condición, evidencia declarada vs encontrada, pills con what/when, atoms con answer, y acciones: Avanzar (POST advance con confirmación y guarda de revisión; refresca), y Iniciar ejecución / Promover a atom / Diferir deshabilitados con el motivo de alcance.md. Carril inferior con un resumen del drawer (enlace a la pantalla Drawer). Errores de la vista visibles en un aviso, no escondidos.

## Implementation Path

_Outline the expected implementation route or affected surface._



## Validation

_List the checks required before this task can close._

- pytest -q tests/test_desk_ui_routes.py tests/e2e_desk_ui.py

## Done When

_Name the observable condition that makes the task complete._

e2e de navegador sobre un desk temporal con dos tareas en nodos distintos: aparecen en sus columnas; los gates y el conteo coinciden con deskops view board; avanzar una tarea con gates cumplidos la mueve de columna y deskops show task lo confirma; avanzar con revisión vieja muestra el conflicto; ningún texto de ejemplo de Stitch aparece en la página (lista de cadenas de prueba: TASK-104, 85.7%, draft_spec_v2_syntax, atom-sldb-is-read-write-edit-surface, Worker #2); foco visible por teclado en tarjetas y botones.
