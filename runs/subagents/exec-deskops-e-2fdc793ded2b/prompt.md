Task: task-las-vistas-de-mindmap-reciben-request-y-la-url-base-del-servidor-en-vez-de-importar-shell-api-js-con
Title: Las vistas de mindmap reciben request y la URL base del servidor en vez de importar shell/api.js con rutas absolutas
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
  at: '2026-11-25T14:11:03Z'
  authority: generated
  via: create_document
id: task-las-vistas-de-mindmap-reciben-request-y-la-url-base-del-servidor-en-vez-de-importar-shell-api-js-con
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

# Las vistas de mindmap reciben request y la URL base del servidor en vez de importar shell/api.js con rutas absolutas

## Rationale

_Explain why this task exists or the business driver behind it._

Pedido de JP (2026-11-25), brief de johanes en /mnt/ssd/proyectos/SLDB_1/IR/runs/coordinacion-johanes.md (G-A/G-B). G-A: un panel de edicion embebible en cualquier UI con las mismas funciones que en graph_ui. Hoy notation-view.js:4 y otras vistas importan request de shell/api.js y usan rutas absolutas /api/..., /skins/*.css, /views/.../*.css, lo que impide montarlas en otra pagina.

## Goal

_Describe the concrete result this task must produce._

Que toda vista de frontends/mindmap/views reciba request (y la base URL) por su contexto/props, igual que SourceProvider ya recibe request inyectado (app.js, source/source.js), y que ninguna ruta del cliente sea absoluta a la raiz.

## Scope

_State what is in scope and what is out of scope._

frontends/mindmap/views/**, frontends/mindmap/shell/api.js, frontends/mindmap/app.js y los tests node que toquen. Fuera: mount() embebible (G-A2), tema y storage (G-A3).

## Implementation Path

_Outline the expected implementation route or affected surface._

Repo /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui. Inventario: grep -rn "shell/api" frontends/mindmap/views (hoy: workspace-view.js, notation-view.js, document-ficha.js, deskops-view.js, flow-view.js) y grep -rn "'/api\|/skins/\|/views/" frontends/mindmap --include=*.js. shell/api.js exporta createRequest(baseUrl) que devuelve request(path, init) resolviendo path contra baseUrl (default ''), y request sigue existiendo como createRequest('') para no romper. Las vistas toman request del contexto que app.js ya provee (o de una prop) en vez de importarlo; las URLs de css/skins se resuelven contra la base. Comportamiento en graph_ui: identico.

## Validation

_List the checks required before this task can close._

- node --test tests/*.test.mjs && python -m pytest -q tests/e2e_mindmap_notation.py tests/e2e_notation_activity.py

## Done When

_Name the observable condition that makes the task complete._

Ninguna vista importa request de shell/api.js; createRequest(base) resuelve rutas contra la base; node --test de tests/*.test.mjs y las e2e de notacion pasan como hoy.

## Entrega del ejecutor

Al terminar, commitea solo los archivos que cambiaste para la tarea, nombrados uno por uno (los mismos que listas en result-summary.md):

    git add <ruta> <ruta> ...
    git commit -m "<resumen>" -m "Task-Id: task-las-vistas-de-mindmap-reciben-request-y-la-url-base-del-servidor-en-vez-de-importar-shell-api-js-con"

Nunca uses `git add -A`, `git add -u` sobre todo el arbol ni `git stash`: puede haber trabajo ajeno sin commitear. No hagas push. Recien despues ejecuta `deskops advance task`.

## Temporales de pytest

Antes de cualquier pytest exporta, para que sus temporales caigan en el /tmp del contenedor (muere con el agente) y no en el /dev/shm del host:

    export PYTEST_ADDOPTS="--basetemp=/tmp/pytest-deskops-e-2fdc793ded2b"

## Tu worktree

Tu codigo vive en un worktree propio, en la rama `deskops/deskops-e-2fdc793ded2b`:

    /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui/.worktrees/deskops-e-2fdc793ded2b

Haz `cd` ahi: edita, corre los tests y commitea ahi (git add / git commit), no en el checkout principal /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui. Las operaciones de desk (`deskops ... --root /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui`, evidencia en runs/subagents/..., `deskops advance task`) siguen usando el checkout principal. Al terminar, reap trae tus commits a la rama principal y borra el worktree.
