---
id: atom-structuralauditor-where
title: StructuralAuditor
five_wh_one_plus: where
tags:
- system:graph_ui
- layer:backend
- topic:auditing
provenance: docs/specs/component.graph-ui.yml
---

# StructuralAuditor

## Answer

StructuralAuditor lives in `src/auditor.py` in the backend layer. That file imports `GraphData` and `UINode`, defines the `StructuralAuditor` class, and implements `audit()` and `_decorate_node()`. Its outputs are written onto node fields and metadata within that backend module.
