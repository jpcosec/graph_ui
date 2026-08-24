---
id: atom-reviewworkbenchspa-how
title: ReviewWorkbenchSPA
five_wh_one_plus: how
tags:
- system:graph_ui
- topic:runtime
- layer:frontend
provenance: docs/specs/deployment.runtime.yml
---

# ReviewWorkbenchSPA

## Answer

The SPA is served by Vite and bootstrapped from `src/App.tsx`, where React creates the root, wraps the app in `QueryClientProvider`, and renders `AppShell` with `HumBodyPage` as the default mounted page. From there the frontend uses its L1, L2, and store layers to load graph data and render interactive graph views. In deployment terms, this is the artifact the browser fetches over HTTP from the dev server.
