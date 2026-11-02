## REFORMULACION
**Encargo:** implementar en el host Mindmap un lector de solo lectura para Markdown modelado y no modelado, con render y fuente cruda íntegra del mismo origen, contexto real, seguimiento de enlaces internos y foco compartido entre Document, Graph y Code cuando WS11 defina correspondencia.

**Alcance:** delta cerrado en `frontends/mindmap/workspace_routes.py`; `frontends/mindmap/views/workspace/node/` (`workspace-view.js`, `workspace.mjs`, `workspace.css` y módulos nuevos); `tests/test_mindmap_workspace_reader.py`; `tests/e2e_mindmap_workspace.py`. Solo si se declara antes de editar: `frontends/mindmap/sldb_adapter.py` para lectura única y `frontends/mindmap/serve.py` para despachar ruta.

**Repo:** `/home/jp/proyectos/SLDB_1/UIs/graph_ui`, host Mindmap.

**Límites:** sin escritura, mutación, migración, `recover_links`, shell/API, Changes, Integrity, Agents, explorador completo, pestañas/split, multidesk WS41 ni 8090. El Executor no cierra la tarea ni avanza el Board. Bloqueo concreto en `result-summary.md` si algo excede el alcance.

## AMBIGUEDADES
1. “Autoridad: `runs/subagents/.../review-source.md`” y contratos citados por sha256: no están incluidos en el preflight. Obliga a inventar rutas de lectura, guardias §3.3, tratamiento §5.2 y criterios C5b/H-xx.
2. “contexto real” y “relaciones reales” no definen formato ni fuente. Obliga a inventar el contrato de respuesta.
3. “Model:name prevalece” no define precedencia exacta ni sintaxis. Obliga a inventar resolución de identidad.
4. “extract_sections o el builder solo si se verifica” no indica verificación ni criterio de fallo. Obliga a inventar validación.
5. “foco interno §6.1” y “arista schema con todas sus procedencias” remiten a contrato ausente. Obliga a inventar modelo de foco y payload.
6. “declarar antes de editar” no indica dónde ni en qué formato. Obliga a inventar el mecanismo de declaración.
7. “la prueba comprueba que el store no cambió” no define observación. Obliga a inventar hash, snapshot o mtime.

## DRY-RUN
Un ejecutor futuro leería primero `review-source.md`, contratos, DAG, `suplemento-8090.md` y pruebas existentes; tomaría línea base con pytest; inspeccionaría rutas/vistas actuales; implementaría una ruta de lectura única que devuelva texto íntegro, identidad, revisión y contexto; añadiría render de Markdown no modelado sin inventar modelo; resolvería enlaces internos con referencia rota visible; añadiría foco por documento/campo/posición/valor y alternancia Document/Graph/Code; escribiría pruebas con stores y desk temporales reales. Errores esperables: contratos ausentes, conflicto de identidad modelado/no modelado, mutación accidental del store, fallo de DOM/e2e o pruebas base ya rojas. Resultado esperado: delta probado, `result-summary.md`, `validation.log` y handoff al Tester, sin cierre ni avance del Board.

## FUTURO
El Tester independiente produce `runs/subagents/20261102-ws13-1-lector/tester-result-summary.md` con ejecución real. WS13.2 decide explorador completo; WS13.3, pestañas/split; WS41, multidesk. G_HUMAN_READ y WS16 quedan pendientes de decisión humana. Otro nodo o persona cierra la tarea y actualiza el Board.
