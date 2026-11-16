---
sldb:
  by: agent
  at: '2026-11-16T12:55:53Z'
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

En la vista Tarea y en el inspector del Board de frontends/desk (las dos dibujan los gates con renderGateBoxes de board.js: task.js línea ~71 y board.js línea ~165, cargados como scripts globales en index.html), cada gate muestra sus findings: el nivel como texto visible ('error', 'aviso' o 'info'), el código de la regla en <code> y el mensaje (what) completo; el subject no se muestra (es la propia tarea). Un gate sin findings no muestra lista.

## Scope

_State what is in scope and what is out of scope._

ENTRA: (1) frontends/desk/board.js: renderGateBoxes agrega, bajo la línea de condición, una <ul class='gate-findings'> con un <li data-testid='gate-finding' class='finding is-<level>'> por finding: un <span class='finding-level'> con el texto 'error', 'aviso' (level warning) o 'info', el code en <code> y el what como nodo de texto (con h(), nunca innerHTML). Como task.js llama a la misma función, la vista Tarea queda cubierta sin tocar task.js. (2) frontends/desk/styles.css: clases nuevas .finding.is-error, .finding.is-warning y .finding.is-info (borde izquierdo o color del texto del nivel); el nivel siempre va también como texto. (3) Pruebas: en tests/e2e_desk_ui.py, junto a test_task_page_sections_inheritance_and_advance, una prueba que abre la vista Tarea de una tarea con un gate retenido y comprueba el li gate-finding con nivel, code y what, y otra que comprueba que un gate sin findings no tiene ul.gate-findings; si el fixture de desk de ese archivo no produce findings, se crea la tarea retenida en el fixture del propio test (una task.code sin recibo preflight produce el finding rules/rule-activation-task-code). tests/test_desk_ui_routes.py y tests/test_mindmap_deskops.py se corren solo como regresión. NO ENTRA: frontends/desk/task.js y app.js (JP tiene cambios locales sin commitear; si el cambio los necesitara, el ejecutor para y lo reporta); cambiar deskops o el contrato de deskops view; la lista de ReviewDoc de la tarea (deskops view no la entrega; pedida a deskops en la nota 20261116-095054).

## Implementation Path

_Outline the expected implementation route or affected surface._

1) cd ../../deskops && deskops view task task-advance-y-closeout-no-derraman-reglas-de-activacion-ni-runtimes-centrales-sin-trackear-en-el-desk-co --root . --format json: esa tarea real tiene un gate con 1 finding (code rules/rule-activation-task-code); fija la forma exacta {level, code, subject, what}. 2) Editar renderGateBoxes en board.js y styles.css. 3) Las pruebas de (3). 4) Verificación en navegador headless (playwright, chromium) sobre el desk real: python3 frontends/desk/serve.py 8091 --root ../../deskops; abrir la vista Tarea de esa tarea y el inspector del Board con ella seleccionada; guardar runs/subagents/<run_dir del despacho>/gate-findings-task.png, gate-findings-board.png y timings.txt (ms hasta que el gate es visible, 3 cargas por pantalla).

## Validation

_List the checks required before this task can close._

- python -m pytest -q -rs tests/test_desk_ui_routes.py tests/test_mindmap_deskops.py
- python -m pytest -q -rs tests/e2e_desk_ui.py
- git diff --quiet HEAD -- frontends/desk/task.js frontends/desk/app.js

## Done When

_Name the observable condition that makes the task complete._

Con la UI servida sobre el desk real de deskops, la vista Tarea y el inspector del Board de la tarea del paso 1 muestran el nivel, el code rules/rule-activation-task-code y el what completo; un gate sin findings no muestra lista; las pruebas de la validación pasan; task.js y app.js no cambiaron; las 2 capturas y timings.txt están en el run_dir.
