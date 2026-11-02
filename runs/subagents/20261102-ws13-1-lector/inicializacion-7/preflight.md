## REFORMULACION

**Objetivo:** entregar en el host Mindmap (graph_ui) un lector de solo lectura que, desde una única lectura de bytes, sirva render y fuente cruda del mismo origen para Markdown modelado (`Model:name`) y no modelado (`path`), con contexto real, seguimiento de enlaces y foco interno compartido donde WS11 defina correspondencia.

**Alcance:** nodo WS13.1 del DAG (rev. 10). Lista cerrada de archivos: `frontends/mindmap/workspace_routes.py`, `frontends/mindmap/views/workspace/node/*`, `tests/test_mindmap_workspace_reader.py`, `tests/e2e_mindmap_workspace.py`; opcionales `sldb_adapter.py` (solo función nueva, sin alterar `document_ir`) y `serve.py` (solo despacho), con declaración previa en `declaracion-archivos.md`.

**Límites:** sin escritura ni mutación en lectura (`load_edge_index(..., include_linked=False)`), sin mocks/stubs, sin alias/multidesk, sin `recover_links`/`audit_links`/`resolve_link_target`, sin tocar 8090/8091/8092. Executor no commitea, no cierra Board; Supervisor commitea y levanta demo en 8092.

## AMBIGUEDADES

1. *"Forma de la respuesta: la decide el Executor con estos campos mínimos: identidad, ruta, revisión, texto, secciones con span"*. No fija nombres de claves ni anidamiento JSON → obliga a inventar el esquema, que luego consumen WS13.2/WS13.3.
2. *"Opcionales: … solo añadiendo una función, si render y fuente no pueden salir de una lectura sin ella"*. Condición subjetiva sin criterio verificable → obliga a decidir cuándo es inevitable.
3. *"UTF-8 con reemplazo marcado utf-8-replaced"* frente a *"fuente íntegra byte a byte"*. Si hay reemplazo, los bytes no se reproducen → no se define si se devuelve texto decodificado o base64; habría que inventarlo.
4. *"los mismos nombres de estado que `_inspect_file_reference`"*. No se indica módulo/ruta de esa función → obliga a buscarla y a fijar su contrato por inspección.
5. *"Si no coincide, render propio sobre la misma lectura, declarado en result-summary.md"*. No se especifica tolerancia ni condición de bloqueo → decisión inventada.

## DRY-RUN

1. Leer bundle de referencias y `suplemento-8090.md`; línea base `pytest` (tasks, `test_mindmap_workspace.py`, `test_parallel_workspace_serve.py`, e2e).
2. En `workspace_routes.py`: añadir `GET /api/workspace/source` con `id` XOR `path` (400 si ambos/ninguno), guardias con `resolve`, `.git`/gitignored, tope, nulo, sufijo `.md`, y mapa de errores 404/403/415/413.
3. Lectura única → `sha256` de bytes → `build_document_ir_json(runtime_doc, markdown, template)` solo si modelado; `extract_sections` para no modelado.
4. En `views/workspace/node/`: render + fuente, enlaces (`parse_links`→`split_anchor`→prefijo), foco por procedencia (span, `field_path`, objeto `{doc,field,position,value}`, aristas), rango local de Code, estado explícito sin grafo para no modelado, instancia única.
5. Pruebas con stores/desks temporales reales; `result-summary.md` + `validation.log`.

**Errores esperados:** 400 selección inválida; 403/404/413/415 según guardia; `ambiguous` visible y no abierto; fallo de CDN diagnosticado, no falseado.
**Resultado esperado:** todos los pytest y el e2e en verde, `.sldb` y archivo leído con sha256 idéntico antes/después de cada GET.

## FUTURO

- **Tester** (agente distinto): ejecuta y escribe `tester-result-summary.md` con verificación de DOM/píxeles.
- **Supervisor:** commit tras el Tester y demo en 127.0.0.1:8092 sobre copia temporal.
- **WS13.2:** explorador completo; hereda la forma de respuesta documentada (lista de permitidos).
- **WS13.3:** pestañas y split.
- **WS16 / G_HUMAN_READ:** siguen pendientes; WS15.1 (`shell/api.js`), WS19, WS41, WS45-48 fuera.
