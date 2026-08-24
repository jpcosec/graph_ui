---
id: atom-schemaregistry-how_not
title: SchemaRegistry
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:frontend
- topic:schema
provenance: docs/specs/matrix.graph-ui-views.yml
---

# SchemaRegistry

## Answer

SchemaRegistry must not bypass payload validation or allowed-connection rules, because those checks are part of the type contract. It must not silently pretend unknown node types are valid renderable entities; the registry either throws on missing renderers or returns a failed validation result. It also must not hardcode every domain shape into canvas components, because the point of the registry is to keep those definitions centralized and replaceable.
