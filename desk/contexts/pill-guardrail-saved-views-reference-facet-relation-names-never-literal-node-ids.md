---
# pill-xxx
id: pill-guardrail-saved-views-reference-facet-relation-names-never-literal-node-ids
# e.g., language:python, library:pydantic
tags:
- topic:projection-grammar
- topic:saved-views
---

# Guardrail: saved views reference facet/relation names, never literal node ids

## What

_Define the context or guardrail this pill carries._

ProjectionView query filters must reference facet names and relation-type names, never literal node ids.

## Why

_Explain why this context matters for safe execution._

A view that hardcodes node ids only re-runs against the exact graph it was authored on. Name-based references are what make a view re-runnable across different kgdb instances (the cross-database requirement).

## When

_Describe when an agent should apply this pill._

When designing or persisting ProjectionView / StructuredQuery / RelationFilter payloads.

## Where

_Name the files, surfaces, or scope this pill applies to._

query.filters[].facet and relations[].relation_types. See SPEC section 3.4.

## How

_Describe the correct way to apply this guidance._

Reference facet names and relation_type names as vocabulary terms; keep views portable.

## How Not

_Describe the shortcut or failure mode to avoid._

Do NOT embed literal node ids or instance-specific identifiers in a saved view.
