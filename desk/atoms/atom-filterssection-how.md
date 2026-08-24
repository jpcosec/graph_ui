---
id: atom-filterssection-how
title: FiltersSection
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:canvas
- topic:filtering
provenance: docs/specs/matrix.graph-ui-views.yml
---

# FiltersSection

## Answer

It reads edges from the graph store to derive the available relation types, then reads and patches filter state in the UI store. Search text, hidden relation types, attribute filter key and value, and hideNonNeighbors are all updated through setFilter or clearFilters.
