---
id: atom-graphprovider-what
title: GraphProvider
five_wh_one_plus: what
tags:
- system:graph_ui
- layer:backend
- topic:data-loading
provenance: docs/specs/component.graph-ui.yml
---

# GraphProvider

## Answer

GraphProvider is the backend loader that reads graph fixtures and validates them into the canonical `GraphData` contract. In `src/provider.py` it exposes `load_fixture()` and `get_ecosystem_slice()`. Its responsibility is to serve fixture-backed graph data from the repository's `desk/fixtures/` area or an explicitly supplied fixtures directory.
