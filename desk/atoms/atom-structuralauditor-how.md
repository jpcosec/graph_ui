---
id: atom-structuralauditor-how
title: StructuralAuditor
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:backend
- topic:auditing
provenance: docs/specs/component.graph-ui.yml
---

# StructuralAuditor

## Answer

`audit()` builds outgoing and incoming degree maps keyed by node ID, then walks every edge to increment those counters. It then iterates each node and calls `_decorate_node(node, in_degree, out_degree)`, which sets `compliance_status` and a `metadata['signal']` message for orphan and terminal cases. Nodes with outgoing relationships are marked `valid` in the implementation.
