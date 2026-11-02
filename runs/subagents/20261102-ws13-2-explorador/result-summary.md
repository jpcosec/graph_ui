# Resultado WS13.2: explorador de documentos modelados y no modelados

Executor Claude Sonnet 5.5, 2026-11-02. Parte de HEAD f237ed7. Sin commits, sin tocar el Board. No es PASS de Tester. Salidas: `validation.log`, `stdout.log`, `stderr.log`, `validation-pertinente-{1,2}.log`, `evidencia-base/base_results.log`, `capturas/`.

## Cambios por punto (archivo:linea)
`workspace_routes.py` (R), `workspace-view.js` (V), `explorer/explorer.mjs` y `explorer-view.js` (nuevos), `workspace.css`.
1. Lista de permitidos: lee `WORKSPACE_EXPLORER_ROOTS` una vez en `__init__` (R:107-109, defecto desk,docs, R:64). `_explorer_roots` (R:234) clasifica en cada llamada: absoluta, `..`, componente symlink o fuera de la raiz van a `roots_invalid`; una valida inexistente se omite sin error. Walk sin seguir directorios symlink, solo `.md`, sin partes con punto ni `__pycache__`/`node_modules`, symlink de archivo fuera de la raiz excluido (`_walk_candidates`, R:291). Ignorados: una sola invocacion `git check-ignore --stdin -z`, argv fijo, sin shell, cwd en la raiz, rutas relativas (`_check_ignore_batch`, R:272); fallo => cierra (ningun no modelado, modelados en estado `protegido`, campo `ignorados_error`). Sin `.git`: `sin_git` true. Tope 5000: `truncado`.
2. `GET /api/workspace/explorer` (ruta R:135, `workspace_explorer` R:324). Modelados desde `indexed_documents`, todos; estado de guardia con `_guard_path(..., ignored=batch)` (R:915, reutiliza la unica consulta git). No modelados: solo permitidos, sin abrir archivos; rastreados excluidos por ruta resuelta. Sin cache, sin parametros del cliente (se ignoran), store inexistente da 503 sin crearlo.
3. Explorador: `views/workspace/explorer/` (arbol de carpetas, modelados por modelo, filtro local, estados, avisos de truncado/sin_git/roots_invalid/ignorados_error). Montado en V:650 como columna izquierda de `.workspace-body`; selector actual conservado. Boton "Refrescar catalogo" (`refreshCatalogs`, V:372) recarga /nodes y /explorer. Abrir usa `openTarget` del lector WS13.1 (id o path). CSS en `workspace.css:714+`.
4. Catalogo degradado: `/nodes` captura fallo de `load_registered_model`/`extract_model_data` (R:220-221): entrada con identidad y ruta, `estado:'modelo_no_carga'`, `causa:str(exc)`. `/source` suma `degraded_reason` (R:1082). `/node` ya respondia 200 con is_degraded (sin cambio, probado).
5. Aviso de relaciones: `RelationsNotice` (V:45) en pestana Grafo (V:779) y en relaciones del panel de contexto (V:943), solo en documentos modelados (un no modelado no tiene relaciones). Sin afirmacion de frescura ni mecanismo nuevo.

## Forma JSON
`/explorer`: `{ok, repo:'local', roots:[rel], roots_invalid:[{entry,reason}] (ruta_absoluta|contiene_..|symlink|fuera_del_repo|vacia), sin_git:bool, truncado:bool, limite:5000, ignorados_error:str|null, modeled:[{id,name,model_name,title(=name),path,estado}] (orden modelo,nombre), unmodeled:[{path,name}] (orden por ruta)}`.
`/nodes`: cada nodo con `estado:'modelo_no_carga'` suma `causa`. `/source`: suma `degraded_reason` (str o null).

