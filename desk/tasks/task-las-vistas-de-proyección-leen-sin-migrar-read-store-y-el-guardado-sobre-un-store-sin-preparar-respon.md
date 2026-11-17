---
sldb:
  by: agent
  at: '2026-11-17T04:08:50Z'
  authority: generated
  via: save_document_payload
id: task-las-vistas-de-proyección-leen-sin-migrar-read-store-y-el-guardado-sobre-un-store-sin-preparar-respon
status: active
summary: ''
tags:
- workspace:desk
- artifact:task
- host:robocop2
current_node: ritual-testing
history:
- task_activates
references:
- runs/subagents/20261116-read-store-tester-a1/result-summary.md
- runs/subagents/20261116-read-store-tester-a1/closeout-notes.md
- 1479e24
- frontends/mindmap/projection_views.py
depends_on: []
pills: []
files:
- frontends/mindmap/sldb_adapter.py
- frontends/mindmap/views_routes.py
- frontends/mindmap/persistence.py
- tests/test_mindmap_persistence.py
- tests/test_projection_views.py
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# Las vistas de proyección leen sin migrar (read_store) y el guardado sobre un store sin preparar responde 503, no 500

## Rationale

_Explain why this task exists or the business driver behind it._

Al cerrar read_store (código 1479e24, closeout d7beba4) quedaron dos huecos fuera de su alcance. (a) runtime_documents en frontends/mindmap/sldb_adapter.py:403-413 abre el store con sldb.api.open_store, que migra un layout no canónico al leer. Lo llaman evaluate_view y list_views de frontends/mindmap/projection_views.py:109 y :127, que sirven GET de views_routes.py, así que un GET de vistas puede reescribir el store, justo lo que read_store evita en el workspace. (b) El tester independiente (runs/subagents/20261116-read-store-tester-a1/result-summary.md, hallazgo F2) vio que POST /api/save sobre un store des-preparado con el servidor ya arrancado pasó de 409 a 500 'store not prepared'. La causa es que persistence.py:77 llama a adapter.refresh_for_concurrent_sessions(), que ahora usa read_store y lanza SLDBStoreError, y save no la traduce a SaveError. No escribe nada, pero el cliente recibe un 500 genérico.

## Goal

_Describe the concrete result this task must produce._

Ningún GET de frontends/mindmap migra el store. runtime_documents usa sldb.api.read_store en vez de open_store, y sobre un store sin preparar los GET de vistas responden 503 con el texto de sldb ('store not prepared'). POST /api/save sobre un store des-preparado responde 503 con ese texto y estado 'store_no_preparado', como el workspace, sin escribir nada.

## Scope

_State what is in scope and what is out of scope._

ENTRA: (1) frontends/mindmap/sldb_adapter.py runtime_documents: open_store(Path(store)) pasa a read_store(Path(store)); el docstring dice que no migra y que lanza 'store not prepared'. (2) frontends/mindmap/views_routes.py: un SLDBStoreError con 'store not prepared' que llegue desde evaluate_view o list_views se responde 503 con str(exc) y estado 'store_no_preparado'. Reusa la forma de respuesta de error que ya tenga ese módulo. (3) frontends/mindmap/persistence.py save: si refresh_for_concurrent_sessions lanza SLDBStoreError con 'store not prepared', se convierte en SaveError(str(exc), 503). SaveError ya acepta status. Si su respuesta no lleva campo de estado, se agrega 'store_no_preparado' solo en este caso. (4) Pruebas: - En tests/test_mindmap_persistence.py, un POST /api/save sobre un store des-preparado con el servidor
  ya arrancado da 503 'store not prepared' y no cambia ningún archivo de .sldb (sha256 y mtime).
- En tests/test_projection_views.py,
  un GET de vistas sobre un store des-preparado da 503 y no cambia nada.
- El store no canónico se fabrica como en
  tests/test_mindmap_workspace_explorer.py::test_listing_get_on_unprepared_store_is_503_and_writes_nothing.
NO ENTRA: - el arranque del servidor (make_server), que sigue preparando el store con open_store; - el import de render_model_markdown/validate_model_input_roundtrip (sldb_adapter.py:31; pedido a sldb,
  nota 20261116-222854);
- cambiar sldb; frontends/desk.

## Implementation Path

_Outline the expected implementation route or affected surface._

1) grep -rn 'open_store\|runtime_documents(' frontends --include=*.py para fijar los puntos. 2) Cambiar runtime_documents. 3) Ubicar en views_routes.py dónde se atrapan ViewError y otros errores, y agregar el caso de SLDBStoreError (importada de sldb.core.exceptions, como en workspace_routes.py). 4) En persistence.save, envolver la llamada a refresh_for_concurrent_sessions. 5) Escribir las pruebas copiando la fabricación del store no canónico de la prueba existente. 6) Antes de cambiar nada, correr la validación y guardar la línea base.

## Validation

_List the checks required before this task can close._

- ! grep -rn open_store frontends/mindmap/sldb_adapter.py frontends/mindmap/projection_views.py frontends/mindmap/views_routes.py
- python -m pytest -q -rs tests/test_mindmap_persistence.py tests/test_projection_views.py tests/test_mindmap_workspace_explorer.py tests/test_mindmap_adapter.py tests/test_parallel_workspace_serve.py tests/test_mindmap_deskops.py
- python -m pytest -q -rs tests/e2e_mindmap_workspace.py tests/e2e_review_workbench_views.py

## Done When

_Name the observable condition that makes the task complete._

El grep no devuelve nada. Las pruebas pasan, incluidas las nuevas: 503 en save y en el GET de vistas sobre un store des-preparado, sin cambios en .sldb. Sobre el código anterior esas pruebas nuevas fallan.
