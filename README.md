# graph_ui

Domain-agnostic **visual graph editor** embedded in the PhD 2.0 review workbench.
It lets an operator inspect, edit, and approve knowledge graphs produced by the
pipeline — without writing JSON.

graph_ui is the **editing surface** over graph instances. Its companion
`spec2viz` is the **architecture visualization** surface over specs; the two are
distinct and do not overlap (edit-instances vs. render-specs).

## What it is

- React/Vite app under `apps/review-workbench/` — the interactive editor (L1/L2/L3).
- Python contracts/adapters under `src/` — `GraphData` contract, editor engine,
  auditor, provider, and the `kgdb_adapter` bridge.
- deskops workspace under `desk/` — tasks, atoms, pills, rituals governing the work.

## Current focus

- Make the editor **actually edit** (persist changes, not a no-op save).
- Move off hardcoded fixtures and work **directly over kgdb** as the data source.

## Where truth lives

- `desk/atoms/` — durable architecture and policy truths (canonical).
- `desk/tasks/Board.md` — active routed work.
- `docs/` — human-facing materializations of atoms and diagram projections.
- `legacy/` — pre-merge specs and reconstruction notes (historical only).

## Install

Install the Node.js dependencies:

```bash
npm install
```

This will install both runtime and dev dependencies (Vitest, Playwright).

To run Playwright browsers for the first time:

```bash
npx playwright install
```

## Run

```bash
cd apps/review-workbench
npm run dev        # http://127.0.0.1:5173
npm run test       # vitest
npm run test:user-flows   # Playwright acceptance flows
```