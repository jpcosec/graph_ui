---
id: task-build-kgdb-to-ui-graph-adapter
status: active
summary: ''
tags:
- workspace:desk
- artifact:task
- source:drawer
routine: routine-task-build-kgdb-to-ui-graph-adapter
current_node: checklist-task-build-kgdb-to-ui-graph-adapter-execution-ready
history: []
references: []
depends_on: []
pills:
- desk/contexts/pill-guardrail-kgdb-edge-knowledgenode-is-the-canonical-graph-contract.md
- desk/contexts/pill-guardrail-filtering-is-primary-encoding-is-secondary-scope-stays-narrow.md
files: []
checklists:
- checklist-task-build-kgdb-to-ui-graph-adapter-execution-ready
- checklist-task-build-kgdb-to-ui-graph-adapter-testing-ready
- checklist-task-build-kgdb-to-ui-graph-adapter-closeout-ready
task_type: ''
inherits_from: []
inherit_acceptance_context: false
atoms:
- atom-three-incompatible-graph-node-edge-contracts-exist-across-the-ecosystem
- atom-projection-grammar
- atom-graph-ui
---

# Build kgdb-to-UI graph adapter

## Rationale

_Explain why this task exists or the business driver behind it._

Not provided.

## Goal

_Describe the concrete result this task must produce._

Add an additive `kgdb_to_ui_graph(snapshot: GraphSnapshot) -> GraphData` adapter in `graph_ui/src/` that maps kgdb's canonical `KnowledgeNode`/`Edge` onto graph_ui's existing `UINode`/`UIEdge`, with unit tests, without changing either contract.

## Scope

_State what is in scope and what is out of scope._

In scope:
- New module `graph_ui/src/adapters/kgdb_adapter.py` exposing `kgdb_to_ui_graph`.
- Map `KnowledgeNode` -> `UINode` (carry facet payloads through `UINode.metadata: dict[str, Any]`).
- Map `Edge` (`relation_type`) -> `UIEdge` (`relation_type`).
- Unit tests in `graph_ui/tests/test_kgdb_adapter.py` against a small in-memory kgdb snapshot.

Out of scope:
- Any change to `kgdb.contracts` or `graph_ui/src/contracts/graph_data.py`.
- Relation filtering, encoding, saved views, layout (later tasks).
- A fourth node/edge contract.

## Implementation Path

_Outline the expected implementation route or affected surface._

Promoted from desk/drawer/tasks/task-kgdb-to-ui-graph-adapter.md.

## Validation

_List the checks required before this task can close._

- pytest tests/test_kgdb_adapter.py
- pytest

## Done When

_Name the observable condition that makes the task complete._

kgdb_to_ui_graph round-trips a sample kgdb snapshot into a valid GraphData with facets preserved in metadata, proven by tests, with no contract changes.
