FILE:desk/tasks/task-el-lector-del-workspace-y-el-adaptador-usan-la-lectura-pública-de-sldb-read-store-extract-payload-en.md
---
sldb:
  by: agent
  at: '2026-11-16T12:55:21Z'
  authority: generated
  via: save_document_payload
id: task-el-lector-del-workspace-y-el-adaptador-usan-la-lectura-pública-de-sldb-read-store-extract-payload-en
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
- host:robocop2
current_node: ritual-execution
history: []
references:
- desk/inbox/20261116-073057-suggestion-sldb-api-read-store-store-is-prepared-y-extract-payload-lectura-p-blica-sin-migrar.md
- ../../sldb/src/sldb/api/stores/read_store.py
- ../../sldb/src/sldb/api/documents/extract_payload.py
- ../../sldb/docs/architecture/store-declaration.md
depends_on:
- task-ir13-migrar-graph-ui-de-spec2viz-a-sldb-api-notations-resolve-view-sync-de-specs-viewdoc-pilotos-com
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
files:
- frontends/mindmap/sldb_adapter.py
- frontends/mindmap/workspace_routes.py
- frontends/mindmap/persistence.py
- tests/deskops_viewdocs.py
- tests/test_mindmap_workspace_explorer.py
- pyproject.toml
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# El lector del workspace y el adaptador usan la lectura pública de sldb (read_store, extract_payload) en vez de módulos internos

## Rationale

_Explain why this task exists or the business driver behind it._

sldb publicó en sldb.api (commits f515d91c y 336cde87 de sldb main; nota del inbox de graph_ui 20261116-073057) una lectura pública que no migra: read_store(store) -> StoreLocation abre una operación fresca de solo lectura (re-barre la caché runtime y el hash de documentos, así ve altas y bajas de otros procesos) y lanza SLDBStoreError 'store not prepared: run `sldb stores update`' si el layout no es canónico; store_is_prepared(store) -> bool; extract_payload(model_type, markdown) -> dict. graph_ui todavía importa internos de sldb para lo mismo: sldb.store.runtime_cache_signature.new_operation (frontends/mindmap/sldb_adapter.py, método refresh_for_concurrent_sessions) y sldb.runtime.validation.extract_model_data (frontends/mindmap/workspace_routes.py, método _extract_payload, y tests/deskops_viewdocs.py). Esos módulos no son contrato y pueden cambiar sin aviso.

## Goal

_Describe the concrete result this task must produce._

Ningún archivo .py bajo frontends/ ni tests/deskops_viewdocs.py importa sldb.store.runtime_cache_signature ni sldb.runtime.validation; las lecturas usan sldb.api.read_store y sldb.api.extract_payload, y un listado GET del workspace sobre un store sin preparar responde 503 con el texto de sldb ('store not prepared: run `sldb stores update`') en vez de migrar el store.

## Scope

_State what is in scope and what is out of scope._

ENTRA: (1) frontends/mindmap/sldb_adapter.py, método refresh_for_concurrent_sessions (línea ~371): 'from sldb.store.runtime_cache_signature import new_operation; new_operation(self.store)' pasa a 'from sldb.api import read_store; read_store(self.store)' (read_store hace ese new_operation y además el de documents_hash). (2) frontends/mindmap/workspace_routes.py: (a) _extract_payload (línea ~183) usa sldb.api.extract_payload(model_type, text) en lugar de sldb.runtime.validation.extract_model_data, mismo valor devuelto; (b) _fresh_listing (línea ~164), el único punto del módulo que abre el store en un GET (open_store(self.store_path, mode='readonly')), pasa a read_store(self.store_path); su docstring se reescribe: read_store no migra. Si read_store lanza SLDBStoreError con 'store not prepared', _fresh_listing la convierte en WorkspaceError(<mensaje de sldb>, 503, 'store_no_preparado') (WorkspaceError(mensaje, status, código) ya existe en el módulo; el 503 es el mismo estado que hoy da 'El store no está disponible.'). Las escrituras no cambian. (3) frontends/mindmap/persistence.py: solo el comentario de la línea ~74 que cita new_operation pasa a citar read_store. (4) tests/deskops_viewdocs.py línea 14 y 27: extract_model_data -> sldb.api.extract_payload. (5) tests/test_mindmap_workspace_explorer.py: una prueba nueva junto a test_refresh_path_has_no_sldb_store_import que recorre con ast (imports estáticos, como la existente) todos los .py de frontends/ y falla si alguno importa sldb.store.runtime_cache_signature o sldb.runtime.validation; y una prueba de que GET /api/workspace/nodes sobre un store con layout no canónico responde 503 con 'store not prepared' y no cambia ningún archivo del store. (6) pyproject.toml: no cambia (sldb sigue en 0.1.13 en su pyproject; no hay versión nueva que exigir). NO ENTRA: cambiar sldb; frontends/desk; las rutas de escritura.

## Implementation Path

_Outline the expected implementation route or affected surface._

1) grep -rnE 'runtime_cache_signature|runtime\.validation|extract_model_data|open_store' frontends tests/deskops_viewdocs.py para fijar la lista real. 2) Reemplazar los imports como dice el alcance (import directo desde sldb.api, sin envolver). 3) Para (4), revisar las rutas GET de workspace_routes.py que abren el store; read_store acepta la misma ruta .sldb. 4) Agregar la prueba de (5) con ast, igual que la existente. 5) Correr la validación. Requisito previo: el sldb instalado debe contener f515d91c (python -c 'from sldb.api import read_store, extract_payload, store_is_prepared'); la CI instala sldb@main de GitHub, así que el push necesita f515d91c en origin/main de sldb (git -C ../../sldb branch -r --contains f515d91c).

## Validation

_List the checks required before this task can close._

- python -c "from sldb.api import read_store, extract_payload, store_is_prepared"
- ! grep -rnE "sldb\.store\.runtime_cache_signature|sldb\.runtime\.validation" frontends tests/deskops_viewdocs.py --include=*.py
- python -m pytest -q -rs tests/test_mindmap_workspace_explorer.py tests/test_mindmap_workspace_reader.py tests/test_mindmap_workspace.py tests/test_mindmap_adapter.py tests/test_mindmap_persistence.py tests/test_parallel_workspace_serve.py tests/test_mindmap_deskops.py tests/test_desk_ui_routes.py
- python -m pytest -q -rs tests/e2e_mindmap_workspace.py
- git -C ../../sldb branch -r --contains f515d91c

## Done When

_Name the observable condition that makes the task complete._

El grep de la validación no devuelve nada; las pruebas de la validación pasan, incluidas las dos nuevas (imports por ast en frontends/ y el 503 'store not prepared' sin escrituras); el sldb instalado contiene f515d91c. Para el push, f515d91c debe estar en origin/main de sldb (la CI instala sldb@main): si no lo está, el commit queda local y el coordinador avisa.

FILE:instruccion
Preflight solo-TaskDoc de la tarea task-el-lector-del-workspace-y-el-adaptador-usan-la-lectura-pública-de-sldb-read-store-extract-payload-en: reformula el encargo tal como lo leería un ejecutor sin ningún otro contexto, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

