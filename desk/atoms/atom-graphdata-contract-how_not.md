---
id: atom-graphdata-contract-how_not
title: GraphData Contract
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:backend
- topic:contracts
provenance: docs/specs/component.graph-ui.yml
---

# GraphData Contract

## Answer

The GraphData Contract must not be treated as an ad hoc dict with drifting fields or per-module custom shapes. It also must not absorb React-specific view state, because the grounded backend contract is separate from frontend store state. In this repo it stays a backend Pydantic contract for graph data itself.
