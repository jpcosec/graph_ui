---
id: atom-l1app-when
title: L1App
five_wh_one_plus: when
tags:
- system:graph_ui
- layer:frontend
- topic:orchestration
provenance: docs/specs/component.graph-ui.yml
---

# L1App

## Answer

It runs when a page mounts and whenever the page's data inputs change. In the generic path that means schema/graph query results and dirty-state guards; in the Antonia path it is the one-time load of the live or fixture graph, with loading and error states.
