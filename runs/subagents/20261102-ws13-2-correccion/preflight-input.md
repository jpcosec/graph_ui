FILE:desk/tasks/task-corregir-ws13-2-frontera-api-raíces-identidad-visible-y-estado-de-carga.md
---
id: task-corregir-ws13-2-frontera-api-raíces-identidad-visible-y-estado-de-carga
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
current_node: ritual-execution
history: []
references:
- runs/subagents/20261102-ws13-2-correccion/review-source.md
- runs/subagents/20261102-ws13-2-explorador/checkpoint.md
- runs/subagents/20261102-ws13-2-explorador/result-summary.md
- runs/subagents/workspace-documental-acceptance/ws13-2-g-ui-read.md
- runs/subagents/workspace-documental-acceptance/ws13-1-aceptacion-tecnica-root.md
- ../../deskops/desk/drawer/plans/workspace-documental/contratos/navegacion.md
- ../../deskops/desk/drawer/plans/workspace-documental/contratos/navegacion-aprobacion.md
depends_on: []
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
files:
- frontends/mindmap/workspace_routes.py
- frontends/mindmap/views/workspace/explorer/
- frontends/mindmap/views/workspace/node/workspace-view.js
- frontends/mindmap/views/workspace/node/workspace.css
- tests/test_mindmap_workspace_explorer.py
- tests/e2e_mindmap_workspace.py
- tests/mindmap-workspace-explorer.test.mjs
task_type: code
inherits_from: []
inherit_acceptance_context: false
atoms: []
from_drawer: desk/drawer/tasks/task-corregir-ws13-2-frontera-api-raices-identidad-estado.md
closeout_evidence:
- tests
- commit
---

# Corregir WS13.2: frontera API, raíces, identidad visible y estado de carga

## Rationale

_Explain why this task exists or the business driver behind it._

Root no aceptó WS13.2: el refresco importa sldb.store sin ensayar la vía pública, el filtro de raíces deja pasar árboles prohibidos, títulos iguales son indistinguibles y el explorador sugiere carga de modelo no conocida.

## Goal

_Describe the concrete result this task must produce._

Corregir los cuatro puntos en el explorador de graph_ui con pruebas reales y calibrar el hook de escrituras, sin iniciar WS13.3.

## Scope

_State what is in scope and what is out of scope._

Autoridad: runs/subagents/20261102-ws13-2-correccion/review-source.md. Contrato: contratos/navegacion.md sha256 6a4f8518f3d69de6118550b3077921db4bbb46bc9123c26980c6c8fc5f62361e, §2.2, §3.3, §5.4, H-02. Límites heredados: runs/subagents/workspace-documental-acceptance/ws13-1-aceptacion-tecnica-root.md. Estado de partida: runs/subagents/20261102-ws13-2-explorador/result-summary.md y checkpoint.md. La tarea está activa y enrutada; status draft es el campo del modelo. Base: ec0eb43 en main o posterior; el Executor registra el SHA que encuentra.

Archivos, lista cerrada: frontends/mindmap/workspace_routes.py; frontends/mindmap/views/workspace/explorer/explorer-view.js y explorer.mjs; frontends/mindmap/views/workspace/node/workspace-view.js y workspace.css, solo para estados e identidad; tests/test_mindmap_workspace_explorer.py; tests/e2e_mindmap_workspace.py; tests/mindmap-workspace-explorer.test.mjs.

1. Frontera API. Primero se ensaya sobre store canónico preparado: reemplazar _fresh_listing por sldb.api.open_store(<directorio .sldb explícito>, mode="readonly"), que termina llamando las dos new_operation (sldb api/stores/open_store.py:40-41). Se adopta si pasa cero escrituras observadas, hashes iguales y refresco entre procesos. Observar escrituras: sys.addaudithook en un proceso real de serve.py, registrando open con modo de escritura, os.remove, os.rename, os.mkdir y equivalentes. El Executor lo usa en sus pruebas; la calibración positiva independiente la hace el Tester. Refresco: alta, baja, track y untrack desde otro proceso con servidor vivo. Entonces no queda ningún import de sldb.store en el camino del refresco. Esto no habilita layout no canónico ni afirma que readonly lo proteja. Si se observa escritura incluso en canónico: reproductor preciso en result-summary.md; _fresh_listing queda sin cambios en ese caso, se sigue con los puntos 2 a 4, sin caché propia, y el Supervisor lo lleva a root. Un store inexistente sigue dando su error sin crearlo: comprobarlo antes de llamar open_store.

2. Raíces. Una raíz configurada cuya ruta tenga cualquier componente prohibido (empieza por punto, __pycache__, node_modules) se rechaza en roots_invalid antes de enumerar, tanto directa como anidada. Configuración mixta: conserva las raíces válidas y diagnostica las demás. Ningún metadato del listado sale de esos árboles, con git y sin git. Se conservan rutas legítimas con espacios y unicode. Sigue sin haber raíz desde el cliente y el fallo cerrado.

3. Títulos repetidos. Cada entrada del explorador muestra de forma visible, no solo en tooltip, la ruta relativa del documento como identificador secundario, siempre, también cuando título y nombre coincidan. Identidad canónica intacta; sin renombrar archivos ni duplicar registros.

4. Estado de modelo. El estado ok de /explorer es de guardia y listado, no prueba de carga. Mientras /nodes está pendiente o falló, la entrada modelada muestra el estado modelo_sin_confirmar, con el texto «modelo sin confirmar», y el error de /nodes que ya muestra la vista no se borra. Al llegar /nodes se actualizan título y diagnóstico. Sin protocolo nuevo ni instantánea transaccional.

Fuera de alcance: shell/api.js, persistencia, edición, frontends/workspace/, WS13.3, render Markdown, API nueva de sldb, formato interno, Scion, push, puertos 8090, 8091 y 8092, tareas draft hermanas, fuentes globales del plan.

Roles. Supervisor: commit, suite general una vez sobre bytes finales, demo en 8092. Tester: otro agente, con calibración positiva del hook. El Executor implementa y prueba, sin commits ni Board, y no corre la suite general. Sin mocks ni stubs: stores temporales reales; retener una respuesta GET real con page.route es admisible. Bloqueo que no quepa: concreto en result-summary.md con el avance hecho. Sin preguntar al solicitante.

## Implementation Path

_Outline the expected implementation route or affected surface._

1. Ensayar open_store con fallo previo observado. 2. Raíces. 3. Identidad visible. 4. Estado de modelo. 5. Pruebas. 6. result-summary.md y handoff.

## Validation

_List the checks required before this task can close._

- python -m pytest -q tests/test_mindmap_workspace_explorer.py
- python -m pytest -q tests/e2e_mindmap_workspace.py
- node --test tests/mindmap-workspace-explorer.test.mjs
- Tester independiente con ejecución deja runs/subagents/20261102-ws13-2-correccion/tester-result-summary.md

## Done When

_Name the observable condition that makes the task complete._

Acceptance. 1: sin import de sldb.store en el refresco, con refresco entre procesos y cero escrituras comprobadas por observación de operaciones, no solo por hashes; o reproductor preciso. 2: cada raíz prohibida directa y anidada, mixta, con git y sin git, con centinelas .md que no aparecen ni se abren. 3: prueba DOM con dos títulos iguales y rutas distintas, abriendo cada uno a su origen. 4: /nodes real retenida con modelo no importable: sin afirmación de carga; al llegar, diagnóstico. Tester independiente con control positivo del hook. Suite general ejecutada una vez sobre bytes finales con atribución exacta. G_HUMAN_READ y WS16 pendientes; WS13.3 sin iniciar.

