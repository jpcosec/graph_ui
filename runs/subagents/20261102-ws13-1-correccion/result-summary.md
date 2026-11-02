# Resultado: corrección WS13.1 (lectura sin mutación, guardias previas, foco con dueño, estado ligado, anclas)

Executor Claude Sonnet 5.5, 2026-11-02. Sin commits, sin tocar el Board. Parte de `4fdaf05` (master, contiene bf55151). WS13.1 sigue sin aceptar hasta root. Este resumen solo afirma lo ejecutado; las salidas están en `validation.log`, `stdout.log`, `stderr.log`, `capturas/` y `evidencia-base/`.

## Archivos

Cambiados, todos dentro de la lista cerrada:
- `frontends/mindmap/workspace_routes.py`
- `frontends/mindmap/views/workspace/node/reader.mjs`
- `frontends/mindmap/views/workspace/node/workspace-view.js`
- `tests/test_mindmap_workspace_reader.py` (+6 pruebas), `tests/test_mindmap_workspace.py` (1 modificada, +1), `tests/e2e_mindmap_workspace.py` (+7), `tests/mindmap-workspace-reader.test.mjs` (nuevo, 9 pruebas)

No se tocó `sldb_adapter.py` (por eso `declaracion-archivos.md` no tiene entradas), `serve.py`, `shell/api.js`, `frontends/workspace/`, `persistence.py`, `desk/inbox`, tareas hermanas, puertos 8090/8091/8092. No hay API nueva de sldb ni formato interno en el producto.

Para el criterio de "falla sin la corrección" creé un worktree desechable `/tmp/ws131-base` (`git worktree add --detach`, HEAD `4fdaf05`), copié las pruebas nuevas ahí y las corrí contra el código de partida. Mi árbol no se tocó con `stash`. El worktree se elimina al final (`git worktree remove`).

## Por punto: cambios, prueba que lo cubre, evidencia de que fallaba antes

Líneas de `workspace_routes.py` (R), `reader.mjs` (M), `workspace-view.js` (V) en el estado final.

### 1. Lectura sin mutación
- Cambios: ninguna ruta GET llama `document_edges`, `rebuild_edges` ni `editor_store.document_ir`. `_load_index` (R:435) usa `load_edge_index(store, include_linked=False)`; `_relations_state` (R:444) lee `EdgeIndex.stale`; con stale no vacío, `_build_graph_neighborhood` (R:508) y `_source_context` (R:928) responden `ok:false, estado:'store_no_preparado', stale:[...]` sin escribir. `/node` además lleva `context.relations_state` y `incoming/outgoing_relations: null` en ese caso. `_check_problems_for_node` reutiliza el mismo índice. Si `load_edge_index` falla: `estado:'error_indice'`.
- Pruebas: `test_get_leaves_store_documents_and_git_unchanged_canonical` y `test_get_on_stale_store_rejects_observably_and_never_rebuilds` (reader), `test_workspace_cycle_on_unprepared_store_is_rejected_not_rebuilt` (workspace), e2e `test_reader_unprepared_store_shows_rejection_in_graph_and_relations`. Hashes de `.sldb`, de todos los documentos del repo y `git status --porcelain` + HEAD (con un commit real y un archivo sin rastrear), antes y después de CADA GET (10 URL) en caso canónico y en caso stale (shard del documento B borrado, que es como sldb documenta un store al que se escribió desde fuera). El rechazo es observable; después de `rebuild_edges` explícito el grafo responde.
- Falla antes: en `/tmp/ws131-base` ambas pruebas de hashes fallan (`GET modifico el store`, incluso en el caso canónico: el diff muestra cambios en `store`), `KeyError: 'stale'`, y la prueba workspace falla con `graph.ok is True` (el GET reconstruyó el shard). Ver `evidencia-base/base_results.log`.
- Layout no canónico: no hay consulta pública previa a `open_store`; `load_edge_index`/`doc_status` pasan por `open_store`, que migra (leído en contrato §5.4). Las rutas se comportan igual que con store canónico: riesgo declarado, intake ya enviado a sldb. No lo observé: fabricar un layout no canónico exige formato interno, que no se usó. No usé `_already_canonical`.

