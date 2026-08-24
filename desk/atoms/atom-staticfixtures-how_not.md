---
id: atom-staticfixtures-how_not
title: StaticFixtures
five_wh_one_plus: how_not
tags:
- system:graph_ui
- topic:data-loading
- layer:runtime
provenance: docs/specs/sequence.data-load.yml
---

# StaticFixtures

## Answer

StaticFixtures must not be mistaken for live graph data or described as if they prove end-to-end persistence. They also must not quietly mask that `saveGraph()` does nothing, because a frozen input plus an in-memory draft graph is still not a real editor round-trip. Long-term architecture should not keep them as the primary source once kgdb is available.
