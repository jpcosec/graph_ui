---
id: atom-graph-ui-node-types-must-not-be-hand-written-zod-generate-them-from-sldb-models-at-build
title: graph_ui node types must not be hand-written Zod; generate them from sldb models
  at build
five_wh_one_plus: how_not
tags:
- system:graph_ui
- topic:typed-editor
- layer:document-model
provenance: null
---

# graph_ui node types must not be hand-written Zod; generate them from sldb models at build

## Answer

Today node types are hardcoded in src/schema/register-defaults.ts (Zod written by hand, placeholder renderers). This is the gap: the registry must be populated FROM sldb models, not local definitions. The chosen path is BUILD-TIME: export sldb models to a schema/contract that graph_ui consumes to generate NodeTypeDefinition (Zod from Field, allowedConnections from relation fields, colorToken/category from __family__), rather than runtime store reads. This is where 'typed editor' meets 'sldb nucleus': one sldb model -> one generated typed, validated, renderable node.
