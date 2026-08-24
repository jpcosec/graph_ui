---
id: atom-graphprovider-why
title: GraphProvider
five_wh_one_plus: why
tags:
- system:graph_ui
- layer:backend
- topic:data-loading
provenance: docs/specs/component.graph-ui.yml
---

# GraphProvider

## Answer

It exists so fixture loading and validation have one backend entry point instead of each caller reading JSON files by hand. The grounding states that `provider.py` loads validated fixtures from `desk/fixtures/`. That keeps graph fixture access aligned with the canonical contract.
