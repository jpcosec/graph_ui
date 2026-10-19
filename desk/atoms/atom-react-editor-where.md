---
id: atom-react-editor-where
title: React Editor
five_wh_one_plus: where
tags:
- system:graph_ui
- layer:frontend
- topic:architecture
provenance: docs/specs/component.graph-ui.yml
---

# React Editor

## Answer

It lives under `apps/review-workbench/src/` in the frontend layer. The shell starts in `src/App.tsx`, which mounts `features/antonia-flow/AntoniaFlowPage.tsx`, which uses `features/graph-editor/L2-canvas/` and content renderers.
