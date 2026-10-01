---
# atom-xxx, unique identifier
id: atom-kgdb-s-query-language-has-no-relation-type-filter-yet
# Short, descriptive title
title: kgdb's query language has no relation-type filter yet
# what | why | how | how_not | when | where | for_whom
five_wh_one_plus: what
# e.g., system:deskops, topic:templates
tags:
- system:kgdb
- layer:query
- topic:projection-grammar
# Optional URL or path to the authoritative source of this knowledge
provenance: null
---

# kgdb's query language has no relation-type filter yet

## Answer

kgdb.StructuredQuery (kgdb/src/kgdb/query/language.py:10-46) filters nodes by facet via FacetFilter and scopes by graph topology via GraphScope (descendant_of/ancestor_of/node_id_prefix), but has no field to filter edges by relation_type. A RelationFilter must be added before the projection grammar can filter by relation type at the query layer.
