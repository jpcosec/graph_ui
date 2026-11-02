REFORMULACION

Objetivo: corregir los cinco hallazgos del lector WS13.1 (lectura GET sin mutación, guardias previas, foco con dueño, sin mezcla de documentos, anclas) con pruebas reales y casos negativos, sin implementar hojas siguientes.

Alcance: repo /home/jp/proyectos/SLDB_1/UIs/graph_ui. Lista cerrada: frontends/mindmap/workspace_routes.py, views/workspace/node/, tests/test_mindmap_workspace.py, tests/test_mindmap_workspace_reader.py, tests/e2e_mindmap_workspace.py y tests/mindmap-workspace-reader.test.mjs nuevo; sldb_adapter.py solo funciones de lectura declaradas antes.

Límites: autoridad runs/subagents/20261102-ws13-1-correccion/review-source.md; contrato navegacion.md sha256 6a4f...; base HEAD con bf55151; sin commits ni Board (Executor); sin mocks/stubs; sin API nueva de sldb; fuera shell/api.js, frontends/workspace/, render Markdown, WS13.2/13.3, multidesk, Scion, push y puertos; bloqueos concretos en result-summary.md.

AMBIGUEDADES

1. "se documenta el caso como bloqueo concreto" (layout no canónico): no se define qué hacen /nodes, /node y /source en runtime ante layout no canónico; solo se pide documentar. Obligaría a inventar conducta observable.
2. "las demás rutas no lo leen" y "un 403 solo no basta": no se fija código, cuerpo ni campo estado de /node y /source para documento indexado no autorizado. Obligaría a inventar contrato.
3. "en el contexto de /source": no se aclara si ok false abarca toda la respuesta o solo el contexto, ni su convivencia con "la fuente ... sigue legible". Obligaría a inventar forma JSON.
4. "en un serve.py real es admisible", pero serve.py no está en la lista cerrada. Obligaría a inventar su ubicación o qué fixture reutilizar.
5. "con su name como título": no se definen status ni demás campos de /nodes para el documento no autorizado. Obligaría a inventar valores.
6. "Forma JSON de ok false, stale, avisos y correspondencias: implementación": sin claves pactadas, el tester aceptaría lo inventado por el Executor.

DRY-RUN

1. Leer review-source.md, checkpoint/result-summary del lector, contrato §3.3/§5.2/§5.4/§6/§6.1/H-14 y el código actual.
2. Antes de tocar sldb_adapter.py, escribir declaracion-archivos.md con funciones y motivo.
3. Implementar en workspace_routes.py y views/workspace/node/: quitar document_edges/rebuild de GET; usar load_edge_index(include_linked=False) y stale; guardias §3.3 antes de leer; indexed_documents para metadata; load_registered_model+extract_model_data; build_document_ir_json; foco con el source del registro de arista; contador de generación; extract_section para anclas; estados y avisos.
4. Corregir test_workspace_cycle_and_2hops_real_edges y añadir negativos; crear el .mjs; stores temporales reales, sys.addaudithook y page.route.
5. Ejecutar los comandos de Validation; si falta API pública, parar y documentar bloqueo.
6. Escribir result-summary.md y handoff.

Errores: mutación por rebuild, apertura de no autorizados, stale ignorado, resaltado ajeno, respuesta atrasada aplicada, ancla sin validar. Resultado: 204 previas (menos retiradas declaradas) más nuevas en verde.

FUTURO

Supervisor: commit y demo en 8092 sobre copia temporal (8092 fuera de alcance del Executor). Tester independiente: ejecuta y escribe tester-result-summary.md. Root: decide aceptación de WS13.1; WS13.2/13.3 y render Markdown esperan. sldb: resolver el intake de consulta pública de store preparado sin open_store; si no, bloqueo. Board: no lo toca el Executor.
