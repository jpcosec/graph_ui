# Prove projection grammar end to end on the sldb test domain

ID: task-sldb-end-to-end-proof
Status: deferred
Priority: low
Depends On: task-projection-sidebar-ui, task-kgdb-to-ui-graph-adapter

## Goal

Prove the projection grammar end to end using sldb as the test domain: export sldb's AST to kgdb `Edge`/`KnowledgeNode`, then hand-author two `ProjectionView`s (one `imports`, one `defines`) that render distinctly.

## Scope

In scope:
- Extend sldb's AST export to emit kgdb `Edge`/`KnowledgeNode` (new sink; reuse existing `defines`/`imports`/`is_kind` relation types spec2viz generators already emit).
- View 1: filter `relation_type: imports`, encode imports edges one way, layout `elk-layered`.
- View 2: filter `relation_type: defines` (class membership), different encoding, same or different layout.
- One end-to-end test proving both views render distinct slices.

Out of scope:
- Full coverage of sldb's AST.
- All relation types or both layout strategies polished.
- Touching Match/CV product surfaces.

## Contracts and files

- Today sldb AST -> spec2viz `ComponentIR` bypasses kgdb entirely; add a kgdb sink (SPEC section 5, gap analysis section 5).
- Consumes the full stack: adapter, RelationFilter, ProjectionView store, encoding, layout, sidebar.
- sldb is the proving ground, not the destination.

## Pills

- pill-guardrail-kgdb-edge-knowledgenode-is-the-canonical-graph-contract
- pill-guardrail-saved-views-reference-facet-relation-names-never-literal-node-ids
- pill-guardrail-filtering-is-primary-encoding-is-secondary-scope-stays-narrow

## Atoms

- atom-the-projection-grammar-belongs-in-graph-ui-not-sldb
- atom-three-incompatible-graph-node-edge-contracts-exist-across-the-ecosystem
- atom-projection-grammar

## Validation

- sldb AST -> kgdb export produces valid `Edge`/`KnowledgeNode`.
- End-to-end test: two saved views render two distinct slices of the same sldb graph.

## Done When

- Two working `ProjectionView`s over real sldb AST data render distinct slices end to end, proven by a test — the "prove it end to end" milestone.
