---
sldb:
  by: agent
  at: '2026-11-25T21:11:14Z'
  authority: generated
  via: create_document
id: materialization-vista-viewdoc-frontends-mindmap-views-specs-notation-notation-mjs
title: vista-viewdoc frontends-mindmap-views-specs-notation-notation-mjs
source_atoms:
- atom-la-vista-de-notacion-lista-y-dibuja-los-viewdoc-del-store
target_kind: code
target_identity: frontends/mindmap/views/specs/notation/notation.mjs
validation:
- node --test tests/mindmap-notation.test.mjs; pytest -q tests/e2e_notation_viewdoc.py
tags:
- system:graph_ui
- topic:vista-viewdoc
---

# vista-viewdoc frontends-mindmap-views-specs-notation-notation-mjs

## Intent

materializa en frontends/mindmap/views/specs/notation/notation.mjs el atom atom-la-vista-de-notacion-lista-y-dibuja-los-viewdoc-del-store
