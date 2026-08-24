---
id: atom-graphstore-how
title: GraphStore
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:frontend
- topic:stores
provenance: docs/specs/matrix.graph-ui-views.yml
---

# GraphStore

## Answer

GraphStore is created in `graph-store.ts` with zustand and records semantic actions into `undoStack` and `redoStack`. `updateNode()` and `updateEdge()` merge patches into existing elements, `removeElements()` also removes incident edges, `onConnect()` synthesizes a new `floating` edge with relation type `linked`, and `loadGraph()` resets history while capturing a fresh saved snapshot. Visual-only updates pass `isVisualOnly: true`, so selection, drag positions, pan-like interactions, and similar UI changes update state without producing undoable semantic actions.
