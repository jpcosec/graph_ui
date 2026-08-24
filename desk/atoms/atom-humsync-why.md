---
id: atom-humsync-why
title: HumSync
five_wh_one_plus: why
tags:
- system:graph_ui
- topic:runtime
- layer:runtime
provenance: docs/specs/deployment.runtime.yml
---

# HumSync

## Answer

HumSync exists so the generated HUM AST fixture can be refreshed from a source tree instead of being maintained by hand. That keeps the HumBody demo data aligned with source files when the sync works. Without it, the app would depend on a manually curated or stale generated fixture.
