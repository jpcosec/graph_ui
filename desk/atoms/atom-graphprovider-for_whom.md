---
id: atom-graphprovider-for_whom
title: GraphProvider
five_wh_one_plus: for_whom
tags:
- system:graph_ui
- layer:backend
- topic:data-loading
provenance: docs/specs/component.graph-ui.yml
---

# GraphProvider

## Answer

It is for backend callers and tests that need repository fixtures as validated graph data. It supports current graph_ui development flows that still rely on checked-in fixtures. End operators do not use it directly; it feeds the systems that they interact with.
