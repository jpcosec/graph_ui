# Tester independiente: vistas con read_store + save 503 (viewsave-tester-a1)

**Veredicto: PASS.** Cumple el contrato y la Disposition. No hay hallazgos bloqueantes en el cambio. Las dos observaciones de abajo no vienen de este cambio.

## Entorno
- venv uv con Python 3.13 en /dev/shm/viewsave-t1/venv (código nuevo) y venv-old (HEAD).
- sldb origin/main d50dd6a9, deskops HEAD 0bc4206a, pron HEAD 39ea9724, graph_ui HEAD 440a5683 (ver logs/shas.txt).
- Workspace como en la CI: /dev/shm/viewsave-t1/ws/{deskops,UIs/graph_ui}. Es el `git archive HEAD` con los 7 archivos del diff encima y el node_modules de review-workbench copiado. Antes de correr se hizo `sldb stores build` en las dos copias.
- La copia de código viejo es oldws: HEAD más solo los 3 archivos de prueba nuevos.

## 1. Validation
| comando | rc | resultado |
|---|---|---|
| `! grep -rn open_store sldb_adapter.py projection_views.py views_routes.py` | 0 | sin coincidencias (logs/v1-grep.log) |
| pytest persistence, projection_views, workspace_explorer, adapter, parallel_workspace_serve, mindmap_deskops | 0 | 76 passed (logs/v2-pytest.log) |
| pytest e2e_mindmap_workspace.py, e2e_review_workbench_views.py | 1 | 24 passed, 1 failed (logs/v3-e2e.log) |
| la prueba e2e que falló, corrida sola: código nuevo, viejo, nuevo | 0/0/0 | 1 passed cada vez (logs/v3-rerun-flaky.log): es intermitente, no regresión |
| pytest tests/test_mindmap_endpoints.py completo | 0 | 33 passed (logs/v4-endpoints.log) |

La prueba que falló es e2e_mindmap_workspace.py::test_explorer_equal_titles_show_distinct_visible_paths_and_open_their_origin. Falló en `document-reader` con un timeout de 5 s. Recorre el explorador de deskops, no las vistas ni save, y pasa sola tanto con el código nuevo como con el viejo.

## 2. Alcance
Evidencia en logs/p2-scope.log.
- `git diff --name-only` devuelve solo los 4 archivos de frontends/mindmap (sldb_adapter, views_routes, persistence, serve) y los 3 de tests (endpoints, persistence, projection_views). serve.py lo autorizó el coordinador.
- pyproject.toml no tiene diff (0 líneas).
- make_server es idéntico a HEAD; solo se corrió de línea. Sigue preparando el store así: SldbAdapter → get_store_context → sldb.api.open_store (sldb src/sldb/cli/store_context.py:9,23). En el proceso real, `prepared at start: True`.
- El import de render_model_markdown/validate_model_input_roundtrip sigue, ahora en sldb_adapter.py:32 porque se agregó encima el import de SLDBStoreError.

## 3. Las pruebas nuevas fallan con el código viejo
Las 3 corrieron sobre oldws con venv-old. Se verificó que `mindmap` resuelve a oldws y que su runtime_documents usa open_store.
- test_projection_views::test_views_get_on_an_unprepared_store_is_503_and_writes_nothing: rc 1, `('GET','/api/views',200,{'views': []})`, 200 != 503.
- test_mindmap_persistence::test_save_on_a_store_unprepared_after_open_is_503_...: rc 1, la SLDBStoreError 'store not prepared' sale sin traducir.
- test_mindmap_endpoints::test_save_on_a_store_unprepared_after_start_is_503_...: rc 1, `(500, 'store not prepared ...')`, 500 != 503.

## 4. Procesos reales
Script: scripts/proc_check.py. Se levantó serve.py como proceso aparte sobre un store en /dev/shm, armado con los pilotos de notación, y se des-preparó desde otro proceso python escribiendo el índice semántico legado.

Código nuevo (logs/p4-new-unprepare.log):
- Sobre el store preparado:
  - GET /api/views da 200;
  - POST /api/views/evaluate da 200 con 11 aristas;
  - POST /api/save da 200 y cambia 4 archivos. El título persiste.
