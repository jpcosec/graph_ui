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

StaticFixtures are used when `AntoniaFlowPage` runs with `?src=fixture` instead of the default live source. The Antonia fixture is regenerated on demand by `scripts/generate-antonia-fixture.mjs`; the old `hum:sync` fixture step no longer exists (it now generates node types). Their role is current-state bootstrapping and fallback, not target-state persistence.
