Task: task-g-d-el-layout-de-notacion-corta-en-el-primer-candidato-legible-y-elk-corre-en-un-worker
Title: G-D: el layout de notacion corta en el primer candidato legible y ELK corre en un worker
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
  at: '2026-11-25T14:22:45Z'
  authority: generated
  via: create_document
id: task-g-d-el-layout-de-notacion-corta-en-el-primer-candidato-legible-y-elk-corre-en-un-worker
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

# G-D: el layout de notacion corta en el primer candidato legible y ELK corre en un worker

## Rationale

_Explain why this task exists or the business driver behind it._

Medido por specir-graph-ui-parity en Chrome (johanes, /mnt/ssd/proyectos/SLDB_1/IR/runs/coordinacion-johanes.md): activity.render-error-handling (13 nodos, 17 relaciones) hace 99 corridas de ELK y tarda 3,5 s, las demas specs 24 corridas y 0,3-0,5 s. bestLayout (frontends/mindmap/views/specs/notation/notation-layout.mjs:469-523) prueba 24 candidatos y, si el mejor tiene problemas o queda bajo el zoom legible, repite 24 en la otra direccion y otros 24 por direccion sin reservar rotulos. ELK se instancia sin worker (notation-view.js:25): la pagina no responde mientras tanto.

## Goal

_Describe the concrete result this task must produce._

Que bestLayout corte en el primer candidato sin problemas y con zoom legible, que ELK corra en un worker, y que una prueba fije un tope de corridas para esa spec.

## Scope

_State what is in scope and what is out of scope._

notation-layout.mjs (bestLayout), notation-view.js (instancia de ELK), tests node de layout y una e2e o medicion. Fuera: cambiar el layout de las specs que ya salen bien.

## Implementation Path

_Outline the expected implementation route or affected surface._

Repo /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui. bestLayout: evaluar candidatos en el orden actual y devolver el primero sin problemas y con zoom >= legible; solo si ninguno lo cumple seguir con la otra direccion y luego sin reservar rotulos, como hoy; el resultado para las specs que hoy salen al primer intento no cambia. ELK con worker: elkjs trae elk-worker; instanciarlo con workerUrl servido por graph_ui (o el patron que use la libreria vendorizada), con fallback al hilo principal si el worker no carga. Prueba node en tests/mindmap-notation-layout.test.mjs: con un contador de corridas inyectado, la spec de actividad de 13 nodos (fixture: copiar activity.render-error-handling a tests/fixtures/ si no esta) no pasa de un tope (p. ej. 30) y las specs de fixtures existentes dan el mismo layout que antes.

## Validation

_List the checks required before this task can close._

- node --test tests/mindmap-notation-layout.test.mjs tests/mindmap-notation.test.mjs && python -m pytest -q tests/e2e_mindmap_notation.py tests/e2e_notation_activity.py

## Done When

_Name the observable condition that makes the task complete._

La spec de 13 nodos queda bajo el tope de corridas en la prueba node, las demas dan el mismo layout, ELK corre en un worker, y node --test de layout y la e2e de notacion pasan.

## Entrega del ejecutor

Al terminar, commitea solo los archivos que cambiaste para la tarea, nombrados uno por uno (los mismos que listas en result-summary.md):

    git add <ruta> <ruta> ...
    git commit -m "<resumen>" -m "Task-Id: task-g-d-el-layout-de-notacion-corta-en-el-primer-candidato-legible-y-elk-corre-en-un-worker"

Nunca uses `git add -A`, `git add -u` sobre todo el arbol ni `git stash`: puede haber trabajo ajeno sin commitear. No hagas push. Recien despues ejecuta `deskops advance task`.

## Temporales de pytest

Antes de cualquier pytest exporta, para que sus temporales caigan en el /tmp del contenedor (muere con el agente) y no en el /dev/shm del host:

    export PYTEST_ADDOPTS="--basetemp=/tmp/pytest-deskops-e-d47d4a975df5"

## Tu worktree

Tu codigo vive en un worktree propio, en la rama `deskops/deskops-e-d47d4a975df5`:

    /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui/.worktrees/deskops-e-d47d4a975df5

Haz `cd` ahi: edita, corre los tests y commitea ahi (git add / git commit), no en el checkout principal /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui. Las operaciones de desk (`deskops ... --root /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui`, evidencia en runs/subagents/..., `deskops advance task`) siguen usando el checkout principal. Al terminar, reap trae tus commits a la rama principal y borra el worktree.
