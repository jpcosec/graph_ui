# Add layout strategy registry with elk-layered and elk-rings

ID: task-layout-strategy-registry
Status: deferred
Priority: medium
Depends On: task-encoding-rules-l2

## Goal

Introduce a `LAYOUT_REGISTRY` (name -> `LayoutStrategy`) in graph_ui's L2, register the existing ELK layered layout under `elk-layered`, and add a second `elk-rings` (radial) strategy, selected by `ProjectionView.layout_strategy`.

## Scope

In scope:
- `LayoutStrategy` interface + `LAYOUT_REGISTRY: Record<string, LayoutStrategy>` (SPEC section 4.1), mirroring spec2viz's `RENDERER_MAP` (`spec2viz/renderers/__init__.py:19-28`).
- Register existing `use-graph-layout.ts` ELK layout under key `elk-layered` (behavior unchanged, just named).
- Add `elk-rings`: ELK `radial` algorithm; nodes sharing a `ring`/`layer` facet on the same radius; edges only between adjacent rings unless the relation type is config-marked as an "interface" relation.
- Vitest tests for registry selection and elk-rings ring/interface behavior.

Out of scope:
- More than two strategies (vision point 1.3).
- A general architecture-style DSL.

## Risk to resolve first (SPEC section 7)

ELK's radial may not natively support "edges only between adjacent rings unless marked interface". Do a short spike; if ELK config alone is insufficient, post-process ELK output. Record the outcome in the task's evidence before finalizing the design.

## Contracts and files

- `apps/review-workbench/` L2: existing `use-graph-layout.ts` (single hardwired ELK run today).
- Pattern reference: `spec2viz/renderers/__init__.py` `RENDERER_MAP`.
- `ProjectionView.layout_strategy` selects the registry key.

## Pills

- pill-guardrail-encoding-and-layout-live-in-graph-ui-spec2viz-not-in-kgdb
- pill-guardrail-filtering-is-primary-encoding-is-secondary-scope-stays-narrow

## Atoms

- atom-hardcoded-static-lenses-are-the-anti-pattern-for-projection
- atom-projection-grammar

## Validation

- `npm run test` passes for registry selection and elk-rings behavior.
- Spike outcome documented; elk-layered behavior unchanged.

## Done When

- Two named layout strategies are selectable via the registry, elk-rings places rings + honors interface edges, proven by Vitest tests and a recorded spike result.
