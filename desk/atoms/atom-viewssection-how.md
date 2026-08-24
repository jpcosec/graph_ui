---
id: atom-viewssection-how
title: ViewsSection
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:canvas
- topic:views
provenance: docs/specs/matrix.graph-ui-views.yml
---

# ViewsSection

## Answer

It reads views from ProjectionViewStore, which persists them in localStorage, and tracks the active or selected view in UI state. Saving builds a ProjectionView from the current encoding and layout settings, loading applies those settings back into the UI store, and applying a selected view triggers a layout run before showing a success toast.
