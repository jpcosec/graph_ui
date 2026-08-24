---
id: atom-python-backend-when
title: Python Backend
five_wh_one_plus: when
tags:
- system:graph_ui
- layer:backend
- topic:architecture
provenance: docs/specs/component.graph-ui.yml
---

# Python Backend

## Answer

The Python Backend applies whenever graph_ui needs backend graph semantics: when fixtures are loaded, when validated edits are applied, when structural signals are computed, and when a kgdb snapshot is adapted into UI data. In the current repo it is exercised by the Python tests and by scripts or integrations that need a canonical graph contract. It is not tied to a browser render cycle.
