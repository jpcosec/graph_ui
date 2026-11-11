# ui-followups: id_prefix en el diálogo de documento y relations_state ante un stale

Rama `wt/ui-followups` sobre origin/master `2e29b37` (trae CC34). Worker: robocop2-uifollow-worker, 2026-11-11.

| commit | ítem |
|---|---|
| 55cb7a0 | 2: `relations_state` del contexto aplica el criterio del grafo ante un stale |
| c053189 | 1: el diálogo de documento antepone el `id_prefix` del modelo al auto-id |

## Ítem 1: document-dialog.js sin id_prefix

**Causa raíz.** `DocumentDialog` fijaba el id de un documento nuevo en `useRef('mm-'+crypto.randomUUID())` y lo usaba como `doc.id` y `payload.id` (y lo mostraba en `.doc-meta`). Nunca pasaba por `quickId`. 428b5b7 aplicó `id_prefix` solo a la captura rápida (`quick-create-dialog.js`) y al borrador (`draft.mjs`). Un AtomDoc creado desde «＋ Documento» llevaba `mm-<uuid>`, y el validador de deskops CC38 (4a1aae81) lo rechaza porque exige `atom-<slug>`. `defaultsFor` también generaba `nuevo-documento-xxxx` sin prefijo.

**Arreglo.** `shared/documents.mjs`: `newDocumentId(model, seed)` = `quickId(model, 'mm-'+seed)`. `defaultsFor` arma su id con `quickId`. El diálogo guarda solo la semilla uuid y calcula `newId` para el modelo elegido en cada render, así que un cambio de clase en el picker cambia el prefijo. Un AtomDoc sale como `atom-mm-<uuid>`; los modelos sin `id_prefix` no cambian (`mm-<uuid>`).

**Tests.**
- node `tests/mindmap-model.test.mjs`: «the document dialog auto-id carries the model id_prefix like quickId». Rojo antes del arreglo (`newDocumentId` no existía) y verde después.
- e2e nuevo `tests/e2e_mindmap_document_dialog.py`: desk de deskops desechable, navegador real. Hace «＋ Documento» → clase Atom; el ID visible empieza con `atom-`; llena título y `answer`, aplica, Ctrl+S y guardado. Después verifica que el store tiene exactamente un AtomDoc nuevo con ese id. Rojo antes del arreglo (ID visible `mm-7f55209c-…`, corrido sobre el frontend de master) y verde después.

## Ítem 2: relations_state global ante un stale

