REFORMULACION

Corregir en el repo `graph_ui`, base HEAD de `main` al despacho con `bf55151`, los cinco hallazgos de WS13.1: lectura sin mutación, guardias antes de leer, foco con dueño, estado sin mezcla y anclas. Alcance cerrado: `workspace_routes.py`, `views/workspace/node/`, tests listados y `sldb_adapter.py` solo con funciones de lectura declaradas antes. Autoridad: `review-source.md`; contrato `navegacion.md` sha256 indicado. Límites: no `shell/api.js`, `frontends/workspace/`, mutaciones, render Markdown, WS13.2/13.3, multidesk, API nueva de sldb, push ni puertos ajenos; sin mocks; stores reales; WS13.1 sigue sin aceptar.

AMBIGUEDADES

1. Cita: «Payload de un documento autorizado: desde sus bytes ya leídos con API pública (load_registered_model y la extracción pública del modelo; comprobar en fuente…)». No fija nombre, firma ni contrato de esa «extracción pública». Obliga a decidir qué función cuenta y cómo se obtiene el payload desde bytes; si no aparece, la TaskDoc manda bloquear, pero el límite queda a interpretación.

2. Cita: «Cada procedencia de arista lleva su documento propietario, el que declara el campo». No define cómo derivar el propietario cuando la metadata no lo trae —`relation_doc`, composición, `source_field`— ni si es `source` o `target`. Elegirlo por intuición sería inventar y podría resaltar un campo ajeno.

3. Cita: «graph, relaciones y procedencia responden ok false con estado store_no_preparado y los documentos atrasados». No fija campos JSON ni la correspondencia exacta con `/node` y el contexto de `/source`. Inventar nombres de campo rompería el contrato observable.

4. Cita: «Dos revisiones distintas no se unifican en silencio». No aclara si «revisión» es `file_revision`, `content_hash`, `revision` de `/source` o el contador de generación. Obliga a fijar el criterio de descarte sin apoyo textual.

5. Cita: «comprobado con extract_section sobre bytes obtenidos por lectura protegida o con el contenido ya leído si es el propio documento». No especifica si `extract_section` recibe bytes o texto ya decodificado; adaptarlo sin contrato obliga a inventar la interfaz.

DRY-RUN

Un ejecutor futuro leería `review-source.md`, el contrato y esta TaskDoc; comprobaría las APIs en `sldb.api`; declararía en `declaracion-archivos.md` cualquier función añadida a `sldb_adapter.py`; en `workspace_routes.py` sustituiría `document_edges` por `load_edge_index`, comprobaría `EdgeIndex.stale` y devolvería `store_no_preparado`; usaría `indexed_documents` y aplicaría contención, `.git`, ignorado y permisos antes de leer; añadiría dueño a cada procedencia; en `reader.mjs` y `workspace-view.js` ataría estado a identidad y generación y validaría anclas; añadiría pruebas negativas en los archivos listados. Ejecutaría pytest focal, e2e, `node --test` y suite general. Esperado: GET sin cambios de hashes/store, rechazo de store desactualizado, no lectura de documentos protegidos, foco solo del documento abierto, sin mezcla y anclas inexistentes rotas. Errores: falta de API pública o layout no canónico → bloqueo concreto en `result-summary.md`; test legacy de conducta retirada → corregirlo declarándolo.

FUTURO

El Executor produce producto probado, `result-summary.md` y handoff; el Tester independiente, `tester-result-summary.md`; el Supervisor, commit y demo 8092 sobre copia temporal; root decide la aceptación de WS13.1. WS13.2/13.3 y el render Markdown quedan fuera.
