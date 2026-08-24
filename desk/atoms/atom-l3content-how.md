---
id: atom-l3content-how
title: L3Content
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:frontend
- topic:rendering
provenance: docs/specs/component.graph-ui.yml
---

# L3Content

## Answer

It works through renderer components registered in the schema registry. Generic content lives in `src/components/content/` such as `EntityCard.tsx`, while HUM-specific renderers live in `src/features/hum-body/renderers.tsx` with `HumDot`, `HumLabel`, and `HumCard` chosen through `registerHumNodeTypes` and similar registration flows.
