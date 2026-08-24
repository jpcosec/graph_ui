---
id: atom-schemaregistry-why
title: SchemaRegistry
five_wh_one_plus: why
tags:
- system:graph_ui
- layer:frontend
- topic:schema
provenance: docs/specs/matrix.graph-ui-views.yml
---

# SchemaRegistry

## Answer

SchemaRegistry exists to keep node-type knowledge centralized and type-driven. The editor needs one place to answer questions such as which renderer a node uses, whether a payload validates, and whether one node type may connect to another, instead of scattering those rules across components. This also lets L1 register schema-driven types dynamically while preserving a consistent contract for the canvas.
