---
id: atom-schemaregistry-how
title: SchemaRegistry
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:frontend
- topic:schema
provenance: docs/specs/matrix.graph-ui-views.yml
---

# SchemaRegistry

## Answer

SchemaRegistry is implemented as a `Map<string, NodeTypeDefinition>` inside `NodeTypeRegistry` with methods such as `register()`, `get()`, `getRenderer()`, `validatePayload()`, `sanitizePayload()`, `canConnect()`, and `getAll()`. `getRenderer()` throws for unknown types, `validatePayload()` uses the registered zod schema or a failing unknown-type schema, and `register-defaults.ts` seeds baseline types like `group`, `simple`, `person`, and `document`. `GraphEditorPage` then registers additional schema-derived definitions so the registry can drive rendering and validation at runtime.
