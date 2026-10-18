---
id: atom-kgdb-to-ui-for_whom
title: snapshot_to_ui_graph
five_wh_one_plus: for_whom
tags:
- system:graph_ui
- layer:backend
- topic:adapters
provenance: docs/specs/component.graph-ui.yml
---

# snapshot_to_ui_graph

## Answer

It is for graph_ui backend code or integrations that need to consume sldb graph snapshots through the graph_ui contract. It specifically serves the path from sldb.api.graph into the editor. Operators benefit indirectly because it prepares the graph they would edit, but they do not call it themselves.
