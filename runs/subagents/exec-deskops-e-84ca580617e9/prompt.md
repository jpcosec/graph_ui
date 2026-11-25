Task: task-g-c-la-vista-de-notacion-lista-tambien-los-viewdoc-del-store-y-dibuja-uno-con-su-notacion
Title: G-C: la vista de notacion lista tambien los ViewDoc del store y dibuja uno con su notacion
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

## Entrega del ejecutor

Al terminar, commitea solo los archivos que cambiaste para la tarea, nombrados uno por uno (los mismos que listas en result-summary.md):

    git add <ruta> <ruta> ...
    git commit -m "<resumen>" -m "Task-Id: task-g-c-la-vista-de-notacion-lista-tambien-los-viewdoc-del-store-y-dibuja-uno-con-su-notacion"

Nunca uses `git add -A`, `git add -u` sobre todo el arbol ni `git stash`: puede haber trabajo ajeno sin commitear. No hagas push. Recien despues ejecuta `deskops advance task`.

## Temporales de pytest

Antes de cualquier pytest exporta, para que sus temporales caigan en el /tmp del contenedor (muere con el agente) y no en el /dev/shm del host:

    export PYTEST_ADDOPTS="--basetemp=/tmp/pytest-deskops-e-84ca580617e9"

## Tu worktree

Tu codigo vive en un worktree propio, en la rama `deskops/deskops-e-84ca580617e9`:

    /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui/.worktrees/deskops-e-84ca580617e9

Haz `cd` ahi: edita, corre los tests y commitea ahi (git add / git commit), no en el checkout principal /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui. Las operaciones de desk (`deskops ... --root /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui`, evidencia en runs/subagents/..., `deskops advance task`) siguen usando el checkout principal. Al terminar, reap trae tus commits a la rama principal y borra el worktree.
