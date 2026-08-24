---
id: atom-graphprovider-where
title: GraphProvider
five_wh_one_plus: where
tags:
- system:graph_ui
- layer:backend
- topic:data-loading
provenance: docs/specs/component.graph-ui.yml
---

# GraphProvider

## Answer

GraphProvider lives in `src/provider.py` in the backend layer. It points by default to the repository fixture directory at `desk/fixtures/` and returns `GraphData` instances to callers. The exact load and validation logic is implemented in that single backend file.
