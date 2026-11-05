---
id: task-ui02-servidor-y-shell-de-la-ui-de-deskops-en-graph-ui
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
depends_on: []
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

# UI02: Servidor y shell de la UI de deskops en graph_ui

## Rationale

_Explain why this task exists or the business driver behind it._

Nodo UI02 del plan deskops-ui (desk deskops, desk/drawer/plans/deskops-ui): la UI de deskops es el producto.

## Goal

_Describe the concrete result this task must produce._

Servidor y shell de la UI de deskops en graph_ui, con datos de deskops view y escrituras solo por operaciones de deskops.

## Scope

_State what is in scope and what is out of scope._

frontends/desk/ (serve.py, index.html, app.js, styles.css): servidor en 127.0.0.1 (puerto por defecto 8091) que expone GET /api/view/{board,task,drawer,inbox,agents}?desk=<repo> llamando a la vista de UI01 por Python (no por subprocess), reusa DeskRoutes para POST /api/desk/advance, y sirve el shell. Selector de desk entre los repos del registro de deskops (desk/registry/repo-*.md) que tengan desk/. Shell con el design system de DESIGN.md en tema oscuro por defecto: barra lateral (Board, Drawer, Inbox, Agentes, y "Inspeccionar" que abre el visor KIMUN en :8090 con el id), cabecera con desk activo y conteos derivables (tareas por etapa, drawer, inbox sin ack, workers vivos). Estado de error visible con causa cuando la vista falla. Sin CDN: fuentes del sistema o vendorizadas, como pide el plan de la fábrica.

## Implementation Path

_Outline the expected implementation route or affected surface._



## Validation

_List the checks required before this task can close._

- pytest -q tests/test_desk_ui_routes.py tests/e2e_desk_ui.py

## Done When

_Name the observable condition that makes the task complete._

pytest de rutas: cada /api/view/* devuelve exactamente lo que devuelve deskops view para el mismo desk temporal; métodos no GET rechazados salvo advance; escucha solo en loopback; el shell carga sin red externa (ninguna URL http(s) externa en index.html, styles.css ni app.js); el selector lista los desks del registro; captura del shell comparada con The Desk - Active Board de Stitch y diferencias anotadas en el TaskDoc.
