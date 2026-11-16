---
sldb:
  by: agent
  at: '2026-11-16T19:16:15Z'
  authority: generated
  via: save_document_payload
id: task-edicion-contextual-de-relaciones-y-campos-con-control-de-concurrencia
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
- frontends/mindmap/persistence.py
depends_on:
- task-decisión-de-jp-el-workspace-de-graph-ui-edita-y-ancla-código-softfactory-k03-k05-k12-o-solo-muestra
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
files:
- frontends/mindmap/workspace_routes.py
- frontends/mindmap/serve.py
- frontends/mindmap/sldb_adapter.py
- frontends/mindmap/views/workspace/node/workspace-view.js
- frontends/mindmap/views/workspace/node/workspace.css
- docs/workspace-ui.md
- tests/test_mindmap_workspace_edit.py
- tests/test_mindmap_workspace_reader.py
- tests/e2e_mindmap_workspace.py
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

# Edicion contextual de relaciones y campos con control de concurrencia

## Rationale

_Explain why this task exists or the business driver behind it._

En softfactory_spec (K06, K11, K13, K15) el usuario edita campos y agrega o quita relaciones desde el workspace sin saber en qué archivo se persisten, y las ediciones concurrentes de agentes o del CLI no se pisan en silencio. Editar la KB SLDB es la función propia de graph_ui (JP, 2026-11-16: graph_ui y la UI de deskops son productos distintos), así que esta tarea sigue en graph_ui. La decisión de T4 (opción A, por ahora) limita solo el código: aquí se editan documentos y relaciones, nunca código.

## Goal

_Describe the concrete result this task must produce._

En el workspace de Mindmap (/workspace/node, puerto 8088; no el visor standalone de solo lectura de frontends/workspace en el 8090) se puede editar un campo de un documento desde 'Campos del Documento (IR)' de la proyección Documento y agregar o quitar una relación válida según el modelo desde el panel 'Contexto y Relaciones'. Cada escritura lleva la revisión del documento (su source_hash) y el servidor la rechaza con 409 si el documento cambió desde que se leyó, sin perder lo que el usuario escribió.

## Scope

_State what is in scope and what is out of scope._

ENTRA (solo modo local; en remote, 501 como hoy el workspace): (1) frontends/mindmap/workspace_routes.py y serve.py: POST /api/workspace/field {id:'Model:name', field_path, value, op:'set'|'remove', revision} y POST /api/workspace/relation {id, action:'add'|'remove', kind:'field'|'relation_doc', field|relation_type, target:'Model:name', revision}, enrutadas en serve.py do_POST con el mismo chequeo de Origin que /api/save; GET /api/workspace/relation-options?id= con las relaciones válidas. Todas las demás rutas del workspace siguen siendo GET de solo lectura (405/404 como hoy). (2) Escritura con sldb.api.apply_batch (toma store_lock entre procesos) con expected_source_hash = revision, bajo adapter.lock y refresh_for_concurrent_sessions: ConflictError -> 409 {ok:false, estado:'revision_obsoleta', expected, actual, current:{revision, payload}}; SLDBValidationError o relación no válida -> 422; respuesta 200 {ok:true, revision, content_hash}. La revisión es el source_hash que ya exponen /api/workspace/source (revision) y /api/workspace/node (file_revision). No se reutiliza el endpoint /api/save ni se toca .sldb/runtime/mindmap-view.json (/api/save reescribe la vista y usa claves sin modelo). (3) Relaciones válidas: kind=field, el campo está en __references__, __containment__ o __reference_models__ del modelo y el modelo del target (con su familia, pron WorldDeclaration.family_of) está permitido; se agrega o quita el 'Model:name' de la lista. kind=relation_doc, los RelationTypeDoc del store (WorldDeclaration.relation_types) con source_types, target_types y cardinalidad como pron RelationChecks; alta crea el RelationDoc con apply_batch action create, baja hace untrack. Las aristas que vienen de enlaces en la prosa ([[...]], origin link) se rechazan con 422 'edita el texto'. Hace falta exponer __reference_models__ en el esquema que arma sldb_adapter.py. (4) UI en frontends/mindmap/views/workspace/node/workspace-view.js: edición en línea por campo en 'Campos del Documento (IR)', y en el panel de contexto un '+ Agregar relación' con las opciones de relation-options y un botón de quitar por arista propia. Ante 409 se conserva el valor local, se muestra un aviso role=alert con el valor vigente, y se ofrece 'Reaplicar sobre la versión actual' (reintenta con la revisión nueva) o 'Descartar y recargar'. Tras un 200 se releen /source y /node. (5) docs/workspace-ui.md deja de decir 'lectura estricta' para Mindmap y documenta las dos rutas y el 409. (6) Pruebas nuevas en tests/test_mindmap_workspace_edit.py con los fixtures reales de tests/test_mindmap_workspace.py (test_env, server); tests/test_mindmap_workspace_reader.py se ajusta solo en la prueba de POST (404/405). NO ENTRA: editar código o anclajes de código (task.decision T4), el visor standalone frontends/workspace (8090), escribir enlaces en la prosa, el modo remote, y los cambios sin commitear de JP en frontends/desk/app.js y task.js.

## Implementation Path

_Outline the expected implementation route or affected surface._

1) Leer persistence.py:62-139 (lock, refresh, 409) y sldb/src/sldb/api/documents/apply_batch.py:26-57, batch_prevalidate.py:105-112 y core/exceptions/sldb_conflict_error.py para el guard por source_hash. 2) Servidor: rutas del alcance (1) en workspace_routes.py, resolviendo la identidad con el mismo resolve_indexed_document que usan las rutas GET; payload actual con pron.Store.payload; deep_set/deep_delete en memoria; apply_batch con expected_source_hash. 3) relation-options con WorldDeclaration(store).relation_types() y family_of, y __reference_models__ expuesto en sldb_adapter.schema. 4) UI del alcance (4) con htm, sin innerHTML. 5) Pruebas: editar un campo persiste y sobrevive a un make_server nuevo; add/remove de depends_on y de un RelationDoc del lifecycle de deskops; tipo o modelo no admitido -> 422; revisión obsoleta tras un pron.Store.replace hecho por otro proceso -> 409 sin cambiar los bytes del archivo (snapshot como tests/test_mindmap_workspace_reader.py:70); el PillDoc homónimo de task_a no se cruza; mindmap-view.json queda intacto; una arista de prosa no se puede quitar. 6) Un e2e en Chromium (en tests/e2e_mindmap_workspace.py): editar un campo, ver el 409 provocado por otro proceso con el aviso y el valor local conservado, y 'Reaplicar'.

## Validation

_List the checks required before this task can close._

- python -m pytest -q -rs tests/test_mindmap_workspace_edit.py tests/test_mindmap_workspace.py tests/test_mindmap_workspace_reader.py tests/test_mindmap_persistence.py
- python -m pytest -q -rs tests/e2e_mindmap_workspace.py
- node --test tests/*.test.mjs

## Done When

_Name the observable condition that makes the task complete._

Desde /workspace/node, editar un campo y agregar o quitar una relación válida persiste en el store real, sobrevive a reiniciar el servidor y respeta las relaciones del modelo; una escritura con revisión obsoleta responde 409 sin tocar el archivo y la UI conserva el valor local con las opciones Reaplicar y Descartar; mindmap-view.json no cambia; las pruebas de la validación pasan sin skips.
