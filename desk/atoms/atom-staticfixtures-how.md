---
id: atom-staticfixtures-how
title: StaticFixtures
five_wh_one_plus: how
tags:
- system:graph_ui
- topic:data-loading
- layer:runtime
provenance: docs/specs/sequence.data-load.yml
---

# StaticFixtures

## Answer

In the generic editor path, `mockClient` imports `graph_data.json`, validates it with `validateGraphData`, and returns it after a short delay. In the Antonia path, `buildAntoniaGraph()` in `features/antonia-flow/lib/adapter.ts` builds nodes and edges from the bundled `antonia-fixture.generated.json` when the page runs with `?src=fixture`. Both flows load bundle-local data instead of fetching from an external graph store.
