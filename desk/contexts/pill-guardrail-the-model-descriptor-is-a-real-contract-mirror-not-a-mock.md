---
# pill-xxx
id: pill-guardrail-the-model-descriptor-is-a-real-contract-mirror-not-a-mock
# e.g., language:python, library:pydantic
tags:
- system:graph_ui
- topic:workflow-guardrail
- layer:document-model
---

# Guardrail: the model descriptor is a real contract mirror, not a mock

## What

_Define the context or guardrail this pill carries._

Clarifies that consuming a checked-in JSON descriptor of a real sldb model (source: gemini_test/kb_agent/models/knowledge/step.py) is legitimate real data, NOT a mock. The descriptor must mirror the real model's fields exactly. It is a deliberate build-time contract boundary, deferring only the live-store read mechanism to a follow-up task.

## Why

_Explain why this context matters for safe execution._

Without this clarification an executor might either (a) wrongly treat the descriptor as a mock to be replaced with fabricated data, or (b) wrongly try to wire a live sldb store read that is explicitly out of scope. Both break the task. The descriptor is the real, verifiable source of truth for the spike.

## When

_Describe when an agent should apply this pill._

Applied whenever a task uses a checked-in descriptor/contract that mirrors an upstream real model while deferring the live wiring to a later task.

## Where

_Name the files, surfaces, or scope this pill applies to._

apps/review-workbench/src/schema/models/*.model.json and the generator that consumes them.

## How

_Describe the correct way to apply this guidance._

Populate the descriptor by faithfully transcribing the real sldb model fields (names, kinds, enums, defaults, relation fields). Verify each field against the real step.py source. The generator then derives everything from this real descriptor.

## How Not

_Describe the shortcut or failure mode to avoid._

Do not invent fields not present in the real model. Do not simplify or omit real fields. Do not substitute a live store read. Do not treat the descriptor as throwaway fake data.
