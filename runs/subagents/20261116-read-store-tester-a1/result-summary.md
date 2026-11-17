# Tester independiente — read_store / extract_payload en graph_ui

Tarea: `task-el-lector-del-workspace-y-el-adaptador-usan-la-lectura-pública-de-sldb-read-store-extract-payload-en`
Cambio probado: el árbol de trabajo sin commitear de graph_ui sobre HEAD 7ad725a (los 5 archivos del alcance).

## Veredicto: PASS (código), con una salvedad sobre la Validation 5

El código cumple el contrato y las aclaraciones de preflight-3. Las 9 corridas de pytest de la validación pasan sin skips. Las dos pruebas nuevas fallan con el código viejo. En un proceso real, un store no preparado responde 503 sin cambiar ningún byte, y la detección de cambios de otro proceso sigue funcionando.

Salvedad (F1): el sha f515d91c **no está** en origin/main de sldb. El comando de la Validation 5 da rc 0 pero con salida vacía. El mismo parche está en origin/main como 77b6dc34 (rebase). El Done When pide literalmente f515d91c: lo decide el coordinador.

## Entorno

- venv `/dev/shm/readstore-t1/venv`, con uv y Python 3.13.18.
- sldb: `git archive origin/main` en **df3903db09af8afb12d02dc877fff265d2220f1d** (structuredlanguagedb 0.1.13).
- deskops: `/home/robocop/herramientas/deskops` HEAD 7ccd5dce69b7fbfd33de24db86eb7dccca41c0dc (0.2.0).
- pron: HEAD 39ea9724d7c307101722e536e87daf8e7635ff22 (1.0.0).
- pytest 9.2.0 y playwright 1.65.2; chromium en `PLAYWRIGHT_BROWSERS_PATH=/dev/shm/readstore-t1/pw`.
- graph_ui: copia en `/dev/shm/readstore-t1/new`, armada con `git archive HEAD` más los 5 archivos del árbol de trabajo (verificados con cmp). Se instaló como en la CI, con `-e "[test]"` sobre la copia.
- Árbol viejo: `/dev/shm/readstore-t1/old`, con `git archive HEAD` más solo `tests/test_mindmap_workspace_explorer.py` nuevo.

Cada pytest corrió así: `systemd-run --user --scope -p MemoryMax=3G -- env TMPDIR=/dev/shm python -m pytest -q -rs -p no:cacheprovider --basetemp=/dev/shm/readstore-t1/bt <archivo>`, uno a la vez y sin `-n`.

## 1. Comandos de Validation

| # | Comando | rc | Resultado | Log |
|---|---|---|---|---|
| V1 | `python -c "from sldb.api import read_store, extract_payload, store_is_prepared"` | 0 | ok | logs/v1-import.log |
| V2 | `! grep -rnE "runtime_cache_signature\|extract_model_data" frontends tests/deskops_viewdocs.py --include=*.py` | 0 | sin coincidencias; también en el árbol de trabajo real (grep rc 1) | logs/v2-grep.log |
| V3 | tests/test_mindmap_workspace_explorer.py | 0 | 42 passed | logs/v3-test_mindmap_workspace_explorer.log |
| V3 | tests/test_mindmap_workspace_reader.py | 0 | 31 passed | logs/v3-test_mindmap_workspace_reader.log |
| V3 | tests/test_mindmap_workspace.py | 0 | 17 passed | logs/v3-test_mindmap_workspace.log |
| V3 | tests/test_mindmap_adapter.py | 0 | 7 passed | logs/v3-test_mindmap_adapter.log |
| V3 | tests/test_mindmap_persistence.py | 0 | 4 passed | logs/v3-test_mindmap_persistence.log |
| V3 | tests/test_parallel_workspace_serve.py | 0 | 3 passed | logs/v3-test_parallel_workspace_serve.log |
| V3 | tests/test_mindmap_deskops.py | 0 | 7 passed | logs/v3-test_mindmap_deskops.log |
| V3 | tests/test_desk_ui_routes.py | 0 | 13 passed | logs/v3-test_desk_ui_routes.log |
| V4 | tests/e2e_mindmap_workspace.py (playwright) | 0 | 22 passed | logs/v4-e2e_mindmap_workspace.log |
| V5 | `git -C ../../sldb branch -r --contains f515d91c` | 0 | **salida vacía**; `merge-base --is-ancestor f515d91c origin/main` da rc 1; 77b6dc34, con el parche idéntico, sí está en origin/main | logs/v5-branch-contains.log |

