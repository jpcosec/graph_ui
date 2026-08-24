---
id: atom-graphdata-contract-for_whom
title: GraphData Contract
five_wh_one_plus: for_whom
tags:
- system:graph_ui
- layer:backend
- topic:contracts
provenance: docs/specs/component.graph-ui.yml
---

# GraphData Contract

## Answer

It is for backend code inside graph_ui that needs a shared graph model, especially the editor engine, auditor, provider, and kgdb adapter. It also benefits any downstream integration or test that wants validated graph_ui-shaped data. End users never interact with this contract directly.
