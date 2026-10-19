---
id: atom-actionssection-when
title: ActionsSection
five_wh_one_plus: when
tags:
- system:graph_ui
- layer:canvas
- topic:editing
provenance: docs/specs/matrix.graph-ui-views.yml
---

# ActionsSection

## Answer

It is used throughout an editing session whenever the operator wants to reverse or reapply semantic edits, duplicate a node, or remove selected elements. Button enablement follows current store state such as clipboard state, selection state, and undo or redo availability. Saving is not done here; documents are saved from NodeInspector.
