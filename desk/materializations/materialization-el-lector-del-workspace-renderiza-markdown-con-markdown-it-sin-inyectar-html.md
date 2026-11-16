---
sldb:
  by: agent
  at: '2026-11-16T17:23:09Z'
  authority: generated
  via: create_document
id: materialization-el-lector-del-workspace-renderiza-markdown-con-markdown-it-sin-inyectar-html
title: El lector del workspace renderiza Markdown con markdown-it sin inyectar HTML
source_atoms:
- atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node
target_kind: code
target_identity: frontends/mindmap/views/workspace
validation:
- node --test tests/mindmap-workspace-reader.test.mjs tests/mindmap-workspace.test.mjs
tags: []
---

# El lector del workspace renderiza Markdown con markdown-it sin inyectar HTML

## Intent

La proyección Documento del workspace dibuja el Markdown con markdown-it 14.1.0 (html:false) recorriendo tokens con htm: citas, énfasis, código inline; enlaces estándar como span no navegable; [[…]] resueltos por el backend; foco por sección con line_start/line_end.
