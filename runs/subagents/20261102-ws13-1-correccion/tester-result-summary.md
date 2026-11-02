# Resultado del Tester independiente: corrección WS13.1

Tester independiente, 2026-11-02. No implementé nada, no edité producto ni tests, sin commits ni Board. Bytes probados: `sha256sum -c entregable-executor.sha256` dio OK en los 7 archivos, antes y después de mis corridas. Escenarios diseñados antes de leer `result-summary.md`. Todo con repos git y stores sldb temporales reales bajo `/tmp/tst/` y servidores `serve.py` reales en puertos 18101 a 18107 (muertos al terminar; 8090, 8091 y 8092 siguen escuchando y 8090 responde 200 en `/` y `/api/workspace/nodes`). Scripts en `runs/subagents/20261102-ws13-1-correccion/tester/` (build.py, build2.py, s1.py a s5.py, s3pure.mjs, audit_launch.py, time.py, srv.sh, asrv.sh).

## Tabla por punto de done_when

| Punto | Resultado | Evidencia observada |
|---|---|---|
| 1. Lectura sin mutación | PASS | Hash sha256 de todo `.sldb` + documentos (A, B, notes) + `git status --porcelain` + HEAD, antes y después de cada uno de 5 GET (`/nodes`, `/node` A d2, `/source` A, `/node` B, `/source` B), todos `SIN_CAMBIOS=True`. Canónico: graph ok, 10 nodos. Stale por edición externa de B (cambié `depends_on` en el .md, `update_store_indexes` y restauré por git solo el shard de B, que no es borrarlo): `/node` responde `graph.ok=False estado=store_no_preparado stale=['TaskDoc:task-doc-b']`, `incoming_relations=None`, `/source` sigue legible (`ok`, texto con el cambio) con `relations_state=store_no_preparado`. Stale tras campo de referencia (modelo propio Linked, `also` declarado en `__references__`, valor editado y shard restaurado): mismo rechazo, hashes iguales. Tras `rebuild_edges` externo vuelven `graph.ok=True` y la arista con ambas procedencias (`about`, `also`). |
| 2. Guardias antes de leer | PASS | `serve.py` en proceso aparte con `sys.addaudithook` (registra cada `open`, ruta y realpath). Rastreados: gitignorado (`task-secreto-p`), `.env.md` (por `.env*`), symlink a archivo fuera del repo, `notes/ign.md` ignorado, y documentos normales. `/nodes`, `/node` normal y de A depth 2, `/source` normal, `/source` y `/node` de los 3 protegidos (403 `protegido`/`fuera_del_repo`), `path=` normal y `path=` de `.env.md`, symlink, ignorado, `notes/ign.md` y `../` fuera: `PROHIBIDOS_ABIERTOS=[]` en las 18 peticiones (ni el solicitado ni los no solicitados, ni el destino del symlink). Autorizados sí abiertos (A, B, N en `/nodes`; N en `/node` y `/source`; `anclas.md`). `/nodes` muestra los 3 con `estado` y su name como título. Un enlace con ancla a `notes/ign.md#Sec` tampoco lo abre. |
| 2b. Fallback, modelo que no carga | PASS con observación | Store r2 (modelo `t2models` no importable por el servidor) con nota `sec.md` gitignorada: `sec.md` nunca abierto en `/nodes`, `/node`, `/source` ni `path=` (los 3 últimos dan 403 `protegido`). `/node` y `/source` de l1 responden 200 con `is_degraded` y error del modelo; `/nodes` responde 500 «Failed to import module» (conducta previa conservada, el Executor lo declara). |
| 3. Foco con dueño (Chromium) | PASS | 15 de 15. A y B con `depends_on`: con B→A enfocada y A abierto, `A.depends_on` no se resalta y la correspondencia dice Documento 0. A→C con dos procedencias muestra `depends_on,inherits_from`, el foco resalta ambos campos de A (Documento 2, Grafo 1). Vecino a dos saltos D→B: ningún campo de A. Foco por campo `A.depends_on`: solo A→C resaltada (no B→A ni D→B), Grafo 1. Foco `A.inherits_from`: A→C. Referencia de Code `src/x.py`: Grafo 0. Con B abierto, B→A sí resalta `B.depends_on`. Con `reader.mjs` real (función pura, entradas fabricadas con la forma del servidor): campo propio que apunta a otro destino no cuenta; relation_doc no resalta campo; foco de otro doc no cuenta. Sin pageerrors. |
| 4. Sin mezcla | PASS | `page.route` retiene la respuesta real y la libera con `continue_()`. A→B (pestañas graph, document y code) con `/source` de B retenido: DOM de identidad todo «Cargando…» (ID, Modelo, Estado, Path, hashes), relaciones/enlaces/integridad «Cargando…», main «Cargando grafo/documento/código…», sin «Doc A» ni «task-doc-a»; al liberar aparece B. Con `/source` de B ya llegado y `/node` de B retenido: identidad es de B, Estado/Nodo/Content Hash «Cargando…» (no el hash de A), sin `src/x.py` ni aristas de A, relaciones sin `task-doc-c` (15 de 15 en esta variante). A→no modelado con `/source` retenido: todo en carga, nada de A; al llegar se ve el no modelado. A con `/node` retenido→no modelado: al liberar, no repuebla (Grafo/Código «Sin grafo ni referencias»). A(`/node` tardío)→B: Código de B sin `src/x.py`. A→B→A (back) con B retenido: se muestra A y la B tardía se descarta. |
| 5. Anclas | PASS | 15 de 15. Válida e inexistente en documento propio no modelado (`#Propia` / `#Zzz`), propio modelado (`#Goal` / `#Inexistente`), destino no modelado (`otro.md#Real` / `#Nada`), destino modelado (`task-doc-b#Goal` / `#Nada`). API: inexistente `status=roto estado=ancla_inexistente open=null` con causa y origen `ruta:línea`; válidas `ok` con `open`, incluso `#real` y `#goal` en minúsculas y `#Real ` con espacio. UI: clic en la inexistente (item y texto inline): URL idéntica y 0 peticiones nuevas; se ve «roto: La sección «X» no existe en … (origen notes/anclas.md:5)». Las válidas navegan con `anchor=` y enfocan la sección. Destino protegido: `estado=protegido`, no navegable, causa visible, el destino no se abrió (registro de open). |

