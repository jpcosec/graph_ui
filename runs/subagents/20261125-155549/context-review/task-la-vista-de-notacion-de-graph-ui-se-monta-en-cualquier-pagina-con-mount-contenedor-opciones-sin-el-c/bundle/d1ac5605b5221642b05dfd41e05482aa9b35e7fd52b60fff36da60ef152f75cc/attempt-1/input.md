FILE:desk/tasks/task-la-vista-de-notacion-de-graph-ui-se-monta-en-cualquier-pagina-con-mount-contenedor-opciones-sin-el-c.md
---
sldb:
  by: agent
  at: '2026-11-25T14:23:58Z'
  authority: generated
  via: save_document_payload
id: task-la-vista-de-notacion-de-graph-ui-se-monta-en-cualquier-pagina-con-mount-contenedor-opciones-sin-el-c
status: draft
summary: ''
tags: []
current_node: ritual-execution
history: []
references: []
depends_on:
- task-las-vistas-de-mindmap-reciben-request-y-la-url-base-del-servidor-en-vez-de-importar-shell-api-js-con
pills: []
files: []
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# La vista de notacion de graph_ui se monta en cualquier pagina con mount(contenedor, opciones) sin el cascaron

## Rationale

_Explain why this task exists or the business driver behind it._

Pedido de JP (2026-11-25), brief de johanes en /mnt/ssd/proyectos/SLDB_1/IR/runs/coordinacion-johanes.md (G-A/G-B). G-A: un panel de edicion embebible en cualquier UI con las mismas funciones que en graph_ui. Paso 2 de G-A: punto de entrada embebible para la vista de notacion.

## Goal

_Describe the concrete result this task must produce._

Un modulo frontends/mindmap/embed/notation.js que exporte mount(container, {baseUrl, spec, view, theme}) y unmount, que monte la vista de notacion con su SourceProvider y request(baseUrl) sin shell, y una pagina de ejemplo ajena (tests/fixtures/embed/host.html) que lo usa con una llamada.

## Scope

_State what is in scope and what is out of scope._

frontends/mindmap/embed/ (nuevo), la pagina host de prueba y una e2e nueva. Fuera: tema/storage con alcance (G-A3), otras vistas (G-A4).

## Implementation Path

_Outline the expected implementation route or affected surface._

Repo /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui. El importmap que hoy pone index.html (react, @xyflow/react, ...) lo tiene que poner la pagina anfitriona: documentarlo en el modulo y en la pagina host. e2e nueva tests/e2e_embed_notation.py: sirve graph_ui (como hacen las e2e de notacion con _serve), abre host.html (otro origen o ruta fuera de mindmap), monta una spec de fixtures y comprueba lo mismo que tests/e2e_mindmap_notation.py en su caso basico . Correccion de la revision de johanes: la vista de notacion es de solo lectura (nodesConnectable=false, sin dialogos de edicion), no hay label que editar. La e2e embebida comprueba lo que la vista hace: lista el catalogo, dibuja un spec, cambia de spec, 'Ver todo' encuadra, y no hay errores de pagina (console/pageerror). El importmap que pone la pagina anfitriona incluye elkjs ademas de react y @xyflow/react.

## Validation

_List the checks required before this task can close._

- python -m pytest -q tests/e2e_embed_notation.py tests/e2e_mindmap_notation.py

## Done When

_Name the observable condition that makes the task complete._

Una pagina ajena monta la vista de notacion con una llamada a mount(...), lista el catalogo, dibuja y cambia de spec y encuadra con 'Ver todo' sin errores de pagina; tests/e2e_embed_notation.py pasa junto con tests/e2e_mindmap_notation.py.

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
Cold-bundle de la tarea task-la-vista-de-notacion-de-graph-ui-se-monta-en-cualquier-pagina-con-mount-contenedor-opciones-sin-el-c: con el TaskDoc, los rituales enrutados por el Board, las pills ligadas, los átomos ligados y los archivos que el TaskDoc nombra, reformula el encargo, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

Sección de validación del TaskDoc:
- python -m pytest -q tests/e2e_embed_notation.py tests/e2e_mindmap_notation.py

