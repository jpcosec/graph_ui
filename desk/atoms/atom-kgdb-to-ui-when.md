---
id: atom-kgdb-to-ui-when
title: kgdb_to_ui_graph
five_wh_one_plus: when
tags:
- system:graph_ui
- layer:backend
- topic:adapters
provenance: docs/specs/component.graph-ui.yml
---

# kgdb_to_ui_graph

## Answer

It applies when graph_ui reads data from kgdb and needs to convert that snapshot into its own contract. In the repo's stated target architecture, that is the read path before the editor loads nodes and edges. It is not the save path and not part of the current static fixture flow.
