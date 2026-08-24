---
id: atom-graphdata-contract-why
title: GraphData Contract
five_wh_one_plus: why
tags:
- system:graph_ui
- layer:backend
- topic:contracts
provenance: docs/specs/component.graph-ui.yml
---

# GraphData Contract

## Answer

This contract exists so graph_ui has one agreed graph shape instead of each subsystem inventing its own node and edge schema. The grounding explicitly identifies `contracts/graph_data.py` as the canonical contract. That common model lets the editor engine, auditor, provider, and kgdb adapter interoperate safely.
