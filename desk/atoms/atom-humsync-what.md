---
id: atom-humsync-what
title: HumSync
five_wh_one_plus: what
tags:
- system:graph_ui
- topic:runtime
- layer:runtime
provenance: docs/specs/deployment.runtime.yml
---

# HumSync

## Answer

HumSync is the build-time step that is supposed to regenerate the HUM AST fixture used by the mounted HumBody page. In this repository it is the `generate-hum-ast.mjs` script run by the `hum:sync` npm script before dev, build, and test commands. Its output is a TypeScript fixture file, not a live backend connection.
