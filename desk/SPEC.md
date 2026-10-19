# Graph UI Delivery Spec

`graph_ui` is the visual editor of an SLDB knowledge base: it reads and writes a
real `.sldb` store and never invents semantics that do not live in SLDB.

---

## Where it stands (2026-10-18)

- Active development: `frontends/mindmap/` (stdlib `serve.py`, React/htm by CDN),
  addressed as `/{facet}/{view}`, over a real store, locally or through
  `sldb serve` (`GRAPH_UI_BACKEND=remote`).
- `apps/review-workbench/` (React/Vite) is maintained: it mounts
  `AntoniaFlowPage` over `sldb serve` (`/sldb/*`).
- The graph layer is `sldb.api.graph` (formerly kgdb); `src/adapters/snapshot_adapter.py`
  adapts its snapshot to the UI contract.

The first delivery slice (real graph data, reusable editor, one semantic signal,
one safe edit) closed with tasks 001-006, retired in 4b7ec60..13717d7.

## Open product decision

Which page is review-workbench's L1 (`GraphEditorPage` or `AntoniaFlowPage`), and
with it the projection grammar in the drawer: pending with the owner.
