## REFORMULACION

Encargo: corregir los cinco hallazgos de la revisión root sobre WS13.1 en el lector de graph_ui —(1) lectura GET sin mutación (sin `document_edges`/`rebuild`, bloquear si `EdgeIndex.stale` no vacío, preparación externa vía `rebuild_edges` en fixture); (2) guardias §3.3 antes de leer, identidad desde `indexed_documents`, sin abrir fuentes ajenas; (3) foco de arista con documento propietario; (4) estado ligado a identidad/generación sin mezcla A→B; (5) ancla verificada con `extract_section` antes de navegar—. Alcance cerrado a `frontends/mindmap/workspace_routes.py`, `views/workspace/node/`, cuatro pruebas backend/e2e y `tests/mindmap-workspace-reader.test.mjs` nuevo; `sldb_adapter.py` solo con funciones de lectura previa declaración. Límites: nada de `shell/api.js`, `frontends/workspace/`, mutaciones, render Markdown (tarea aparte), WS13.2/13.3, multidesk, API nueva sldb, aceptación de WS13.1, Scion, push ni puertos 8090-8092. Executor no commitea; Supervisor sí, demo en 8092 sobre copia temporal; Tester independiente.

## AMBIGUIDADES

1. «Si `EdgeIndex.stale` no está vacío» — no se evidencia que `stale` sea atributo público de `load_edge_index`; si no lo es, obligaría a inventar el criterio de «store preparado».
2. «comprobar cuál existe en `sldb.api`» — deja al ejecutor descubrir la API de extracción desde bytes; no se fija qué cuenta como «existe» para bloquear frente a improvisar.
3. «`sldb_adapter.py` solo añadiendo funciones de lectura, declaradas antes… en `declaracion-archivos.md`» — ese archivo no está en la lista cerrada; no se dice si crearlo es parte del alcance.
4. «intake enviado a sldb» — afirma un intake ya cursado sin referencia verificable; el ejecutor no puede comprobarlo.
5. «`correspondences` no cuenta correspondencias falsas» — no define «falsa»; obligaría a inventar la regla de conteo.
6. «Suite general comparada con 204 passed» — no distingue si el total debe seguir en 204 o crecer por las pruebas nuevas.

## DRY-RUN

- `workspace_routes.py`: sustituir `document_edges` por `_document_edges`/`load_edge_index(include_linked=False)` en `_build_graph_neighborhood`; comprobar `idx.stale` y devolver `ok:false, estado:'store_no_preparado'` en graph, `_source_context` y procedencia; `workspace_nodes`/`workspace_source`/`_resolve_document` leen identidad vía `indexed_documents`, aplican `_guard_markdown_file` antes de abrir y eliminan `editor_store.documents`/`resolve_runtime_doc` de GET; `_classify_link` clasifica ancla con `extract_section` sobre bytes ya leídos o lectura protegida, devolviendo `ancla_inexistente` con origen/causa.
- `reader.mjs`/`workspace-view.js`: añadir documento propietario a la procedencia de arista y filtrar `fieldHighlighted` por dueño; generación por identidad en cada panel y placeholders de carga; descartar respuestas tardías.
- Pruebas: corregir `test_workspace_cycle_and_2hops_real_edges` para preparar store con `rebuild_edges` y añadir rechazo `store_no_preparado`; casos negativos de (2)-(5); nuevo `tests/mindmap-workspace-reader.test.mjs`.
- Errores previsibles: `stale` inexistente, API de extracción ausente o `_already_canonical` insuficiente → bloqueo concreto en `result-summary.md`, sin workaround. Éxito: suites pertinentes verdes y general coherente con 204+N.

## FUTURO

Tester independiente produce `tester-result-summary.md`; Supervisor commitea y monta demo 8092 sobre copia temporal; root decide aceptación de WS13.1 y habilita WS13.2/13.3.
