---
sldb:
  by: agent
  at: '2026-11-26T02:58:42Z'
  authority: generated
  via: create_document
id: materialization-layout-notacion-worker-tests-e2e-notation-activity-py
title: layout-notacion-worker tests-e2e_notation_activity-py
source_atoms:
- atom-el-layout-de-notacion-corta-en-el-primer-candidato-legible-y-elk-corre-en-un-worker
target_kind: test
target_identity: tests/e2e_notation_activity.py
validation:
- node --test tests/mindmap-notation-layout.test.mjs tests/mindmap-notation.test.mjs;
  pytest -q tests/e2e_notation_activity.py tests/e2e_mindmap_notation.py
tags:
- system:graph_ui
- topic:layout-notacion-worker
---

# layout-notacion-worker tests-e2e_notation_activity-py

## Intent

materializa en tests/e2e_notation_activity.py el atom atom-el-layout-de-notacion-corta-en-el-primer-candidato-legible-y-elk-corre-en-un-worker
