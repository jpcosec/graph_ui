Task: task-de-un-spec-del-store-sale-un-svg-del-modo-lector-con-el-mismo-layout-que-la-vista-de-notacion
Title: De un spec del store sale un SVG del modo lector con el mismo layout que la vista de notacion
Status: draft
Current node: ritual-execution
Task type: task.code
Lifecycle gates:
- task_activates -> ritual-testing: open [(none)]
  post-hook encola-reap-del-ejecutor: deskops queue add dispatch-reap --root .
  post-hook encola-tester: deskops queue add dispatch-tester --root .

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

## Entrega del ejecutor

Al terminar, commitea solo los archivos que cambiaste para la tarea, nombrados uno por uno (los mismos que listas en result-summary.md):

    git add <ruta> <ruta> ...
    git commit -m "<resumen>" -m "Task-Id: task-de-un-spec-del-store-sale-un-svg-del-modo-lector-con-el-mismo-layout-que-la-vista-de-notacion"

Nunca uses `git add -A`, `git add -u` sobre todo el arbol ni `git stash`: puede haber trabajo ajeno sin commitear. No hagas push. Recien despues ejecuta `deskops advance task`.

## Temporales de pytest

Antes de cualquier pytest exporta, para que sus temporales caigan en el /tmp del contenedor (muere con el agente) y no en el /dev/shm del host:

    export PYTEST_ADDOPTS="--basetemp=/tmp/pytest-deskops-e-51b69c93d00f"

## Tu worktree

Tu codigo vive en un worktree propio, en la rama `deskops/deskops-e-51b69c93d00f`:

    /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui/.worktrees/deskops-e-51b69c93d00f

Haz `cd` ahi: edita, corre los tests y commitea ahi (git add / git commit), no en el checkout principal /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui. Las operaciones de desk (`deskops ... --root /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui`, evidencia en runs/subagents/..., `deskops advance task`) siguen usando el checkout principal. Al terminar, reap trae tus commits a la rama principal y borra el worktree.
