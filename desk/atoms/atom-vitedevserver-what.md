---
id: atom-vitedevserver-what
title: ViteDevServer
five_wh_one_plus: what
tags:
- system:graph_ui
- topic:runtime
- layer:runtime
provenance: docs/specs/deployment.runtime.yml
---

# ViteDevServer

## Answer

ViteDevServer is the local development server that serves the review-workbench frontend for graph_ui. In the deployment spec it is the frontend artifact listening on `:5173` and delivering the SPA over HTTP. It is a development-time runtime host, not a graph backend.
