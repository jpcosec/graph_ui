# Add ProjectionView model and file-based ProjectionViewStore

ID: task-projectionview-store
Status: deferred
Priority: medium
Depends On: task-relationfilter-in-kgdb-query

## Goal

Add a `ProjectionView` model and a small file-based `ProjectionViewStore` (`load`, `save`, `list`) that persists named views as JSON under `graph_ui/desk/fixtures/views/`, referencing facet/relation names only.

## Scope

In scope:
- `ProjectionView` model (SPEC section 3.4):
  `view_id, label, query: StructuredQuery, encoding: list[EncodingRule], layout_strategy: str, created_by, created_at`.
  (Mirror `EncodingRule` shape in Python for storage only; the authoritative TS type lands in the encoding task.)
- `ProjectionViewStore` with `load(view_id)`, `save(view)`, `list()` over `graph_ui/desk/fixtures/views/*.json`.
- Portability check: reject/flag views whose `query.filters[].facet` or `relations[].relation_types` contain literal node ids.
- Tests: round-trip save/load/list + portability rejection.

Out of scope:
- UI surface (later task).
- Actual rendering of encoding/layout.

## Contracts and files

- Reuse fixture-file convention from `graph_ui/src/provider.py` (JSON files, no new storage system).
- New store dir: `graph_ui/desk/fixtures/views/`.
- Depends on `StructuredQuery` incl. `RelationFilter` from `task-relationfilter-in-kgdb-query`.

## Pills

- pill-guardrail-saved-views-reference-facet-relation-names-never-literal-node-ids
- pill-guardrail-kgdb-edge-knowledgenode-is-the-canonical-graph-contract

## Atoms

- atom-saved-views-must-reference-facet-and-relation-names-never-literal-node-ids
- atom-hardcoded-static-lenses-are-the-anti-pattern-for-projection
- atom-projection-grammar

## Validation

- `pytest` for store round-trip and portability rejection.
- A saved view JSON contains only facet/relation names, no node ids.

## Done When

- A `ProjectionView` can be saved, listed, and reloaded from disk, and a view containing literal node ids is rejected, proven by tests.
