---
id: atom-humsync-where
title: HumSync
five_wh_one_plus: where
tags:
- system:graph_ui
- topic:runtime
- layer:runtime
provenance: docs/specs/deployment.runtime.yml
---

# HumSync

## Answer

HumSync is implemented at `apps/review-workbench/scripts/generate-hum-ast.mjs`. It is triggered from `apps/review-workbench/package.json` by the `hum:sync` and `dev` scripts, and its runtime role is shown in `docs/specs/deployment.runtime.yml` as the build-time fixture producer. Those are the exact places that currently define it.
