---
id: atom-graphprovider-when
title: GraphProvider
five_wh_one_plus: when
tags:
- system:graph_ui
- layer:backend
- topic:data-loading
provenance: docs/specs/component.graph-ui.yml
---

# GraphProvider

## Answer

It applies when backend code needs fixture-backed graph data, especially in the repo's current fixture-oriented development flow. The canonical ecosystem slice is retrieved through it by calling `get_ecosystem_slice()`. It is a load-time service, not a render-time or edit-time UI component.
