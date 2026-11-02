## REFORMULACION
**Objetivo:** entregar en el host Mindmap (`graph_ui`) un lector de solo lectura con render y fuente cruda del mismo origen, contexto real, seguimiento de enlaces y foco compartido según WS13.1.
**Alcance:** `frontends/mindmap/workspace_routes.py`; `frontends/mindmap/views/workspace/node/` (`workspace-view.js`, `workspace.mjs`, `workspace.css` y módulos nuevos); `tests/test_mindmap_workspace_reader.py`; `tests/e2e_mindmap_workspace.py`. Opcionales con declaración previa: `sldb_adapter.py` (solo añadir función) y `serve.py` (solo despacho).
**Repo:** `graph_ui`, base integrada `a1b2b22`, trabajando sobre HEAD de `main` al despacho.
**Límites:** sin edición, commit, mutación, Board, `shell/api.js` ni `frontends/workspace/`; sin mocks/stubs; servidores temporales en puertos libres distintos de 8090-8092; contratos `navegacion.md` y `operaciones.md` como autoridad; `load_edge_index(include_linked=False)`; store sin cambios verificable por sha256.

## AMBIGUEDADES
1. «La forma de la respuesta: la decide el Executor con estos campos mínimos»: obliga a inventar nombres, anidamiento y tipos JSON; solo quedan fijados identidad, ruta, revisión, texto y secciones con span.
2. «se usa extract_sections si la prueba comprueba que títulos, niveles y spans coinciden con lo escrito»: criterio circular; obligaría a inventar tolerancia y formato exacto de comparación de spans.
3. «se trabaja sobre el HEAD de main en el momento del despacho»: no fija SHA; obliga a resolverlo y puede diferir de `a1b2b22`.
4. «doc_status(<directorio .sldb del store>, "local:" + ruta)»: no aclara si el argumento es el directorio padre o `.sldb`; obligaría a inspeccionar la API y elegir.
5. «sobre el contenido completo de la tarjeta» (rango de Code): no define si incluye número de línea, encabezado o decoración; obliga a inventar el modelo de texto.
6. «si render y fuente no pueden salir de una lectura sin ella» (adapter opcional): juicio no observable; obliga a decidir y justificar.

## DRY-RUN
1. Leer bundle (`review-source*.md`, `suplemento-8090.md`, contratos, `dag.yaml`), estado git/HEAD y rutas actuales; ejecutar línea base pytest.
2. En `workspace_routes.py`, añadir `GET /api/workspace/source`: `id`/`path` excluyentes (400), lectura única de bytes, guardias con estados 403/404/413/415, `build_document_ir_json` sobre el texto leído, sha256 y forma de respuesta.
3. Implementar clasificación de enlaces (`parse_links`, `split_anchor`), contexto con `load_edge_index` y datos de foco/procedencia; sin escrituras.
4. En `views/workspace/node/`, un único lector, alternancia Document/Graph/Code conservando URL, revisión y foco; rango local de Code.
5. Pruebas con stores/desks temporales reales; e2e con DOM, identidad URL, revisión, un solo lector y sha256 del store antes/después.
**Errores esperados:** 400 por doble selector; 403/404/413/415 de guardias; `utf-8-replaced`; enlaces rotos/externos no abiertos.
**Resultado esperado:** pruebas indicadas en verde, sin commit, `result-summary.md` y `validation.log`.

## FUTURO
El Tester independiente ejecuta y deja `tester-result-summary.md`; el Supervisor levanta la demo en `127.0.0.1:8092` sobre copia temporal. WS13.2 usará la forma de respuesta para lista permitida/explorador, y WS13.3 para pestañas/split. El Board y `G_HUMAN_READ`/WS16 quedan fuera.
