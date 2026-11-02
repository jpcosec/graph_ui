## REFORMULACION

Objetivo: implementar en el host Mindmap un lector de solo lectura con render y fuente cruda del mismo origen para Markdown modelado y no modelado, contexto real, seguimiento de enlaces y foco compartido. Alcance: ruta `GET /api/workspace/source`, guardias de lectura, UI en `frontends/mindmap/views/workspace/node/`, pruebas pytest y e2e. Repo: `graph_ui`, base `a1b2b22` y HEAD de `main` al despacho. Límites: lista cerrada de archivos; opcionales solo con declaración motivada; sin escritura, commit, transición de Board, mocks ni stubs; puertos 8090/8091 excluidos; cambios de respuesta se documentan para WS13.2/13.3.

## AMBIGUEDADES

1. “Base: el workspace integrado de graph_ui a1b2b22; se trabaja sobre el HEAD de main en el momento del despacho”. No queda fijado si el commit es `a1b2b22` o el HEAD móvil; obligaría a inventar la política ante divergencia.
2. “más de 256 KB”. Sin unidad explícita: 256000 o 262144 bytes; obligaría a elegir un umbral.
3. “closeout_evidence: tests, commit” frente a “El Executor implementa y prueba, no hace commits”. No se asigna quién commitea; obligaría a inventar el rol.
4. “doc_status(<directorio .sldb del store>…”, “field_path” y “procedencia de la arista”. Dependen de contratos/API externos no incluidos; si faltan, obligan a inventar cómo obtener el directorio y la estructura exacta.
5. “Se usa extract_sections si la prueba comprueba…”. Condición circular: no define quién ni con qué criterio previo se decide; obligaría a inventar el orden de implementación.

## DRY-RUN

1. Leer TaskDoc, contratos citados, `review-source*.md`, `suplemento-8090.md` y estado del repo; fijar línea base pytest.
2. Crear pruebas con store/desk temporales reales y fixture Markdown con encabezados y enlace.
3. Implementar en `workspace_routes.py` la ruta `GET /api/workspace/source`: selección `id`/`path` con 400 si ambos o ninguno; guardias con estados y códigos 404/403/415/413; lectura única de bytes; sha256; builder solo para modelados; render propio para no modelados; respuesta con identidad, ruta, revisión, texto, secciones y span.
4. Implementar enlaces con `parse_links`, `split_anchor` y `doc_status`; clasificar local/externo/roto; contener y leer con guardias. Añadir foco por span, `field_path`, referencia y arista, y UI de lector único, estados de Graph/Code no modelado y rango local de Code.
5. Ejecutar pruebas dirigidas, suite comparada con baseline y e2e Playwright con `serve.py` temporal; verificar no mutación por sha256 antes/después de cada GET. Errores esperados: 400, 404, 403, 415, 413; si falla el CDN, diagnosticar y usar dependencia local. Resultado: pruebas verdes, `result-summary.md` y `validation.log`, sin commit.

## FUTURO

El Tester independiente ejecuta y escribe `tester-result-summary.md`; el Supervisor levanta la demo en `127.0.0.1:8092` sobre copia temporal; otro rol commitea y cierra el Board. WS13.2/13.3 consumen la forma de respuesta documentada. WS16 y G_HUMAN_READ siguen pendientes.
