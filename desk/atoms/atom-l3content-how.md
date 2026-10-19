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

It works through renderer components registered in the schema registry. Generic content lives in `src/components/content/` (`EntityCard.tsx`, `PropertiesPreview.tsx`, `PropertyEditor.tsx`), default renderers are registered in `src/schema/register-defaults.ts`, and the Antonia flow adds `StepCard.tsx`, chosen for `conversation-step` by `registerModelsFromSchema` in `features/antonia-flow/lib/schema-to-registry.ts`.
