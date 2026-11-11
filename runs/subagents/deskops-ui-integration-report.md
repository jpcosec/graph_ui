# deskops-ui: informe de integración y verificación (PAUSADO)

Estado: **pausado por orden del coordinador (2026-11-11)**. Rama `wt/deskops-ui` sobre origin/master `62bc9f8`. La verificación está incompleta: abajo quedan los pasos corridos, los fallos resueltos y los que faltan.

Commits de la rama (encima de 62bc9f8):

| commit | qué |
|---|---|
| f84ffa8 | tests: `write_lifecycle_graph(root)` en vez de `ensure_lifecycle_graph` (deskops CC31 439150d7) |
| 428b5b7 | mindmap: la captura rápida usa `id_prefix` del modelo (`atom-captura-rapida`) (deskops CC38 4a1aae81) |
| d98fcea | desk: `deskops desk update --apply` por CLI (27 rutas) |
| 341886c | tests: `seed_desk(root)` en vez de `scaffold_desk` (deskops CC36 d4b49ff6) |
| 2f8a1e0 | mindmap: `runtime_documents` abre el store con `sldb.api.open_store` (sldb GO04 d7eefdeb) + test rojo/verde |
| 12bfedb | deskops CC30/CC32: `deskops.doc_access` en vez de alias privados; recibos de activación en fixtures (**parcial**) |
| (este) | informe |

## 1. Los 7 commits de `rescate/deskops-ui-detached`

62829c4..4f80727 tienen contenido idéntico a `5e4f347`, que ya está en master. `git diff` entre la punta del rescate y 5e4f347 sale vacío, y `git diff 5e4f347 origin/master` en esas rutas también. No hubo rebase ni cherry-pick: la rama es origin/master más los arreglos de abajo.

## 2. Entorno

- Layout del CI en clones limpios: `/dev/shm/gui/UIs/graph_ui` (clon de la rama) y `/dev/shm/gui/deskops`, con deskops fijo en origin/main `5ccc29a3`. origin/main avanzó 7 commits durante la sesión; en código solo agregan los alias de b11a5282, que no uso.
- venv `/dev/shm/gui/venv`: el python3.12 del sistema no trae ensurepip, así que se creó con `uv venv --seed -p 3.12`. pip instaló de GitHub deskops 5ccc29a3, sldb 84eb7f7, pron 7f2e308 y spec2viz b16c021. Python 3.13 (la otra versión del CI) **no se verificó**.
- Cada archivo de test corre en su propio proceso: `TMPDIR=/dev/shm timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs <archivo>`. Desde la corrida 3, la guarda espera solo los pytest cuyo cwd está en `proyectos/SLDB_1` o en `/dev/shm` (antes esperaba también los de mepu y AntonIA de otros panes; por eso el panel no avanzaba).
- El CI de master pasó por última vez en 3ea45bc (2026-11-06 18:22Z, con opsys 7f4be3a y sldb 8b60e88). Todos los fallos de abajo vienen de cambios posteriores de deskops o sldb, ninguno de graph_ui.

## 3. Fallos: causa raíz y arreglo

