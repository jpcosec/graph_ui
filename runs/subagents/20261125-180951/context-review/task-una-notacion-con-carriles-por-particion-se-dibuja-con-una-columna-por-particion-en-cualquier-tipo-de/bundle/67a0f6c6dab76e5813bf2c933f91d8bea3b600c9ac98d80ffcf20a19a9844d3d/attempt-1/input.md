FILE:desk/tasks/task-una-notacion-con-carriles-por-particion-se-dibuja-con-una-columna-por-particion-en-cualquier-tipo-de.md
---
sldb:
  by: agent
  at: '2026-11-25T17:44:54Z'
  authority: generated
  via: create_document
id: task-una-notacion-con-carriles-por-particion-se-dibuja-con-una-columna-por-particion-en-cualquier-tipo-de
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

# una notación con carriles por partición se dibuja con una columna por partición en cualquier tipo de diagrama

## Rationale

_Explain why this task exists or the business driver behind it._

ADR sldb/docs/architecture/mechanism-in-sldb-content-in-specir.md (JP, 2026-11-25): una notación pide un tipo de layout, no trae uno, y no hay código por notación. Hoy los carriles por partición solo existen para la actividad UML (views/specs/notation/notation-swimlanes.mjs, por data.partition) y el layout lanes es el de secuencia. BPMN y la notación de capas de specIR necesitan carriles y no los tienen.

## Goal

_Describe the concrete result this task must produce._

Que el layout de carriles por partición sea una capacidad genérica de la vista de notación, que cualquier notación pueda pedir.

## Scope

_State what is in scope and what is out of scope._

Dentro: frontends/mindmap/views/specs/notation/ (notation.mjs, notation-swimlanes.mjs, notation-layout.mjs). Fuera: la notación BPMN y la de capas (son de specIR), eventos y compuertas como formas nuevas.

## Implementation Path

_Outline the expected implementation route or affected surface._

Leer docs/representacion/README.md. Si hace falta un tipo de layout que sldb no acepta hoy (sldb/src/sldb/notations/notation_constants.py, LAYOUT_KINDS), pedirlo por el inbox de sldb con deskops message send; no se resuelve en graph_ui.

## Validation

_List the checks required before this task can close._

- node --test tests/notation-partition-lanes.test.mjs
- python -m pytest -q tests/e2e_notation_activity.py tests/e2e_mindmap_notation.py

## Done When

_Name the observable condition that makes the task complete._

Una notación de prueba que no es la de actividad, con nodos repartidos en tres particiones, se dibuja con tres columnas con su título y cada nodo dentro de la suya. La actividad UML se dibuja igual que antes. En el código de la vista no hay ninguna rama por nombre de notación ni por tipo de diagrama.

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
Cold-bundle de la tarea task-una-notacion-con-carriles-por-particion-se-dibuja-con-una-columna-por-particion-en-cualquier-tipo-de: con el TaskDoc, los rituales enrutados por el Board, las pills ligadas, los átomos ligados y los archivos que el TaskDoc nombra, reformula el encargo, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

Sección de validación del TaskDoc:
- node --test tests/notation-partition-lanes.test.mjs
- python -m pytest -q tests/e2e_notation_activity.py tests/e2e_mindmap_notation.py

