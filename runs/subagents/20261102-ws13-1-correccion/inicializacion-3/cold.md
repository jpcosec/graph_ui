REFORMULACION

Objetivo: corregir los cinco hallazgos de la revisión root sobre WS13.1 en el lector de graph_ui (lectura sin mutación, guardias antes de leer, foco con dueño, estado por identidad/generación y anclas), con pruebas reales que fallan sin la corrección. Alcance: lista cerrada — `frontends/mindmap/workspace_routes.py`, `frontends/mindmap/views/workspace/node/`, tres archivos pytest y `tests/mindmap-workspace-reader.test.mjs` nuevo; `sldb_adapter.py` solo funciones de lectura declaradas antes en `declaracion-archivos.md`. Repo: graph_ui, HEAD de main con bf55151; autoridad `review-source.md`; contrato `navegacion.md` sha256 `6a4f8518…`, §3.3, §5.2, §5.4, §6, §6.1, H-14. Límites: sin commits ni Board (Executor), sin mocks, sin API nueva de sldb, sin `shell/api.js` ni `frontends/workspace/`, sin WS13.2/13.3, sin push, sin 8090/8091; 8092 solo copia temporal del Supervisor.

AMBIGUEDADES

1. «hashes de store, documentos y estado git iguales antes y después de cada GET en caso canónico y caso desactualizado» frente a «Layout no canónico: no hay consulta pública previa a open_store». `load_edge_index` invoca `open_store`, que migra: obligaría a inventar si «desactualizado» es solo `stale` con layout canónico o también layout no canónico, y si ese caso puede cumplir hashes iguales.
2. «con la operación pública rebuild_edges en el fixture»: sin módulo, símbolo exacto ni firma (`pythonpath`); obligaría a inventar el import y su contrato.
3. «desde sus bytes ya leídos con API pública (load_registered_model…, extract_document_payload…)»: no dice cómo se arma el descriptor (`template`) que consume `build_document_ir_json`, ni si `editor_store.document_ir` sigue permitido; obligaría a inventar el origen de la plantilla.
4. «Un documento indexado no autorizado aparece en el catálogo con su estado»: no define qué es «su estado» (nombre de guardia, código HTTP, etiqueta) ni qué título muestra; obligaría a inventar el shape.
5. «un contador local que se incrementa en cada navegación» y «cada panel muestra carga»: sin forma observable ni criterio cuando `/node` no tiene `file_revision`; obligaría a inventar comparación y textos.

DRY-RUN

1. `declaracion-archivos.md` antes de tocar `sldb_adapter.py`. 2. En rutas: sustituir `document_edges` por `load_edge_index` en `_build_graph_neighborhood`; comprobar `idx.stale` antes de leer y responder `graph` `{ok:false, estado:store_no_preparado, stale:[…]}` y lo mismo en `context` de `/source`; reordenar `workspace_source` a `indexed_documents` → guardias §3.3 → lectura del único documento autorizado; payload/IR por API pública; `_resolve_document` con guardia antes de `read_text`; `_classify_link` comprobando ancla con `extract_section` antes de `ok`. 3. En `node/`: dueño de procedencia en `reader.mjs`, contador de generación y estados de carga por panel, descarte de respuestas atrasadas. 4. Pruebas negativas en los tres pytest y el nuevo `.mjs`; corregir `test_workspace_cycle_and_2hops_real_edges` para preparar el store. 5. Ejecutar los comandos de Validation. Errores previstos: falta de API pública de bytes→payload o de consulta de store preparado → bloqueo concreto con avance en `result-summary.md`; roces del test heredado y del conteo 204, declarados uno a uno. Resultado esperado: cinco puntos con evidencia, suites verdes, handoff.

FUTURO

Supervisor: commit y demo en 8092 sobre copia temporal. Tester independiente ejecuta y produce `tester-result-summary.md`. Root decide la aceptación de WS13.1; sin ella WS13.2/13.3 no arrancan. sldb: intake de consulta pública de store preparado sin `open_store`. Aparte: tarea de render Markdown legible.
