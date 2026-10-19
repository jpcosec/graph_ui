---
# pill-xxx
id: pill-guardrail-kgdb-edge-knowledgenode-is-the-canonical-graph-contract
# e.g., language:python, library:pydantic
tags:
- topic:projection-grammar
- topic:contracts
---

# Guardrail: sldb.api.graph Edge/KnowledgeNode is the canonical graph contract

## What

_Define the context or guardrail this pill carries._

Use sldb.api.graph's Edge/KnowledgeNode (formerly kgdb's) as the single canonical node/edge shape. graph_ui's UINode/UIEdge and TS ASTNode/ASTEdge are adapters/renderers, not new contracts.

## Why

_Explain why this context matters for safe execution._

Three incompatible node/edge contracts already exist (sldb.api.graph, graph_ui-Python, graph_ui-TS). A fourth would deepen the fragmentation the feature exists to fix.

## When

_Describe when an agent should apply this pill._

Whenever adding data-model code for the projection grammar (adapters, filters, views).

## Where

_Name the files, surfaces, or scope this pill applies to._

graph_ui/src/ adapters, sldb.api.graph query types, TS L1 translation. See SPEC section 2.

## How

_Describe the correct way to apply this guidance._

Write additive adapters: snapshot_to_ui_graph(snapshot) -> GraphData (src/adapters/snapshot_adapter.py); reuse UINode.metadata for facet payloads; extend TS ASTNode/ASTEdge only in the render layer.

## How Not

_Describe the shortcut or failure mode to avoid._

Do NOT invent a fourth contract or rewrite sldb.api.graph/graph_ui contracts. If TS needs new fields, add them in the render layer only.
