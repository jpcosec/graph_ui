---
id: atom-graphdata-contract-how
title: GraphData Contract
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:backend
- topic:contracts
provenance: docs/specs/component.graph-ui.yml
---

# GraphData Contract

## Answer

`src/contracts/graph_data.py` implements the contract with Pydantic `BaseModel` classes. `Position` carries `x`, `y`, and optional `z`; `UINode` carries `id`, `label`, `node_type`, `position`, `compliance_status`, and `metadata`; `UIEdge` carries `source`, `target`, `relation_type`, and `metadata`; `GraphData` groups `nodes`, `edges`, and top-level `metadata`. Default factories supply empty collections and a zeroed position where needed.
