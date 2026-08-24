---
id: atom-humsync-how
title: HumSync
five_wh_one_plus: how
tags:
- system:graph_ui
- topic:runtime
- layer:runtime
provenance: docs/specs/deployment.runtime.yml
---

# HumSync

## Answer

`package.json` defines `hum:sync` as `node scripts/generate-hum-ast.mjs`, and the `dev` script runs `npm run hum:sync && vite`. The intended behavior is to locate the hum source tree and rewrite `generated-hum-ast.ts` before the frontend starts. Today its `repoRoot` resolves to `apps/../../../hum`, which does not exist, so it silently keeps the existing frozen fixture instead of regenerating it.
