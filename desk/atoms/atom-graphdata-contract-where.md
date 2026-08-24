---
id: atom-graphdata-contract-where
title: GraphData Contract
five_wh_one_plus: where
tags:
- system:graph_ui
- layer:backend
- topic:contracts
provenance: docs/specs/component.graph-ui.yml
---

# GraphData Contract

## Answer

The contract lives in `src/contracts/graph_data.py` in the backend layer. The file defines `Position`, `UINode`, `UIEdge`, and `GraphData`. Other backend modules import those classes from that path when they need the canonical graph shape.
