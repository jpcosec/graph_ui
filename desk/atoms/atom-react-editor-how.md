---
id: atom-react-editor-how
title: React Editor
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:frontend
- topic:architecture
provenance: docs/specs/component.graph-ui.yml
---

# React Editor

## Answer

It is built with React 18 and Vite, using `@xyflow/react` (ReactFlow) for the canvas, zustand for state (`graph-store`, `ui-store`), zod for validation, dagre for layout, TanStack Query for data fetching, and Radix UI + tailwind for the shell. `src/App.tsx` mounts a `QueryClientProvider` around `AppShell` and a page (currently `HumBodyPage`). Pages fetch data, register node types in the schema registry, call `loadGraph` on the store, and render the shared `GraphEditor` (L2) component.
