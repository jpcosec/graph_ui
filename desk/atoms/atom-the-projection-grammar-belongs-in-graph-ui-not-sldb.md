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

graph_ui is the domain-agnostic visual graph editor in this ecosystem and already declares sldb (its sldb.api.graph layer, formerly kgdb) as its data source. sldb is a test domain for proving the grammar against real typed-relation data (its AST), not the grammar's home.
