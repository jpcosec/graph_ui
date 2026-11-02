REFORMULACION

Objetivo: corregir los cinco hallazgos de la revisión root sobre WS13.1 en el lector de graph_ui, con pruebas reales y casos negativos, sin implementar hojas siguientes. Alcance: lista cerrada de archivos de producto (`workspace_routes.py`, `views/workspace/node/`, cuatro pruebas) más `sldb_adapter.py` condicionado a declaración previa; autoridad `review-source.md`; contrato `navegacion.md` sha256 `6a4f85…361e`, §3.3/§5.2/§5.4/§6/§6.1/H-14. Repo: graph_ui (CWD `UIs/graph_ui`), base HEAD main con `bf55151`. Límites: sin mutaciones por GET, sin API nueva de sldb (intake si falta), sin `shell/api.js` ni `frontends/workspace/`, sin WS13.2/13.3, sin commits del Executor, sin mocks, sin push, 8090/8091 ajenos, demo solo copia temporal en 8092.

AMBIGUEDADES

1. «Archivos, lista cerrada: …» frente a «`frontends/mindmap/sldb_adapter.py` solo añadiendo funciones de lectura». `sldb_adapter.py` no figura en `files:` ni en la lista cerrada; obliga a inventar si se amplía el cierre o se bloquea el caso.
2. «Cuenta como pública una función importable sin guion bajo» frente a «`extract_document_payload` no sirve: carga todos los documentos». El criterio es necesario pero no suficiente; obliga a inventar el test de admisibilidad real.
3. «No se llama `editor_store.documents`, `resolve_runtime_doc` ni `load_runtime_documents` desde las rutas del lector» omite `editor_store.document_ir(...)`, que `/node` usa hoy. Obliga a inventar si se sustituye por `build_document_ir_json` sobre la lectura única.
4. «cada estado cargado … a un contador local que se incrementa en cada navegación». No fija si el contador es global al lector o por panel; obliga a inventar la granularidad y qué respuestas se descartan.
5. «si la revisión de /node difiere de la de /source para el mismo documento, se muestra el aviso» no distingue edición concurrente legítima de inconsistencia real; obliga a inventar la política de comparación (instante, generación).
6. «El fallback `_resolve_document` no lee sin guardia» no dice si la lista de candidatos fijos (`desk/tasks`, `contexts`…) permanece; obliga a inventar el conjunto y sus guardias.
7. «graph, relaciones y procedencia responden ok false … `store_no_preparado`» no dice qué hace `/api/workspace/nodes` bajo `stale` no vacío; obliga a inventar el comportamiento del catálogo.

DRY-RUN

Un ejecutor futuro leería `review-source.md`, el contrato y `reader.mjs`; si toca `sldb_adapter.py`, escribiría antes `declaracion-archivos.md`. En `workspace_routes.py`: sustituir `document_edges` por `load_edge_index(include_linked=False)` leyendo `EdgeIndex.stale`; resolver identidad con `indexed_documents` y aplicar contención/`.git`/ignorado antes de leer; leer bytes una vez y derivar payload con `load_registered_model` + `extract_model_data`, plantilla vía `__template__`; catálogo con campo `estado`; error `store_no_preparado`; anclas con `extract_section` sobre lectura protegida. En `node/`: `reader.mjs` con dueño de procedencia y `correspondence` filtrado; `workspace-view.js` con generación/identidad por panel, estado «carga» y aviso de revisión. En pruebas: casos negativos (hashes antes/después, `addaudithook`, retraso con `page.route`, anclas propia/modelada/no modelada); corregir `test_workspace_cycle_and_2hops_real_edges` preparando con `rebuild_edges` en fixture. Errores esperables: falta de API pública → bloqueo en `result-summary.md` sin workaround; layout no canónico → intake ya enviado; tests retirados → declarar uno a uno. Resultado: suite pertinente y general verdes, `result-summary.md` y handoff, sin commit.

FUTURO

Supervisor commitea y monta demo 8092 en copia temporal; Tester independiente produce `tester-result-summary.md`; root decide aceptación de WS13.1 y desbloquea WS13.2/13.3; P01/root atienden `G_HUMAN_READ`, WS16 y el intake de sldb; otra tarea cubre el render Markdown.
