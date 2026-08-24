---
id: atom-humsync-how_not
title: HumSync
five_wh_one_plus: how_not
tags:
- system:graph_ui
- topic:runtime
- layer:runtime
provenance: docs/specs/deployment.runtime.yml
---

# HumSync

## Answer

HumSync must not be treated as if it were a live data integration, because it only produces a build-time fixture file. It also must not silently remain broken long-term while the project speaks as if the fixture reflects current hum sources. Keeping the frozen file without surfacing the path failure is exactly the stale-data behavior the tool needs to outgrow.
