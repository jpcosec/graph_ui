FILE:desk/tasks/task-las-vistas-de-mindmap-reciben-request-y-la-url-base-del-servidor-en-vez-de-importar-shell-api-js-con.md
---
sldb:
  by: agent
  at: '2026-11-25T14:11:03Z'
  authority: generated
  via: create_document
id: task-las-vistas-de-mindmap-reciben-request-y-la-url-base-del-servidor-en-vez-de-importar-shell-api-js-con
status: draft
summary: ''
tags: []
current_node: ritual-execution
history: []
references: []
depends_on: []
pills: []
files: []
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# Las vistas de mindmap reciben request y la URL base del servidor en vez de importar shell/api.js con rutas absolutas

## Rationale

_Explain why this task exists or the business driver behind it._

Pedido de JP (2026-11-25), brief de johanes en /mnt/ssd/proyectos/SLDB_1/IR/runs/coordinacion-johanes.md (G-A/G-B). G-A: un panel de edicion embebible en cualquier UI con las mismas funciones que en graph_ui. Hoy notation-view.js:4 y otras vistas importan request de shell/api.js y usan rutas absolutas /api/..., /skins/*.css, /views/.../*.css, lo que impide montarlas en otra pagina.

## Goal

_Describe the concrete result this task must produce._

Que toda vista de frontends/mindmap/views reciba request (y la base URL) por su contexto/props, igual que SourceProvider ya recibe request inyectado (app.js, source/source.js), y que ninguna ruta del cliente sea absoluta a la raiz.

## Scope

_State what is in scope and what is out of scope._

frontends/mindmap/views/**, frontends/mindmap/shell/api.js, frontends/mindmap/app.js y los tests node que toquen. Fuera: mount() embebible (G-A2), tema y storage (G-A3).

## Implementation Path

_Outline the expected implementation route or affected surface._

Repo /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui. Inventario: grep -rn "shell/api" frontends/mindmap/views (hoy: workspace-view.js, notation-view.js, document-ficha.js, deskops-view.js, flow-view.js) y grep -rn "'/api\|/skins/\|/views/" frontends/mindmap --include=*.js. shell/api.js exporta createRequest(baseUrl) que devuelve request(path, init) resolviendo path contra baseUrl (default ''), y request sigue existiendo como createRequest('') para no romper. Las vistas toman request del contexto que app.js ya provee (o de una prop) en vez de importarlo; las URLs de css/skins se resuelven contra la base. Comportamiento en graph_ui: identico.

## Validation

_List the checks required before this task can close._

- node --test tests/*.test.mjs && python -m pytest -q tests/e2e_mindmap_notation.py tests/e2e_notation_activity.py

## Done When

_Name the observable condition that makes the task complete._

Ninguna vista importa request de shell/api.js; createRequest(base) resuelve rutas contra la base; node --test de tests/*.test.mjs y las e2e de notacion pasan como hoy.

FILE:desk/rituals/execution.md
---
# ritual-xxx
id: ritual-execution
# List of step-xxx paths
steps: []
# e.g., layer:workflow, system:sldb
tags:
- workspace:desk
- system:graph_ui
- layer:workflow
---

# Execution ritual

## Purpose

_Explain why this ritual exists._

Keep graph_ui delivery scoped to one active task at a time, grounded in the board and its bound pills, so implementation stays narrow and reviewable.

## Trigger

_State when this ritual should start._

When a graph_ui task is promoted to active and implementation begins.

## Preconditions

_List the conditions that must hold before running the ritual._

- The task is the active item on `desk/tasks/Board.md`.
- The relevant pills are bound to the task.

## Validation

_List the checks that prove the ritual was performed correctly._

- Only the active task's scope was changed.
- Bound pill guardrails were respected.

## Failure Modes

_List common mistakes this ritual prevents._

- Implementing more than the active task.
- Bypassing bound pills or the board.

## Completion

_Describe what completion looks like._

The active task is implemented within scope and ready for the testing ritual.

## Step Details

_Generated from the step references above._

FILE:desk/rituals/testing.md
---
# ritual-xxx
id: ritual-testing
# List of step-xxx paths
steps: []
# e.g., layer:workflow, system:sldb
tags:
- workspace:desk
- system:graph_ui
- layer:workflow
---

# Testing ritual

## Purpose

_Explain why this ritual exists._

Prove the intended contract of a graph_ui task with the smallest relevant validation first, then broaden coverage when the change touches shared behavior.

## Trigger

_State when this ritual should start._

When the execution ritual for a task completes and the change needs validation.

## Preconditions

_List the conditions that must hold before running the ritual._

- The task implementation is complete.
- The affected test surface is known.

## Validation

_List the checks that prove the ritual was performed correctly._

- `pytest` passes for backend changes.
- `npm test` passes for `apps/review-workbench` changes.

## Failure Modes

_List common mistakes this ritual prevents._

- Broadening coverage before the narrow contract is proven.
- Skipping the frontend suite when the UI changed.

## Completion

_Describe what completion looks like._

The task's contract is proven green and the change is ready for closeout.

## Step Details

_Generated from the step references above._

FILE:desk/rituals/closeout.md
---
# ritual-xxx
id: ritual-closeout
# List of step-xxx paths
steps: []
# e.g., layer:workflow, system:sldb
tags:
- workspace:desk
- system:graph_ui
- layer:workflow
---

# Closeout ritual

## Purpose

_Explain why this ritual exists._

Close a graph_ui task only after validation passes, the board reflects reality, and the final change is captured as its own atomic commit.

## Trigger

_State when this ritual should start._

When the testing ritual passes and the task is ready to be closed.

## Preconditions

_List the conditions that must hold before running the ritual._

- Validation is green.
- The board and task status match the implemented reality.

## Validation

_List the checks that prove the ritual was performed correctly._

- The task is marked resolved on `desk/tasks/Board.md`.
- The closing change is a single atomic commit.

## Failure Modes

_List common mistakes this ritual prevents._

- Closing without green validation.
- Leaving the board out of sync with the code.

## Completion

_Describe what completion looks like._

The task is resolved, the board is reconciled, and the closeout commit is recorded.

## Step Details

_Generated from the step references above._

FILE:instruccion
Cold-bundle de la tarea task-las-vistas-de-mindmap-reciben-request-y-la-url-base-del-servidor-en-vez-de-importar-shell-api-js-con: con el TaskDoc, los rituales enrutados por el Board, las pills ligadas, los átomos ligados y los archivos que el TaskDoc nombra, reformula el encargo, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

Sección de validación del TaskDoc:
- node --test tests/*.test.mjs && python -m pytest -q tests/e2e_mindmap_notation.py tests/e2e_notation_activity.py

