---
# atom-xxx, unique identifier
id: atom-hardcoded-static-lenses-are-the-anti-pattern-for-projection
# Short, descriptive title
title: Hardcoded static lenses are the anti-pattern for projection
# what | why | how | how_not | when | where | for_whom
five_wh_one_plus: how_not
# e.g., system:deskops, topic:templates
tags:
- system:graph_ui
- layer:l2-canvas
- topic:projection-grammar
# Optional URL or path to the authoritative source of this knowledge
provenance: null
---

# Hardcoded static lenses are the anti-pattern for projection

## Answer

_Answer the selected 5WH1+ question as one stable knowledge unit._

graph_ui's HUM feature (apps/review-workbench/src/features/hum-body/lib/presets.ts) ships five fixed view modes (structure/body/routine/trace/compare), each with hardcoded hero copy and layout preset. This is a catalog of pre-built views, not a projection grammar, and is the pattern the projection grammar should replace, not extend — a grammar lets an operator define a new view without writing code.
