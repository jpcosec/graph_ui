---
id: atom-kgdb-to-ui-when
title: snapshot_to_ui_graph
five_wh_one_plus: when
tags:
- system:graph_ui
- layer:backend
- topic:adapters
provenance: docs/specs/component.graph-ui.yml
---

# snapshot_to_ui_graph

## Answer

It applies when graph_ui reads data from an sldb graph snapshot and needs to convert it into its own contract. It is the read path before the editor loads nodes and edges, exercised by `tests/test_snapshot_adapter.py` and by `tests/test_sldb_end_to_end.py`, which builds the snapshot live from the repo's `.sldb`. It is not the save path.
