---
id: atom-react-editor-why
title: React Editor
five_wh_one_plus: why
tags:
- system:graph_ui
- layer:frontend
- topic:architecture
provenance: docs/specs/component.graph-ui.yml
---

# React Editor

## Answer

It exists to give operators a visual, domain-agnostic way to inspect and edit graph data without hand-editing JSON. The hum-ecosystem produces semantically rich graphs (knowledge structures, code ASTs, match results) that need human review and correction; the React Editor is the reusable surface that makes that review possible on a canvas. Being the single frontend keeps editing logic in one place rather than reimplemented per domain.