### 2. Guardias antes de leer
- Cambios: identidad y ruta salen de `indexed_documents` (`_indexed`, R:146), sin abrir fuentes. `_guard_path` (R:733) aplica contención, `.git`, existencia, ignorado, directorio y (solo /source y destinos de enlace) `.md`; `_read_authorized` (R:767) lee bytes solo después. Ya no se llama `editor_store.documents/document_ir`, `resolve_runtime_doc`, `load_runtime_documents` ni `extract_document_payload`. Payload: `load_registered_model` + `extract_model_data` sobre los bytes ya leídos (`_extract_payload`, R:160); plantilla `getattr(model_type,'__template__',None)`; IR con `build_document_ir_json` sobre el texto leído (`_build_ir`). `/nodes` (R:174): título/status del payload de cada autorizado, leído uno a uno; un no autorizado aparece con `estado` = su estado de guardia y `title` = su name; los autorizados llevan `estado:'ok'`. `/node` y `/source` rechazan con estado y código de §3.3 sin leer. `_resolve_document_fallback` (R:378) conserva la lista de candidatos fijos y cada uno pasa `_read_authorized`. Los vecinos de `/node` se etiquetan (`_node_label`, R:493) leyendo solo si pasan las guardias.
- Prueba: `test_no_file_is_opened_before_or_instead_of_its_guards`. Lanza un `serve.py` real en un proceso aparte con `sys.addaudithook` que registra cada `open` (ruta y realpath) y lo compara con el árbol de la prueba (PYTHONPATH apunta al mismo árbol que la prueba). Cubre: documento protegido (gitignorado) solicitado por id, por path y en /node; symlink que escapa solicitado; otro protegido y el symlink y el secreto externo NO solicitados durante /source de A, /nodes y /node depth 2; un documento autorizado no enlazado no se abre en /source de A; enlaces con ancla hacia ignorado y symlink: se informa su estado y el destino no se abre.
- Falla antes: contra el código de partida, la prueba falla porque el servidor abrió `task-protegido-p.md`, `task-protegido-q.md`, `task-symlink-s.md` y el archivo externo `secreto-externo.md` al servir la petición del protegido (que igual respondía 403). Con `/nodes` el código de partida respondía 500. Nota honesta: en una primera corrida el subproceso importaba `mindmap` del paquete instalado (el árbol nuevo) y el chequeo pasaba en falso; lo detecté y corregí con PYTHONPATH.
- Efecto colateral: `semantic_tags` de `/node` es ahora `[]` (no hay API pública sin abrir otros documentos que los dé); la UI no lo consume.

### 3. Foco con dueño
- Cambios: cada procedencia de arista lleva `owner` (R:488): el documento fuente del registro cuando `origin=='schema'` y hay `field`; `null` para `relation_doc`/`structural`. Se conservan todas las procedencias. `reader.mjs`: `ownedProvenance` (M:119), `edgeFields(edge, docId)` (M:125, solo campos propios), `edgeDeclarations` (M:135, de cualquier dueño, para mostrar), `fieldHighlighted/edgeHighlighted/referenceHighlighted` con `docId` (M:150-177), `correspondence` con `docId` (M:195). La referencia exige además que la procedencia declare el mismo valor, de modo que un campo propio que apunta a otro destino no cuenta. V: el sidebar muestra `declara: <dueño>.<campo>`.
- Pruebas: `test_edge_provenance_carries_owner_document` y `test_focus_uses_only_fields_owned_by_the_open_document` (respuestas reales de `/node` depth 2 del servidor, evaluadas con `reader.mjs` real vía node: saliente, entrante con el mismo nombre de campo, vecino a dos saltos); `tests/mindmap-workspace-reader.test.mjs` (9; entradas con la forma que entrega el servidor, incluye referencia con otro destino, relation_doc y multiplicidad); e2e `test_reader_edge_focus_marks_only_fields_of_the_open_document`.
- Falla antes: `evidencia-base/old_focus.out` (reader.mjs de partida): con foco en la arista entrante B->A, `fieldHighlighted('depends_on')` de A = true y `correspondence` = `{document:1,...}`; con foco de campo depends_on resalta la entrante. Las pruebas pytest de base fallan con `KeyError: 'owner'` y `edgeDeclarations is not a function`; el e2e del destino B falla con `Documento: 2` en vez de 0; el .mjs falla en la importación.

