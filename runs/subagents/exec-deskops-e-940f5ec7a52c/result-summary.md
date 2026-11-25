# Resultado: modo local de mindmap sobre sldb.api, sin pron

run_id: exec-deskops-e-940f5ec7a52c
session: (sesión Claude del ejecutor; sin ruta de archivo expuesta)
session_sha256: n/a

## Cambios (worktree deskops/deskops-e-940f5ec7a52c)
- frontends/mindmap/sldb_adapter.py: abre el store con sldb.api (registered_models, load_registered_model, describe_model_fields, load_runtime_documents, create_document, save_document_payload, untrack_document, add_model). Errores SLDBError -> AdapterError.
- frontends/mindmap/models_service.py: editor de clases con las mismas funciones sldb.api y los helpers run_draft_op/run_report_op/catalog_payload de sldb/cli/serve que usa `sldb serve`. Recibe el SldbAdapter (ya no pron.Store).
- frontends/mindmap/persistence.py: se quita `pron_store`. serve.py: el editor de clases usa `editor_store.adapter`; docstrings sin pron.
- pyproject.toml y .github/requirements-suite.txt: sin pron. tests/test_ci_workflow.py (2 deps de git) y docstring de tests/test_mindmap_adapter.py actualizados.

## Validación (validation.log)
- grep de imports/uso de pron en frontends y src: sin coincidencias.
- Suite tests/ (sin e2e_*) en venv sin pron: 231 passed, 3 errors.
- Los 3 errores son tests/test_review_workbench.py (typecheck/vitest/architecture_lint): fallan en el setup por el toolchain npm del review-workbench, ajenos a pron. Revisar que el supervisor los corra con npm disponible.
- tests/e2e_*.py (playwright) no se corrieron.

## Notas
- Todas las operaciones existían en sldb.api; no hizo falta nota al inbox de sldb. `sldb.cli.serve.models_routes.catalog_payload` y `models_route_support` se reutilizan tal cual (no son sldb.api); si se prefiere solo sldb.api habría que pedir un `catalog` público a sldb.
- Cambio de forma: template-edit/fields-add/fields-remove ahora devuelven `draft_path` en vez de `text` (shape de sldb serve); class-dialog.js solo lee ok/error/draft.
- README de frontends/mindmap y docs/ aún nombran pron (docs fuera de alcance).

## Commit
- Rama deskops/deskops-e-940f5ec7a52c, commit de código con los 8 archivos listados (sin push).
- Sin trailer Task-Id: el encargo se contradice (la aclaración de la revisión dice «No poner Task-Id en el commit de código»; la sección de entrega lo pide). Se siguió la aclaración específica; el supervisor decide.
- Git no tenía identidad: se usó GIT_AUTHOR/COMMITTER por variables de entorno (scion-executor), sin tocar config.
- El worktree tenía `.sldb/` modificado (documentos de otras tareas): no son de esta tarea ni se commitearon.

## Advance
`deskops advance task` bloqueado: [rules/rule-activation-task-code] falta un recibo preflight aceptado e intacto; el bundle-1 tiene anchor_state "changed" (el texto de la tarea cambió tras la revisión). Requiere re-revisar preflight/bundle; no es un fallo del código.
