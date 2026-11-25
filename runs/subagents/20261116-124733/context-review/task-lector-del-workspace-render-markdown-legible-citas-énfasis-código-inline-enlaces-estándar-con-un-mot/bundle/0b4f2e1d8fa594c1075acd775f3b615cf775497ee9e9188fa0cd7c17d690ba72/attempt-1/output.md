REFORMULACION
Nodo ejecutable `task.code` (no es agregado ni paquete). Propósito: cerrar la deuda de legibilidad del lector del workspace (WS13.1), para que un Markdown se lea con citas, énfasis, negrita, código inline y enlaces estándar renderizados, conservando enlaces SLDB, foco por sección y RawSource literal. Resultado: en `/workspace` (RenderedDocument) un motor real markdown-it 14.1.0 cargado por import map, render con htm (nunca `innerHTML`), CSS de cita y código inline, y pruebas node + e2e. Superficie/repo: graph_ui; `frontends/mindmap/views/workspace/node/{reader.mjs,workspace-view.js,workspace.css}`, `frontends/mindmap/index.html`, `tests/mindmap-workspace-reader.test.mjs`, `tests/e2e_mindmap_workspace.py`. Límites: no clasificar ni abrir enlaces estándar (span `no_clasificado`, sin `<a>`), no inyectar HTML crudo, no tablas/GFM, no tocar `workspace_routes.py`, no migrar a Kimun, no tocar cambios sin commitear de JP en `frontends/desk/`.

AMBIGUEDADES
1. "node --test tests/mindmap-workspace-reader.test.mjs tests/mindmap-workspace.test.mjs" y "pytest … tests/test_mindmap_workspace_reader.py": ambos archivos no figuran en `files`; obliga a inventar si se crean, se modifican o solo se ejecutan.
2. "un `<script>` escrito en un documento de prueba": no define documento ni ubicación; obliga a inventar el fixture.
3. "runs/subagents/<run_dir>/reader.png … con el run_dir que asigne el despacho": el path queda indeterminado; obliga a inventar el run_dir.
4. "abre README.md y docs/workspace-ui.md reales del repo": no fija raíz/repo; obliga a inventar la ruta base.
5. "los [[…]] se siguen resolviendo por splitInline sobre el contenido de los tokens de texto": no aclara precedencia si un `[[…]]` cae dentro de un enlace estándar o de `code_inline`; obliga a decidir ese caso.

DRY-RUN
Lecturas: los seis archivos listados, más `runs/subagents/20261102-ws13-1-correccion/review-source.md` y `docs/workspace-ui.md`. Cambios previstos: añadir `markdown-it` al import map; reescribir `renderBlocks` sobre `md.parse` con frontmatter separado y `line_start/line_end`; mapear tokens a htm; extender `InlineText` para enlace estándar como span `no_clasificado`; clases CSS; pruebas node y e2e. Dependencias: `markdown-it@14.1.0` por esm.sh, htm, contrato de `/api/workspace/source` (`links` con `status`). Validaciones futuras: `node --test …` y `python -m pytest …`; captura PNG.

FUTURO
El despacho asigna el `run_dir`; un ejecutor implementa y captura; los rituales testing/closeout validan y cierran; un humano acepta la legibilidad; otra tarea decidirá clasificar/abrir enlaces estándar.
