# Review Workbench App

TypeScript reconstruction of the reusable graph editor described in `graph_ui/spec.md`.

## Current Focus

This copy is wired to a dedicated `HumBodyPage` that reads the live document
set from `sldb serve` and visualizes the HUM model types present in that store:

1. `Structure` — the HUM Lisp tree as collapsible files and forms
2. `Body` — HUM as an embodied shell
3. `Routine` — canonical paths through that body
4. `Trace` — actual enacted runs
5. `Compare` — canonical vs actual divergence

## Local Commands

- Install: `npm --prefix apps/review-workbench install`
- Dev server: `npm --prefix apps/review-workbench run dev`
- Tests: `npm --prefix apps/review-workbench run test`
- Architecture lint: `npm --prefix apps/review-workbench run lint:architecture`
- Single operator flow: `npm --prefix apps/review-workbench run test:user-flow -- --flow user_flows/hum_structure_flow.json`
- All operator flows: `npm --prefix apps/review-workbench run test:user-flows`
- Build: `npm --prefix apps/review-workbench run build`

## Key Entry Points

- `src/App.tsx` — mounts the HUM body view
- `src/features/hum-body/HumBodyPage.tsx` — HUM-specific L1 page
- `scripts/run-user-flow.mjs` — Playwright-based operator-flow acceptance runner
- `src/features/graph-editor/lib/sldb-provider.ts` — live `/sldb/schema`, `/sldb/graph`, and `/sldb/save` client
- `src/features/hum-body/lib/adapter.ts` — SLDB HUM documents -> AST projection
- `user_flows/*.json` — business/operator flows for projections and smoke regression
- `src/features/graph-editor/L2-canvas/GraphEditor.tsx` — reusable canvas shell

## Next Work

The page renders an honest empty state for every lens whose corresponding HUM
document models are absent from the selected store. Authoring those source
documents remains a responsibility of their owning repository.