| # | síntoma | causa raíz | arreglo | estado |
|---|---|---|---|---|
| 1 | ImportError `ensure_lifecycle_graph` (9 tests) | deskops CC31 439150d7 lo renombró a `write_lifecycle_graph(root)` | f84ffa8, sin shim | resuelto |
| 2 | `AtomDoc.quick_capture` = False (test_mindmap_quick_capture) | deskops CC38 4a1aae81: `check_slug_id` exige el prefijo `atom-` | 428b5b7: el adaptador publica `id_prefix`, y `quick_payload`/`quickId` (Python y `shared/documents.mjs`) lo anteponen; test que construye AtomDoc | resuelto (3 passed; node 150 pass) |
| 3 | ImportError `scaffold_desk` | deskops CC36 d4b49ff6 lo renombró a `seed_desk` | 341886c, sin shim. Los 17 imports de deskops en tests, frontends y src resuelven contra 5ccc29a3 | resuelto |
| 4 | e2e_review_workbench_views: `find_view` → None | sldb GO04 d7eefdeb (`edge_index.live_stale`) cachea el roster vacío de ViewDoc dentro de la generación de la operación; graph_ui leía sin `open_store`, así que la generación no avanzaba. Efecto en el servidor de larga vida: no veía lo que escribían otros procesos (el CLI) | 2f8a1e0: `load_runtime_documents(open_store(store).store_path, …)`; test sin navegador `test_a_view_another_process_saves_is_seen_by_the_next_read_of_this_one`, rojo sin el arreglo y verde con él | resuelto (unitario); el e2e no se volvió a correr en el clon limpio |
| 5 | `AttributeError: 'DeskopsOperations' object has no attribute '_write_doc'` (test_mindmap_deskops, test_mindmap_workspace, test_mindmap_workspace_reader, e2e_mindmap_deskops). Lo tapaba el ImportError de #3 | deskops CC30 93cc1943 pasó operations.py a fachada sobre `doc_access.py` y sacó `_write_doc`. CC34 borra los alias que quedan | 12bfedb: tests y frontends (`mindmap/deskops_routes.py`, `desk/serve.py`) usan `deskops.doc_access.<función>(root, …)`. Quedan 0 alias privados en graph_ui (grep) | resuelto (ya no hay AttributeError) |
| 6 | 409 «Gate ritual-execution is blocked by its rules: rule-activation-task-code … recibos preflight y bundle» (test_desk_ui_routes, test_mindmap_deskops, e2e_desk_ui, e2e_mindmap_deskops) | deskops CC32 6afc78b0: una tarea sale de ritual-execution solo con recibos aceptados e intactos y con sus dependencias cerradas. Además, `ops.advance_task` de los fixtures devolvía blocked sin excepción, o sea que fallaba en silencio | 12bfedb: `tests/desk_receipts.py` corre en proceso el CLI de deskops (`review record --kind preflight\|bundle --operator … --evidence desk/tasks/<id>.md`, más `review dispose --verdict accepted`; reproduction para debug), como el quickstart y el CI de deskops. Los fixtures afirman que `advance_task(...)[1].progressed` es verdadero. e2e_desk_ui: (a) editar la tarea fuera de la UI deja el recibo no intacto, así que el test vuelve a registrar los recibos antes del segundo advance (flujo real: cambió el contrato, se revisa de nuevo); (b) la tarea `second` avanza a testing y *después* recibe `depends_on=[first]` con `ops.edit_artifact_field`. Es un estado al que llega el flujo real, aprobado por el coordinador y comentado en el fixture | test_desk_ui_routes **verde** (10 passed). El resto, ver §5 |

### Fallos abiertos al pausar (corrida de arreglo sobre 12bfedb)

- **test_mindmap_deskops**: 2 failed, 5 passed. Fallan `test_blocked_and_missing_lifecycle` y `test_terminal_cannot_close_and_path_escape`. Los dos escriben un TaskDoc con `current_node` ritual-testing o ritual-closeout e `history` vacía. `doc_access.write_doc` ahora valida el payload, y el validador de TaskDoc (deskops) lo rechaza: «lifecycle is inconsistent: current_node 'ritual-testing' needs a history; with an empty history a task is at the entry node». Antes `_write_doc` escribía sin esa validación. Pendiente: llevar la tarea a ese nodo por el flujo (recibos más advance), o fijar una `history` coherente. Causa por confirmar: el commit de deskops que agregó el validador.
- **test_mindmap_workspace**: 2 failed, 13 passed. En `test_workspace_broken_ir_keeps_graph` y `test_workspace_broken_and_healthy_docs_coexistence`, `projections.graph.ok` es False. Sin investigar.
- **test_mindmap_workspace_reader**: 1 failed, 30 passed. En `test_no_file_is_opened_before_or_instead_of_its_guards`, el conjunto de archivos abiertos antes de las guardas incluye los del test (`task-protegido-p.md`, `task-symlink-s.md`, `secreto-externo.md`). Sin investigar: puede venir de la validación o lectura nueva de deskops.
- **e2e_desk_ui, e2e_mindmap_deskops**: no se volvieron a correr después de 12bfedb (la pausa cortó la corrida).

