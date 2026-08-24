---
id: atom-reviewworkbenchspa-when
title: ReviewWorkbenchSPA
five_wh_one_plus: when
tags:
- system:graph_ui
- topic:runtime
- layer:frontend
provenance: docs/specs/deployment.runtime.yml
---

# ReviewWorkbenchSPA

## Answer

ReviewWorkbenchSPA is active whenever the browser loads graph_ui during development or other browser-based runs. It comes into play after the dev server serves the bundle and stays active through loading, editing, filtering, and view interaction. It is the continuous frontend runtime around the editor lifecycle, not a one-shot build step.
