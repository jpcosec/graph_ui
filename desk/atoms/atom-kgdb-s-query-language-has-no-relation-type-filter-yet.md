---
id: atom-kgdb-s-query-language-has-no-relation-type-filter-yet
title: sldb.api.graph query language has a relation-type filter (RelationFilter)
five_wh_one_plus: what
tags:
- system:kgdb
- layer:query
- topic:projection-grammar
---

# sldb.api.graph query language has a relation-type filter (RelationFilter)

## Answer

sldb.api.graph's `StructuredQuery` (sldb/src/sldb/store/graph/language/structured_query.py) filters nodes by facet via FacetFilter, scopes by graph topology via GraphScope (descendant_of/ancestor_of/node_id_prefix), and filters edges via `relations: list[RelationFilter]`, where RelationFilter has a `relation_types` allow-list (empty = all) and a `direction` (outgoing/incoming/both). It arrived with the port of kgdb's contracts and query language into sldb (a883015). tests/test_sldb_end_to_end.py in graph_ui queries by relation type with it, so the projection grammar can filter by relation type at the query layer.
