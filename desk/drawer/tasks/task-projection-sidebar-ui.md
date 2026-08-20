# Add EncodingSection and ViewsSection to the sidebar

ID: task-projection-sidebar-ui
Status: deferred
Priority: low
Depends On: task-projectionview-store, task-encoding-rules-l2, task-layout-strategy-registry

## Goal

Extend the existing sidebar with two sections: `EncodingSection` (edit the `EncodingRule` list) and `ViewsSection` (load/save/list `ProjectionView`s), sitting alongside the existing `FiltersSection`/`ViewSection`.

## Scope

In scope:
- `EncodingSection`: rule-list editor over `EncodingRule[]` (from task-encoding-rules-l2).
- `ViewsSection`: load/save/list `ProjectionView`s (via the store from task-projectionview-store) and a "save this as a named view" action.
- Wire relation-type toggles already spec'd in `FiltersSection` to the active query.
- Vitest/Playwright coverage for save -> reload of a named view.

Out of scope:
- New filter model (reuse existing `FiltersSection`).
- Multi-tenant/permissions on views.

## Contracts and files

- `apps/review-workbench/` sidebar per `spec.md` section 5: existing `FiltersSection`/`ViewSection`; add `EncodingSection`, `ViewsSection`.
- Consumes: `ProjectionViewStore` (task-projectionview-store), `EncodingRule` (task-encoding-rules-l2), `LAYOUT_REGISTRY` (task-layout-strategy-registry).

## Pills

- pill-guardrail-saved-views-reference-facet-relation-names-never-literal-node-ids
- pill-guardrail-filtering-is-primary-encoding-is-secondary-scope-stays-narrow

## Atoms

- atom-saved-views-must-reference-facet-and-relation-names-never-literal-node-ids
- atom-hardcoded-static-lenses-are-the-anti-pattern-for-projection
- atom-projection-grammar

## Validation

- `npm run test` and/or `npm run test:user-flows`: author a view, save it, reload it from the sidebar.

## Done When

- An operator can build a filter+encoding+layout config in the sidebar, save it as a named view, and reload it, proven by a user-flow test.
