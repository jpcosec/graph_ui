## REFORMULACION

**Objetivo:** corregir los cinco hallazgos del lector de `graph_ui` (WS13.1) con pruebas reales —incluidos casos negativos— sin implementar hojas siguientes: (1) GET sin mutación usando `load_edge_index` y rechazo `store_no_preparado` con `stale`; (2) guardias antes de leer, usando `indexed_documents` y lectura una a una de fuentes autorizadas; (3) foco con dueño por procedencia de arista; (4) sin mezcla de documentos mediante contador de generación por lector; (5) anclas validadas con `extract_section` antes de navegar.

**Alcance:** archivos cerrados: `frontends/mindmap/workspace_routes.py`, `views/workspace/node/`, `tests/test_mindmap_workspace.py`, `tests/test_mindmap_workspace_reader.py`, `tests/e2e_mindmap_workspace.py`, `tests/mindmap-workspace-reader.test.mjs` (nuevo). `sldb_adapter.py` solo funciones de lectura, declaradas previamente en `declaracion-archivos.md`. Contrato `navegacion.md` sha256 6a4f8518… y `review-source.md` como autoridad.

**Repo:** `/home/jp/proyectos/SLDB_1/UIs/graph_ui`; base HEAD de `main` con `bf55151`; closeout `ca06f1b` como historia.

**Límites:** fuera de alcance `shell/api.js`, `frontends/workspace/`, mutaciones, render Markdown, WS13.2, WS13.3, multidesk, API nueva de sldb, aceptación de WS13.1, Scion, push, puertos 8090-8092. Sin mocks/stubs: stores temporales reales. Executor sin commits ni Board.

## AMBIGUEDADES

1. *"Forma JSON de ok false, stale, avisos y correspondencias: implementación, se documenta en result-summary.md"* — obliga a inventar el esquema exacto de esos campos; consumidores posteriores dependen de él.
2. *"los mismos nombres de §3.3 y _inspect_file_reference"* — los nombres concretos de estados no están en el texto; sin leer `review-source.md` habría que inventarlos.
3. *"con el nombre de su estado de guardia en un campo estado"* — no fija nombre de campo ni cardinalidad si un documento acumula varios estados.
4. *"un único contador local del lector que se incrementa en cada navegación a otro documento"* — no define si recargar el mismo documento incrementa generación ni si cambiar de panel cuenta como navegación.
5. *"Layout no canónico… se comportan igual… riesgo declarado"* — conducta esperada ambigua; queda sin prueba y obligaría a decidir si es bloqueo o aceptación silenciosa.
6. *"getattr(model_type, '__template__', None)"* — atributo interno, en tensión con el criterio de "solo API pública"; habría que decidir excepción.

## DRY-RUN

Ejecutor futuro: (1) lee bundle y `review-source.md`; (2) corrige rutas GET para usar `load_edge_index` y emitir `store_no_preparado`; (3) sustituye `editor_store.documents`/`document_ir` por `indexed_documents` + lectura autorizada una a una y `build_document_ir_json`; (4) implementa dueño de procedencia y `correspondences` filtradas; (5) añade contador de generación y estados "cargando"; (6) valida anclas con `extract_section`; (7) escribe las cinco pruebas negativas, incluida I/O con `sys.addaudithook` y respuesta atrasada con `page.route`. Errores esperados: `test_workspace_cycle_and_2hops_real_edges` falla por conducta retirada (debe corregirse y declararse); posible bloqueo si no hay API pública para payload desde bytes; `__template__` y layout no canónico como riesgos. Resultado esperado: suite pertinente verde, 204 previas + nuevas (salvo retiradas), `result-summary.md` y handoff.

## FUTURO

Supervisor: commit y demo en 8092 sobre copia temporal; `declaracion-archivos.md` como evidencia. Tester independiente: ejecuta y produce `runs/subagents/20261102-ws13-1-correccion/tester-result-summary.md`. Root decide aceptación de WS13.1; WS13.2 y WS13.3 quedan desbloqueadas tras ella. Intake a sldb para lectura pública de store preparado sin `open_store` ni migración. Render Markdown sigue en tarea aparte.
