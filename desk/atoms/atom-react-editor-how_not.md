---
id: atom-react-editor-how_not
title: React Editor
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:frontend
- topic:architecture
provenance: docs/specs/component.graph-ui.yml
---

# React Editor

## Answer

It must not bake domain knowledge into the editor itself; domain shaping belongs in the L1 page/adapter, not in L2/L3. It must not treat its current static fixture (`generated-hum-ast.ts`) as the real data source, nor rely on the no-op `saveGraph` as if edits persist. It must not bypass the schema registry to render arbitrary node types, and it must not persist saved views by embedding literal node ids.
