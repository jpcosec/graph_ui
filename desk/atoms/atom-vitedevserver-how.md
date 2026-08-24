---
id: atom-vitedevserver-how
title: ViteDevServer
five_wh_one_plus: how
tags:
- system:graph_ui
- topic:runtime
- layer:runtime
provenance: docs/specs/deployment.runtime.yml
---

# ViteDevServer

## Answer

The `dev` script in `apps/review-workbench/package.json` runs `npm run hum:sync && vite`, so the server starts only after the fixture sync step is attempted. Once running, the browser connects to it over HTTP and loads the review-workbench SPA. This is the server that local interaction and Playwright-style flows talk to during development.