En total: 146 passed, 0 failed, 0 skipped (`grep SKIPPED` da 0 en todos los logs).

## 2. Alcance

Evidencia en logs/p2-diff-names.txt, p2-diff-stat.txt y p2-diff.patch.

- `git diff --name-only` muestra los 5 archivos del alcance más `.sldb/core/models/InboxNoteDoc.yaml` y `.sldb/core/store_index.yaml`. Esos dos no son del cambio, como indicó el coordinador. OK.
- persistence.py: un solo `-`/`+`, en el comentario de la línea 74 (`new_operation` pasa a `sldb.api.read_store`). OK.
- pyproject.toml: no cambió (`git status --porcelain -- pyproject.toml` vacío). OK.
- sldb_adapter.py:31 sigue con `from sldb.runtime.validation import render_model_markdown, validate_model_input_roundtrip`. OK.
- Rutas de escritura: el diff de workspace_routes.py toca solo el docstring del módulo, `_fresh_listing`, `_extract_payload` y un comentario. `_extract_payload` lo llaman solo lecturas: workspace_nodes:231, `_materialize`:544 y `_node_label`:745. `sldb.api.extract_payload` es un envoltorio directo de `extract_model_data`, así que devuelve lo mismo. No hay más llamadas a `open_store` en workspace_routes.py. OK.
- sldb_adapter.py: `refresh_for_concurrent_sessions` usa `read_store(self.store)`. Además se amplió el docstring. OK.

## 3. Las dos pruebas nuevas contra el código viejo

Comando: pytest sobre `/dev/shm/readstore-t1/old` (HEAD más el archivo de pruebas nuevo), con los dos nodeids. Resultado: rc 1, **2 failed** (logs/p3-new-tests-on-old-code.log).

- `test_frontends_do_not_import_sldb_internal_readers` falla con `[('mindmap/sldb_adapter.py', 'sldb.store.runtime_cache_signature'), ('mindmap/workspace_routes.py', 'sldb.runtime.validation:extract_model_data')]`.
- `test_listing_get_on_unprepared_store_is_503_and_writes_nothing` falla con `('/api/workspace/nodes', 200, ...)` y `assert 200 == 503`.

Store no canónico: la prueba escribe el índice semántico de archivo único en `semantic_index_path(store)`. En sldb origin/main, `sldb/store/migration.py:67` (`_already_canonical`) devuelve False si ese archivo existe. Después, `migrate_store_layout` lo reparte en shards (`_migrate_derived_indexes`, línea 91). Por eso `open_store` lo migraría. Lo confirman tres cosas:

- el control final de la propia prueba (`open_store(store)` deja `store_is_prepared` en True y el archivo legacy desaparece), que pasa;
- el proceso real con el código viejo (caso B del punto 4), donde el GET borró `.sldb_cache/semantic_index.yaml` y el store quedó preparado;
- `assert not store_is_prepared(store)` antes de los GET.

Es un store que open_store de verdad migraría.

## 4. Prueba a mano en un proceso real

Script: scripts/manual.py. Arranca `python frontends/mindmap/serve.py <port>` con `SLDB_STORE` y `PYTHONPATH=<árbol>/frontends`; la resolución está verificada en logs/p4-mindmap-resolution.log. El store es una copia en /dev/shm de `git archive HEAD` de graph_ui: 425 archivos bajo .sldb. Antes y después de cada GET se tomaron el sha256 y el mtime_ns de cada archivo de `.sldb` y de `.sldb_cache`. Resultados en logs/p4-manual-{new,old}.json y el resumen en logs/p4-manual-summary.txt.

| Caso | Código nuevo | Código viejo |
|---|---|---|
| B: preparado al arrancar; otro proceso lo deja no canónico | nodes y explorer: **503**, `estado=store_no_preparado`, `error='store not prepared: run \`sldb stores update\` (<ruta>)'`; 426 archivos, sha agregado igual antes y después (14362aec…), 0 archivos cambiados, sigue no preparado | 200; **el GET migró el store** (cambió `.sldb_cache/semantic_index.yaml`) |
| C: preparado | nodes y explorer: **200**; 425 archivos sin cambios (f0f2e37a…) | 200 |
| A: no preparado ya al arrancar | 200: el **arranque** del servidor migra el store (`make_server`, comportamiento previo, igual en ambos árboles); los GET no cambian nada | igual |

## 5. Regresiones

**Otras SLDBStoreError o store ausente** (proceso real, servidor arrancado y store alterado después):

