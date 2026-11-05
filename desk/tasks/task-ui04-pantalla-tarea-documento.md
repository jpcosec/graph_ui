---
id: task-ui04-pantalla-tarea-documento
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
- task-ui03-pantalla-board
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

# UI04: Pantalla Tarea (documento)

## Rationale

_Explain why this task exists or the business driver behind it._

Nodo UI04 del plan deskops-ui (desk deskops, desk/drawer/plans/deskops-ui): la UI de deskops es el producto.

## Goal

_Describe the concrete result this task must produce._

Pantalla Tarea (documento), con datos de deskops view y escrituras solo por operaciones de deskops.

## Scope

_State what is in scope and what is out of scope._

Vista de lectura al estilo de "The Desk - Markdown Wiki Doc" y la columna derecha de "Tareas Concurrentes & Herencia": cabecera con id, status y etapa; secciones del TaskDoc en orden (why, goal, scope, implementation_path, validation, done_when) en tipografía de lectura; gates con detalle; pills como callouts; atoms con su respuesta; herencia (inherits_from y depends_on como enlaces a otras tareas del desk); referencias y archivos como chips; pie fijo con estado de gates y la acción Avanzar. Enlace "Inspeccionar" al visor KIMUN.

## Implementation Path

_Outline the expected implementation route or affected surface._



## Validation

_List the checks required before this task can close._

- pytest -q tests/test_desk_ui_routes.py tests/e2e_desk_ui.py

## Done When

_Name the observable condition that makes the task complete._

e2e: abrir una tarea muestra cada sección con el texto de deskops view task; un depends_on navega a la otra tarea; la acción Avanzar del pie se comporta igual que en el Board; sin textos de ejemplo de Stitch.
