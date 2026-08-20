# Feature: Projection Grammar — Gap Analysis

## Kind

feature

## Status

open

## Problem

Before building the projection grammar (`feature-projection-grammar-vision.md`), it's worth knowing exactly what already exists across kgdb, spec2viz, deskops, and graph_ui, so the work integrates instead of duplicating. Every claim below is a direct code read, not a guess.

## Findings

**Typed relations — data model.** kgdb's `Edge.relation_type` (`kgdb/src/kgdb/contracts/base.py:11-28`) is an open vocabulary token, one per edge — the right shape. kgdb's `StructuredQuery` (`kgdb/src/kgdb/query/language.py:10-46`) filters nodes by facet via `FacetFilter` and scopes by topology via `GraphScope`, but has **no relation_type filter**. spec2viz's `ComponentEdge.relation` (`spec2viz/ir.py:112-117`) already carries typed relations (`defines`, `imports`, `is_kind`) from AST generators, but `graph_html.py`'s `_build_edges` (lines 78-86) dumps every edge into the same bucket regardless of type — no filter, no visual distinction. deskops' `DeclaredGraphEdge.role` (`deskops/graph/extract_edges.py:17,29-42`) is a working reference example of typed-relation extraction. graph_ui's Python `UIEdge.relation_type` (`src/contracts/graph_data.py:49-61`) is a third, unconnected shape — its docstring claims "matches node_id in kgdb" but nothing in `src/` actually imports or queries kgdb. graph_ui's TS `ASTEdge.data.relationType` (`spec.md` §3) is a fourth, different shape again.

**Net: three independent node/edge contracts exist (kgdb, graph_ui-Python, graph_ui-TS), none reconciled.**

**Node filtering.** kgdb's `FacetFilter` is real and working. graph_ui's TS `FiltersSection` is spec'd (text search, relation-type toggle, attribute filter, neighbors-only) but `reconstruction.md`'s gap table lists "Neighbors-only filter mode" as not started. graph_ui's Python `GraphProvider.load_fixture()` returns the whole fixture unfiltered — no filter concept at all.

**Saved / reusable projection.** kgdb queries are file-based JSON only, no named/persisted view registry. deskops' `graph trace` CLI is explicitly stubbed for this: `"graph trace grammar added; implementation deferred."` (`deskops/cli/main.py:176`) — someone already anticipated needing exactly this and left it unbuilt. spec2viz's `CatalogLoader`/`vistas.yml` composes references to already-rendered files into a static index (`vistas.yml` is explicitly marked legacy — `_load_legacy_vistas`). graph_ui's HUM lenses (`presets.ts:29-153`) are five fixed, hand-built modes (structure/body/routine/trace/compare) with hardcoded hero copy and layout per mode — a catalog of pre-built views, the pattern to move away from, not extend.

**Net: nothing matching "savable, sidebar-driven, cross-database projection" exists anywhere yet.** This is the one piece that's genuinely new scope.

**Pluggable rendering / architecture-style layout.** spec2viz's `RENDERER_MAP` (`spec2viz/renderers/__init__.py:19-28`) is a real, working name→class registry — swap renderer, same IR. graph_ui's L2 ELK hook (`use-graph-layout.ts`, per `spec.md` §4.5) runs one hardwired algorithm, no per-style choice. No code anywhere maps "rings/hexagonal" or "layered" to a layout algorithm or constraint set. Worth reusing: `docs/architecture/linting.md`'s own "Next step" section already proposed *declare the layer contract as data → compile it with spec2viz into a diagram and an enforcement artifact → single source of truth* — structurally the same pattern this feature needs, just written for a different problem (L1/L2/L3 boundaries).

**Cross-cutting.** The single biggest structural gap: sldb's own AST never flows through kgdb. Today `sldb AST → spec2viz ComponentIR → graph_html.py`, bypassing kgdb entirely. Meanwhile sldb's *document* layer does export to kgdb (`sldb stores semantic-export --format kgdb`), and deskops also produces kgdb snapshots from its doc-atom domain (`deskops/graph/snapshot.py:50-80`) — kgdb ingestion is proven from other domains, just not from sldb's code-structure domain.

## Priority reading for whoever picks this up

1. `kgdb/src/kgdb/query/language.py` + `executor.py` — the query primitive to extend with relation-type filtering.
2. `spec2viz/renderers/__init__.py` — the renderer plug-in pattern to imitate.
3. `graph_ui/apps/review-workbench/src/features/hum-body/lib/presets.ts` — read this to see the anti-pattern (static lenses) to replace, and to salvage its layout/UX ideas as *presets expressible in the new grammar* later.
4. `graph_ui/src/contracts/graph_data.py` vs `graph_ui/spec.md` §3 (`ASTNode`/`ASTEdge`) — the two contracts to reconcile before building anything new on top.

See `desk/drawer/PROJECTION_GRAMMAR_SPEC.md` for the technical proposal built on these findings.
