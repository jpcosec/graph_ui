---
id: atom-staticfixtures-for_whom
title: StaticFixtures
five_wh_one_plus: for_whom
tags:
- system:graph_ui
- topic:data-loading
- layer:runtime
provenance: docs/specs/sequence.data-load.yml
---

# StaticFixtures

## Answer

StaticFixtures serve developers, tests, and any local run of the app that needs graph data without a backend dependency. They also serve the current L1 entry points by giving them something loadable while the kgdb path is still unwired. They are not primarily for operators as a final workflow, because operators need persisted edits against real data, not frozen samples.
