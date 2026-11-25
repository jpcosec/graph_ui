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
