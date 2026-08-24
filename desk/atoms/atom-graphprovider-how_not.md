---
id: atom-graphprovider-how_not
title: GraphProvider
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:backend
- topic:data-loading
provenance: docs/specs/component.graph-ui.yml
---

# GraphProvider

## Answer

GraphProvider must not bypass validation by returning raw JSON text or unvalidated dicts. It also must not guess missing fixture paths silently, because `load_fixture()` explicitly raises `FileNotFoundError` when the target file does not exist. Its grounded behavior is validated fixture loading, not live kgdb I/O.
