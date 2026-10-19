---
id: atom-editorlifecycle-how
title: EditorLifecycle
five_wh_one_plus: how
tags:
- system:graph_ui
- topic:editing
- layer:runtime
provenance: docs/specs/state.editor-lifecycle.yml
---

# EditorLifecycle

## Answer

AntoniaFlowPage sets its LoadState to loading, then ready or error after sldbProvider.getSchema/getGraph (or the ?src=fixture fallback) and loadGraph. A double click opens NodeInspector (inspecting); its typed Save calls sldbProvider.saveDoc (saving) and, on success, updates the node in the graph store and closes (ready); on failure it shows the error and keeps the draft (inspecting).
