---
id: atom-kgdb-to-ui-how
title: kgdb_to_ui_graph
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:backend
- topic:adapters
provenance: docs/specs/component.graph-ui.yml
---

# kgdb_to_ui_graph

## Answer

`kgdb_to_ui_graph(snapshot)` builds `GraphData` by mapping each `KnowledgeNode` through `_knowledge_node_to_ui_node()` and by flattening every node edge into `UIEdge(source, target, relation_type, metadata)`. It copies snapshot metadata and adds `snapshot_version` and `snapshot_created_at` at the graph level. Helper functions `_node_label()`, `_compliance_status()`, `_node_metadata()`, and `_facet_dict()` derive labels, compliance status, and normalized metadata from the kgdb facets.
