---
id: atom-kgdb-to-ui-how_not
title: kgdb_to_ui_graph
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:backend
- topic:adapters
provenance: docs/specs/component.graph-ui.yml
---

# kgdb_to_ui_graph

## Answer

kgdb_to_ui_graph must not invent a parallel frontend-only graph shape or drop back to raw kgdb objects after adaptation. It also must not ignore relation types or facet metadata, because the implementation explicitly carries `relation_type`, edge metadata, and multiple node facet dicts into the output. Its grounded role is faithful contract adaptation, not domain-specific rendering behavior.
