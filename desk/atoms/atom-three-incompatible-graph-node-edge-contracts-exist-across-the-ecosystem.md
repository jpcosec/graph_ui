---
# atom-xxx, unique identifier
id: atom-three-incompatible-graph-node-edge-contracts-exist-across-the-ecosystem
# Short, descriptive title
title: Three incompatible graph node/edge contracts exist across the ecosystem
# what | why | how | how_not | when | where | for_whom
five_wh_one_plus: what
# e.g., system:deskops, topic:templates
tags:
- system:kgdb
- system:graph_ui
- topic:projection-grammar
# Optional URL or path to the authoritative source of this knowledge
provenance: null
---

# Three incompatible graph node/edge contracts exist across the ecosystem

## Answer

_Answer the selected 5WH1+ question as one stable knowledge unit._

kgdb's Edge/KnowledgeNode, graph_ui's Python UIEdge/UINode (src/contracts/graph_data.py), and graph_ui's TypeScript ASTEdge/ASTNode (spec.md) are three separate, unreconciled shapes for the same concept. None converts to another today. Building the projection grammar on top of this requires picking one canonical shape (kgdb's) and writing thin adapters for the other two, not adding a fourth.
