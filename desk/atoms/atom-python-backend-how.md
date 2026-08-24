---
id: atom-python-backend-how
title: Python Backend
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:backend
- topic:architecture
provenance: docs/specs/component.graph-ui.yml
---

# Python Backend

## Answer

The backend is implemented as small Python modules under `src/`. `contracts/graph_data.py` defines the Pydantic models, `editor.py` applies node and edge edits, `auditor.py` decorates nodes with compliance signals, `provider.py` loads validated fixtures, and `adapters/kgdb_adapter.py` converts `GraphSnapshot` objects into `GraphData`. Together those functions operate over the same contract rather than each module inventing its own graph shape.
