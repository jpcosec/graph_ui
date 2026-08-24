---
id: atom-react-editor-for_whom
title: React Editor
five_wh_one_plus: for_whom
tags:
- system:graph_ui
- layer:frontend
- topic:architecture
provenance: docs/specs/component.graph-ui.yml
---

# React Editor

## Answer

It is for the human operator who needs to inspect and edit graph-shaped data on a canvas. It also serves downstream page modules inside the app, because both `HumBodyPage` and `GraphEditorPage` rely on the same editor surface instead of each building their own interaction stack.
