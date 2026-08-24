---
id: atom-vitedevserver-when
title: ViteDevServer
five_wh_one_plus: when
tags:
- system:graph_ui
- topic:runtime
- layer:runtime
provenance: docs/specs/deployment.runtime.yml
---

# ViteDevServer

## Answer

ViteDevServer is used during local development and browser-based validation runs. It starts after the `hum:sync` step in the `dev` script and stays relevant while a developer or automated browser is interacting with the app. It is not part of each save transition inside the editor lifecycle.
