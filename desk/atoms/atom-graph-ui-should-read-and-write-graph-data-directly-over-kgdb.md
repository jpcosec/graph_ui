---
# atom-xxx, unique identifier
id: atom-graph-ui-should-read-and-write-graph-data-directly-over-kgdb
# Short, descriptive title
title: graph_ui should read and write graph data directly over kgdb
# what | why | how | how_not | when | where | for_whom
five_wh_one_plus: how
# e.g., system:deskops, topic:templates
tags:
- system:graph_ui
- topic:intent
- topic:kgdb
- topic:data-loading
# Optional URL or path to the authoritative source of this knowledge
provenance: null
---

# graph_ui should read and write graph data directly over kgdb

## Answer

_Answer the selected 5WH1+ question as one stable knowledge unit._

Target architecture: replace the static baked fixture with kgdb as the live data source, both directions. Read path: kgdb GraphSnapshot -> kgdb_to_ui_graph adapter (already exists at src/adapters/kgdb_adapter.py) -> UI node/edge contract consumed by the editor. Write path: operator edits in the canvas -> graphToDomain -> a real saveGraph that writes back to kgdb (currently a no-op). Open design questions to resolve with the kgdb repo before implementation: whether kgdb exposes a server/API or is a Python lib over an on-disk store; the exact write/mutation contract kgdb accepts; and whether edits are whole-snapshot replace or incremental node/edge mutations. graph_ui already owns the read adapter and the projection/RelationFilter machinery; what is missing is a live data provider (replace mockClient/generated-hum-ast) and a persisting save.
