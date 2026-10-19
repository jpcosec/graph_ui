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

In the Antonia path, `buildAntoniaGraph()` in `features/antonia-flow/lib/adapter.ts` builds nodes and edges from the bundled `antonia-fixture.generated.json` when the page runs with `?src=fixture`. The default source is live (`sldb serve`). The fixture is bundle-local data instead of a fetch from an external graph store.
