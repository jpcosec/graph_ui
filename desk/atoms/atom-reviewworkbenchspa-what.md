---
id: atom-reviewworkbenchspa-what
title: ReviewWorkbenchSPA
five_wh_one_plus: what
tags:
- system:graph_ui
- topic:runtime
- layer:frontend
provenance: docs/specs/deployment.runtime.yml
---

# ReviewWorkbenchSPA

## Answer

ReviewWorkbenchSPA is the browser-side React/Vite application bundle that hosts the graph_ui frontend. It is the delivered frontend artifact in the runtime deployment, and in `src/App.tsx` it mounts the app shell, query client, and the default `HumBodyPage`. This is the interactive surface the browser actually runs.