## Suites de done_when (sin la suite general)

- `python -m pytest -q tests/test_mindmap_workspace_reader.py tests/test_mindmap_workspace.py`: 45 passed (159 s).
- `python -m pytest -q tests/e2e_mindmap_workspace.py`: 11 passed (95 s).
- `node --test tests/mindmap-workspace-reader.test.mjs`: 9 pass, 0 fail.
- `python -m pytest -q tests` no corrido (instrucción).

## Comprobaciones adicionales

- `git diff HEAD`: solo reader.mjs, workspace-view.js, workspace_routes.py y los 3 tests modificados (más `tests/mindmap-workspace-reader.test.mjs` nuevo sin rastrear). Sin `shell/api.js`, `persistence.py` ni `frontends/workspace/`.
- `semantic_tags`: `/node` ahora da `projections.document.semantic_tags = []`. En `frontends/mindmap` ningún JS ni .mjs lo consume (grep en js/mjs/html); las únicas referencias son `serve.py:353` y `sldb_adapter.py:180,211`, que son la ruta de documento del editor, no `/api/workspace/node`. `frontends/workspace/app.js` consume `/api/workspace/node`, pero es otro servidor/frontend, fuera de `frontends/mindmap`, y no lee `semantic_tags` (grep). Consumidores fuera de graph_ui: no verificados.

## Tiempos medidos (copia de la store real: `.sldb`, `desk`, `docs`, 307 nodos de catálogo, 1321 nodos de aristas, 0 stale)

| Petición | Sin `.git` en la copia | Con `git init` en la copia (check-ignore activo) |
|---|---|---|
| `/nodes` | 0.31 a 0.43 s | 0.77 a 0.88 s |
| `/node` primera (frío) depth 1 | 0.48 s | 0.47 s |
| `/node` siguientes depth 1 | 0.03 a 0.04 s | 0.04 s |
| `/node` depth 2 | 0.04 a 0.06 s | 0.07 s |
| `/source` | 0.01 a 0.03 s | 0.02 a 0.03 s |

Tras las peticiones, el hash de todo `.sldb` de la copia no cambió. En esta copia 15 nodos salen `no_existe` porque no copié la carpeta `sldb/` (es un artefacto de la copia, no de la corrección).

## Hallazgos

No hay FAIL en los puntos de done_when. Observaciones:

1. Limitación de sldb, no de graph_ui: tras declarar un campo nuevo en `__references__` de un modelo y correr `reindex_model`, `EdgeIndex.stale` sigue vacío y el shard no incorpora la arista nueva (`docs_reused`); solo aparece al editar el documento y reconstruir. Reproducción: `/tmp/tst/build2.py`, luego cambiar `__references__ = ["about"]` a `["about","also"]` y `api.reindex_model(...)`: `load_edge_index(...).stale == []` y solo existe la arista `about`. Por eso el caso «campo de referencia añadido» solo se pudo obtener como stale editando un valor y restaurando el shard.
2. `/nodes` devuelve 500 completo cuando un documento autorizado no carga su modelo (conducta previa, declarada por el Executor); no es regresión.
3. Un stale «por edición externa» no se produce solo editando el .md: `load_edge_index` no lo marca (`stale=[]`) hasta que el índice del core se rehashea; las APIs públicas (`update_store_indexes`, `reindex_model`) reconstruyen también los shards. Para obtenerlo restauré con git únicamente el shard `runtime/edges/TaskDoc/task-doc-b.yaml` a su versión anterior (core nuevo, shard viejo). Es un estado que la propia sldb define como stale (hash del core distinto del hash del shard), pero fabricado.
4. Mi primera pasada de s4 tenía el patrón de `page.route` sin decodificar `%3A` (no retuvo nada) y un par de comprobaciones mal formuladas (B legítimamente muestra `task-doc-a` y «Doc B» aparece como vecino en el grafo de A); las corregí y todas las cifras anteriores son de la corrida corregida. No hubo cambios al producto.

## No verificado

- Layout no canónico del store (sin consulta pública previa a `open_store`): no observado, riesgo declarado por el Executor.
- Otros orígenes de stale distintos de shard-atrasado-respecto-al-core.
- Solo Chromium y un viewport (1440x900, 1440x1000); no abrí 8092 (demo) ni 8091.
- Caso «campo propio con la misma etiqueta que apunta a otro destino» con referencia de Code solo como función pura: en datos reales `references` no produce aristas en este modelo (TaskDoc), así que no hubo arista real que lo ejerciera en navegador.
- Suite general (`pytest tests`) no corrida, por instrucción.
- Consumidores de `semantic_tags` fuera de `frontends/mindmap`.
- Rendimiento en catálogos mayores de ~300 documentos; no se midió con caché de git en frío.

RESULTADO: PASS
