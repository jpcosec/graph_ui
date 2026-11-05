---
id: task-ui05-pantallas-drawer-e-inbox
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
- task-ui04-pantalla-tarea-documento
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

# UI05: Pantallas Drawer e Inbox

## Rationale

_Explain why this task exists or the business driver behind it._

Nodo UI05 del plan deskops-ui (desk deskops, desk/drawer/plans/deskops-ui): la UI de deskops es el producto.

## Goal

_Describe the concrete result this task must produce._

Pantallas Drawer e Inbox, con datos de deskops view y escrituras solo por operaciones de deskops.

## Scope

_State what is in scope and what is out of scope._

Drawer al estilo de "Drawers - Cajón de Esbozos & Triage": lista de tareas diferidas con título, status y extracto; panel con el Markdown en crudo (solo lectura) y el comando deskops add task --from-drawer <id> listo para copiar (no hay botón que escriba). Inbox al estilo de "Inbox - Buzón Inter-Proyecto": lista con emisor → destino, kind, título, fecha y estado de ack; panel con el cuerpo; acciones Reconocer (deskops message ack) y Pasar al drawer (promote inbox-to-drawer-task), ambas por una ruta POST nueva en frontends/desk/serve.py que llama a la operación de deskops con confirmación y guarda de revisión (hash del archivo de la nota). Sin hilo de conversación, firmas, prioridad ni métricas: no existen.

## Implementation Path

_Outline the expected implementation route or affected surface._



## Validation

_List the checks required before this task can close._

- pytest -q tests/test_desk_ui_routes.py tests/e2e_desk_ui.py

## Done When

_Name the observable condition that makes the task complete._

e2e sobre un desk temporal: el drawer lista lo que hay en desk/drawer/tasks y el comando copiado es exacto; el inbox lista las notas; Reconocer marca la nota como en deskops message list; Pasar al drawer crea el archivo en desk/drawer/tasks y saca la nota del inbox como lo hace el CLI; una nota modificada entre lectura y acción da conflicto; pytest de las rutas POST nuevas; sin textos de ejemplo de Stitch.