**Causa raíz.** `_relations_state(idx, idx_error)` es global: con cualquier `idx.stale` devuelve `store_no_preparado`. a1 (3b15fb6) y 01aa0e8 lo acotaron solo dentro de `_build_graph_neighborhood`, que bloquea si el stale cae en la vecindad o si su nodo falta de `idx.nodes` (§3c #8 y #10 del informe deskops-ui). En cambio, el contexto de `/api/workspace/node` (`workspace_node`) y el de `/api/workspace/source` (`_source_context`) seguían usando la versión global. Así, un documento roto o editado por fuera dejaba sin incoming/outgoing a todos los documentos del store. Además, en `/node` las relaciones salían de las aristas del grafo. Por eso, aunque se acotara el estado, un stale a dos saltos (grafo bloqueado a depth=2) habría vaciado las relaciones directas.

**Arreglo** (`frontends/mindmap/workspace_routes.py`):
- `_blocking_stale(stale, idx, nodes)`: es el predicado común. Bloquea un stale dentro del recorte o uno sin nodo en el índice. El grafo pasa a usarlo, con la misma conducta que tenía.
- `_document_relations_state(canon_id, idx, idx_error)`: aplica el predicado al documento y a sus vecinos directos. Si el stale queda fuera, responde `{'ok': True, 'estado': 'ok', 'stale': [...]}`, con el stale como aviso, igual que el grafo. Devuelve también las aristas del índice.
- `/node` y `/source` usan esa función. En `/node`, incoming/outgoing salen del índice, no de la proyección del grafo.
- Si `_document_edges` falla, `relations_state` sale `error_indice` con el error. Antes `/source` lo ponía en `relations_error` con estado ok; ahora quedan los dos.

**Tests** (`tests/test_mindmap_workspace.py`):
- Nuevo `test_workspace_relations_state_scoped_like_the_graph`. task_d depende de task_a, y task_c, editado por fuera, queda stale y a dos saltos de d. Para d, `/node` (depth 1 y 2) y `/source` dan relaciones ok, `stale == [task_c]` y la arista d→a. Con depth=2 el grafo se bloquea y las relaciones no. Para task_a (vecino) y task_c (el propio stale), `/node` y `/source` dan `store_no_preparado` sin relaciones. El GET no escribe en el store. Rojo sin el arreglo (`assert (False is True)` en `relations_state.ok` de task_d) y verde con él.
- `test_workspace_stale_without_shard_blocks_even_outside_the_neighborhood` afirma ahora también que `relations_state` (en `/node` y `/source`) se bloquea cuando el nodo stale falta del índice. Pasaba igual antes del arreglo; protege el lado seguro.
- Los tests ya existentes de `test_mindmap_workspace_reader` (stale B vecino de A, sin shard) siguen exigiendo `store_no_preparado` en el contexto y pasan.

## Verificación (layout del CI)

Clon limpio: `/dev/shm/uifollow/UIs/graph_ui` en `c053189` (origin/wt/ui-followups) y `/dev/shm/uifollow/deskops` en origin/main `dc3ed05a`. Venv `/dev/shm/uifollow/venv` (Python 3.12.3) con `pip install --src … -r .github/requirements-suite.txt -e ".[test]"`: sldb `7b9b1e6d`, pron `7f2e3085`, deskops `dc3ed05a`, spec2viz `b16c021`. Cada pytest corrió de a uno con `TMPDIR=/dev/shm timeout 900 systemd-run --user --scope -q -p MemoryMax=2G -E TMPDIR=/dev/shm -- python -m pytest -q -p no:cacheprovider -rs <ruta absoluta>`, después de la espera con pgrep del brief.

| paso | rc | tiempo | resultado |
|---|---|---|---|
| build-deskops | 0 | 8s | ok |
| build-graphui | 0 | 4s | ok |
| build-check | 0 | 38s | ok |
| node-test | 0 | 0s | 151 pass, 0 fail |
| pytest-test_auditor | 0 | 1s | 2 passed |
| pytest-test_ci_workflow | 0 | 0s | 6 passed |
| pytest-test_desk_ui_routes | 0 | 227s | 13 passed |
| pytest-test_editor | 0 | 0s | 2 passed |
| pytest-test_mindmap_adapter | 0 | 2s | 7 passed |
| pytest-test_mindmap_compiler | 0 | 1s | 8 passed |
| pytest-test_mindmap_contract | 0 | 0s | 10 passed |
| pytest-test_mindmap_deskops | 0 | 60s | 7 passed |
| pytest-test_mindmap_endpoints | 0 | 5s | 32 passed |
| pytest-test_mindmap_notation | 0 | 9s | 5 passed |
| pytest-test_mindmap_persistence | 0 | 2s | 4 passed |
| pytest-test_mindmap_quick_capture | 0 | 2s | 3 passed |
| pytest-test_mindmap_skin | 0 | 1s | 4 passed |
| pytest-test_mindmap_workers | 0 | 6s | 10 passed |
| pytest-test_mindmap_workspace | 0 | 72s | 17 passed |
| pytest-test_mindmap_workspace_explorer | 0 | 187s | 40 passed |
| pytest-test_mindmap_workspace_reader | 0 | 234s | 31 passed |
| pytest-test_parallel_workspace_serve | 0 | 20s | 3 passed |
| pytest-test_projection_views | 0 | 30s | 11 passed |
| pytest-test_provider | 0 | 1s | 2 passed |
| pytest-test_representacion_docs | 0 | 0s | 4 passed |
| pytest-test_review_workbench | 0 | 0s | 3 skipped |
| pytest-test_sldb_end_to_end | 0 | 9s | 4 passed |
| pytest-test_snapshot_adapter | 0 | 1s | 1 passed |
| pytest-e2e_mindmap_workspace | 0 | 156s | 19 passed |
| pytest-e2e_mindmap_document_dialog | 0 | 9s | 1 passed |
| pytest-e2e_mindmap_quick_capture | 0 | 12s | 1 passed |
| pytest-e2e_mindmap_doc_edit | 0 | 7s | 1 passed |

`build-*` es `sldb stores build` (deskops, luego graph_ui) y `build-check` es `sldb stores build --check`. `node-test` es `node --test tests/*.test.mjs`. Los e2e corridos son los que tocan esto: e2e_mindmap_workspace, el nuevo del diálogo, quick_capture y doc_edit, que también abren el diálogo de documento. `test_review_workbench` sale con 3 skipped (necesita `npm install` en apps/review-workbench); es preexistente y en el job mindmap del CI pasa igual. No toqué apps/, así que el job review-workbench no se corrió. Tampoco se tocó `.github/workflows/`.

Nota de método: la venv tiene graph_ui instalado en modo editable desde el clon limpio. Durante el desarrollo, el e2e del diálogo corrió en el worktree con `PYTHONPATH=frontends` para servir el frontend del worktree. El rojo del ítem 1 se vio con el frontend sin arreglo y el verde final salió del clon limpio en c053189. `test_mindmap_workspace` antepone `frontends` del worktree en `sys.path`, así que su rojo y su verde fueron sobre el código del worktree.
