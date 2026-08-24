---
id: atom-staticfixtures-what
title: StaticFixtures
five_wh_one_plus: what
tags:
- system:graph_ui
- topic:data-loading
- layer:runtime
provenance: docs/specs/sequence.data-load.yml
---

# StaticFixtures

## Answer

StaticFixtures are the frozen graph payloads baked into the frontend bundle and used as the current source of graph_ui data. In practice this means `generated-hum-ast.ts` for the mounted HumBody flow and `graph_data.json` for the mock generic editor path. They are development-time stand-ins for a live backend, not a real source of record.
