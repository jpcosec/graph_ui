---
id: atom-staticfixtures-when
title: StaticFixtures
five_wh_one_plus: when
tags:
- system:graph_ui
- topic:data-loading
- layer:runtime
provenance: docs/specs/sequence.data-load.yml
---

# StaticFixtures

## Answer

StaticFixtures are used in the repository's current runtime, both when the mounted HumBody page builds its initial graph and when the mock generic editor path reads `graph_data.json`. They also participate at build time when the generated HUM AST file is refreshed or, today, left frozen by the broken sync step. Their role is therefore current-state bootstrapping, not target-state persistence.
