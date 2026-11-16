---
sldb:
  by: agent
  at: '2026-11-16T16:12:54Z'
  authority: generated
  via: create_document
id: materialization-pilotos-de-notación-como-fixtures-propios-de-graph-ui
title: Pilotos de notación como fixtures propios de graph_ui
source_atoms:
- atom-la-vista-specs-dibuja-lo-que-resuelve-spec2viz
target_kind: test_fixture
target_identity: tests/fixtures/notation-pilots
validation:
- python -m pytest -q tests/test_projection_views.py tests/test_mindmap_notation.py
tags: []
---

# Pilotos de notación como fixtures propios de graph_ui

## Intent

Los specs piloto que la vista Specs dibuja en las pruebas viven en graph_ui, copiados de spec2viz 2a218b1, y se sincronizan con sldb notations sync.
