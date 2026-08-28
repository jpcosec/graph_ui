---
id: atom-graph-ui-is-a-schema-driven-typed-editor-not-a-generic-canvas
title: graph_ui is a schema-driven typed editor, not a generic canvas
five_wh_one_plus: what
tags:
- system:graph_ui
- topic:typed-editor
- layer:runtime
provenance: null
---

# graph_ui is a schema-driven typed editor, not a generic canvas

## Answer

graph_ui is a typed editor where the node/edge type governs both the data (validation, allowed connections) and the derived UI (renderers per zoom, color, icon, category). It already has @/schema/registry with NodeTypeRegistry covering both axes: payloadSchema (Zod) + validatePayload/sanitizePayload + canConnect/allowedConnections (typed data), and renderers {dot,label,detail} + label/icon/colorToken/defaultSize (UI derived from type). The type governs the dataflow below and generates the UI above.
