FILE:desk/tasks/task-el-lector-del-workspace-y-el-adaptador-usan-la-lectura-pública-de-sldb-read-store-extract-payload-en.md
---
sldb:
  by: agent
  at: '2026-11-16T12:50:25Z'
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

Ningún archivo de frontends/ ni tests/deskops_viewdocs.py importa sldb.store.runtime_cache_signature ni sldb.runtime.validation; las lecturas usan sldb.api.read_store y sldb.api.extract_payload, y un store sin preparar en un GET del workspace da un error claro con el mensaje de sldb en vez de migrarse.

## Scope

_State what is in scope and what is out of scope._

ENTRA: (1) frontends/mindmap/sldb_adapter.py: refresh_for_concurrent_sessions llama a sldb.api.read_store(self.store) en lugar de importar new_operation de sldb.store.runtime_cache_signature (read_store hace new_operation y además el new_operation de documents_hash). (2) frontends/mindmap/workspace_routes.py: _extract_payload usa sldb.api.extract_payload(model_type, text) en lugar de sldb.runtime.validation.extract_model_data; mismo valor devuelto. (3) tests/deskops_viewdocs.py: extract_model_data -> sldb.api.extract_payload. (4) Si una ruta GET del workspace hoy llama a sldb.api.open_store, pasa a read_store y el SLDBStoreError 'store not prepared' se devuelve como respuesta de error con ese texto (no 500 genérico). (5) Una prueba nueva en tests/test_mindmap_workspace_explorer.py (junto a test_refresh_path_has_no_sldb_store_import) que falla si frontends/mindmap/*.py importa sldb.store.runtime_cache_signature o sldb.runtime.validation. (6) pyproject.toml: subir el mínimo de structuredLanguageDB a la versión que trae read_store si sldb la publicó con versión nueva; si no, dejarlo. NO ENTRA: cambiar sldb; las escrituras (open_store para escribir no cambia); frontends/desk; persistence.py salvo que su comentario cite new_operation (solo texto).

## Implementation Path

_Outline the expected implementation route or affected surface._

1) grep -rnE 'runtime_cache_signature|runtime\.validation|extract_model_data|open_store' frontends tests/deskops_viewdocs.py para fijar la lista real. 2) Reemplazar los imports como dice el alcance (import directo desde sldb.api, sin envolver). 3) Para (4), revisar las rutas GET de workspace_routes.py que abren el store; read_store acepta la misma ruta .sldb. 4) Agregar la prueba de (5) con ast, igual que la existente. 5) Correr la validación. Requisito previo: el sldb instalado debe contener f515d91c (python -c 'from sldb.api import read_store, extract_payload, store_is_prepared'); la CI instala sldb@main de GitHub, así que el push necesita f515d91c en origin/main de sldb (git -C ../../sldb branch -r --contains f515d91c).

## Validation

_List the checks required before this task can close._

- python -c 'from sldb.api import read_store, extract_payload, store_is_prepared'
- ! grep -rnE 'sldb\.store\.runtime_cache_signature|sldb\.runtime\.validation' frontends tests/deskops_viewdocs.py
- python -m pytest -q -rs tests/test_mindmap_workspace_explorer.py tests/test_mindmap_workspace_reader.py tests/test_mindmap_workspace.py tests/test_mindmap_adapter.py tests/test_mindmap_persistence.py tests/test_parallel_workspace_serve.py tests/test_mindmap_deskops.py tests/test_desk_ui_routes.py
- python -m pytest -q -rs tests/e2e_mindmap_workspace.py

## Done When

_Name the observable condition that makes the task complete._

El grep de la validación no devuelve nada, las pruebas de la validación pasan (incluida la nueva de imports), y un GET a /api/workspace/nodes sobre un store sin preparar responde un error con el texto 'store not prepared' en vez de migrar el store.

FILE:instruccion
Preflight solo-TaskDoc de la tarea task-el-lector-del-workspace-y-el-adaptador-usan-la-lectura-pública-de-sldb-read-store-extract-payload-en: reformula el encargo tal como lo leería un ejecutor sin ningún otro contexto, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

