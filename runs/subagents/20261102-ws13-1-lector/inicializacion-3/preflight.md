## REFORMULACION

**Objetivo:** entregar en el host Mindmap un lector de solo lectura que, desde una única lectura de bytes del mismo origen, produzca render y fuente cruda íntegra para Markdown modelado y no modelado, más contexto real, seguimiento de enlaces y foco interno.

**Alcance:** autoridad en `review-source.md`, `review-source-2.md`, nodo WS13.1 del `dag.yaml` revisión 10 y contratos `navegacion.md` y `operaciones.md` (este solo como límite de no escritura). Lista cerrada de archivos: `workspace_routes.py`, `views/workspace/node/`, `tests/test_mindmap_workspace_reader.py`, `tests/e2e_mindmap_workspace.py`. Opcionales `sldb_adapter.py` y `serve.py` solo con declaración previa en `declaracion-archivos.md`. Define identidad modelado/no modelado, selección por URL, guardias de lectura, mismo origen, enlaces, foco por procedencia real, rango local de Code, contexto, instancia única y ausencia de mutación.

**Repo:** `graph_ui` en `a1b2b22`.

**Límites:** sin edición, commit, transición de workflow, rutas de mutación, `shell/api.js`, `frontends/workspace/`, Changes, Integrity, Agents, multidesk, WS19/WS45-48, Scion, Kimun, push, puertos 8090/8091/8092 ni stores ajenos. Sin mocks ni stubs. Sin preguntar al solicitante.

## AMBIGUEDADES

1. «preservando field y posición antes de concatenar»: no dice qué se concatena ni con qué formato. Obligaría a inventar la regla de representación de la referencia de archivo.
2. «Un prefijo que no sea local: es nombre local literal»: no define sintaxis de prefijo. Un `http://` o `mailto:` quedaría como nombre local y referencia rota; obligaría a inventar el clasificador.
3. «La forma de la respuesta: la decide el Executor con estos campos mínimos»: no fija tipos ni estructura de identidad, ruta, revisión y secciones. Obligaría a inventar el esquema, aunque deba documentarse.
4. «catálogo actual para modelados»: no identifica endpoint, ruta ni fuente de datos del catálogo. Obligaría a inventar cuál es «el actual».
5. «arista schema con todas sus procedencias»: «arista schema» no está definida en el texto. Obligaría a inventar su forma de datos y el criterio de multiplicidad.

## DRY-RUN

Un ejecutor futuro: (1) leería el bundle y verificaría los sha256 citados; (2) correría la línea base; (3) en `workspace_routes.py` añadiría la ruta de lectura con una sola lectura de bytes, guardias (`resolve`, `.git`, gitignorado con fallo cerrado, directorio, 256 KB, binario, codificación), identidad `Model:name` o `path`, `load_edge_index(..., include_linked=False)`, `build_document_ir_json` sobre el texto ya leído y respuesta con identidad, ruta, revisión, texto y secciones con `line_start`/`line_end`; (4) implementaría enlaces con `parse_links`, `split_anchor`, `doc_status`, retirando un `local:` y marcando rotos con origen y causa; (5) en `views/workspace/node/` haría el lector único con Document/Graph/Code, conservando `id`/`path`, revisión y foco, y rango local de Code; (6) escribiría pruebas con stores y desks temporales reales; (7) documentaría en `result-summary.md` y `validation.log`.

Errores esperados: 400 por `id` y `path` juntos o ausentes; bloqueo si falta builder público o la no mutación no se sostiene con API pública; fallo cerrado en guardias. Resultado esperado: pruebas citadas en verde, sha256 de `.sldb` y archivo leído sin cambios, un solo lector en DOM.

## FUTURO

El Tester independiente ejecutará y dejará `tester-result-summary.md`. El Supervisor levantará la demo en `127.0.0.1:8092` sobre copia temporal. La forma de respuesta documentada alimentará WS13.2 y WS13.3. `G_HUMAN_READ` y WS16 siguen pendientes.
