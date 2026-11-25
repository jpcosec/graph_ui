REFORMULACION
Propósito: corregir la deuda de legibilidad del lector del workspace, que deja literales citas, énfasis, código inline y enlaces Markdown estándar. Resultado: en `/workspace`, `RenderedDocument` renderiza esos elementos con un motor real, conserva enlaces SLDB `[[…]]`/`[pred:: [[…]]]`, foco por `data-line-start` y `RawSource` íntegro; enlaces estándar quedan como `span` no navegable con `data-status='no_clasificado'`. Repo: `frontends/mindmap/...`, `tests/...`, import map en `frontends/mindmap/index.html`. Límites: no backend, no clasificar/abrir enlaces estándar, no HTML crudo inyectado, no tablas/GFM, no parser SLDB propio, no Kimun, no cambios sin commitear de JP. Es `task.code` ejecutable; no agregado ni paquete no ejecutable.

AMBIGUEDADES
1. Validación cita `tests/mindmap-workspace.test.mjs` y `tests/test_mindmap_workspace_reader.py`, pero `files`/Scope solo nombran `tests/mindmap-workspace-reader.test.mjs` y `tests/e2e_mindmap_workspace.py`: “node --test tests/mindmap-workspace-reader.test.mjs tests/mindmap-workspace.test.mjs” y “tests/test_mindmap_workspace_reader.py”. Obligaría a inventar si deben crearse o solo ejecutarse si existen.
2. “un `<script>` escrito en un documento de prueba se muestra como texto y no se ejecuta”: no define ruta, contenido ni si es fixture versionado. Obligaría a inventar el documento y su ubicación.
3. “la fuente cruda es idéntica byte a byte”: no aclara si la comparación es contra el archivo real leído por la UI o contra una copia en el test. Obligaría a inventar el mecanismo exacto de comparación.

DRY-RUN
Lecturas: TaskDoc, `review-source.md` línea 14, `docs/workspace-ui.md`, `reader.mjs`, `workspace-view.js`, `workspace.css`, `index.html`, tests existentes, `README.md` y `docs/workspace-ui.md` como datos e2e. Cambios previstos: agregar `markdown-it@14.1.0` al import map; usar `md.parse` con `{html:false, linkify:false}` y `map` a `line_start`/`line_end`; renderizar tokens con `htm`; mantener `splitInline` para `[[…]]`; CSS para cita/código inline; pruebas node, e2e Chromium y PNG. Dependencias: CDN de markdown-it, `htm`, runners node/pytest, Chromium/Playwright. Validaciones futuras: ejecutar los comandos listados, comprobar cita/código/énfasis, estados SLDB, no ejecución de script, igualdad byte a byte y captura. Sin ejecutar nada.

FUTURO
El despacho asigna `run_dir`; un humano valida la captura y la aceptación visual. Clasificar/abrir enlaces estándar y migrar a Kimun quedan fuera, en tareas posteriores.
