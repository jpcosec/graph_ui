---
sldb:
  by: agent
  at: '2026-11-25T21:35:56Z'
  authority: generated
  via: create_document
id: materialization-mindmap-sin-pron-github-requirements-suite-txt
title: mindmap-sin-pron -github-requirements-suite-txt
source_atoms:
- atom-el-modo-local-de-mindmap-abre-el-store-por-sldb-api-y-graph-ui-deja-pron
target_kind: code
target_identity: .github/requirements-suite.txt
validation:
- pytest -q tests/test_mindmap_adapter.py tests/test_ci_workflow.py
tags:
- system:graph_ui
- topic:mindmap-sin-pron
---

# mindmap-sin-pron -github-requirements-suite-txt

## Intent

materializa en .github/requirements-suite.txt el atom atom-el-modo-local-de-mindmap-abre-el-store-por-sldb-api-y-graph-ui-deja-pron