## Decisiones
Causa = `str(exc)`. Raices invalidas se reevaluan por peticion (la env se lee una vez). Tope cuenta archivos ya filtrados incluida la guardia git; tope duro de 20000 candidatos previos al chequeo (marca `truncado`). Titulo del modelado en /explorer es el name (no abre archivos); la UI cruza con /nodes para titulo/estado/causa. Orden del arbol: carpetas antes que archivos, por nombre; carpetas de primer nivel abiertas, el resto colapsadas, abiertas al filtrar. Los no-GET al workspace los responde el servidor existente (404/501), sin cambio.

## Resultados reales
| Comando | Resultado |
|---|---|
| `pytest -q tests/test_mindmap_workspace_explorer.py tests/test_mindmap_workspace_reader.py` | 48 passed (17 nuevas explorer + 1 nueva reader) |
| `pytest -q tests/e2e_mindmap_workspace.py` | 14 passed (3 nuevas) |
| `node --test` explorer, reader, workspace, document-ir | 29 pass, 0 fail (7 nuevas) |
| `pytest -q tests` (07:21 a 07:35, 13m45s) | **238 passed, 1 failed**, 2 warnings |
La falla: `tests/test_mindmap_workspace.py::test_workspace_broken_doc_catalog_returns_500` (ver bloqueos). 218 previas: 217 pasan, 1 falla por conducta retirada.

## Falla contra la base
Worktree desechable `/tmp/ws132-base` (HEAD f237ed7 con mis dos archivos de prueba copiados), eliminado al terminar (`git worktree remove`, `list` solo muestra el principal). `evidencia-base/base_results.log`: 15 failed, 3 passed. `/explorer` 404; `/nodes` con modelo no importable 500; `/source` con modelo no importable responde 200 con texto, identidad y `degraded` correctos y falla solo por `KeyError: 'degraded_reason'` (la base ya servia la fuente segura; lo nuevo es el campo explicito). Los 3 que pasan en base son pruebas que no dependen del cambio (p. ej. no-GET y estado inmutable del reader).
Modelo no importable real: su modulo se registra con `add_model`/`create_document` en un proceso aparte desde un directorio fuera del `sys.path`; se comprueba que `import ws132_bitacora` falla; coexiste con TaskDoc sano. Sin monkeypatch.

## Inmutabilidad
`test_every_get_leaves_store_documents_and_git_unchanged`: hashes de `.sldb`, documentos, `git status --porcelain` y HEAD antes/despues de cada GET (explorer, nodes, source por id/path/symlink, node, con modelo no importable, repo con commit y archivo sin rastrear). Tambien en sin_git. Pasa.

## UI (Chromium, 1440x900)
DOM y capturas: explorador, boton de refresco, estado `modelo_no_carga`, arbol, aviso de relaciones en Grafo y panel de contexto (ausente en el explorador y en no modelados), truncado y rutas invalidas. Revise visualmente `explorer-tras-refrescar.png` y `explorer-aviso-relaciones-grafo.png`. Alta de un modelado y un .md aparecen tras refrescar sin reiniciar; todas las peticiones /api son GET; `/explorer` sin query. Ajuste visual posterior (`max-height` de secciones) no tiene captura nueva distinta de la ya generada en e2e final.

## Prueba previa modificada (autorizada por el coordinador)
`tests/test_mindmap_workspace.py::test_workspace_broken_doc_catalog_returns_500` renombrada a `test_workspace_broken_doc_catalog_degrades_that_entry_and_keeps_healthy_ones`: ahora exige 200, la entrada corrupta con `estado:'modelo_no_carga'`, `causa` no vacia, identidad y ruta conservadas, y las sanas con `estado:'ok'`. Resultado real: `pytest -q tests/test_mindmap_workspace.py` 15 passed. La suite completa no se repitio; total esperado 239 pruebas (238 que pasaron + esta corregida). El bloqueo 1 de abajo queda resuelto.

