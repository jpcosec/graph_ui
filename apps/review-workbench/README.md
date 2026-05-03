# Review Workbench App

TypeScript reconstruction of the reusable graph editor described in `graph_ui/spec.md`.

## Current Focus

This copy is now wired to a dedicated `HumBodyPage` that visualizes:

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
- `scripts/generate-hum-ast.mjs` — extracts the HUM Lisp tree into generated AST fixtures
- `scripts/run-user-flow.mjs` — Playwright-based operator-flow acceptance runner
- `src/features/hum-body/lib/generated-hum-ast.ts` — generated structure data from real `hum/*.lisp`
- `src/features/hum-body/lib/mock-data.ts` — higher-level body/routine/trace overlays layered on top
- `src/features/hum-body/lib/adapter.ts` — HUM -> AST projection
- `user_flows/*.json` — business/operator flows for structure, overlays, editing, and smoke regression
- `src/features/graph-editor/L2-canvas/GraphEditor.tsx` — reusable canvas shell

## Next Work

1. Derive the body/organ/capability projection from the generated Lisp AST instead of the current curated overlay
2. Replace mock traces with parsers for `hum/journal.lisp` and autopoiesis sessions
3. Add persistence semantics for saved HUM projections if this becomes an operator authoring tool