## 4. `deskops desk update` (commit d98fcea)

Dry-run (rc=1):

```
Desk divergence report:
- Moved model contracts: ReviewDoc
- Lifecycle documents to rewrite: desk/lifecycle/execution-task_activates.md, desk/lifecycle/testing-task_hands_to_closeout.md, desk/lifecycle/closeout-task_completes.md
- Missing desk structure: desk/reviews/
- Untracked desk documents: desk/rituals/phase.md
```

`--apply` (rc=0, 13s): actualiza el contrato de ReviewDoc, crea la estructura que faltaba, escribe y trackea los 7 `rule-activation-task-*.md`, reescribe los 3 documentos del ciclo de vida y trackea `desk/rituals/phase.md` como RitualDoc. Una segunda corrida da «Desk is up to date.» y no cambia nada. Todo pasó por el CLI; no se tocó nada a mano en `desk/` ni en `.sldb/`.

**Hueco conocido de deskops** (tarea abierta por el coordinador en deskops): `desk/reviews/` queda vacío y git no guarda directorios vacíos. Por eso el dry-run en un clon limpio da rc=1 («Missing desk structure: desk/reviews/»). No se parchea en graph_ui.

## 5. Pasos del CI: comando, rc y tiempo

### Corrida 1: 62bc9f8 (origin/master, sin arreglos)

| paso | comando | rc | tiempo |
|---|---|---|---|
| build-deskops | `sldb stores build` | 0 | 7s |
| build-graphui | `sldb stores build` | 0 | 4s |
| build-check | `sldb stores build --check` | 0 | 150s |
| node-test | `bash -c node --test tests/*.test.mjs` | 0 | 0s |
| rw-npm-ci | `npm ci` | 0 | 7s |
| rw-tsc | `npx tsc -p tsconfig.app.json --noEmit` | 0 | 6s |
| rw-vitest | `npx vitest run` | 0 | 5s |
| rw-lint | `node scripts/lint-architecture.mjs` | 0 | 0s |
| e2e-playwright-install | `python -m playwright install chromium` | 0 | 47s |
| pytest-test_auditor | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_auditor.py` | 0 | 0s |
| pytest-test_ci_workflow | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_ci_workflow.py` | 0 | 1s |
| pytest-test_desk_ui_routes | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_desk_ui_routes.py` | 2 | 1s |
| pytest-test_editor | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_editor.py` | 0 | 0s |
| pytest-test_mindmap_adapter | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_adapter.py` | 0 | 7s |
| pytest-test_mindmap_compiler | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_compiler.py` | 0 | 1s |
| pytest-test_mindmap_contract | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_contract.py` | 0 | 1s |
| pytest-test_mindmap_deskops | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_deskops.py` | 2 | 1s |
| pytest-test_mindmap_endpoints | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_endpoints.py` | 0 | 7s |
| pytest-test_mindmap_notation | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_notation.py` | 0 | 11s |
| pytest-test_mindmap_persistence | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_persistence.py` | 0 | 4s |
| pytest-test_mindmap_quick_capture | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_quick_capture.py` | 1 | 2s |
| pytest-test_mindmap_skin | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_skin.py` | 0 | 0s |
| pytest-test_mindmap_workers | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_workers.py` | 0 | 6s |
| pytest-test_mindmap_workspace | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_workspace.py` | 2 | 1s |
| pytest-test_mindmap_workspace_explorer | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_workspace_explorer.py` | 2 | 1s |
| pytest-test_mindmap_workspace_reader | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_workspace_reader.py` | 2 | 2s |
| pytest-test_parallel_workspace_serve | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_parallel_workspace_serve.py` | 2 | 1s |
| pytest-test_projection_views | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_projection_views.py` | 0 | 24s |
| pytest-test_provider | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_provider.py` | 0 | 0s |
| pytest-test_representacion_docs | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_representacion_docs.py` | 0 | 0s |
| pytest-test_review_workbench | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_review_workbench.py` | 0 | 16s |
| pytest-test_sldb_end_to_end | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_sldb_end_to_end.py` | 0 | 9s |
| pytest-test_snapshot_adapter | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_snapshot_adapter.py` | 0 | 1s |
| pytest-e2e_desk_ui | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_desk_ui.py` | 2 | 2s |
| pytest-e2e_mindmap_brainstorm | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_brainstorm.py` | 0 | 20s |
| pytest-e2e_mindmap_classes | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_classes.py` | 0 | 6s |
| pytest-e2e_mindmap_compiler | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_compiler.py` | 0 | 5s |
| pytest-e2e_mindmap_deskops | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_deskops.py` | 2 | 1s |
| pytest-e2e_mindmap_doc_edit | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_doc_edit.py` | 0 | 9s |
| pytest-e2e_mindmap_flow | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_flow.py` | 0 | 11s |
| pytest-e2e_mindmap_keyboard | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_keyboard.py` | 0 | 8s |

