---
id: atom-schemaregistry-when
title: SchemaRegistry
five_wh_one_plus: when
tags:
- system:graph_ui
- layer:frontend
- topic:schema
provenance: docs/specs/matrix.graph-ui-views.yml
---

# SchemaRegistry

## Answer

SchemaRegistry is used during startup and graph loading, when default or fetched node types are registered before the canvas hydrates. It is consulted again whenever the editor needs a renderer, validates a payload, sanitizes input, or checks whether two node types can connect. In other words, it applies both at registration time and throughout interactive editing.
