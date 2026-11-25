Task: task-la-vista-de-notacion-de-graph-ui-se-monta-en-cualquier-pagina-con-mount-contenedor-opciones-sin-el-c
Title: La vista de notacion de graph_ui se monta en cualquier pagina con mount(contenedor, opciones) sin el cascaron
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

## Entrega del ejecutor

Al terminar, commitea solo los archivos que cambiaste para la tarea, nombrados uno por uno (los mismos que listas en result-summary.md):

    git add <ruta> <ruta> ...
    git commit -m "<resumen>" -m "Task-Id: task-la-vista-de-notacion-de-graph-ui-se-monta-en-cualquier-pagina-con-mount-contenedor-opciones-sin-el-c"

Nunca uses `git add -A`, `git add -u` sobre todo el arbol ni `git stash`: puede haber trabajo ajeno sin commitear. No hagas push. Recien despues ejecuta `deskops advance task`.

## Temporales de pytest

Antes de cualquier pytest exporta, para que sus temporales caigan en el /tmp del contenedor (muere con el agente) y no en el /dev/shm del host:

    export PYTEST_ADDOPTS="--basetemp=/tmp/pytest-deskops-e-edb4d68cbe34"

## Tu worktree

Tu codigo vive en un worktree propio, en la rama `deskops/deskops-e-edb4d68cbe34`:

    /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui/.worktrees/deskops-e-edb4d68cbe34

Haz `cd` ahi: edita, corre los tests y commitea ahi (git add / git commit), no en el checkout principal /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui. Las operaciones de desk (`deskops ... --root /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui`, evidencia en runs/subagents/..., `deskops advance task`) siguen usando el checkout principal. Al terminar, reap trae tus commits a la rama principal y borra el worktree.