- F, `.sldb` borrado: nuevo y viejo dan lo mismo, 503 `'El store no está disponible.'`, porque la comprobación de existencia va antes de `_fresh_listing`. Sin regresión.
- G, `core/store_index.yaml` borrado: el viejo daba **500** `'Error al cargar documentos del store: No store_index.yaml…'`. El nuevo da **503 store_no_preparado** `'store not prepared…'`, porque `store_is_prepared` devuelve False sin store_index. Es un cambio de estado, a mejor. Ver F3.
- D y E, store inexistente o `.sldb` vacío al arrancar: el arranque crea el store en ambos árboles y los GET dan 200. Ese camino no llega a `_fresh_listing`.
- Una SLDBStoreError sin 'store not prepared' se relanza igual que antes (`raise`, workspace_routes.py:176).

**refresh_for_concurrent_sessions**: no hay en la suite una prueba que la llame con un segundo proceso real en la ruta de guardado (F4). Las pruebas de altas y bajas de otro proceso cubren solo el listado. Esas pasaron:

- test_modeled_created_and_removed_by_another_process_show_after_refresh (explorer:515)
- test_real_process_listing_get_writes_nothing_and_sees_other_process_changes (explorer:799)
- test_explorer_refresh_shows_changes_made_by_another_process (e2e:1085)

Por eso hice scripts/concurrent.py: el proceso A (EditorStore) y el proceso B (un subprocess) trabajan sobre el mismo store.

- Código nuevo (logs/p5-concurrent-new.json):
  - A ve el alta de s2 hecha por B.
  - A rechaza con **409** un update de s1 con `expected` viejo.
  - A deja de ver s2 después del borrado de B.
- Código viejo: idéntico.
- **Control**, con `refresh_for_concurrent_sessions` anulada (logs/p5-concurrent-control-norefresh.json): A **pisa** el cambio de B (lo acepta) y sigue viendo s2. La prueba discrimina, y read_store conserva el comportamiento.

## Hallazgos

| ID | Severidad | Dónde | Hallazgo |
|---|---|---|---|
| F1 | Media (gate de proceso, no de código) | Validation 5 y Done When de la tarea; sldb origin/main | f515d91c no está en origin/main de sldb: `branch -r --contains` da vacío y `is-ancestor` rc 1. El parche idéntico entró como 77b6dc34, y el closeout 336cde87 como d40ee439. La CI tendrá read_store (lo prueba esta corrida contra origin/main df3903db), pero el comando de la Validation pasa por rc 0 sin decir nada. El coordinador decide si acepta 77b6dc34 como equivalente. |
| F2 | Baja | frontends/mindmap/persistence.py:77 → sldb_adapter.py:373 | La ruta de guardado cambia de forma observable. Si el store queda no preparado o se borra con el servidor arrancado, `POST /api/save` daba antes 409 (seguía hasta el chequeo de revisión). Ahora da **500** con `'store not prepared…'`, porque `read_store` lanza SLDBStoreError antes de validar. No escribe nada, es más seguro y es consecuencia directa del alcance (1). Pero no se mapea a 503/SaveError como el GET. |
| F3 | Baja (informativo) | frontends/mindmap/workspace_routes.py:171-176 | Un store sin `core/store_index.yaml` pasa de 500 a 503 store_no_preparado con el texto de sldb. Lo considero coherente con el contrato. |
| F4 | Baja (hueco de cobertura previo) | tests/ | Ninguna prueba del repo ejercita `refresh_for_concurrent_sessions` con un segundo proceso en la ruta de guardado. Lo cubrí a mano (punto 5); no se pidió agregar la prueba. |
| F5 | Baja | tests/test_mindmap_workspace_explorer.py:780-790 | `store_state()` hashea solo `.sldb`. La migración que se quiere evitar escribe en `.sldb_cache` (con el código viejo, el único archivo cambiado fue `.sldb_cache/semantic_index.yaml`). La protección real es la línea 791 (`legacy.exists() and not store_is_prepared`), así que la prueba sigue siendo válida. Pero el mensaje 'ningún archivo bajo .sldb cambia' no detecta la escritura que importa. |
| F6 | Muy baja | tests/test_mindmap_workspace_explorer.py:731-733 | El chequeo por ast no marca `import sldb.runtime.validation` seguido de `sldb.runtime.validation.extract_model_data(...)`. Hoy no existe ese patrón. |

## Limpieza

Logs y scripts copiados a este run_dir. `/dev/shm/readstore-t1` se borró al terminar. No se escribió en ningún repo salvo este run_dir, y no se hizo git add, commit, stash ni checkout.
