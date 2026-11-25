FILE:desk/tasks/task-de-un-spec-del-store-sale-un-svg-del-modo-lector-con-el-mismo-layout-que-la-vista-de-notacion.md
---
sldb:
  by: agent
  at: '2026-11-25T14:24:08Z'
  authority: generated
  via: save_document_payload
id: task-de-un-spec-del-store-sale-un-svg-del-modo-lector-con-el-mismo-layout-que-la-vista-de-notacion
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

# De un spec del store sale un SVG del modo lector con el mismo layout que la vista de notacion

## Rationale

_Explain why this task exists or the business driver behind it._

Pedido de JP (2026-11-25), brief de johanes en /mnt/ssd/proyectos/SLDB_1/IR/runs/coordinacion-johanes.md (G-A/G-B). G-B: exportar el modo lector como HTML o SVG estatico, como los que tenia spec2viz, con el mismo dibujo que la vista interactiva. El generador usa la logica pura que ya existe y se prueba con node --test: sceneFor (notation.mjs:351), bestLayout (notation-layout.mjs), notation-style.mjs, notation-swimlanes.mjs, notation-deployment.mjs. No un segundo layout.

## Goal

_Describe the concrete result this task must produce._

Un modulo puro frontends/mindmap/views/specs/notation/notation-svg.mjs con exportSvg(view, opts) -> string SVG, a partir del mismo payload de GET /api/notation/view, y una prueba que compare posiciones con la vista interactiva.

## Scope

_State what is in scope and what is out of scope._

frontends/mindmap/views/specs/notation/notation-svg.mjs (nuevo) y tests/mindmap-notation-svg.test.mjs. Fuera: HTML autocontenido y CLI (G-B2).

## Implementation Path

_Outline the expected implementation route or affected surface._

Repo /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui. exportSvg llama sceneFor + bestLayout con la misma medida de texto que la vista (o una aproximada inyectable, como approximateMeasure de notation-layout.mjs) y dibuja glyphs, aristas y swimlanes con los estilos de notation-style.mjs. Test node: para las specs de tests/fixtures/notation-* (al menos una de actividad con carriles y una de clases), las posiciones de los nodos en el SVG coinciden con las de la escena que usa la vista (mismas posiciones relativas, tolerancia de 1 px). Ampliacion (revision de johanes): bestLayout solo cubre la escena graph. Secuencias (lanes) y matrices (grid) calculan su geometria en laneScene y gridScene (notation.mjs), pero su dibujo vive como componentes htm en notation-view.js (LanesDiagram, GridDiagram). Para que exportSvg cubra los 8 tipos de diagrama, sacar ese dibujo a un modulo puro (p. ej. notation-draw.mjs) que usen tanto la vista como el exportador, sin cambiar lo que la vista muestra. La prueba incluye ademas una secuencia y una matriz. En node no hay canvas: las posiciones se comparan contra la escena calculada con la misma medida aproximada (approximateMeasure), no contra la del navegador.

## Validation

_List the checks required before this task can close._

- node --test tests/mindmap-notation-svg.test.mjs tests/mindmap-notation.test.mjs tests/mindmap-notation-layout.test.mjs

## Done When

_Name the observable condition that makes the task complete._

exportSvg produce un SVG valido de los 8 tipos de diagrama (al menos actividad con carriles, clases, una secuencia y una matriz en la prueba), con las mismas posiciones que la escena calculada con la misma medida; la vista sigue dibujando igual usando el mismo modulo de dibujo; tests/mindmap-notation-svg.test.mjs y los tests node de notacion pasan.

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
Cold-bundle de la tarea task-de-un-spec-del-store-sale-un-svg-del-modo-lector-con-el-mismo-layout-que-la-vista-de-notacion: con el TaskDoc, los rituales enrutados por el Board, las pills ligadas, los átomos ligados y los archivos que el TaskDoc nombra, reformula el encargo, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

Sección de validación del TaskDoc:
- node --test tests/mindmap-notation-svg.test.mjs tests/mindmap-notation.test.mjs tests/mindmap-notation-layout.test.mjs

