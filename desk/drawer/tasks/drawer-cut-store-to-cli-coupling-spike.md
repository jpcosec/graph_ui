---
id: drawer-cut-store-to-cli-coupling-spike
status: drawer
tags:
- workspace:desk
- artifact:task
- source:drawer
depends_on: []
atoms:
- atom-the-store-is-coupled-to-sldb-via-two-store-to-cli-imports-plus-type-and-codec
- atom-store-core-knows-index-query-hash-lock-consumers-inject-type-and-codec
---

# Cut the store-to-cli coupling (extraction spike)

## Rationale

The store is de-facto the ecosystem nucleus (high inbound, low outbound
coupling, ~1857 LOC). The one thing that ties it to sldb-as-owner is a
dependency inversion: the store imports from the CLI. This spike proves the
store CAN be decoupled, cheaply, before any carpentry of moving folders or
introducing Document/Codec.

## Goal

Invert the two `store -> cli` imports so the store receives them by injection
instead of importing them:
- `store/facade.py`: `get_store_context` -> injected context/provider.
- `store/diagnostics.py`: `resolve_model_ref` -> injected callable
  (pattern already exists in `load_runtime_documents`).

## Scope

Import inversion ONLY. No folder move. No Document protocol. No Codec. Lowest
risk, highest signal: does the store still pass its tests with zero
`sldb.cli` imports?

## Done when

- `grep -rn "sldb.cli" store/` returns nothing (outside comments).
- sldb test suite stays green.

## Not in scope (later tasks)

- Abstracting `StructuredNLDoc` to a Document protocol.
- Abstracting `extract_model_data` to a Codec interface.
- Moving `store/` to a standalone package.
- Own exceptions (drop `sldb.core.exceptions`).
