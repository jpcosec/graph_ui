---
id: atom-actionssection-how_not
title: ActionsSection
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:canvas
- topic:editing
provenance: docs/specs/matrix.graph-ui-views.yml
---

# ActionsSection

## Answer

ActionsSection does not implement persistence itself; it only invokes the save callback supplied by the parent editor shell. It also does not delete immediately when nodes are selected, because node and edge deletion route through the delete-confirm state instead of bypassing confirmation.
