---
id: atom-graphcanvas-when
title: GraphCanvas
five_wh_one_plus: when
tags:
- system:graph_ui
- layer:canvas
- topic:canvas
provenance: docs/specs/matrix.graph-ui-views.yml
---

# GraphCanvas

## Answer

It runs whenever the editor page is mounted and whenever graph nodes, graph edges, or hidden relation types change. The mapping and filtering happen inside a React effect before the next render.
