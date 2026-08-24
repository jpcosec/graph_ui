---
id: atom-graphdata-contract-what
title: GraphData Contract
five_wh_one_plus: what
tags:
- system:graph_ui
- layer:backend
- topic:contracts
provenance: docs/specs/component.graph-ui.yml
---

# GraphData Contract

## Answer

The GraphData Contract is the canonical Python data model that describes a graph slice for graph_ui. In `src/contracts/graph_data.py` it is expressed as the `GraphData` top-level model plus `UINode`, `UIEdge`, and `Position`. It defines the backend shape that editing, auditing, fixture loading, and kgdb adaptation all share.
