---
sldb:
  by: agent
  at: '2026-11-25T21:11:25Z'
  authority: generated
  via: create_document
id: materialization-vista-viewdoc-tests-e2e-notation-viewdoc-py
title: vista-viewdoc tests-e2e_notation_viewdoc-py
source_atoms:
- atom-la-vista-de-notacion-lista-y-dibuja-los-viewdoc-del-store
target_kind: test
target_identity: tests/e2e_notation_viewdoc.py
validation:
- node --test tests/mindmap-notation.test.mjs; pytest -q tests/e2e_notation_viewdoc.py
tags:
- system:graph_ui
- topic:vista-viewdoc
---

# vista-viewdoc tests-e2e_notation_viewdoc-py

## Intent

materializa en tests/e2e_notation_viewdoc.py el atom atom-la-vista-de-notacion-lista-y-dibuja-los-viewdoc-del-store
