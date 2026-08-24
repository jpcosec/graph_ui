---
id: atom-l3content-how_not
title: L3Content
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:frontend
- topic:rendering
provenance: docs/specs/component.graph-ui.yml
---

# L3Content

## Answer

L3Content must not fetch graph data, hydrate stores, or own keyboard and canvas behavior; those belong to L1 and L2. It also must not smuggle domain orchestration into renderer components, because renderers should consume prepared props rather than rebuild graph semantics.
