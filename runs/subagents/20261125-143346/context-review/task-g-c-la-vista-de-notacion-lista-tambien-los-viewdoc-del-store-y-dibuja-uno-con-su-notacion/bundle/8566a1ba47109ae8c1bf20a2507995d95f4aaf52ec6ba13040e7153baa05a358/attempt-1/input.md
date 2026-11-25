FILE:desk/tasks/task-g-c-la-vista-de-notacion-lista-tambien-los-viewdoc-del-store-y-dibuja-uno-con-su-notacion.md
---
sldb:
  by: agent
  at: '2026-11-25T14:21:08Z'
  authority: generated
  via: create_document
id: task-g-c-la-vista-de-notacion-lista-tambien-los-viewdoc-del-store-y-dibuja-uno-con-su-notacion
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

# G-C: la vista de notacion lista tambien los ViewDoc del store y dibuja uno con su notacion

## Rationale

_Explain why this task exists or the business driver behind it._

Pedido de JP via johanes (2026-11-25 11:50, /mnt/ssd/proyectos/SLDB_1/IR/runs/coordinacion-johanes.md): la vista de notacion solo lista SpecDoc (specCatalog en frontends/mindmap/views/specs/notation/notation.mjs:18 filtra model_name === 'SpecDoc') y ninguna vista del frontend consume /api/views; un ViewDoc con notacion se evalua en el servidor pero no se puede ver. Es previo a ver la cadena de specIR con su propia notacion.

## Goal

_Describe the concrete result this task must produce._

Que la vista de notacion liste los ViewDoc del store junto a los SpecDoc y dibuje un ViewDoc con su notacion, reusando el mismo lienzo y layout.

## Scope

_State what is in scope and what is out of scope._

frontends/mindmap/views/specs/notation/ (catalogo y carga), frontends/mindmap/views_routes.py solo si hace falta exponer algo, un test node y una e2e. Fuera: crear ViewDoc desde la UI, la notacion de specIR (va en IR).

## Implementation Path

_Outline the expected implementation route or affected surface._

Repo /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui. specCatalog incluye tambien los ViewDoc que tengan notacion (marcados como vista, agrupados por category si la traen, si no en su propio grupo). Al elegir un ViewDoc, la vista pide su evaluacion (GET /api/views/evaluate?view=ViewDoc:<name>, ver views_routes.py:3-7) y, si el resultado trae lo mismo que GET /api/notation/view para un spec, lo dibuja con el mismo camino (sceneFor + bestLayout); si el payload difiere, adaptarlo en un punto (funcion pura testeada), sin un segundo layout. Test node en tests/mindmap-notation.test.mjs (o uno nuevo): specCatalog con un SpecDoc y un ViewDoc lista ambos. e2e nueva tests/e2e_notation_viewdoc.py: store temporal con un ViewDoc y una notacion propia (sincronizada con sldb notations sync), abre la vista de notacion, el ViewDoc aparece en la lista y al elegirlo se dibujan sus nodos.

## Validation

_List the checks required before this task can close._

- node --test tests/mindmap-notation.test.mjs && python -m pytest -q tests/e2e_notation_viewdoc.py tests/e2e_mindmap_notation.py

## Done When

_Name the observable condition that makes the task complete._

La vista de notacion lista y dibuja un ViewDoc con su notacion; el test node y tests/e2e_notation_viewdoc.py pasan junto con tests/e2e_mindmap_notation.py.

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
Cold-bundle de la tarea task-g-c-la-vista-de-notacion-lista-tambien-los-viewdoc-del-store-y-dibuja-uno-con-su-notacion: con el TaskDoc, los rituales enrutados por el Board, las pills ligadas, los átomos ligados y los archivos que el TaskDoc nombra, reformula el encargo, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

Sección de validación del TaskDoc:
- node --test tests/mindmap-notation.test.mjs && python -m pytest -q tests/e2e_notation_viewdoc.py tests/e2e_mindmap_notation.py

