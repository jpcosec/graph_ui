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

It must not bake domain knowledge into the editor itself; domain shaping belongs in the L1 page/adapter (e.g. `features/antonia-flow/lib/adapter.ts`), not in L2/L3. It must not treat the static fixtures (`mock/fixtures/graph_data.json`, `antonia-fixture.generated.json`) as the real data source, nor rely on the no-op `saveGraph` (in both `graphDataProvider` and `sldbProvider`) as if edits persist; only `saveDoc` writes to the store. It must not bypass the schema registry to render arbitrary node types, and it must not persist saved views by embedding literal node ids.
