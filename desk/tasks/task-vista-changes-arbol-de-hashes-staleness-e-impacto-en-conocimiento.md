---
sldb:
  by: agent
  at: '2026-11-16T12:43:55Z'
  authority: generated
  via: save_document_payload
id: task-vista-changes-arbol-de-hashes-staleness-e-impacto-en-conocimiento
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
- host:robocop2
current_node: ritual-execution
history: []
references:
- /home/jp/proyectos/softfactory_spec/SPEC.md
- f16fcd1
- desk/tasks/task-decisión-de-jp-el-workspace-de-graph-ui-edita-y-ancla-código-softfactory-k03-k05-k12-o-solo-muestra.md
- ../../sldb/docs/architecture/code-anchoring.md
depends_on:
- task-workspace-inspect-mostrar-los-anclajes-de-código-de-un-documento-y-su-estado-leídos-de-codeanchordoc
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
files:
- frontends/mindmap/workspace_routes.py
- frontends/mindmap/sldb_adapter.py
- frontends/mindmap/views/workspace/node/
- tests/test_mindmap_changes.py
- tests/e2e_mindmap_workspace.py
- docs/workspace-ui.md
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms:
- atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node
closeout_evidence:
- tests
- commit
- atom
---

# Vista Changes: arbol de hashes, staleness e impacto en conocimiento

## Rationale

_Explain why this task exists or the business driver behind it._

En softfactory_spec (K04, K08) las mutaciones de contenido son señal de UX: quien inspecciona un nodo tiene que ver qué cambió y qué quedó potencialmente obsoleto por eso. graph_ui es un editor visual de la KB SLDB con función propia (JP, 2026-11-16), y esta vista es parte de esa función. sldb ya calcula todo el estado de cambio: el índice de relaciones marca los documentos stale (lo usa hoy workspace_routes.py), `stores check` reporta data_mutation (documento cambiado desde el índice) y `anchors check` da el estado de cada CodeAnchorDoc. graph_ui no guarda una línea base propia ni calcula hashes: proyecta lo que dice sldb. Con la decisión de T4 (opción A, por ahora) el código entra solo como estado de anclajes, de solo lectura.

## Goal

_Describe the concrete result this task must produce._

Añadir en /workspace la pestaña Changes y la sección Integrity del panel Context: listan los documentos que sldb reporta como cambiados o stale y los anclajes de código que no están intact, y para cada uno los documentos que dependen de él a 1-2 saltos en el índice de relaciones, marcados como potencialmente obsoletos. Todo de solo lectura.

## Scope

_State what is in scope and what is out of scope._

ENTRA: endpoint de solo lectura en frontends/mindmap (workspace_routes.py, con las llamadas a sldb en sldb_adapter.py) que junta los hallazgos de sldb (stale del índice, data_mutation de stores check, estados de anchors check con record=False) y las aristas entrantes a 1-2 saltos del índice; la pestaña Changes y la sección Integrity en views/workspace/node/; docs/workspace-ui.md; pruebas pytest y e2e con mutaciones reales en un store temporal. NO ENTRA: una línea base o cache de hashes propia de graph_ui; reparar, regrabar o reanclar (stores update, anchors record, anchors check --record); editar código (T4, opción A); ocultar o resumir hallazgos de sldb; tocar sldb (si falta una API, nota por inbox); los cambios sin commitear de JP en frontends/desk/app.js y task.js.

## Implementation Path

_Outline the expected implementation route or affected surface._

1) Fijar con el código de sldb la forma real de cada fuente: idx.stale (como workspace_routes._relations_state), los Finding de stores check y AnchorReport de sldb.api.anchors.check_anchors. 2) Reusar code_anchor_states de sldb_adapter.py (lo crea la tarea de anclajes de la que depende esta). 3) Cruzar cada documento afectado con sus aristas entrantes a 1-2 saltos del mismo índice. 4) Pestaña Changes: una tarjeta por cambio con su fuente sldb, su detalle sin resumir y los dependientes; sección Integrity en Context para el documento inspeccionado. 5) Pruebas sobre un store temporal real: editar a mano el Markdown de un documento (data_mutation y stale) y el cuerpo de una función anclada (changed), y comprobar tarjetas y dependientes.

## Validation

_List the checks required before this task can close._

- python -m pytest -q -rs tests/test_mindmap_changes.py
- python -m pytest -q -rs tests/e2e_mindmap_workspace.py

## Done When

_Name the observable condition that makes the task complete._

En un store temporal real, tras editar un documento y el cuerpo de una función anclada, la pestaña Changes y la sección Integrity listan el documento cambiado y el anclaje changed con el detalle que da sldb y sus dependientes a 1-2 saltos; con el store limpio no listan nada; graph_ui no escribe en el store al calcularlo; tests/test_mindmap_changes.py y el e2e pasan sin skips.
