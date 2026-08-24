---
id: atom-python-backend-for_whom
title: Python Backend
five_wh_one_plus: for_whom
tags:
- system:graph_ui
- layer:backend
- topic:architecture
provenance: docs/specs/component.graph-ui.yml
---

# Python Backend

## Answer

The immediate consumers are other graph_ui modules and tests that need a canonical graph contract or backend graph operations. It also serves downstream integrations that want to feed graph data into the UI, especially the kgdb adaptation path. It is not authored for end operators directly; it supports the tool that they use.
