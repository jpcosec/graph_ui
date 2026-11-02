## REFORMULACION

Encargo: corregir los cinco hallazgos de WS13.1 en graph_ui —lectura GET sin mutación, guardias antes de leer, foco con dueño, generaciones de estado y anclas— con pruebas reales y casos negativos. Repo: graph_ui; base: HEAD de main al despacho, que contiene bf55151. Alcance cerrado: `workspace_routes.py`, `views/workspace/node/`, tests listados y `sldb_adapter.py` solo con funciones de lectura declaradas antes. Límites: Executor implementa y prueba sin commits ni Board; sin shell/api.js, WS13.2/13.3, API nueva de sldb, mocks, push ni preguntar al solicitante; bloqueo concreto se documenta.

## AMBIGUEDADES

1. «la revisión de /node difiere de la de /source»: /node expone `content_hash` y `file_revision`; no dice cuál es «la revisión». Obliga a inventar cuál se compara y avisa.
2. «la lista actual de candidatos fijos se conserva y cada candidato pasa las guardias antes de leerse»: incluye `desk/relations/*.yaml`, pero `_guard_markdown_file` rechaza todo lo que no sea `.md`. Obliga a inventar qué guardia aplica o a descartar candidatos, cambiando conducta.
3. «graph, relaciones y procedencia responden ok false con estado store_no_preparado… en la proyección graph de /node y en el contexto de /source»: no dice qué ocurre con `context.incoming_relations/outgoing_relations` de /node.
4. «Cada procedencia de arista lleva su documento propietario: el source del registro de arista» y «Una arista relation_doc no tiene campo»: calla sobre origin `structural`. Obliga a inventar su propietario.
5. «se excluye también el campo propio cuya procedencia apunte a un destino distinto del elemento seleccionado»: no define la comparación de destino cuando hay `ref_path` o varias procedencias.
6. «declaradas antes con motivo en runs/.../declaracion-archivos.md»: no dice quién la escribe ni cuándo; los roles la tratan como evidencia del Supervisor.

## DRY-RUN

Leería el bundle y verificaría el sha256 del contrato. En `workspace_routes.py`: sustituir `document_edges` por `load_edge_index(include_linked=False)` y comprobar `EdgeIndex.stale`; usar `indexed_documents` para identidad; aplicar guardias §3.3 antes de leer; extraer payload con `load_registered_model`+`extract_model_data` y construir IR con `build_document_ir_json`; añadir propietario a cada procedencia; bloquear consultas si `stale`. En `reader.mjs`/`workspace-view.js`: filtrar correspondencias por dueño y generación, mostrar carga por panel y verificar anclas con `extract_section`. Pruebas: hashes antes/después de GET en caso canónico y desactualizado, `sys.addaudithook`, `page.route` con retraso, anclas en propio/modelado/no modelado, y `test_workspace_cycle_and_2hops_real_edges` corregido. Luego pytest focal, e2e, `node --test` y suite general; escribir `result-summary.md`. Errores esperados: si `stale` no existe o no hay API pública desde bytes, bloquear y documentar sin workaround. Resultado: los cinco puntos con pruebas que fallan sin corrección.

## FUTURO

El Executor produce implementación probada y `result-summary.md`; el Tester independiente, `tester-result-summary.md`; el Supervisor, commit y demo en 8092 sobre copia temporal; root decide la aceptación de WS13.1 y el consumo del intake en sldb; después, WS13.2/13.3 y la tarea de render Markdown.
