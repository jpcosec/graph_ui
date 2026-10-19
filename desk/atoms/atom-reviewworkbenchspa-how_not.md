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

ReviewWorkbenchSPA must not be confused with the graph data source or with the persistence backend. Running the SPA in the browser does not mean canvas edits are saved anywhere durable: there is no whole-graph save, and only `sldbProvider.saveDoc` (per document, from NodeInspector) writes to the store through `sldb serve`. It also should not define graph_ui's identity as if the tool were only one consuming project; the active development is `frontends/mindmap/`.
