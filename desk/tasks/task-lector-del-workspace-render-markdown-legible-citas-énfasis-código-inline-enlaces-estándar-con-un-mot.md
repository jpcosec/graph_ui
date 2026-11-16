---
sldb:
  by: agent
  at: '2026-11-16T03:49:57Z'
  authority: generated
  via: save_document_payload
id: task-lector-del-workspace-render-markdown-legible-citas-énfasis-código-inline-enlaces-estándar-con-un-mot
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
- host:local
current_node: ritual-execution
history: []
references:
- runs/subagents/20261102-ws13-1-correccion/review-source.md
- docs/workspace-ui.md
depends_on: []
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
files:
- frontends/mindmap/views/workspace/node/reader.mjs
- frontends/mindmap/views/workspace/node/workspace-view.js
- frontends/mindmap/views/workspace/node/workspace.css
- frontends/mindmap/index.html
- tests/mindmap-workspace-reader.test.mjs
- tests/e2e_mindmap_workspace.py
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms:
- atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node
from_drawer: desk/drawer/tasks/task-render-markdown-legible-del-lector.md
---

# Lector del workspace: render Markdown legible (citas, énfasis, código inline, enlaces estándar) con un motor real

## Rationale

_Explain why this task exists or the business driver behind it._

La revisión root de WS13.1 (runs/subagents/20261102-ws13-1-correccion/review-source.md, línea 14) registró que el render del lector deja literales las citas, el énfasis, el código inline y los enlaces Markdown estándar; solo encabezados, listas y bloques de código se dibujan. Es deuda visible de lectura (JP llamó al lector "un vertedero de información": legibilidad antes que más vistas) y bloquea la aceptación humana de lectura.

## Goal

_Describe the concrete result this task must produce._

En la pestaña de lectura del workspace (/workspace, componente RenderedDocument de frontends/mindmap/views/workspace/node/workspace-view.js) un documento Markdown se ve con citas, énfasis, negrita, código inline y enlaces estándar renderizados, conservando lo que ya funciona: los enlaces SLDB [[…]] y [pred:: [[…]]] con su resolución y estados, el foco por sección con data-line-start, y la fuente cruda (RawSource) literal e íntegra.

## Scope

_State what is in scope and what is out of scope._

ENTRA: frontends/mindmap/views/workspace/node/reader.mjs (renderBlocks, splitInline) y workspace-view.js (RenderedDocument, InlineText); el import map de frontends/mindmap/index.html, donde se agrega el motor (obligatorio); workspace.css para cita y código inline; pruebas en tests/mindmap-workspace-reader.test.mjs (lógica pura) y un e2e en tests/e2e_mindmap_workspace.py que abre README.md y docs/workspace-ui.md reales del repo. Enlaces: el backend (workspace_routes.py, _document_links) solo clasifica enlaces SLDB [[…]] y [pred:: [[…]]] (sldb.links.parse_links) y entrega por cada uno {raw, target, kind, predicate, line, anchor, status: ok|externo|roto|no_markdown, cause, open, origin}; esos se siguen dibujando como hoy (InlineText, por raw). Los enlaces Markdown estándar [texto](destino) no los clasifica nadie: se dibujan con su texto como <span className='workspace-link-unresolved' data-testid='doc-link' data-status='no_clasificado' title={destino}>, nunca como <a> navegable, y no se abren. NO ENTRA: clasificar o abrir enlaces estándar (cambio del backend, otra tarea), HTML crudo del documento (se muestra como texto, nunca se inyecta), tablas y extensiones GFM, un parser propio de documentos SLDB, cambios en workspace_routes.py o sus guardias, migración a Kimun, y los cambios sin commitear de JP en frontends/desk/.

## Implementation Path

_Outline the expected implementation route or affected surface._

1) Motor: markdown-it 14.1.0 en el import map como "markdown-it": "https://esm.sh/markdown-it@14.1.0" (mismo mecanismo que react, htm y dagre), instanciado con {html: false, linkify: false}. 2) renderBlocks usa md.parse(text): cada token de bloque trae map = [inicio, fin) en base 0; el bloque guarda line_start = map[0] + 1 y line_end = map[1] (base 1, inclusivo, la misma convención que hoy tienen data-line-start y el foco por sección). El frontmatter inicial (--- … ---) se separa antes de parsear, como hoy. 3) El render recorre los tokens con htm, nunca con innerHTML ni dangerouslySetInnerHTML: blockquote -> <blockquote className='workspace-render-quote'>, em -> <em>, strong -> <strong>, code_inline -> <code className='workspace-render-code-inline'>, link estándar -> el span no_clasificado del alcance. 4) Los [[…]] siguen resueltos por splitInline sobre el contenido de los tokens de texto, así un enlace SLDB dentro de énfasis o de una cita conserva su estado. 5) CSS: .workspace-render-quote con borde izquierdo de 3px y sangría, .workspace-render-code-inline con fuente monoespaciada y fondo tenue, con las variables de color del skin existentes. 6) Pruebas node de renderBlocks (citas, énfasis, código inline, enlace estándar, [[…]] dentro de énfasis, line_start/line_end) y un e2e en Chromium: en README.md hay <blockquote>, <code> inline y <em> o <strong> donde el Markdown los tiene; un <script> escrito en un documento de prueba se muestra como texto y no se ejecuta; la fuente cruda es idéntica byte a byte. 7) Captura PNG de /workspace con README.md abierto en runs/subagents/<run_dir>/reader.png, con el run_dir que asigne el despacho.

## Validation

_List the checks required before this task can close._

- node --test tests/mindmap-workspace-reader.test.mjs tests/mindmap-workspace.test.mjs
- python -m pytest -q -rs tests/test_mindmap_workspace_reader.py tests/e2e_mindmap_workspace.py

## Done When

_Name the observable condition that makes the task complete._

`node --test tests/mindmap-workspace-reader.test.mjs` y `python -m pytest -q -rs tests/test_mindmap_workspace_reader.py tests/e2e_mindmap_workspace.py` pasan; en /workspace, README.md muestra cita, código inline y énfasis renderizados, los [[…]] conservan su estado, ningún HTML del documento se ejecuta, y la fuente cruda es igual a los bytes del archivo. Captura en runs/subagents/<run>/.
