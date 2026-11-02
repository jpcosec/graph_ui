## REFORMULACION

Encargo: corregir cinco hallazgos de WS13.1 en graph_ui —lectura sin mutación (H-14), guardias antes de leer, foco con dueño, sin mezcla de documentos y anclas— con pruebas reales y casos negativos. Repo: graph_ui. Alcance cerrado: `workspace_routes.py`, `views/workspace/node/`, seis archivos de test (uno nuevo) y `sldb_adapter.py` solo con funciones de lectura declaradas antes. Autoridad: `review-source.md`; contrato `navegacion.md` (sha indicado) §3.3, §5.2, §5.4, §6, §6.1, H-14. Fuera: shell/api.js, mutaciones, render Markdown, WS13.2/13.3, sldb nuevo, commits, Board, push, 8090-8092.

## AMBIGUEDADES

1. «editor_store.documents… porque abren todos los documentos indexados» y «No se llama editor_store.document_ir». El bundle solo evidencia la cadena de `documents()`/`resolve_runtime_doc` (`query.py:26`); `document_ir` lee un archivo (`sldb_adapter.py:202`). Obliga a inventar si `document_ir` es de un solo documento y, por tanto, a reescribir /node sin necesidad.
2. «Identidad y metadata salen de indexed_documents (… solo índices: name, model, path)». /nodes expone hoy `title` y `status` desde payload. No se dice si se pierden o de dónde salen: obliga a inventar el contrato del catálogo, en tensión con «el catálogo /nodes no cambia».
3. «Payload… con load_registered_model(store, modelo, pythonpath)… y extract_model_data(modelo, texto)». Ninguna de las dos aparece citada por línea en el bundle; tampoco la forma de obtener `model_type` para `__template__`. Si no existen con esa firma, el Executor debe descubrirlas o declarar bloqueo.
4. Punto 5 exige comprobar el ancla «sobre el texto… obtenido por lectura protegida» del destino modelado/no modelado. Eso lee otro documento durante `/source`, mientras el punto 2 limita la lectura a «solo fuentes autorizadas, una a una». No se fija el orden ni si esa lectura cuenta para las guardias previas: inventable.
5. «Un documento indexado no autorizado aparece en el catálogo con… un campo estado». No se distingue si es `/nodes`, la proyección graph de `/node` o ambas.
6. «Suite general: las 204 pruebas previas siguen pasando, salvo las que se corrigen por conducta retirada, declaradas una a una». No hay lista: obliga a inventar qué tests son legacy.
7. TaskDoc `status: draft`, `history: []`, y el ritual exige «active item on Board»; el encargo habla de drawer→promoción→preflight. No se dice si el Executor puede arrancar sin promoción.
8. `references` cita `navegacion-aprobacion.md`, ausente del bundle, mientras el contrato adjunto se declara «borrador… no autoriza implementación».

## DRY-RUN

Ejecutor futuro: (a) `workspace_routes.py`: sustituir `document_edges` por `load_edge_index(..., include_linked=False)`; si `EdgeIndex.stale`, responder `ok:false, estado:'store_no_preparado', stale` en graph, relaciones y procedencia; `/nodes` desde `indexed_documents` con guardias y `estado`; `/node` y `_resolve_document` con guardias antes de cada lectura y payload/IR desde bytes; `_classify_link` con `extract_section` → `ancla_inexistente`. (b) `reader.mjs`: dueño de procedencia por `source` del registro, `correspondence` filtrada por documento abierto. (c) `workspace-view.js`: contador de generación por panel, estado «carga», aviso de revisiones divergentes. (d) tests con stores temporales, `sys.addaudithook`, `page.route`. Errores esperados: `store_no_preparado`, `ancla_inexistente`, estados de guardia, respuestas atrasadas descartadas. Resultado: cinco puntos con prueba que falla sin corrección; suite pertinente y general verdes.

## FUTURO

Tester independiente con ejecución produce `tester-result-summary.md`; Supervisor commitea y monta demo en 8092 sobre copia; root acepta o rechaza. Posible intake en sldb (layout no canónico, API desde bytes). La tarea de render Markdown queda aparte. WS13.2/13.3 siguen bloqueadas hasta aceptación root.
