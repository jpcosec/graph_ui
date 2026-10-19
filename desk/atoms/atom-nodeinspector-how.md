---
id: atom-nodeinspector-how
title: NodeInspector
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:canvas
- topic:editing
provenance: docs/specs/matrix.graph-ui-views.yml
---

# NodeInspector

## Answer

It derives the open node from `focusedNodeId` in the UI store and builds a draft from the node's `payloadValue`. If `getTypedFields(typeId)` returns fields it renders `TypedFieldEditor` per field and `handleTypedSave` calls `sldbProvider.saveDoc(node.id, payload)` and then `graphStore.updateNode` with the new payload, label and properties, surfacing errors as `saveError`. Otherwise `PropertyEditor` edits key-value properties and `handleFallbackSave` rewrites the title and properties in the graph store only; both paths close back to browse mode.
