---
id: atom-python-backend-where
title: Python Backend
five_wh_one_plus: where
tags:
- system:graph_ui
- layer:backend
- topic:architecture
provenance: docs/specs/component.graph-ui.yml
---

# Python Backend

## Answer

This backend layer lives under `src/` in the repository root. The exact files are `src/contracts/graph_data.py`, `src/editor.py`, `src/auditor.py`, `src/provider.py`, and `src/adapters/kgdb_adapter.py`. In architecture terms, it is the backend layer that sits beside, not inside, `apps/review-workbench/`.
