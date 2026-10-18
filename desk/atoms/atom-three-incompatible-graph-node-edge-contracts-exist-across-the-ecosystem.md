---
id: atom-three-incompatible-graph-node-edge-contracts-exist-across-the-ecosystem
title: Three incompatible graph node/edge contracts exist across the ecosystem
five_wh_one_plus: what
tags:
- system:kgdb
- system:graph_ui
- topic:projection-grammar
---

# Three incompatible graph node/edge contracts exist across the ecosystem

## Answer

sldb.api.graph's Edge/KnowledgeNode (formerly kgdb's), graph_ui's Python UIEdge/UINode (src/contracts/graph_data.py), and graph_ui's TypeScript ASTEdge/ASTNode (stores/types.ts) are three separate, unreconciled shapes for the same concept. graph_ui's snapshot_to_ui_graph (src/adapters/snapshot_adapter.py) maps GraphSnapshot to the Python UINode/UIEdge, and the review-workbench antonia-flow adapter.ts builds ASTNode/ASTEdge from sldb documents, but the three shapes are not reconciled into one. Building the projection grammar on top of this requires picking one canonical shape (sldb.api.graph's) and writing thin adapters for the other two, not adding a fourth.
