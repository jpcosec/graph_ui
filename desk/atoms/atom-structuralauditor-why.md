---
id: atom-structuralauditor-why
title: StructuralAuditor
five_wh_one_plus: why
tags:
- system:graph_ui
- layer:backend
- topic:auditing
provenance: docs/specs/component.graph-ui.yml
---

# StructuralAuditor

## Answer

It exists so graph_ui can surface simple structural anomalies without embedding that logic into unrelated code. The grounding states that `StructuralAuditor.audit()` decorates nodes with orphan, terminal, or valid-style signals derived from in-degree and out-degree. That gives the system a backend place for compliance cues.
