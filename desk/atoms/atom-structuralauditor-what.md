---
id: atom-structuralauditor-what
title: StructuralAuditor
five_wh_one_plus: what
tags:
- system:graph_ui
- layer:backend
- topic:auditing
provenance: docs/specs/component.graph-ui.yml
---

# StructuralAuditor

## Answer

StructuralAuditor is the backend analyzer that inspects `GraphData` and decorates nodes with lightweight compliance signals. In `src/auditor.py` it exposes `audit()` plus the helper `_decorate_node()`. Its role is not to mutate topology but to compute status flags from graph connectivity.
