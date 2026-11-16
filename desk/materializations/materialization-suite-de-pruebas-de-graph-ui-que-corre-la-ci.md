---
sldb:
  by: agent
  at: '2026-11-16T16:13:03Z'
  authority: generated
  via: create_document
id: materialization-suite-de-pruebas-de-graph-ui-que-corre-la-ci
title: Suite de pruebas de graph_ui que corre la CI
source_atoms:
- atom-cómo-corre-la-ci-de-graph-ui
target_kind: test_suite
target_identity: tests
validation:
- python -m pytest -q tests/test_ci_workflow.py
tags: []
---

# Suite de pruebas de graph_ui que corre la CI

## Intent

tests/ es lo que corren los jobs mindmap (pytest sin e2e_* y node --test) y e2e (pytest tests/e2e_*.py) de la CI.
