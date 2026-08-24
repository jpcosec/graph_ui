---
id: atom-humsync-when
title: HumSync
five_wh_one_plus: when
tags:
- system:graph_ui
- topic:runtime
- layer:runtime
provenance: docs/specs/deployment.runtime.yml
---

# HumSync

## Answer

HumSync runs before local dev, builds, and tests whenever the npm scripts invoke `hum:sync`. In deployment terms it is a build-time preparation step that happens before the review-workbench SPA is served to the browser. It does not run on every canvas edit or save.