### Corrida 2: d98fcea

| paso | comando | rc | tiempo |
|---|---|---|---|
| build-deskops | `sldb stores build` | 0 | 7s |
| build-graphui | `sldb stores build` | 0 | 4s |
| build-check | `sldb stores build --check` | 0 | 161s |
| pytest-test_auditor | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_auditor.py` | 0 | 0s |
| pytest-test_ci_workflow | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_ci_workflow.py` | 0 | 0s |
| pytest-test_desk_ui_routes | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_desk_ui_routes.py` | 2 | 1s |
| pytest-test_editor | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_editor.py` | 0 | 1s |
| pytest-test_mindmap_adapter | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_adapter.py` | 0 | 3s |
| pytest-test_mindmap_compiler | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_compiler.py` | 0 | 1s |
| pytest-test_mindmap_contract | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_contract.py` | 0 | 0s |
| pytest-test_mindmap_deskops | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_deskops.py` | 2 | 1s |
| pytest-test_mindmap_endpoints | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_endpoints.py` | 0 | 6s |
| pytest-test_mindmap_notation | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_notation.py` | 0 | 14s |
| pytest-test_mindmap_persistence | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_persistence.py` | 0 | 3s |
| pytest-test_mindmap_quick_capture | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_quick_capture.py` | 0 | 2s |
| pytest-test_mindmap_skin | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_skin.py` | 0 | 0s |
| pytest-test_mindmap_workers | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_workers.py` | 0 | 6s |
| pytest-test_mindmap_workspace | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_workspace.py` | 2 | 2s |
| pytest-test_mindmap_workspace_explorer | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_workspace_explorer.py` | 2 | 1s |
| pytest-test_mindmap_workspace_reader | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_workspace_reader.py` | 2 | 1s |
| pytest-test_parallel_workspace_serve | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_parallel_workspace_serve.py` | 2 | 1s |
| pytest-test_projection_views | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_projection_views.py` | 0 | 25s |
| pytest-test_provider | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_provider.py` | 0 | 0s |
| pytest-test_representacion_docs | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_representacion_docs.py` | 0 | 0s |
| pytest-test_review_workbench | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_review_workbench.py` | 0 | 1s |
| pytest-test_sldb_end_to_end | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_sldb_end_to_end.py` | 0 | 8s |
| pytest-test_snapshot_adapter | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_snapshot_adapter.py` | 0 | 1s |
| node-test | `bash -c node --test tests/*.test.mjs` | 0 | 1s |
| rw-npm-ci | `npm ci` | 0 | 4s |
| rw-tsc | `npx tsc -p tsconfig.app.json --noEmit` | 0 | 6s |
| rw-vitest | `npx vitest run` | 0 | 5s |
| rw-lint | `node scripts/lint-architecture.mjs` | 0 | 0s |
| e2e-playwright-install | `python -m playwright install chromium` | 0 | 0s |
| pytest-e2e_desk_ui | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_desk_ui.py` | 2 | 2s |
| pytest-e2e_mindmap_brainstorm | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_brainstorm.py` | 0 | 9s |
| pytest-e2e_mindmap_classes | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_classes.py` | 0 | 6s |
| pytest-e2e_mindmap_compiler | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_compiler.py` | 0 | 11s |
| pytest-e2e_mindmap_deskops | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_deskops.py` | 2 | 1s |
| pytest-e2e_mindmap_doc_edit | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_doc_edit.py` | 0 | 10s |
| pytest-e2e_mindmap_flow | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_flow.py` | 0 | 9s |
| pytest-e2e_mindmap_keyboard | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_keyboard.py` | 0 | 7s |
| pytest-e2e_mindmap_notation | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_notation.py` | 0 | 34s |
| pytest-e2e_mindmap_projections | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_projections.py` | 0 | 14s |
| pytest-e2e_mindmap_quick_capture | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_quick_capture.py` | 0 | 12s |
| pytest-e2e_mindmap_routes | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_routes.py` | 0 | 7s |
| pytest-e2e_mindmap_schema | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_schema.py` | 0 | 10s |
| pytest-e2e_mindmap_workspace | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_workspace.py` | 2 | 1s |
| pytest-e2e_notation_activity | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_notation_activity.py` | 0 | 23s |
| pytest-e2e_notation_class | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_notation_class.py` | 0 | 45s |
| pytest-e2e_notation_deployment | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_notation_deployment.py` | 0 | 41s |
| pytest-e2e_notation_legibility | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_notation_legibility.py` | 0 | 43s |
| pytest-e2e_notation_sequence | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_notation_sequence.py` | 0 | 31s |
| pytest-e2e_notation_style | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_notation_style.py` | 0 | 21s |
| pytest-e2e_review_workbench_views | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_review_workbench_views.py` | 1 | 41s |

### Corrida 3: 2f8a1e0, clones limpios (cortada al pasar a e2e_mindmap_workspace)

Los 6 rojos de esta corrida son los fallos #5 y #6, que antes tapaba el ImportError de #3.

| paso | comando | rc | tiempo |
|---|---|---|---|
| build-deskops | `sldb stores build` | 0 | 9s |
| build-graphui | `sldb stores build` | 0 | 4s |
| build-check | `sldb stores build --check` | 0 | 169s |
| pytest-test_auditor | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_auditor.py` | 0 | 1s |
| pytest-test_ci_workflow | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_ci_workflow.py` | 0 | 0s |
| pytest-test_desk_ui_routes | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_desk_ui_routes.py` | 1 | 66s |
| pytest-test_editor | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_editor.py` | 0 | 0s |
| pytest-test_mindmap_adapter | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_adapter.py` | 0 | 2s |
| pytest-test_mindmap_compiler | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_compiler.py` | 0 | 1s |
| pytest-test_mindmap_contract | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_contract.py` | 0 | 0s |
| pytest-test_mindmap_deskops | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_deskops.py` | 1 | 21s |
| pytest-test_mindmap_endpoints | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_endpoints.py` | 0 | 5s |
| pytest-test_mindmap_notation | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_notation.py` | 0 | 9s |
| pytest-test_mindmap_persistence | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_persistence.py` | 0 | 2s |
| pytest-test_mindmap_quick_capture | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_quick_capture.py` | 0 | 2s |
| pytest-test_mindmap_skin | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_skin.py` | 0 | 0s |
| pytest-test_mindmap_workers | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_workers.py` | 0 | 6s |
| pytest-test_mindmap_workspace | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_workspace.py` | 1 | 43s |
| pytest-test_mindmap_workspace_explorer | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_workspace_explorer.py` | 0 | 119s |
| pytest-test_mindmap_workspace_reader | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_workspace_reader.py` | 1 | 84s |
| pytest-test_parallel_workspace_serve | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_parallel_workspace_serve.py` | 0 | 12s |
| pytest-test_projection_views | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_projection_views.py` | 0 | 23s |
| pytest-test_provider | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_provider.py` | 0 | 1s |
| pytest-test_representacion_docs | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_representacion_docs.py` | 0 | 0s |
| pytest-test_review_workbench | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_review_workbench.py` | 0 | 0s |
| pytest-test_sldb_end_to_end | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_sldb_end_to_end.py` | 0 | 8s |
| pytest-test_snapshot_adapter | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_snapshot_adapter.py` | 0 | 1s |
| node-test | `bash -c node --test tests/*.test.mjs` | 0 | 1s |
| rw-npm-ci | `npm ci` | 0 | 5s |
| rw-tsc | `npx tsc -p tsconfig.app.json --noEmit` | 0 | 8s |
| rw-vitest | `npx vitest run` | 0 | 6s |
| rw-lint | `node scripts/lint-architecture.mjs` | 0 | 0s |
| e2e-playwright-install | `python -m playwright install chromium` | 0 | 0s |
| pytest-e2e_desk_ui | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_desk_ui.py` | 1 | 175s |
| pytest-e2e_mindmap_brainstorm | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_brainstorm.py` | 0 | 6s |
| pytest-e2e_mindmap_classes | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_classes.py` | 0 | 6s |
| pytest-e2e_mindmap_compiler | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_compiler.py` | 0 | 4s |
| pytest-e2e_mindmap_deskops | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_deskops.py` | 1 | 62s |
| pytest-e2e_mindmap_doc_edit | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_doc_edit.py` | 0 | 11s |
| pytest-e2e_mindmap_flow | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_flow.py` | 0 | 13s |
| pytest-e2e_mindmap_keyboard | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_keyboard.py` | 0 | 7s |
| pytest-e2e_mindmap_notation | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_notation.py` | 0 | 91s |
| pytest-e2e_mindmap_projections | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_projections.py` | 0 | 29s |
| pytest-e2e_mindmap_quick_capture | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_quick_capture.py` | 0 | 36s |
| pytest-e2e_mindmap_routes | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_routes.py` | 0 | 14s |
| pytest-e2e_mindmap_schema | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/e2e_mindmap_schema.py` | 0 | 25s |

### Corrida de arreglo: archivos de 12bfedb sobre el clon de 2f8a1e0 (cortada por la pausa)

| paso | comando | rc | tiempo |
|---|---|---|---|
| pytest-test_desk_ui_routes | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_desk_ui_routes.py` | 0 | 236s |
| pytest-test_mindmap_deskops | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_deskops.py` | 1 | 67s |
| pytest-test_mindmap_workspace | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_workspace.py` | 1 | 128s |
| pytest-test_mindmap_workspace_reader | `timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -- python -m pytest -q -rs tests/test_mindmap_workspace_reader.py` | 1 | 212s |

### Sin correr sobre el estado actual

- Los e2e que la corrida 3 no alcanzó: e2e_mindmap_workspace, e2e_notation_activity, e2e_notation_class, e2e_notation_deployment, e2e_notation_legibility, e2e_notation_sequence, e2e_notation_style y e2e_review_workbench_views. Los 7 de notation pasaron en la corrida 2 (d98fcea). e2e_review_workbench_views falló en la corrida 2 (fallo #4).
- e2e_desk_ui y e2e_mindmap_deskops después de 12bfedb.
- La corrida completa final desde clones limpios de la punta de la rama.

## 6. Fuera de alcance / pendiente

- Store derivado desfasado: en el clon, `sldb stores build` modifica `ReviewDoc.yaml` y `store_index` por CC33a de deskops. `--check` pasa.
- `document-dialog.js` genera su auto-id sin `id_prefix`; solo se arregló la captura rápida.
- 3 skips en test_review_workbench, iguales a los del CI de GitHub (el job mindmap no corre `npm ci`).
- Python 3.13 sin verificar.

## 7. Incidentes

- Un `sed` de reemplazo tocó por error 4 archivos de `runs/subagents/`. El clasificador denegó `git checkout -- runs/`, así que se revirtió con el `sed` inverso solo en esos 4 archivos. Ninguno llegó a commit.
- Un `git add -N .` se deshizo en el acto con `git reset -q`. No llegó a commit.
- En deskops no hice commits ni push. b11a5282 y los commits de github-actions[bot] no son míos.
