---
# pill-xxx
id: pill-guardrail-encoding-and-layout-live-in-graph-ui-spec2viz-not-in-kgdb
# e.g., language:python, library:pydantic
tags:
- topic:projection-grammar
- topic:layering
---

# Guardrail: encoding and layout live in graph_ui/spec2viz, not in kgdb

## What

_Define the context or guardrail this pill carries._

Visual encoding and architecture-style layout are presentation concerns and must live in graph_ui's L2 (and the layout registry), not in kgdb's query language.

## Why

_Explain why this context matters for safe execution._

kgdb must stay domain-agnostic and reusable for non-visual consumers (CLI queries). Only node/relation filtering belongs in kgdb (RelationFilter); everything visual stays out.

## When

_Describe when an agent should apply this pill._

When deciding where a projection-grammar change belongs.

## Where

_Name the files, surfaces, or scope this pill applies to._

kgdb query language (filtering only) vs graph_ui L2 EncodingRule + LAYOUT_REGISTRY. See SPEC sections 3.3 and 4.

## How

_Describe the correct way to apply this guidance._

Put RelationFilter in kgdb StructuredQuery; put EncodingRule and LayoutStrategy in graph_ui TS render layer.

## How Not

_Describe the shortcut or failure mode to avoid._

Do NOT add color/stroke/shape or layout-algorithm choices to kgdb query types.
