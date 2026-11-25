---
sldb:
  by: agent
  at: '2026-11-25T21:11:36Z'
  authority: generated
  via: create_document
id: materialization-vista-viewdoc-tests-mindmap-notation-test-mjs
title: vista-viewdoc tests-mindmap-notation-test-mjs
source_atoms:
- atom-la-vista-de-notacion-lista-y-dibuja-los-viewdoc-del-store
target_kind: test
target_identity: tests/mindmap-notation.test.mjs
validation:
- node --test tests/mindmap-notation.test.mjs; pytest -q tests/e2e_notation_viewdoc.py
tags:
- system:graph_ui
- topic:vista-viewdoc
---

# vista-viewdoc tests-mindmap-notation-test-mjs

## Intent

materializa en tests/mindmap-notation.test.mjs el atom atom-la-vista-de-notacion-lista-y-dibuja-los-viewdoc-del-store
