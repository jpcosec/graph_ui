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

In the current HumBody flow, the page builds a graph from mock data that imports `generatedHumAstFiles` and `generatedHumAstForms` from a generated TypeScript module. In the generic editor path, `mockClient` imports `graph_data.json`, validates it with `validateGraphData`, and returns it after a short delay. Both flows load bundle-local data instead of fetching from an external graph store.
