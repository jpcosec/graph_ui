# Feature: Projection Grammar

## Kind

feature

## Status

open

## Problem

graph_ui has a working, domain-agnostic interactive graph editor but no way to define *which slice of a graph* to look at, other than hand-building a new L1 adapter (Match, CV) or a new hardcoded lens (HUM's five presets in `apps/review-workbench/src/features/hum-body/lib/presets.ts`). Every new "view" today means writing code.

This came out of a design conversation while debugging an unrelated tool (`sldb`'s AST tree viewer, rendered by `spec2viz`). `sldb` is a **test domain** for this capability, not its home — graph_ui already declares itself "domain-agnostic" and already lists kgdb as its data source (`desk/atoms/atom-graph-ui.md`: "kgdb supplies the graph data it visualizes").

## Desired Outcome

A **sidebar-driven, savable, cross-database projection grammar** sitting between typed graph data (kgdb) and the rendering engine (graph_ui's L2 canvas / spec2viz's renderer registry). It lets an operator choose *which nodes*, *which relation types*, *how each is drawn*, and *which layout strategy* to view a graph through — as a reusable, named config, not a one-off hand-built page.

Stated as four points:

1. **Nodes and relations are both filterable.** Filtering, not visual encoding, is the primary mechanism.
   1.1. Encoding (color/stroke/shape per relation type) is secondary — a way to *see* what's filtered in, not a substitute for filtering.
   1.2. Relation-type modeling itself is out of scope here — it's owned by other libraries (kgdb's `Edge.relation_type`). This layer consumes that model, doesn't define it.
   1.3. Coverage doesn't need to be complete. One or two relation types filtered and encoded *well* beats ten done shallowly.
2. **Layout should express architecture style, not be generic.** A ring/hexagonal architecture should visually separate phases connected only through interfaces; a layered architecture should show ordered hierarchy. This is the render engine's job, not something hardcoded per view.
   2.3. End goal: a graph built from clean, well-structured code should make its own architectural logic legible at a glance — without reading every node — *if* the code actually respects that structure. The visualization becomes evidence for or against architectural compliance.

Additional constraints:

- **Node filtering matters as much as relation filtering** — not just "which edges show" but "which nodes are even in view."
- **The projection config is a grammar, not a set of pages.** Compare to spec2viz's `CatalogLoader`/`vistas.yml` (a static catalog of pre-rendered files) or graph_ui's HUM lenses (five hand-built, hardcoded presets) — both are "vistas ya hechas." The ask is the opposite: a live, composable filter+encoding config, controllable from the sidebar, savable and re-applicable across different graph databases.
- **The render engine's architecture-style mapping is its own concern**, decoupled from the projection grammar and from any one dataset. Swapping the engine (or its layout strategy) should not require redefining the grammar.

## Questions

- Does the projection grammar live inside graph_ui's Python backend (`src/`), inside kgdb itself (extending `StructuredQuery`), or as a new standalone layer between the two?
- Should the "architecture style → layout" mapping live in graph_ui's L2 (next to the existing ELK hook) or in a new spec2viz renderer?
- How do saved views travel "across different databases" concretely — same view JSON pointed at a different kgdb instance, or same view *shape* re-authored per instance?

See `desk/drawer/features/feature-projection-grammar-gap-analysis.md` for what exists today and `desk/drawer/PROJECTION_GRAMMAR_SPEC.md` for the technical proposal.
