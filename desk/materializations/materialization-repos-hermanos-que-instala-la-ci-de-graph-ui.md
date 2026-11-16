---
sldb:
  by: agent
  at: '2026-11-16T16:13:20Z'
  authority: generated
  via: create_document
id: materialization-repos-hermanos-que-instala-la-ci-de-graph-ui
title: Repos hermanos que instala la CI de graph_ui
source_atoms:
- atom-cómo-corre-la-ci-de-graph-ui
target_kind: config
target_identity: .github/requirements-suite.txt
validation:
- python -m pytest -q tests/test_ci_workflow.py
tags: []
---

# Repos hermanos que instala la CI de graph_ui

## Intent

requirements-suite.txt instala sldb, pron y deskops desde sus ramas principales en git; spec2viz no.
