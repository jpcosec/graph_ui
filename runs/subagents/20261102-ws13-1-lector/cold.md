## REFORMULACION

Encargo: implementar el nodo WS13.1 en graph_ui (base `a1b2b22`, HEAD `20e5797`): lector de solo lectura con render y fuente cruda íntegra del mismo origen para Markdown modelado y no modelado, contexto real, seguimiento de enlaces intra-desk y foco interno compartido entre Document/Graph/Code donde WS11 defina correspondencia. Alcance cerrado: `workspace_routes.py`, `views/workspace/node/` (+módulos ahí), dos tests; opcional y declarado antes de editar: `sldb_adapter.py` (lectura única) y `serve.py` (despacho). Contratos: `navegacion.md` sha `6a4f…361e` con nota de aprobación; `operaciones.md` sha `7545…9f39` solo como límite de no escritura. Fuera: edición, mutaciones, Changes/Integrity/Agents, explorador (WS13.2), pestañas/split (WS13.3), multidesk (WS41), shell/api.js (WS15.1), Kimun, 8090. Sin mocks; bloqueo explícito en `result-summary.md` en vez de inventar; el Executor no cierra ni mueve Board.

## AMBIGUEDADES

1. «Solo si hace falta y se declara antes de editar: `sldb_adapter.py` para una lectura única»: no se fija qué condición determina «hace falta» ni si «lectura única» exige reemplazar `document_ir` (que ya lee en `sldb_adapter.py:202`) o añadir función. Obligaría a inventar el criterio de decisión.
2. «Reutiliza `extract_sections` o el builder solo si se verifica; si no, render propio»: no se define qué cuenta como verificación suficiente ni quién la declara. Obligaría a inventar el umbral de aceptación.
3. «referencia de archivo por documento, campo, posición y valor (H-03, preservar antes de concatenar)»: no se fija la forma del identificador (objeto JSON, cadena, sintaxis de clave de sesión). El contrato 5.3 dice expresamente que «no fija una sintaxis de cadena». Obligaría a inventar el formato.
4. «Apertura sin conocer ID: … no modelado desde enlaces, referencias y URL»: no se define el parámetro/forma de URL para identidad no modelada `(repo, ruta)`. Obligaría a inventar esquema de URL.
5. «Rango local de Code C14a dentro del delta»: F17 pide «archivo o rango», pero no se define la interacción de selección de rango por la persona. Obligaría a inventar el gesto/UI.
6. «la prueba comprueba que el store no cambió»: no se fija el medio observable (bytes, hashes, mtime, estado de versión); el contrato remite el medio a los consumidores. Obligaría a inventar el criterio de medición.

## DRY-RUN

Ejecutor futuro: (1) verifica Board/tarea activa y no solapamiento con las dos draft que declaran `views/workspace/`; (2) línea base `pytest` y `e2e`; (3) en `workspace_routes.py` añade ruta GET de fuente con guardias §3.3, una sola lectura de bytes compartida por render y fuente, y expone revisión; (4) adapta C5b sin modelo o render propio; (5) preserva `files`/`references` con campo y posición antes de concatenar; (6) añade módulo de foco y estado en `views/workspace/node/`, con alternancia que conserve foco y origen; (7) resuelve `[[…]]` con `parse_links`+`split_anchor`+`doc_status("local:"+resto)`, nunca `recover_links`; (8) si toca `sldb_adapter.py`/`serve.py`, lo declara antes; (9) tests con store/desk temporales reales, comprobando store inalterado; (10) `result-summary.md`, `validation.log`, handoff a Tester. Errores esperados: falta de capacidad para lectura sin mutación (H-14) → bloqueo; ausencia de CDN → diagnóstico local; fallo previo de suite → declarar sin tapar. Resultado esperado: ruta de fuente y foco verificables, sin mutación.

## FUTURO

Tester independiente produce `tester-result-summary.md` con ejecución y DOM/píxeles; el Supervisor revisa el checkpoint y decide continuidad del DAG (WS13.2/13.3); P01 mantiene `G_HUMAN_READ`/WS16 pendientes; WS41 consume enlaces entre desks; WS15.1 tipifica errores en `shell/api.js`.
