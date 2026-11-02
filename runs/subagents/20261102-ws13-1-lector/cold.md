## REFORMULACION

Objetivo: implementar WS13.1 en el host Mindmap (graph_ui) sobre HEAD de main heredando a1b2b22: lector de solo lectura que entregue render y fuente cruda íntegra del mismo origen (una sola lectura de bytes + revisión sha256) para Markdown modelado y no modelado, contexto real con identidad/ruta/relaciones, seguimiento de enlaces `[[…]]` en el desk propio y foco interno compartido entre Document/Graph/Code solo donde exista procedencia real (span de sección, field_path, objeto de referencia `{doc, field, position, value}`, arista `schema` con todas sus procedencias). Alcance cerrado: `workspace_routes.py`, `views/workspace/node/`, `test_mindmap_workspace_reader.py`, `e2e_mindmap_workspace.py`; opcionales `sldb_adapter.py` (solo función nueva) y `serve.py` (solo despacho), declarados antes de editar. Límites: sin escritura, sin mocks, sin tocar 8090/8091 ni tareas hermanas, sin WS13.2/13.3, sin span por campo ni mapeo texto→código, sin `recover_links`/`audit_links`/`resolve_link_target`, sin `document_edges`/`rebuild`.

## AMBIGUEDADES

1. «Forma de la respuesta: la decide el Executor con estos campos mínimos»: no fija nombres ni anidamiento; WS13.2/13.3 consumirán algo aún inexistente. Obliga a inventar el contrato de campos.
2. «con encabezados de dos niveles»: ¿dos niveles distintos o encabezados de nivel 2? Obliga a inventar el fixture.
3. «la plantilla que la resolución actual del documento ya entrega»: no nombra función ni descriptor; obliga a adivinar de dónde sale la plantilla y si `document_ir` sirve.
4. «si render y fuente no pueden salir de una lectura sin ella» (`sldb_adapter.py` opcional): criterio de juicio subjetivo; obliga a inventar el disparador.
5. «con las mismas operaciones públicas que usan las pruebas actuales de workspace»: no las enumera; obliga a inventar la preparación canónica del store.
6. «line_end sigue la regla de sldb»: la regla no se cita ni se localiza; obliga a deducirla.
7. «closeout_evidence: tests, commit» frente a «El Executor… no hace commits»: no aclara de quién es esa evidencia.
8. «(workspace-view.js, workspace.mjs, workspace.css y módulos nuevos ahí)»: lista cerrada con extensión abierta.
9. «clic en una línea y mayúsculas más clic»: tecla no explicitada.
10. «status: draft es el campo del modelo: la tarea está enrutada en el Board»: afirmación contradictoria con el propio campo.

## DRY-RUN

Un ejecutor futuro: (1) lee bundle y baseline (`test_mindmap_workspace.py`+`test_parallel_workspace_serve.py`, 17 passed); (2) escribe `declaracion-archivos.md` si toca opcionales; (3) añade en `workspace_routes.py` la rama `GET /api/workspace/source` con exclusividad `id`/`path` y 400 si ambos o ninguno, reutilizando estados de `_inspect_file_reference` (no_existe 404, fuera_del_repo/protegido 403, binario/directorio/no_markdown 415, demasiado_grande 413, sin_repo_root 503, error_lectura 500); (4) lee bytes una vez, calcula revisión sha256, construye render modelado con `build_document_ir_json` y no modelado con `extract_sections`; (5) resuelve enlaces con `parse_links`+`split_anchor`+`doc_status("local:"+resto)` y contención previa; (6) en `views/workspace/node/` añade fuente/render con enlaces en render y literal en fuente, foco (sección/span, field_path, referencia con campo y posición, arista con procedencias) y rango local de Code sobre `content` completo; (7) tests en los dos archivos declarados con stores/desks temporales y e2e Playwright. Errores esperados: ambigüedad 400, guardias por estado, fallo si el store muta. Resultado esperado: suite verde, un solo lector en DOM, revisión idéntica render/fuente.

## FUTURO

El Executor entrega `result-summary.md`, `validation.log` y handoff; el Tester independiente produce `tester-result-summary.md`; el Supervisor hace el commit y la demo en 8092; root revisa el checkpoint y decide WS13.2/WS13.3. G_HUMAN_READ y WS16 siguen pendientes.
