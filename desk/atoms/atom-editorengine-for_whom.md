---
id: atom-editorengine-for_whom
title: GraphEditorEngine
five_wh_one_plus: for_whom
tags:
- system:graph_ui
- layer:backend
- topic:editing
provenance: docs/specs/component.graph-ui.yml
---

# GraphEditorEngine

## Answer

It is for backend callers inside graph_ui that need safe, contract-aware graph mutation. Tests and future persistence/integration code can rely on it to apply edits over `GraphData` consistently. It is not a direct surface for operators; it supports the editor they use.
