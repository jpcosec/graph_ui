FILE:desk/tasks/task-el-modo-local-de-mindmap-abre-el-store-por-sldb-api-y-graph-ui-deja-de-depender-de-pron.md
---
sldb:
  by: agent
  at: '2026-11-25T17:44:50Z'
  authority: generated
  via: create_document
id: task-el-modo-local-de-mindmap-abre-el-store-por-sldb-api-y-graph-ui-deja-de-depender-de-pron
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

# el modo local de mindmap abre el store por sldb.api y graph_ui deja de depender de pron

## Rationale

_Explain why this task exists or the business driver behind it._

ADR sldb/docs/architecture/pron-is-archived.md (JP, 2026-11-25): pron se archiva y la puerta a un store es sldb. El modo local, que es el default, abre el store con pron.world.store.Store (frontends/mindmap/sldb_adapter.py:87) y el editor de clases también (models_service.py). Todo lo que le piden existe en sldb.api, y el modo remoto ya funciona sin pron.

## Goal

_Describe the concrete result this task must produce._

Que mindmap lea, cree, reemplace y quite documentos, registre modelos y edite clases en modo local llamando a sldb.api, sin importar pron.

## Scope

_State what is in scope and what is out of scope._

Dentro: frontends/mindmap/sldb_adapter.py, models_service.py, serve.py, pyproject.toml y .github/requirements-suite.txt. Fuera: la edición por gestos, el modo remoto, reescribir docs/ (tarea aparte).

## Implementation Path

_Outline the expected implementation route or affected surface._

Leer docs/mindmap-developer.md. sldb serve ya implementa las mismas operaciones sobre sldb.api (sldb/src/sldb/cli/serve/): se usan esas funciones, sin una capa nueva.

## Validation

_List the checks required before this task can close._

- ! grep -rnE '^(from|import) pron|pron\.world' frontends src
- python -m pytest -q tests

## Done When

_Name the observable condition that makes the task complete._

En un entorno sin pron instalado, la suite completa de tests/ pasa en modo local. Ningún archivo de frontends/ ni de src/ importa pron. pyproject.toml y requirements-suite.txt no lo nombran.

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
Cold-bundle de la tarea task-el-modo-local-de-mindmap-abre-el-store-por-sldb-api-y-graph-ui-deja-de-depender-de-pron: con el TaskDoc, los rituales enrutados por el Board, las pills ligadas, los átomos ligados y los archivos que el TaskDoc nombra, reformula el encargo, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

Sección de validación del TaskDoc:
- ! grep -rnE '^(from|import) pron|pron\.world' frontends src
- python -m pytest -q tests

