---
id: atom-vitedevserver-how_not
title: ViteDevServer
five_wh_one_plus: how_not
tags:
- system:graph_ui
- topic:runtime
- layer:runtime
provenance: docs/specs/deployment.runtime.yml
---

# ViteDevServer

## Answer

ViteDevServer must not be confused with the graph data source or with persistence. Serving the SPA does not mean edits are being written anywhere durable, and it should not be described as if it replaced kgdb. It is also not the production architecture; it is the local development host.
