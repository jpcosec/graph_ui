---
id: atom-schemaregistry-what
title: SchemaRegistry
five_wh_one_plus: what
tags:
- system:graph_ui
- layer:frontend
- topic:schema
provenance: docs/specs/matrix.graph-ui-views.yml
---

# SchemaRegistry

## Answer

SchemaRegistry is the frontend node-type registry centered on `NodeTypeRegistry` and `NodeTypeDefinition`. Each registered type supplies a `typeId`, label, icon, category, color token, zod `payloadSchema`, renderers for dot/label/detail zoom levels, default size, and allowed connections. This registry is how the editor knows what a node type is, how to validate it, and how to render it.
