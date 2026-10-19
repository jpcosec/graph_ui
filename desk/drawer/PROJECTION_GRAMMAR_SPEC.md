# Projection Grammar — Technical Specification

Companion to `desk/drawer/features/feature-projection-grammar-vision.md` (why). This document says
*what to build*, against the architecture of 2026-10-19. Decided by the coordinator (delegated by the
owner) on 2026-10-19; it replaces the 2026-08 draft, written when kgdb was a separate project.

---

## 1. Problem

review-workbench (`apps/review-workbench`, main page `AntoniaFlowPage`) draws whatever graph its page
loads. Choosing *which slice of a store* to look at — which nodes, which relations, which layout —
means writing code. The ask: make that slice a **view**, a document of the store that the sidebar
edits and saves, and that runs against any store.

## 2. Who owns what

| Piece | Owner | Where |
|---|---|---|
| Typed graph (nodes, relations, query) | sldb | `sldb.api.graph` (formerly kgdb): `StructuredQuery`, `FacetFilter`, `RelationFilter`, `execute_query` |
| `where` predicates over a payload | sldb | `sldb.api.where.where_matches` (the grammar of `sldb find --where`) |
| Visual vocabulary (notations, glyphs, links, layout kind) | spec2viz (decision D3, `docs/representacion/plan-de-cierre.md`) | `spec2viz.sldb_models`: `NotationDoc`, `GlyphDoc`, `LinkDoc` |
| **View model** (`ViewDoc`) | spec2viz, next to `NotationDoc` | `spec2viz.sldb_models.ViewDoc` (task a) |
| View evaluation, sidebar, saving, layout by style | graph_ui | `frontends/mindmap` server + `apps/review-workbench` (tasks b, c) |

graph_ui does not define relation types or drawing rules; it evaluates and lays out.

## 3. The view model: `ViewDoc` (spec2viz)

A document `ViewDoc:<name>` with:

| Field | Type | Meaning |
|---|---|---|
| `id`, `name` | str | the view's name |
| `title` | str | human label |
| `nodes` | list of `{model, where}` | which documents are in the view: union of the entries; `where` in the `sldb find --where` grammar, empty matches all of the model; an empty list means every document |
| `relations` | list[str] | relation-type names kept between those nodes; empty = all |
| `direction` | `both` \| `outgoing` \| `incoming` | as `sldb.api.graph.RelationFilter.direction` |
| `notation` | str | optional `NotationDoc:<name>`; its `layout` gives the layout style |
| `layout` | dict | optional override of the notation's `layout` (same shape) |
| `description` | str | what the view is for |

`__references__ = ["notation"]`. **Portability**: a view names models, relation types and a notation,
never a node id or a store path, so the same `ViewDoc` evaluates against any store that has those
models and relations.

## 4. Evaluation (graph_ui, server side)

`evaluate_view(store, view)` in the graph_ui Python package (`frontends/mindmap`), with sldb's API only:

1. Node set: for each `nodes` entry, the documents of `model` (`sldb.api.graph` nodes whose
   `semantics.model` is that model) whose payload satisfies `where` (`where_matches`). Union.
2. Edge set: `execute_query` with `RelationFilter(relation_types, direction)` over those nodes, keeping
   only edges whose two ends are in the node set.
3. Result: `{view, nodes: [{id, model, title, payload}], edges: [{source, target, relation_type}], layout}`.

HTTP, on the graph_ui server: `GET /api/views` (the store's `ViewDoc`s), `GET /api/views/evaluate?view=
ViewDoc:<name>[&store=<path to a .sldb>]` (default: the server's store; any store can be named) and
`POST /api/views/save` (writes the `ViewDoc` through sldb). review-workbench reaches them through its
dev proxy (`/api`), next to `/sldb`.

## 5. UI (graph_ui, review-workbench)

The sidebar's `ViewsSection` lists the store's views, loads one (evaluate → `loadGraph`) and saves the
current one as a `ViewDoc` (no more localStorage `ProjectionView`). `FiltersSection` edits the view's
`nodes` (model + where) and `relations`. Encoding rules stay a client-side presentation detail.

## 6. Layout by architecture style (graph_ui)

The view's layout (`ViewDoc.layout`, else its notation's `layout`) carries `kind: graph` and
`style`: `layered` (ordered hierarchy) or `rings` (concentric layers joined through interfaces).
`style` selects the ELK strategy in `L2-canvas/layout/layout-strategies.ts` (`elk-layered`,
`elk-rings`); `rings` reads the ring of each node from a payload field named in
`layout.ring_field`. No other strategies in this pass.

## 7. Tasks

- (a) `ViewDoc` in spec2viz, next to `NotationDoc` — via spec2viz's inbox.
- (b) evaluation + sidebar filters + saving in graph_ui, with e2e.
- (c) layout by style from the notation's `layout` + the ELK hook, with e2e.

## 8. Non-goals

No general query language beyond model + `where` + relation types + direction; no multi-user
permissions on views; no strategies beyond `layered` and `rings`; no drawing rules in graph_ui.
