---
id: atom-graphdata-contract-when
title: GraphData Contract
five_wh_one_plus: when
tags:
- system:graph_ui
- layer:backend
- topic:contracts
provenance: docs/specs/component.graph-ui.yml
---

# GraphData Contract

## Answer

The contract is used whenever graph data is created, validated, transformed, or returned by backend logic. `GraphProvider.load_fixture()` validates JSON into it, `GraphEditorEngine` mutates it, `StructuralAuditor.audit()` decorates it, and `kgdb_to_ui_graph()` produces it from a `GraphSnapshot`. It is therefore active across the whole backend graph lifecycle.
