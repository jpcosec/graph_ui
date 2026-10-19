---
id: atom-reviewworkbenchspa-how_not
title: ReviewWorkbenchSPA
five_wh_one_plus: how_not
tags:
- system:graph_ui
- topic:runtime
- layer:frontend
provenance: docs/specs/deployment.runtime.yml
---

# ReviewWorkbenchSPA

## Answer

ReviewWorkbenchSPA must not be confused with the graph data source or with the persistence backend. Running the SPA in the browser does not mean edits are saved anywhere durable: `saveGraph()` is a no-op in both providers, and only `sldbProvider.saveDoc` writes to the store through `sldb serve`. It also should not define graph_ui's identity as if the tool were only one consuming project; the active development is `frontends/mindmap/`.
