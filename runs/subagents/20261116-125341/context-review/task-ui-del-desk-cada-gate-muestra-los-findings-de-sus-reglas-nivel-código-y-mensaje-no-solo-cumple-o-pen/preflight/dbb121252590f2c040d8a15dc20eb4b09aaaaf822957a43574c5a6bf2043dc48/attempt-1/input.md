FILE:desk/tasks/task-ui-del-desk-cada-gate-muestra-los-findings-de-sus-reglas-nivel-código-y-mensaje-no-solo-cumple-o-pen.md
---
sldb:
  by: agent
  at: '2026-11-16T12:50:29Z'
  authority: generated
  via: save_document_payload
id: task-ui-del-desk-cada-gate-muestra-los-findings-de-sus-reglas-nivel-código-y-mensaje-no-solo-cumple-o-pen
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
- host:robocop2
current_node: ritual-execution
history: []
references:
- desk/inbox/20261116-011047-suggestion-deskops-ui-la-ui-del-desk-ya-muestra-los-findings-de-reglas-y-los-recibos-gates-g-gc-gates-y-g-gc-receipts.md
- ../../deskops/docs/deskops-ui.md
- frontends/desk/README.md
depends_on: []
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
files:
- frontends/desk/board.js
- frontends/desk/styles.css
- tests/test_desk_ui_routes.py
- tests/e2e_desk_ui.py
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# UI del desk: cada gate muestra los findings de sus reglas (nivel, código y mensaje), no solo cumple o pendiente

## Rationale

_Explain why this task exists or the business driver behind it._

deskops preguntó (nota del inbox de graph_ui 20261116-011047, gates G_GC_GATES y G_GC_RECEIPTS del plan deskops-ui) si la UI del desk ya muestra los findings de las reglas de activación y los recibos de cada tarea. Hoy no: `deskops view task <id> --format json` y `deskops view board` entregan en cada gate `findings: [{level, code, subject, what}]` (por ejemplo code 'rules/rule-activation-task-code' y what 'Una tarea task.code se activa con recibos preflight y bundle aceptados e intactos ... (seen: {})'), pero renderGateBoxes de frontends/desk/board.js (que usan el inspector del Board y la vista Tarea) dibuja solo relation_type, target, holds y condition. Sin los findings, quien mira la UI no sabe qué recibo falta.

## Goal

_Describe the concrete result this task must produce._

En la vista Tarea y en el inspector del Board de frontends/desk, cada gate muestra sus findings: el nivel (error, warning, info) como texto visible, el código de la regla en <code> y el mensaje (what) completo; un gate sin findings no muestra lista vacía.

## Scope

_State what is in scope and what is out of scope._

ENTRA: (1) frontends/desk/board.js: renderGateBoxes agrega, bajo la condición, una lista (data-testid 'gate-finding') con un ítem por finding: nivel en texto, code en <code>, what como texto (sin innerHTML). (2) frontends/desk/styles.css: estilo del nivel reutilizando las clases de estado que ya existen (is-holds, is-pending) o una clase is-error/is-warning nueva; el nivel no se transmite solo por color. (3) Pruebas: tests/test_desk_ui_routes.py o tests/e2e_desk_ui.py (el que ya cubra la vista Tarea) con un caso de gate con finding y uno sin; tests/mindmap-deskops.test.mjs no aplica. NO ENTRA: frontends/desk/task.js y frontends/desk/app.js (JP tiene cambios locales sin commitear en ellos; si el cambio los necesitara, el ejecutor para y lo reporta); cambiar deskops ni el contrato de `deskops view`; mostrar la lista de ReviewDoc de la tarea (la vista no la entrega: se pide a deskops aparte).

## Implementation Path

_Outline the expected implementation route or affected surface._

1) `deskops view task <id> --root ../../deskops --format json` sobre una tarea real de deskops con un gate que tenga findings, para fijar la forma exacta. 2) Editar renderGateBoxes en board.js. 3) Prueba según el alcance, con datos del desk real de deskops vía tests/deskops_viewdocs.py o el fixture que ya use la prueba elegida. 4) Verificación en navegador headless (playwright, chromium) sobre el desk real: `python3 frontends/desk/serve.py 8091 --root ../../deskops`, abrir la vista Tarea de una tarea con findings y el inspector del Board, captura PNG y tiempo de carga de cada pantalla en el run_dir.

## Validation

_List the checks required before this task can close._

- python -m pytest -q -rs tests/test_desk_ui_routes.py tests/test_mindmap_deskops.py
- python -m pytest -q -rs tests/e2e_desk_ui.py
- git diff --quiet HEAD -- frontends/desk/task.js frontends/desk/app.js

## Done When

_Name the observable condition that makes the task complete._

Con la UI servida sobre el desk real de deskops, la vista Tarea de una tarea con un gate retenido por una regla muestra el nivel, el código rules/... y el mensaje completo; un gate sin findings no muestra lista; las pruebas de la validación pasan; task.js y app.js no cambiaron; capturas y tiempos quedan en el run_dir.

FILE:instruccion
Preflight solo-TaskDoc de la tarea task-ui-del-desk-cada-gate-muestra-los-findings-de-sus-reglas-nivel-código-y-mensaje-no-solo-cumple-o-pen: reformula el encargo tal como lo leería un ejecutor sin ningún otro contexto, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

