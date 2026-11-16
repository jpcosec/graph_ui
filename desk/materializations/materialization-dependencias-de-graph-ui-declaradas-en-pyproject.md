---
sldb:
  by: agent
  at: '2026-11-16T16:13:10Z'
  authority: generated
  via: create_document
id: materialization-dependencias-de-graph-ui-declaradas-en-pyproject
title: Dependencias de graph_ui declaradas en pyproject
source_atoms:
- atom-cómo-corre-la-ci-de-graph-ui
target_kind: config
target_identity: pyproject.toml
validation:
- python -m pytest -q tests/test_ci_workflow.py
tags: []
---

# Dependencias de graph_ui declaradas en pyproject

## Intent

pyproject.toml declara structuredLanguageDB y pron, y los extras deskops y test que instala la CI; sin extra notation.
