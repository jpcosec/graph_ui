---
sldb:
  by: agent
  at: '2026-11-26T02:58:38Z'
  authority: generated
  via: create_document
id: materialization-layout-notacion-worker-frontends-mindmap-views-specs-notation-notation-view-js
title: layout-notacion-worker frontends-mindmap-views-specs-notation-notation-view-js
source_atoms:
- atom-el-layout-de-notacion-corta-en-el-primer-candidato-legible-y-elk-corre-en-un-worker
target_kind: code
target_identity: frontends/mindmap/views/specs/notation/notation-view.js
validation:
- node --test tests/mindmap-notation-layout.test.mjs tests/mindmap-notation.test.mjs;
  pytest -q tests/e2e_notation_activity.py tests/e2e_mindmap_notation.py
tags:
- system:graph_ui
- topic:layout-notacion-worker
---

# layout-notacion-worker frontends-mindmap-views-specs-notation-notation-view-js

## Intent

materializa en frontends/mindmap/views/specs/notation/notation-view.js el atom atom-el-layout-de-notacion-corta-en-el-primer-candidato-legible-y-elk-corre-en-un-worker
