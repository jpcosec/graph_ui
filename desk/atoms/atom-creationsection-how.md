---
id: atom-creationsection-how
title: CreationSection
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:canvas
- topic:creation
provenance: docs/specs/matrix.graph-ui-views.yml
---

# CreationSection

## Answer

It reads all registered node types from the registry and opens a popover command list. When the operator selects a type, it builds a new AST node with a generated id, a random starting position, typeId-driven payload and visual token, then inserts it through graphStore.addElements.
