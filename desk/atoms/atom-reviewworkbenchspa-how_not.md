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

ReviewWorkbenchSPA must not be confused with the graph data source or with the persistence backend. Running the SPA in the browser does not mean edits are saved anywhere durable, especially while DataProvider still reads frozen fixtures and `saveGraph()` is a no-op. It also should not define graph_ui's identity as if the tool were only one consuming project.
