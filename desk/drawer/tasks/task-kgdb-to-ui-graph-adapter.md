# Build kgdb-to-UI graph adapter

ID: task-kgdb-to-ui-graph-adapter
Status: deferred
Priority: high
Depends On: none

## Goal

Add an additive `kgdb_to_ui_graph(snapshot: GraphSnapshot) -> GraphData` adapter in `graph_ui/src/` that maps kgdb's canonical `KnowledgeNode`/`Edge` onto graph_ui's existing `UINode`/`UIEdge`, with unit tests, without changing either contract.

## Scope

In scope:
- New module `graph_ui/src/adapters/kgdb_adapter.py` exposing `kgdb_to_ui_graph`.
- Map `KnowledgeNode` -> `UINode` (carry facet payloads through `UINode.metadata: dict[str, Any]`).
- Map `Edge` (`relation_type`) -> `UIEdge` (`relation_type`).
- Unit tests in `graph_ui/tests/test_kgdb_adapter.py` against a small in-memory kgdb snapshot.

Out of scope:
- Any change to `kgdb.contracts` or `graph_ui/src/contracts/graph_data.py`.
- Relation filtering, encoding, saved views, layout (later tasks).
- A fourth node/edge contract.

## Contracts and files

- Canonical source: `kgdb/src/kgdb/contracts/base.py` (`KnowledgeNode`, `Edge.relation_type`).
- Snapshot source: `kgdb` `GraphSnapshot` (confirm exact import path in kgdb before coding).
- Target: `graph_ui/src/contracts/graph_data.py` (`GraphData`, `UINode`, `UIEdge`, `UINode.metadata`).
- Adapter is additive per SPEC section 2.

## Pills

- pill-guardrail-kgdb-edge-knowledgenode-is-the-canonical-graph-contract
- pill-guardrail-filtering-is-primary-encoding-is-secondary-scope-stays-narrow

## Atoms

- atom-three-incompatible-graph-node-edge-contracts-exist-across-the-ecosystem
- atom-projection-grammar
- atom-graph-ui

## Validation

- `pytest tests/test_kgdb_adapter.py` passes.
- Full suite still green: `pytest`.
- No edits to kgdb or graph_data contracts (git diff shows only new adapter + test files).

## Done When

- `kgdb_to_ui_graph` round-trips a sample kgdb snapshot into a valid `GraphData` with facets preserved in `metadata`, proven by tests, with no contract changes.