## Bloqueos
1. `tests/test_mindmap_workspace.py::test_workspace_broken_doc_catalog_returns_500` afirma `/nodes` 500 para un documento con frontmatter corrupto; la TaskDoc exige degradar tambien `extract_model_data`, asi que ahora da 200 con `modelo_no_carga`. El archivo esta fuera de la lista cerrada y no lo edite. Hace falta que el Supervisor autorice reemplazar esa asercion (200, `estado:'modelo_no_carga'`, el resto del catalogo sano). Cobertura equivalente ya existe en mis pruebas nuevas.
2. Ninguno de contrato o API nueva.

## Transferencia a WS13.3
El explorador es presentacional (`ExplorerPanel`) con `onOpenId/onOpenPath`; WS13.3 puede reutilizarlo para abrir en pestanas/split sin tocar el listado. `/nodes` entrega `estado/causa`, `/source` `degraded_reason`; titulo de modelados en /explorer es el name.

## No verifique
Solo Chromium, un viewport; sin Tester independiente; layout de store no canonico; rendimiento con catalogos grandes (una invocacion git para el listado, pero `/nodes` sigue leyendo cada documento); umbral de 20000 candidatos no probado; media query movil no probada; no use puertos 8090-8092; el aviso de relaciones no se muestra en no modelados por diseno; no probe symlink de archivo cuyo destino tenga parte `.git` (codigo lo excluye, sin prueba).

## Renovacion 1 (correccion tras FAIL del Tester: H1, H2, symlink)
Fallo primero, correccion despues (salidas en `validation.log` y `validation-renovacion-1.log`).
1. H1: `_fresh_listing` (`workspace_routes.py`, llamado al inicio de `workspace_nodes` y `workspace_explorer`) invoca `sldb.store.runtime_cache_signature.new_operation` y `sldb.store.documents_hash.new_operation` (las mismas que usa `open_store`; sin guion bajo, ya usadas por `sldb_adapter.refresh_for_concurrent_sessions`). Lei ambas: solo tocan estructuras en memoria del proceso (`_FORCE_SWEEP`, `_STAT_CACHE`, `_GEN`); no escriben archivos ni migran. No se llama `open_store`. Pruebas reales: `test_modeled_created_and_removed_by_another_process_show_after_refresh` (servidor vivo con cache caliente; otro proceso crea con `DeskopsOperations`, `untrack_document`, `track_document_file`, `delete_document`; HTTP: aparece en /nodes y /explorer.modeled, sin duplicar como no modelado; el untrack lo pasa a no modelado; re-track lo devuelve; el borrado lo quita) y e2e `test_explorer_refresh_shows_changes_made_by_another_process` (Chromium, boton Refrescar; captura `explorer-alta-otro-proceso.png`). Fallaba antes, pasa despues. No hubo bloqueo: no hizo falta formato interno.
2. H2: en `_materialize` un fallo de modelo deja `is_degraded` true y `degraded_reason` = "Fallo al validar documento en disco (<causa>)" (antes quedaba false/null si el frontmatter rescataba el payload). `/node` da 200 con `node.is_degraded` y `context.is_degraded` true y `context.degraded_reason` con la causa; el sano queda false/null. Efecto colateral: la proyeccion de codigo de ese documento queda "no disponible" (conducta existente para degradados).
3. Symlink: `_walk_candidates` excluye todo archivo symlink (solo se lista el destino real por su ruta). Prueba `test_internal_file_symlink_is_not_listed_as_unmodeled` y ajuste de `test_explorer_filters_hidden_ignored_symlinks_and_extensions`.
Pruebas: explorer 19 (+2) y e2e 15 (+1); total de las cuatro suites pertinentes 80 passed; node 29 pass. Suite general no corrida. Total esperado de la suite: 239 + 3 = 242 pruebas.
No verificado ademas: reglas de cache de sldb mas alla de las probadas (alta/baja/untrack/track desde otro proceso); un archivo symlink con destino fuera de las rutas permitidas simplemente no se lista.
