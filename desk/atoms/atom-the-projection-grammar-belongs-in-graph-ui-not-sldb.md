---
id: atom-the-projection-grammar-belongs-in-graph-ui-not-sldb
title: The projection grammar belongs in graph_ui, not sldb
five_wh_one_plus: where
tags:
- system:graph_ui
- system:sldb
- topic:projection-grammar
---

# The projection grammar belongs in graph_ui, not sldb

## Answer

graph_ui is the visual graph editor of this ecosystem (active frontend frontends/mindmap over a real SLDB store) and already declares sldb (its sldb.api.graph layer, formerly kgdb) as its data source. The projection grammar belongs in graph_ui as view-layer config (projection views in apps/review-workbench lib/projection-view-store.ts and frontends/mindmap/source/projections.mjs); sldb is a test domain for proving the grammar against real typed-relation data, not the grammar's home.
