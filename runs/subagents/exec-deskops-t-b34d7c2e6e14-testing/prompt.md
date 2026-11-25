Task: task-de-un-spec-del-store-sale-un-svg-del-modo-lector-con-el-mismo-layout-que-la-vista-de-notacion
Title: De un spec del store sale un SVG del modo lector con el mismo layout que la vista de notacion
Status: active
Current node: ritual-testing
Task type: task.code
Lifecycle gates:
- task_hands_to_closeout -> ritual-closeout: open [nonempty(validation)]
  post-hook evento-para-el-coordinador: sh -c mkdir -p runs/hooks && printf '%s %s %s %s->%s\n' "$(date -u +%FT%TZ)" "$DESKOPS_TASK_ID" "$DESKOPS_TRANSITION" "$DESKOPS_FROM_NODE" "$DESKOPS_TO_NODE" >> runs/hooks/events.log
  post-hook encola-reap-del-tester: deskops queue add dispatch-reap --root .

---
sldb:
  by: agent
  at: '2026-11-25T15:16:45Z'
  authority: generated
  via: save_document_payload
id: task-de-un-spec-del-store-sale-un-svg-del-modo-lector-con-el-mismo-layout-que-la-vista-de-notacion
status: active
summary: ''
tags: []
current_node: ritual-testing
history:
- task_activates
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

## Como probar (tester)

Ubica el trabajo del ejecutor:

    git log -1 --format=%H --grep "Task-Id: task-de-un-spec-del-store-sale-un-svg-del-modo-lector-con-el-mismo-layout-que-la-vista-de-notacion"   # commit del ejecutor
    git show --name-only <commit>                           # sus archivos

Los tests a correr son los archivos tests/*.py de ese commit, mas tests/test_<modulo>.py cuando exista para cada modulo de codigo tocado; de a uno, con `TMPDIR=/tmp python -m pytest -q <archivo>`. No corras la suite completa: la corre integrate en el host.

Escribe result-summary.md con el veredicto PASA o FALLA en la primera linea.

## Temporales de pytest

Antes de cualquier pytest exporta, para que sus temporales caigan en el /tmp del contenedor (muere con el agente) y no en el /dev/shm del host:

    export PYTEST_ADDOPTS="--basetemp=/tmp/pytest-deskops-t-b34d7c2e6e14"
