---
id: atom-viewsection-how
title: ViewSection
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:canvas
- topic:layout
provenance: docs/specs/matrix.graph-ui-views.yml
---

# ViewSection

## Answer

It calls useGraphLayout to run the active layout strategy and reports the result through toasts. It also reads focusedNodeId from the UI store and, when focusing, sets hideNonNeighbors to true and switches editorState to focus.
