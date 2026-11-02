## REFORMULACION

**Objetivo:** corregir en el lector de `graph_ui` los cinco hallazgos de WS13.1 —lectura GET sin mutación, guardias antes de abrir fuentes, foco con documento propietario, aislamiento de respuestas por generación y validación de anclas— con pruebas reales, incluidos casos negativos, sin implementar hojas posteriores.

**Alcance:** repo `graph_ui`. Lista cerrada: `frontends/mindmap/workspace_routes.py`; `frontends/mindmap/views/workspace/node/`; los cuatro tests citados; nuevo `tests/mindmap-workspace-reader.test.mjs`. `sldb_adapter.py` solo admite funciones de lectura, declaradas previamente en `declaracion-archivos.md`.

**Límites:** nada de `shell/api.js`, `frontends/workspace/`, mutaciones, render Markdown, WS13.2/WS13.3, multidesk, API nueva de sldb, Scion, push ni puertos 8090/8091/8092. Executor implementa y prueba; no commitea ni toca Board. Sin mocks ni stubs. Autoridad: `review-source.md` y contrato `navegacion.md` sha256 6a4f…361e.

## AMBIGUEDADES

1. **“Leer el bundle”** (Implementation Path): no define qué archivos lo componen. Obliga a inferir el conjunto desde `references/`; si falta alguno, se inventaría el alcance documental.
2. **“La plantilla para build_document_ir_json sale del modelo, getattr(model_type, '__template__', None)”**: no dice qué hacer si devuelve `None`. Obliga a inventar conducta de error o fallback.
3. **“o el ya leído si es el propio documento”** (punto 5): no aclara si “ya leído” es la caché del panel o los bytes de la petición. Obliga a inventar la fuente de verdad y su vigencia.
4. **“un contador local que se incrementa en cada navegación”** (punto 4): no define si es uno global por instancia documental o uno por panel, ni si cuenta cambios de documento. Obliga a inventar el mecanismo de descarte.
5. **“Base: HEAD de main al despacho”**: no fija sha de HEAD. Resoluble por git, pero no verificable retroactivamente sin inventar el instante.
6. **“El fallback _resolve_document no lee sin guardia”**: alude a código existente no descrito; obliga a inferir qué es el fallback y qué guardia le aplica.
7. **“se informa con su estado de guardia”** (punto 5): no enumera los nombres de estado. El contrato §3.3 probablemente los fija, pero la TaskDoc no; obliga a consultarlos o inventarlos.
8. **“las 204 pruebas previas”**: cifra cerrada sin listado; si la base difiere, obligaría a decidir qué es regresión aceptable.

## DRY-RUN

Un ejecutor futuro: (1) lee contrato, `review-source.md`, checkpoint y summaries; registra sha de HEAD y de store temporal. (2) En `workspace_routes.py`, sustituye consultas de aristas por `load_edge_index(store, include_linked=False)` y rechaza con `ok:false`, `estado:store_no_preparado` y `stale` cuando proceda, sin escritura. (3) Reordena identidad/metadata sobre `indexed_documents` y aplica guardias de §3.3 antes de abrir fuentes; usa `load_registered_model` + `extract_model_data` para autorizados. (4) Añade propietario a cada procedencia y filtra `correspondences`. (5) Introduce identidad+contador por panel y estados de carga. (6) Valida anclas con `extract_section`. (7) Añade pruebas negativas reales: hashes antes/después, auditoría de I/O, aristas entrantes/salientes/2 saltos, respuesta atrasada con `page.route`, anclas válidas/inexistentes. Errores esperables: ausencia de API pública para payload desde bytes → bloqueo documentado, sin workaround; layout no canónico → bloqueo con observación. Resultado esperado: suite focal y general en verde salvo pruebas retiradas declaradas, y `result-summary.md` con handoff.

## FUTURO

El Tester independiente ejecuta y produce `tester-result-summary.md`. El Supervisor commitea y demuestra en 8092 sobre copia temporal. Root decide aceptación de WS13.1; después se desbloquean WS13.2/WS13.3. Sldb responde al intake de lectura pública de store preparado. La tarea de render Markdown queda separada.