### 4. Sin mezcla de documentos
- Cambios (V): contador local `navGen` (V:251) que solo sube al navegar a otro documento (`navigateTo`, V:280; recargar el mismo no lo sube). `source` y `nodeData` se consumen solo si su `_gen` y su identidad (`_key` / `_id`) son los vigentes (V:257-260); las respuestas pasan por `stale()` (token + generación) y se descartan. Al navegar se vacía todo y cada panel muestra "Cargando…" (documento, grafo, código, relaciones, enlaces, integridad y la identidad del sidebar; ya no "Sin estado"/"Sin nodo"). Aviso `revision-mismatch` (V:492) cuando, dentro de la misma generación, `file_revision` de /node difiere de `revision` de /source, sin unificarlas. Un solo lector.
- Pruebas e2e reales (Chromium, `page.route` retiene la petición y `route.continue_()` la envía al servidor real después; el test verifica que la respuesta llegó): `test_reader_late_node_response_of_previous_document_is_discarded` (A->B modelado, /node de A tardío), `test_reader_modeled_to_unmodeled_shows_loading_not_previous_data` (A->sin modelo con /source retenido), `test_reader_late_node_response_does_not_repopulate_unmodeled_document` (A->sin modelo, /node de A tardío), `test_reader_warns_when_node_and_source_revisions_differ` (el archivo cambia entre las dos lecturas).
- Falla antes: `evidencia-base/base_mix.out`: en el código de partida, con el /node de B retenido, la cabecera dice B pero Código muestra 2 tarjetas de A (`src/app.py:6`, `docs/guia.md`) y Grafo 3 aristas de A. Las e2e nuevas fallan en base (sin estado de carga, sin aviso).

### 5. Anclas
- Cambios: `_check_anchor` (R:981) y `_read_destination` (R:1055) en `_classify_link` (R:996): con ancla, el destino (modelado, no modelado) pasa las guardias, se lee por lectura protegida y se comprueba con `extract_section` (sldb.links.sections); el propio documento usa el texto ya leído. Inexistente: `status:'roto'`, `estado:'ancla_inexistente'`, `open:null`, `cause`, `origin`. Un destino que no pasa las guardias no se lee para mirar el ancla: se informa su estado (`protegido`, `fuera_del_repo`...), no navegable. Sin ancla, el destino no se abre. No se expande contenido.
- Pruebas: `test_anchor_must_exist_in_own_modeled_and_unmodeled_targets` (válida e inexistente en propio, modelado por ruta, modelado por nombre y no modelado), la parte de enlaces de la prueba de E/S, e2e `test_reader_missing_anchor_is_broken_not_navigable`.
- Falla antes: base devuelve `status:'ok'` para `[[#Falta]]`; el e2e cuenta 4 enlaces ok en vez de 2.
- Cambio de comportamiento: antes la UI también aceptaba el slug como ancla; ahora el enlace se valida solo por título como hace `extract_section`.

## Forma JSON nueva para consumidores
- `GET /api/workspace/nodes`: cada nodo suma `estado` (`'ok'` o el estado de guardia); no autorizado: `title` = `name`, `status` = `''`.
- `GET /api/workspace/node`: `projections.graph` suma `estado` (`'ok'`/`'store_no_preparado'`/ausente en error genérico) y `stale: [export ids]`; con stale: `ok:false, nodes:[], edges:[]`. Nodos del grafo suman `estado`. `context.relations_state = {ok, estado, stale, error}`; `incoming_relations`/`outgoing_relations` son `null` si no ok. `context.file_revision` sale ahora de los mismos bytes que el IR. Rechazos de guardia: `{ok:false, error, estado}` con los códigos de §3.3 (403, 404, 413, 415, 503) también en `/node`. `semantic_tags: []`. `context.documents_error` es siempre `null`.
- `GET /api/workspace/source`: `context.relations_state` (igual), relaciones `null` si no preparado y `relations_error` con el motivo. `links[]` suma el estado `ancla_inexistente` (`status:'roto'`).
- Procedencia de arista (`edge.provenance[]`): suma `owner` (Model:name del documento que declara el campo, o `null`).
- Consumidor UI (workspace-view.js): ya no usa `source`/`nodeData` sin comprobar generación e identidad.

