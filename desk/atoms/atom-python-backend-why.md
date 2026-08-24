---
id: atom-python-backend-why
title: Python Backend
five_wh_one_plus: why
tags:
- system:graph_ui
- layer:backend
- topic:architecture
provenance: docs/specs/component.graph-ui.yml
---

# Python Backend

## Answer

The Python Backend exists to keep graph_ui's core contract and graph-manipulation logic out of the React rendering layer. It gives the project one canonical `GraphData` shape plus backend utilities for editing, auditing, loading fixtures, and adapting kgdb snapshots. That separation lets frontend surfaces consume prepared graph data instead of reimplementing these concerns.
