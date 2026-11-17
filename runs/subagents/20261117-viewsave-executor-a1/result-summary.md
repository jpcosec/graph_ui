# Resultado del ejecutor: vistas con read_store y save 503 store_no_preparado

Tarea: desk/tasks/task-las-vistas-de-proyección-leen-sin-migrar-read-store-y-el-guardado-sobre-un-store-sin-preparar-respon.md.
Aclaraciones: Disposition de preflight-1. Base HEAD 440a568. Sin add, commit, push, stash ni checkout.
Entorno: venv en /dev/shm/viewsave-e1 (Python 3.13, uv). Versiones instaladas:
- sldb origin/main d50dd6a9
- deskops /home/robocop/herramientas/deskops HEAD 0bc4206a
- pron HEAD 39ea9724
- pytest y playwright, con chromium en PLAYWRIGHT_BROWSERS_PATH=/dev/shm/viewsave-e1/pw.

`mindmap` se importa con PYTHONPATH=<repo>/frontends, sin instalar graph_ui en modo editable. El script de corrida está en run.sh.

## Cambios (archivo:línea, tras el cambio)

- frontends/mindmap/sldb_adapter.py
  - :31: re-exporta `SLDBStoreError` de `sldb.core.exceptions`. Es la misma clase. Así views_routes y persistence no importan sldb, que es la regla de tests/test_mindmap_adapter.py::test_no_duplicate_sldb_imports_outside_adapter.
  - :71-80: `AdapterError` (= `SaveError`) acepta `estado: str | None = None`. Por omisión es None, así que nada cambia para los llamadores existentes.
  - :407-419: `runtime_documents` usa `read_store(Path(store))` en lugar de `open_store`. El docstring ya no nombra open_store, dice que read_store no migra y que lanza 'store not prepared'.
- frontends/mindmap/views_routes.py
  - :18: importa `SLDBStoreError` desde `mindmap.sldb_adapter`.
  - :21: `STORE_NO_PREPARADO = 'store_no_preparado'`.
  - :89-94: `dispatch` atrapa `SLDBStoreError`. Si el mensaje contiene 'store not prepared', responde `{'ok': False, 'error': str(exc), 'estado': 'store_no_preparado'}` con 503. Si no, la relanza.
- frontends/mindmap/persistence.py
  - :17: importa `SLDBStoreError` desde `mindmap.sldb_adapter`.
  - :20: `STORE_NO_PREPARADO`.
  - :78-85: envuelve `refresh_for_concurrent_sessions()`. Un 'store not prepared' pasa a `SaveError(str(exc), 503, estado='store_no_preparado')`. Cualquier otra SLDBStoreError se relanza.
- frontends/mindmap/serve.py
  - :477-481: en el `except self.save_error` de POST, si la excepción trae `estado`, responde `{'ok': False, 'error', 'estado', 'completed'}` con su status, sin `**self.editor_store.graph()`.
  - Justificación: la Disposition (1) manda agregar 'estado' en la respuesta de save (serve.py:144 en la Disposition; el handler real de /api/save está en :476). Además no tiene sentido volver a leer un store sin preparar para adjuntar el grafo. El cliente (source/documents.js:78) ya acepta una respuesta de error sin `documents`. Las demás respuestas de SaveError quedan como estaban.
- tests/test_projection_views.py
  - :200 `_unprepare`: fabrica el layout no canónico igual que la prueba de referencia.
  - :216 `_tree_state`: sha256 y mtime_ns recursivos.
  - :223 `test_views_get_on_an_unprepared_store_is_503_and_writes_nothing`: arranca un servidor real sobre un store preparado propio, con el pilot real `sldb notations sync`, y después lo des-prepara. Prueba GET /api/views, GET /api/views/evaluate?view=ViewDoc:herencia y POST /api/views/evaluate. Exige 503, `estado`, el texto 'store not prepared' y ningún cambio en `.sldb` ni en `.sldb_cache`. También exige que el archivo legado siga ahí, que el store siga sin preparar y que `open_store` lo prepare después (control).
- tests/test_mindmap_endpoints.py
  - :494 `test_save_on_a_store_unprepared_after_start_is_503_and_writes_nothing`: prueba HTTP de POST /api/save. Va aquí según la Disposition (6), porque test_mindmap_persistence.py no tiene servidor HTTP. Usa la KB kb-small compilada y un update real del primer documento, con expected y viewRevision vigentes. Exige 503, `estado`, el texto 'store not prepared', `completed == []` y el mismo snapshot que la prueba de vistas.
- tests/test_mindmap_persistence.py
  - :76 `test_save_on_a_store_unprepared_after_open_is_503_store_no_preparado_and_writes_nothing`: a nivel de `EditorStore.save`, sin HTTP. Espera SaveError con status 503 y estado 'store_no_preparado'. Comprueba que no cambie ningún archivo bajo la raíz del proyecto temporal: .sldb, .sldb_cache y el archivo de vista.

## Validación

