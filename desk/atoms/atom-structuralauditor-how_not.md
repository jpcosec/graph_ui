---
id: atom-structuralauditor-how_not
title: StructuralAuditor
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:backend
- topic:auditing
provenance: docs/specs/component.graph-ui.yml
---

# StructuralAuditor

## Answer

StructuralAuditor must not invent a new graph structure or rewrite nodes and edges beyond the compliance decoration described in `src/auditor.py`. It also must not be confused with the editor engine; it analyzes connectivity rather than performing CRUD mutations. Its grounded job is lightweight structural signaling, not full semantic validation of every domain rule.
