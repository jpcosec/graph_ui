---
id: atom-l2canvas-how
title: L2Canvas
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:frontend
- topic:canvas
provenance: docs/specs/component.graph-ui.yml
---

# L2Canvas

## Answer

It is implemented by `GraphEditor.tsx` composing `GraphCanvas`, `CanvasSidebar`, `NodeInspector`, `EdgeInspector`, `DeleteConfirm`, and `CommandMenu`, plus hooks such as `useKeyboard`. `GraphCanvas.tsx` hosts `ReactFlow` and runs relation-type filtering, while `L2-canvas/sidebar/`, `hooks/`, `panels/`, `edges/`, `layout/`, and `encoding/` supply the behavior around it.