| Comando | Base (HEAD) | Después |
|---|---|---|
| `! grep -rn open_store sldb_adapter.py projection_views.py views_routes.py` | 3 coincidencias (rc 0, falla) | sin coincidencias (rc 1, pasa) |
| pytest persistence, projection_views, workspace_explorer, adapter, parallel_workspace_serve, mindmap_deskops | 74 passed, 0 failed, 0 skipped | 76 passed, 0 failed, 0 skipped |
| pytest e2e_mindmap_workspace.py e2e_review_workbench_views.py | 25 passed, 0 skipped (con node_modules) | 25 passed, 0 failed, 0 skipped |
| pytest tests/test_mindmap_endpoints.py (archivo tocado, fuera de la lista) | 32 passed | 33 passed |
| control negativo: 3 pruebas nuevas sobre HEAD | 3 failed | (después: 3 passed, after-new-tests.log) |

Control negativo (control-negativo.log). Es HEAD por git archive con solo los tres archivos de prueba encima. Las tres pruebas fallan por la razón esperada:
- vistas: `('GET', '/api/views', 200, {'views': []})`, `assert 200 == 503`. open_store migró el store.
- save HTTP: `(500, {'ok': False, 'error': 'store not prepared: run `sldb stores update` (...)'})`, `assert 500 == 503`. Es el hallazgo F2.
- save en EditorStore: se escapa `SLDBStoreError: store not prepared ...` sin traducir.

## Respuestas 503 reales (after-ejemplos-503.log)

Servidor real de make_server sobre stores reales, des-preparados después de arrancar:

```
GET /api/views -> 503 {"ok": false, "error": "store not prepared: run `sldb stores update` (/dev/shm/viewsave-e1/tmpzglmxxxn/views/.sldb)", "estado": "store_no_preparado"}
GET /api/views/evaluate?view=ViewDoc:herencia -> 503 {"ok": false, "error": "store not prepared: run `sldb stores update` (/dev/shm/viewsave-e1/tmpzglmxxxn/views/.sldb)", "estado": "store_no_preparado"}
POST /api/views/evaluate -> 503 {"ok": false, "error": "store not prepared: run `sldb stores update` (/dev/shm/viewsave-e1/tmpzglmxxxn/views/.sldb)", "estado": "store_no_preparado"}
POST /api/save -> 503 {"ok": false, "error": "store not prepared: run `sldb stores update` (/dev/shm/viewsave-e1/tmpzglmxxxn/save/.sldb)", "estado": "store_no_preparado", "completed": []}
```

## Desviaciones y notas

1. **Línea base re-corrida.** La primera línea base corría sobre el repo real y edité el código durante esa corrida. Corté el proceso por su PID y la descarté (discarded-baseline-unit-contaminated.log). La línea base válida (baseline-*.log) corrió sobre `git archive HEAD` en /dev/shm. Sin node_modules, e2e_review_workbench_views salta 3 pruebas (baseline-e2e-sin-node_modules.log: 22 passed, 3 skipped). Para comparar con la corrida "después" en el repo real, que sí tiene node_modules, enlacé apps/review-workbench/node_modules del repo y repetí la base: 25 passed.
2. **Ruta del import de SLDBStoreError.** La Disposition (2) pide isinstance de `sldb.core.exceptions.SLDBStoreError`. Se cumple con la misma clase, re-exportada por sldb_adapter. Importarla en views_routes al nivel del módulo rompía test_no_duplicate_sldb_imports_outside_adapter (iter-after-unit-1-guard-fail.log, 1 failed). Por eso pasa por el adaptador.
3. **Snapshot más amplio que .sldb.** Además de `.sldb` (Disposition 4), las pruebas hashean `.sldb_cache`, que es donde escribe la migración (hallazgo F5 del tester anterior). También exigen que el archivo legado siga y que `store_is_prepared` sea False.
4. **Prueba extra.** Hay una prueba a nivel de EditorStore en test_mindmap_persistence.py, que es el archivo que nombra el contrato, además de la prueba HTTP en test_mindmap_endpoints.py autorizada por la Disposition (6).
5. **serve.py tocado**, con la justificación de arriba. El número de línea de la Disposition (144) es el del handler de notation. El de save está en :476.
6. **Cambios ajenos en el repo.** Durante la corrida, el proyecto deskops entregó una nota de inbox a las 01:27: desk/inbox/20261117-012702-suggestion-resuelto-en-deskops-...md, su YAML en .sldb/core/documents/InboxNoteDoc/, y cambios en .sldb/core/models/InboxNoteDoc.yaml y .sldb/core/store_index.yaml. No los hice yo ni los toqué, y quedan fuera de diff.patch. Ninguna prueba usa el .sldb del repo.
7. Pytest avisa `Unknown config option: asyncio_default_fixture_loop_scope` en todas las corridas, igual en la base. No hay pytest-asyncio en el venv.
8. Después de after-unit y after-e2e solo cambió el texto de un comentario en serve.py:478-479. Después de ese cambio re-corrí after-endpoints (33 passed) y after-new-tests (3 passed).
9. Fuga de procesos en e2e_review_workbench_views: cada corrida deja huérfano un `vite preview` (ppid 1) aunque el test termine. Maté por PID los dos que dejaron mis corridas: 1979610 (base) y 2114622 (después). Hay otros huérfanos iguales de sesiones ajenas (707726 y 969129 del 16-nov, y otros en /dev/shm/gui, /dev/shm/cc34ui y /home/dios/...) que no toqué. Es un defecto previo del fixture, fuera del alcance de esta tarea.
