# Add RelationFilter to kgdb StructuredQuery

ID: task-relationfilter-in-kgdb-query
Status: deferred
Priority: high
Depends On: none

## Goal

Add an additive `RelationFilter` to kgdb's `StructuredQuery` and one executor branch that filters edges by `relation_type` membership and direction, with tests, keeping kgdb domain-agnostic (no visual concepts).

## Scope

In scope:
- New `RelationFilter` model in `kgdb/src/kgdb/query/language.py`:
  `relation_types: list[VocabularyTerm]` (allow-list, empty = all), `direction: Literal["outgoing","incoming","both"] = "both"`.
- Add `relations: list[RelationFilter] = Field(default_factory=list)` to `StructuredQuery`.
- One new branch in `kgdb/src/kgdb/query/executor.py`: after resolving the node set, filter the edge set by `relation_type in relation_types` and by direction.
- Tests in `kgdb/tests/` covering allow-list, empty=all, and each direction.

Out of scope:
- Encoding, layout, saved views (later tasks).
- Any visual/presentation concept in kgdb.

## Contracts and files

- `kgdb/src/kgdb/query/language.py` (`FacetFilter`, `GraphScope`, `StructuredQuery`).
- `kgdb/src/kgdb/query/executor.py` — READ IN FULL before editing (NetworkX-backed traversal); the SPEC's shape is proposed but unverified against executor internals (SPEC section 7 risk).
- Reference example of typed-relation handling: `deskops/graph/extract_edges.py`.

## Pills

- pill-guardrail-filtering-is-primary-encoding-is-secondary-scope-stays-narrow
- pill-guardrail-encoding-and-layout-live-in-graph-ui-spec2viz-not-in-kgdb

## Atoms

- atom-kgdb-s-query-language-has-no-relation-type-filter-yet
- atom-filtering-is-the-primary-projection-mechanism-encoding-is-secondary
- atom-projection-grammar

## Validation

- kgdb test suite passes (`pytest` in kgdb).
- New tests prove allow-list, empty=all, and direction semantics.
- `git diff` in kgdb shows only `language.py`, `executor.py`, and new tests; no visual concepts added.

## Done When

- A `StructuredQuery` with a `RelationFilter` returns only edges of the allowed relation types and direction, proven by tests, with kgdb still visual-free.
