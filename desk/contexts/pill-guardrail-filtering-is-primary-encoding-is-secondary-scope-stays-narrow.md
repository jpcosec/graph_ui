---
# pill-xxx
id: pill-guardrail-filtering-is-primary-encoding-is-secondary-scope-stays-narrow
# e.g., language:python, library:pydantic
tags:
- topic:projection-grammar
- topic:filtering
---

# Guardrail: filtering is primary, encoding is secondary, scope stays narrow

## What

_Define the context or guardrail this pill carries._

Filtering (which nodes, which relations) is the primary projection mechanism. Visual encoding (color/stroke/shape) is secondary. Do one or two relation types well before adding breadth.

## Why

_Explain why this context matters for safe execution._

The anti-pattern this feature replaces is hardcoded static lenses. Encoding without filtering just recolors everything; broad shallow coverage repeats the lens mistake.

## When

_Describe when an agent should apply this pill._

When implementing RelationFilter, EncodingRule, or layout strategies.

## Where

_Name the files, surfaces, or scope this pill applies to._

kgdb RelationFilter, graph_ui EncodingRule (L2), LAYOUT_REGISTRY. See SPEC sections 3.2, 3.3, 4.2 and vision point 1.3.

## How

_Describe the correct way to apply this guidance._

Land node+relation filtering first; add encoding as a way to see what filtering let through; ship two relation types / two layout strategies proven end to end.

## How Not

_Describe the shortcut or failure mode to avoid._

Do NOT build a general architecture-style DSL, all layout strategies, or ten shallow relation types in the first pass.
