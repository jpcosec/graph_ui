# Add EncodingRule support in graph_ui L2 render layer

ID: task-encoding-rules-l2
Status: deferred
Priority: medium
Depends On: task-kgdb-to-ui-graph-adapter

## Goal

Introduce an `EncodingRule` type in the TS render layer and make `NodeShell`/`FloatingEdge` consult an active rule list instead of a single hardcoded `colorToken` per type, so filtered-in nodes/edges can be visually distinguished.

## Scope

In scope:
- `EncodingRule` TS interface (SPEC section 3.3):
  `when: { relationType?; nodeFacet?; facetValue? }`, `style: { strokeColor?; strokeStyle?: 'solid'|'dashed'; strokeWidth?; nodeColorToken? }`.
- Extend `NodeShell` and `FloatingEdge` to resolve style from the active `EncodingRule[]` (fallback to current default when no rule matches).
- Vitest unit tests for rule matching and fallback.

Out of scope:
- kgdb changes (encoding is presentation, stays out of kgdb).
- Layout strategies (separate task).
- Sidebar UI editor (separate task).

## Contracts and files

- TS render layer per `spec.md` section 3 file list: `NodeShell`, `FloatingEdge`.
- App: `apps/review-workbench/` (Vite + React + @xyflow/react). Tests via Vitest.
- Encoding is secondary to filtering — applies only to what filters already let through.

## Pills

- pill-guardrail-filtering-is-primary-encoding-is-secondary-scope-stays-narrow
- pill-guardrail-encoding-and-layout-live-in-graph-ui-spec2viz-not-in-kgdb

## Atoms

- atom-filtering-is-the-primary-projection-mechanism-encoding-is-secondary
- atom-hardcoded-static-lenses-are-the-anti-pattern-for-projection
- atom-projection-grammar

## Validation

- `npm run test` (Vitest) passes for encoding-rule matching + fallback.
- No hardcoded per-type color remains as the only styling path.

## Done When

- `NodeShell`/`FloatingEdge` render styles from an `EncodingRule[]` with a working default fallback, proven by Vitest tests.
