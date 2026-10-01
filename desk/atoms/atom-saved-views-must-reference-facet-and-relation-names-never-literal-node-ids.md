---
# atom-xxx, unique identifier
id: atom-saved-views-must-reference-facet-and-relation-names-never-literal-node-ids
# Short, descriptive title
title: Saved views must reference facet and relation names, never literal node ids
# what | why | how | how_not | when | where | for_whom
five_wh_one_plus: how
# e.g., system:deskops, topic:templates
tags:
- system:graph_ui
- system:kgdb
- topic:projection-grammar
# Optional URL or path to the authoritative source of this knowledge
provenance: null
---

# Saved views must reference facet and relation names, never literal node ids

## Answer

For a saved ProjectionView to be re-applicable across different graph databases, its FacetFilter and RelationFilter values must name facets and relation-type vocabulary tokens, never literal node ids from one specific graph instance. This is the concrete mechanism behind applying the same view to sldb's graph, the ecosystem_slice fixture, or any other kgdb-backed graph.
