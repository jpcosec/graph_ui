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

The `dev` script in `apps/review-workbench/package.json` runs `npm run hum:sync && vite`, where `hum:sync` is `scripts/generate-node-types.mjs` (it regenerates `src/schema/generated-node-types.ts` from `src/schema/models/*.model.json`). Once running, the browser connects to it over HTTP on `127.0.0.1:5173` and loads the review-workbench SPA; `vite.config.js` proxies `/sldb` to `sldb serve` (default `:8787`). This is the server that local interaction and Playwright-style flows talk to during development.