## Pruebas previas modificadas por conducta retirada (una a una)
1. `tests/test_mindmap_workspace.py::test_workspace_cycle_and_2hops_real_edges`: antes confiaba en que el GET reconstruyera el índice; ahora prepara el store de forma explícita y externa (`sldb.api.rebuild_edges` antes del GET), conserva todas sus aserciones sin relajar nada y añade que el store no cambió tras la lectura. Observación: esa prueba ya pasaba sin la preparación en este fixture (los documentos se escriben con `DeskopsOperations`, que mantiene los shards al día), por lo que no pude reproducir el caso "escrito fuera de la API" con ella; el caso de rechazo se cubre con la prueba nueva `test_workspace_cycle_on_unprepared_store_is_rejected_not_rebuilt`.
Ninguna otra prueba previa se cambió: las 204 previas siguen pasando (ver conteos).

## Resultados reales (comandos y conteos; salidas en `validation.log`, `stdout.log`, `stderr.log`)
| Comando | Resultado |
|---|---|
| `python -m pytest -q tests/test_mindmap_workspace_reader.py tests/test_mindmap_workspace.py` | 45 passed (160 s) |
| `WORKSPACE_SCREENSHOT_DIR=runs/.../capturas python -m pytest -q tests/e2e_mindmap_workspace.py` | 11 passed (96 s) |
| `node --test tests/mindmap-workspace-reader.test.mjs` | 9 pass, 0 fail |
| `node --test tests/mindmap-workspace.test.mjs tests/document-ir.test.mjs` | 13 pass, 0 fail |
| `python -m pytest -q tests` | **218 passed**, 2 warnings (12 min 19 s). Partida: 204 recolectadas; +14 nuevas (6 reader, 1 workspace, 7 e2e); ninguna previa rota |
Contra el código de partida (worktree desechable `/tmp/ws131-base`, `evidencia-base/base_results.log`): reader nuevas 6 failed (la séptima seleccionada es una previa que pasa); workspace: la nueva falla y la modificada pasa; e2e: 6 failed de las 7 nuevas (la séptima, `late_node_response_does_not_repopulate_unmodeled_document`, pasó en base: no distingue sin la corrección, su valor es de regresión; el caso de mezcla A->B lo prueba `base_mix.out`); mjs: falla en la importación. Capturas en `capturas/` (`correccion-*.png`; revisé visualmente `correccion-carga-sin-datos-del-anterior` y `correccion-store-no-preparado`).

## Bloqueos
- Ninguno que impida la entrega. La API pública bastó (`indexed_documents`, `load_registered_model`, `extract_model_data`, `build_document_ir_json`, `load_edge_index`, `doc_status`, `extract_section`).
- Riesgo declarado, sin workaround: layout no canónico. No hay consulta pública previa a `open_store`; `load_edge_index` y `doc_status` pasan por `open_store`, que puede migrar. Intake ya enviado a sldb (el de la TaskDoc). No observado.

## Lo que no verifiqué
- No hay Tester independiente: esto no es PASS de Tester. Las pruebas las escribí y ejecuté yo.
- Layout no canónico (arriba). Solo Chromium; un solo viewport (1440x900); no abrí 8090/8091/8092 ni la demo 8092.
- El caso stale se fabrica borrando el shard de un documento (condición que sldb documenta como causa de `stale`); no probé otros orígenes de stale ni un store con el hash de campos movido.
- Rendimiento: `/nodes` hace una verificación `git check-ignore` y una extracción por documento, uno a uno; no medí catálogos grandes. `/node` lee además los vecinos autorizados del grafo para su título.
- `semantic_tags` ya no se entrega (queda `[]`); no comprobé consumidores fuera de graph_ui.
- Una falla de extracción de un documento autorizado en `/nodes` sigue dando 500 (conducta previa conservada, probada por `test_workspace_broken_doc_catalog_returns_500`); en vecinos del grafo se degrada a `estado:'error_lectura'`.
- La e2e que retiene respuestas retiene la petición y la libera con `route.continue_()` (la respuesta real llega tarde); `route.fetch()` + `fulfill` diferido no entregaba la respuesta en la API síncrona, por eso no se usó.
- G_HUMAN_READ y WS16 siguen pendientes; WS13.1 sigue sin aceptar.