- Sobre el store des-preparado, las 5 rutas responden 503 `store not prepared: run \`sldb stores update\``, con `estado: store_no_preparado`. Save además trae `completed: []`. Las rutas son:
  - GET /api/views;
  - GET /api/views/evaluate?view=…;
  - POST /api/views/evaluate;
  - POST /api/views/save;
  - POST /api/save.
- Se tomó sha256 y mtime_ns de 406 archivos de .sldb y .sldb_cache antes y después: idénticos. El store sigue sin preparar y el servidor sigue vivo.

Código viejo con el mismo guion (logs/p4-old-unprepare.log), para contraste:
- GET /api/views da 200 y migró el store.
- POST /api/save da 200 y escribe.
- El árbol cambió (identical False) y el store queda preparado.

Esto confirma el bug (a) y que el cambio lo corrige.

## 5. Regresiones
- **Otra SLDBStoreError (.sldb borrado con el servidor arrancado)**, en logs/p4-new-delete.log y logs/p4-old-delete.log:
  - Las 4 rutas de vistas dan 404 `... is not an sldb store` en el código viejo y en el nuevo. No cambian.
  - POST /api/save pasa de 500 a 503 con estado store_no_preparado. Motivo: el read_store de sldb@main responde 'store not prepared' también cuando el store no existe. Ver O1.
- **Los errores de save que no son 'store not prepared' siguen llevando el grafo.** Se probaron 409 por viewRevision vieja, 409 por expected viejo y 400 por operación inválida. En código nuevo y viejo, todos traen `completed`, `documents`, `view` y `revision` (logs/p5-save-errors-graph.log).
- **Cliente.** frontends/mindmap/source/documents.js:78 hace `if (e.body?.documents)` antes de tocar baseline o conflicts. Con un 503 sin documents solo muestra `e.message` ('store not prepared…') y el aviso 'No se completó el guardado'. shell/api.js:7-10 lanza el error con body.error. No hay rotura.

## 6. Procesos huérfanos
- Línea base: 4 procesos ajenos que ya estaban antes (logs/ps-baseline.txt, ps-before-e2e.txt):
  - 1327477, 1984202 y 3566546 son vite preview;
  - 3589698 es serve.py 8092 de /home/dios.
  No los toqué.
- La corrida de e2e dejó un vite preview huérfano mío (logs/ps-after-e2e.txt, logs/orphan-vite-evidence.txt):
  - PID 2217000, PPID 1, cwd /dev/shm/viewsave-t1/ws/UIs/graph_ui/apps/review-workbench;
  - `--outDir /dev/shm/rw-views-0e9cco2q/dist --port 36429`.
  Lo corté con `kill 2217000`.
- Final (logs/ps-final.txt): solo quedan los 4 ajenos de la línea base. Los serve.py de mis scripts salieron con -15.

## Hallazgos
- **O1, baja, informativo (sldb).** Con .sldb borrado, POST /api/save responde 503 `store not prepared: run sldb stores update` en vez del 500 de antes, y el texto lleva a pensar que basta con migrar. Viene de sldb.api.read_store y de que persistence.py:83 detecta por la substring 'store not prepared', tal como fija la Disposition (2). Las vistas no cambian (404). No hay que tocar este cambio.
- **O2, media, preexistente y fuera de alcance.** tests/e2e_review_workbench_views.py:107 lanza `npx vite preview` con Popen, y :114 hace terminate sobre el wrapper npx. El hijo node `vite preview` queda huérfano con PPID 1. Se reprodujo en esta corrida con el PID 2217000.
- **O3, baja, preexistente.** e2e_mindmap_workspace.py::test_explorer_equal_titles_show_distinct_visible_paths_and_open_their_origin es intermitente: falló una vez en la corrida conjunta y pasó 3 de 3 sola, con código nuevo y viejo. No toca el código cambiado.
- **Sin hallazgos en el diff.** La detección es isinstance más la substring y relanza el resto. 'estado' solo se agrega en este caso. AdapterError.estado vale None por defecto, así que el resto de los usos sigue igual. La rama con estado de serve.py:477-481 no relee el store para el grafo.

Nota sobre los logs del punto 3: por un error en el nombre de archivo, solo quedó el log de la tercera corrida, logs/p3-old-endpoints.log. Las salidas de las otras dos, con rc 1 y el AssertionError o la excepción, están copiadas arriba tal como salieron en consola.
