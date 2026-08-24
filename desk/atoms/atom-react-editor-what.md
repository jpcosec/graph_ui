---
id: atom-react-editor-what
title: React Editor
five_wh_one_plus: what
tags:
- system:graph_ui
- layer:frontend
- topic:architecture
provenance: docs/specs/component.graph-ui.yml
---

# React Editor

## Answer

The React Editor is the frontend application of graph_ui, located at `apps/review-workbench/`. It is a React 18 + Vite + TypeScript single-page app that renders and edits graph-shaped data on an interactive canvas. It is organized in three layers — L1 (app), L2 (canvas), L3 (content) — and is the human-facing surface through which an operator inspects, edits, and (eventually) persists nodes, edges, and their typed attributes.
