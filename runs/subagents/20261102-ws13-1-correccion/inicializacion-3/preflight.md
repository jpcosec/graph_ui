## REFORMULACION

**Objetivo:** corregir los cinco hallazgos de WS13.1 en el lector de graph_ui con pruebas reales y casos negativos, sin implementar hojas posteriores.

**Alcance:** (1) GET sin mutación ni `document_edges`/`rebuild`; aristas desde `load_edge_index(..., include_linked=False)` y rechazo `store_no_preparado` si `EdgeIndex.stale`; (2) guardias antes de leer, identidad desde `indexed_documents`, payload solo de fuentes autorizadas; (3) foco con dueño por procedencia; (4) estado atado a identidad y generación, sin mezcla entre documentos; (5) anclas verificadas con `extract_section`, rotura `ancla_inexistente`.

**Repo:** `/home/jp/proyectos/SLDB_1/UIs/graph_ui` (graph_ui).

**Límites:** lista cerrada de archivos (`workspace_routes.py`, `views/workspace/node/`, tres tests existentes y `tests/mindmap-workspace-reader.test.mjs` nuevo); `sldb_adapter.py` solo funciones de lectura declaradas. Fuera: `shell/api.js`, `frontends/workspace/`, mutaciones, render Markdown, WS13.2/13.3, API nueva de sldb, aceptación de WS13.1, Scion, push, puertos. Sin mocks ni stubs; sin commits del Executor.

## AMBIGUEDADES

1. «cada panel muestra carga» y «resalta» frente a «Fuera de alcance: … frontends/workspace/». Obliga a inventar si el “resaltado” y el estado de carga son datos del payload del lector o comportamiento de UI excluido.
2. «aparece en el catálogo con su estado y sin título leído». `indexed_documents` solo da `name, model, path`; obliga a inventar la taxonomía de estados del catálogo.
3. «las 204 pruebas previas siguen pasando». Si el conteo real difiere, obliga a decidir equivalencia no especificada.
4. «Base: HEAD de main al despacho, que contiene bf55151». No fija sha exacto; obliga a adivinar la base ante avance de main.

## DRY-RUN

1. Leer bundle, `review-source.md`, checkpoint y contrato (hash indicado).
2. En `workspace_routes.py`: sustituir lecturas mutantes por `load_edge_index`; comprobar `stale` tras guardias; devolver `ok:false`/`store_no_preparado` con lista.
3. En `views/workspace/node/`: separar identidad (`indexed_documents`) de payload; abrir solo autorizados; añadir propietario a cada procedencia; marcar generación por panel; clasificar anclas antes de navegar.
4. En `sldb_adapter.py`: añadir lectores públicos declarados en `declaracion-archivos.md`.
5. Corregir `test_workspace_cycle_and_2hops_real_edges` (preparar store antes del GET) y añadir negativos: hashes/git antes-después, auditoría de I/O, foco entrante/saliente/vecino, respuesta atrasada, anclas válida/inexistente.
6. Ejecutar los cuatro comandos de Validation y la suite general; declarar una a una las pruebas retiradas.
7. Escribir `result-summary.md` y handoff; sin commit.

**Errores esperables:** ausencia de API pública para payload desde bytes → bloqueo documentado; layout no canónico → bloqueo ya enviado a inbox sldb.

**Resultado esperado:** cinco pruebas que fallan sin corrección y pasan con ella; suite general verde salvo retiradas declaradas.

## FUTURO

El Tester independiente ejecuta y produce `tester-result-summary.md`. El Supervisor commitea y hace demo en 8092 sobre copia temporal. Root decide aceptación de WS13.1; WS13.2/WS13.3 y WS16 esperan.
