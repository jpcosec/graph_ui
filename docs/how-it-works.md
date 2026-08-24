# How graph_ui works

Materialization of `desk/atoms/`. If this doc and an atom disagree, the atom wins.

## What it is

A reusable visual editor for graph-shaped data: nodes, edges, typed attributes.
The tool is the identity. Any app that embeds it is a downstream consumer, not
part of its definition.

## Architecture

Two stacks:

- **Python** (`src/`) — canonical contracts and logic.
  - `contracts/graph_data.py` — `GraphData`, `UINode`, `UIEdge`.
  - `editor.py` — CRUD edits, collision checks, cascade delete.
  - `auditor.py` — structural signals (orphan / terminal / valid).
  - `provider.py` — loads fixtures.
  - `adapters/kgdb_adapter.py` — `kgdb_to_ui_graph`: kgdb `GraphSnapshot` → UI graph.
- **React/Vite** (`apps/review-workbench/`) — the interactive editor, 3 layers:
  - **L1 app** — fetches data, registers node types, orchestrates.
  - **L2 canvas** — ReactFlow: interaction, layout, sidebar, encoding, views.
  - **L3 content** — renders individual nodes/edges.

## How it loads data (current state)

The default mounted page is `HumBodyPage` (`src/App.tsx`), **not** the generic
editor. Runtime flow:

```
HumBodyPage
  → buildHumViewGraph()        features/hum-body/lib/adapter.ts
  → humBodyModel               features/hum-body/lib/mock-data.ts
  → generated-hum-ast.ts       static TS array baked into the bundle
```

- `npm run hum:sync` (`scripts/generate-hum-ast.mjs`) is meant to regenerate
  `generated-hum-ast.ts` from a hum source tree, but its `repoRoot` resolves to
  `apps/../../../hum`, which does not exist (real source is one level higher).
  It silently falls back to *"keeping existing HUM AST fixture"* → frozen data.

A second, **unmounted** generic path also exists:

```
GraphEditorPage
  → graphDataProvider.getGraph()   features/graph-editor/lib/data-provider.ts
  → mockClient                     src/mock/client.ts
  → src/mock/fixtures/graph_data.json
```

- `graphDataProvider.saveGraph()` is a **no-op** returning `{ok:true}`.

**Net:** today the app neither reads live data nor persists edits. Named views
persist only in `localStorage`.

## Where it's going

- **Editing must persist.** Save has to round-trip to the backing store so a
  reload shows operator changes. See
  `atom-graph-ui-must-actually-edit-and-persist-not-render-read-only`.
- **kgdb as the live source, both directions.** Read via
  `kgdb_to_ui_graph`; write via a real `saveGraph` into kgdb. See
  `atom-graph-ui-should-read-and-write-graph-data-directly-over-kgdb`.

## Relationship to other tools

- **kgdb** — target data source (graph snapshots). One-directional.
- **spec2viz** — separate tool, renders architecture from specs. No overlap:
  graph_ui edits instances, spec2viz renders specs.

## Run

```bash
cd apps/review-workbench
npm run dev              # http://127.0.0.1:5173
npm run test            # vitest
npm run test:user-flows # Playwright acceptance flows
```
