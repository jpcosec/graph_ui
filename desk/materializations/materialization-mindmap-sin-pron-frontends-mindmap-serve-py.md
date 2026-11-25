---
sldb:
  by: agent
  at: '2026-11-25T21:36:15Z'
  authority: generated
  via: create_document
id: materialization-mindmap-sin-pron-frontends-mindmap-serve-py
title: mindmap-sin-pron frontends-mindmap-serve-py
source_atoms:
- atom-el-modo-local-de-mindmap-abre-el-store-por-sldb-api-y-graph-ui-deja-pron
target_kind: code
target_identity: frontends/mindmap/serve.py
validation:
- pytest -q tests/test_mindmap_adapter.py tests/test_ci_workflow.py
tags:
- system:graph_ui
- topic:mindmap-sin-pron
---

# mindmap-sin-pron frontends-mindmap-serve-py

## Intent

materializa en frontends/mindmap/serve.py el atom atom-el-modo-local-de-mindmap-abre-el-store-por-sldb-api-y-graph-ui-deja-pron
