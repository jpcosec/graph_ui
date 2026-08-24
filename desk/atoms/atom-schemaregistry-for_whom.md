---
id: atom-schemaregistry-for_whom
title: SchemaRegistry
five_wh_one_plus: for_whom
tags:
- system:graph_ui
- layer:frontend
- topic:schema
provenance: docs/specs/matrix.graph-ui-views.yml
---

# SchemaRegistry

## Answer

SchemaRegistry is for L1 pages, canvas code, and renderers that need type metadata instead of ad hoc conditionals. `GraphEditorPage` uses it to register schema types, while rendering and connection logic depend on it to resolve components and constraints. It serves both the frontend implementation and the operator indirectly by ensuring node types behave consistently on the canvas.
