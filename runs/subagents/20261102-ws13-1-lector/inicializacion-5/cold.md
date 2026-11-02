## REFORMULACION

- **Objetivo:** implementar en el host Mindmap (`graph_ui`) el delta WS13.1: lector de solo lectura con render y fuente cruda íntegra del mismo origen (modelado y no modelado), contexto real, seguimiento de enlaces y foco interno compartido donde exista procedencia real.
- **Alcance:** ruta `GET /api/workspace/source`, selección por `id=`/`path=` excluyentes, guardias de lectura, enlaces vía `parse_links`/`split_anchor`/`doc_status`, foco por sección/span, `field_path`, referencia `{doc,field,position,value}` y arista `schema` con multiplicidad, rango local de Code, instancia única Document/Graph/Code.
- **Repo:** `graph_ui`, base `a1b2b22`, HEAD `20e5797`; archivos cerrados: `workspace_routes.py`, `views/workspace/node/`, `tests/test_mindmap_workspace_reader.py`, `tests/e2e_mindmap_workspace.py`; opcionales declarados antes de editar.
- **Límites:** solo lectura sin mutación de store; sin alias/multidesk (WS41), sin edición, sin commit del Executor, sin tocar 8090/8091 ni tareas hermanas; sin mocks.

## AMBIGUEDADES

1. «Ruta: GET /api/workspace/source en WorkspaceRoutes» + «No modelado: path=<ruta relativa>, excluyente con id». No dice si `/api/workspace/node` acepta `path`. Obligaría a inventar si el no modelado tiene contexto/grafo o solo fuente; la «instancia única» con pestañas queda indefinida para ese caso.
2. «llamando al builder público build_document_ir_json(runtime_doc, markdown, template) con el texto ya leído como markdown». No define `runtime_doc` ni `template` para no modelado, y el párrafo siguiente admite `extract_sections` o render propio. Obligaría a inventar descriptor o plantilla.
3. «Rango local de Code: clic en una línea y mayúsculas más clic… sobre el contenido completo de la tarjeta» + «El contexto :N±5 se conserva». No aclara si el rango abarca el archivo completo o solo el fragmento visible. Obligaría a inventar el alcance de líneas.
4. «La prueba e2e lo aserta» y «Tester … navegador real»: no define el arnés (CDN, Playwright, servidor). `review-source.md` exige diagnosticar CDN; la TaskDoc no lo recoge. Obligaría a inventar el mecanismo.
5. «Forma de la respuesta: la decide el Executor con estos campos mínimos». Aceptado como decisión, pero fija nombres inexistentes que WS13.2/13.3 consumirán; no es invención de contrato si se documenta, sí lo sería si el Tester asume claves.
6. «Identidad… (repo, ruta relativa…)» no fija el valor de `repo`; se deduce `local` de navegación §3.2.1, no citado. Menor.

## DRY-RUN

Ejecutor futuro: lee bundle y contratos, mide línea base (17 passed), declara archivos. Edita `workspace_routes.py`: añade `/api/workspace/source`, `path`/`id` excluyentes, guardias con estados existentes, lectura única de bytes, `sha256`, `parse_links`+`split_anchor`+`doc_status`, preserva `files`/`references` con `position`, sustituye `document_edges` por `load_edge_index(include_linked=False)`. Edita `workspace-view.js`/`workspace.mjs`/`workspace.css` y módulos: vista fuente, secciones con span, enlaces, foco, rango Code. Añade los dos tests. Errores esperados: 400/403/404/413/415; bloqueo si `open_store` muta el store pese al fixture canónico, o si `extract_sections` no coincide con el fixture. Resultado: pytest del archivo nuevo y e2e verdes, store sin cambios por GET, un solo lector en DOM; `result-summary.md` y handoff al Tester.

## FUTURO

- **WS13.2** consume la forma de respuesta y la lista de permitidos; **WS13.3** consume foco y clave de sesión; **WS15.1** tipifica `api.js`; **WS41** multidesk.
- **Tester independiente** produce `tester-result-summary.md` con navegador real.
- **Supervisor** levanta demo en 8092 y hace commit atómico tras gate; **root** hace checkpoint y decide hojas siguientes.
- **P01/solicitante:** `G_HUMAN_READ` y WS16 siguen pendientes.
