---
id: atom-graph-ui
title: Graph UI
five_wh_one_plus: what
tags:
- system:graph_ui
- topic:architecture
provenance: null
---

# Graph UI

## Answer
A domain-agnostic visual graph editor and its data contracts, designed to be embedded in the PhD 2.0 review workbench so operators can inspect, edit, and approve knowledge graphs produced by the pipeline without writing JSON. It consists of a Python backend (`src/`) defining the canonical `GraphData` contract, a structural auditor, an editing engine, and a data provider, plus a TypeScript/React frontend application (`apps/review-workbench/`) that implements the 3-layer graph editor architecture (L1 app layer, L2 canvas layer with ReactFlow, L3 content components).

## Why
The hum-ecosystem pipeline produces semantically rich knowledge graphs (match results, CV structure, module dependencies) that need human review and correction. Before graph_ui, those edits required ad hoc JSON manipulation or internal tooling. graph_ui provides a single, reusable visual surface — used in the review workbench's Match, BaseCvEditor, and KnowledgeGraph pages — so operators can inspect, edit, and approve graph state in a uniform way, regardless of domain. The review-workbench app depends on it; kgdb supplies the graph data it visualizes.

## How it's made
**Python backend** (`src/`): Pydantic v2 models for `GraphData`, `UINode`, `UIEdge` (contracts layer); `GraphEditorEngine` applying CRUD edits with collision checking and cascade delete; `StructuralAuditor` for compliance signals (orphan/terminal/valid); `GraphProvider` loading JSON fixtures. Tests use unittest/pytest via `tests/test_editor.py`, `tests/test_auditor.py`, `tests/test_provider.py`. No pyproject.toml found (imports use relative/package-style paths). **TypeScript/React frontend** (`apps/review-workbench/`): Vite + React 18, TypeScript, @xyflow/react for canvas, zustand for state, zod for validation, elkjs for auto-layout, tailwindcss for styling, Radix UI primitives, TanStack Query for data fetching. Tests use Vitest (unit) and Playwright (user-flow acceptance). Build/test entry points: `npm run dev` / `npm run build` / `npm run test` / `npm run test:user-flows`.

## When
Created around April 2026 as part of the PhD 2.0 ecosystem tooling push. It belongs to the "graph visualization and editing" phase, after the core kgdb and ontology subsystems were already running. The project consolidates two parallel worktrees (`ui-redesign` with the monolithic app, `node-editor` with the clean 3-layer refactor) into a single `apps/review-workbench`. Desk tasks run from 001 (data contract, resolved 2026-05-01) through 006 (safe edit flow, resolved 2026-05-01).

## Purpose
To decouple graph visualization and editing from any specific domain (CVs, requirements, vehicles, ecosystem modules) so that any graph-shaped dataset in the ecosystem can be inspected and modified through a consistent, reusable UI — without each domain writing its own editor.

## Patterns
- **3-layer architecture (L1/L2/L3)**: App layer translates domain data into the editor's AST; Canvas layer owns ReactFlow and interaction; Content layer renders individual nodes/edges. Used in the TypeScript frontend. Evidence: `sources.md` maps files to layers; `apps/review-workbench/src/features/graph-editor/` has L1-app/, L2-canvas/, and components/content/ directories.
- **Contract-first design**: The Python `GraphData`/`UINode`/`UIEdge` Pydantic models define the canonical shape before any rendering code. Evidence: `src/contracts/graph_data.py` and `desk/SPEC.md` (rule 2: every task must reference the canonical contract).
- **Desk-driven task tracking**: Requirements, spec, standards, and tasks live in `desk/` alongside code. Evidence: `desk/tasks/001-006` with Board.md, `desk/SPEC.md`, `desk/STANDARDS.md`.
- **Fixture-backed development**: Real graph-shaped JSON fixtures drive development. Evidence: `desk/fixtures/ecosystem_slice.json` and `src/provider.py` -> `GraphProvider.load_fixture()`.
- **Worktree merge strategy**: Two parallel implementations (ui-redesign, node-editor) are merged via a written reconstruction guide. Evidence: `reconstruction.md` describes Phase 0-3 steps.
- **Python + TypeScript dual stack**: Backend contracts and logic in Python, frontend rendering in TypeScript/React, with no shared code generation between them.

## State of maturity
**Active.** The Python backend (`src/`) is small and complete: data contracts, editor engine, auditor, and provider are all implemented and have corresponding tests. The TypeScript frontend (`apps/review-workbench/`) is more substantial: the 3-layer graph editor architecture is fully ported from node-editor, the HUM Body page is wired, and user-flow acceptance tests exist. The `reconstruction.md` guide implies the merge of the two worktrees is the primary remaining integration work — the app may still be settling from that consolidation. The desk task board (001-006) shows all tasks resolved, suggesting the next phase of work is pending definition.

## Open questions
- Whether the Python backend (`src/`) is actively used at runtime or serves as a reference specification for the TypeScript frontend.
- Whether the two worktrees have been fully merged or if gaps remain between the reconstruction plan and the current state of `apps/review-workbench/`.
- Whether there are any deployment targets or hosting environments for the review-workbench app.
- What the test runner is for the Python tests (no `pyproject.toml` or `setup.py` found; imports use relative try/except patterns suggesting ad hoc invocation).

## References
- `src/contracts/graph_data.py` — canonical graph data contract (Pydantic models)
- `src/contracts/editing.py` — node/edge edit contracts
- `src/editor.py` — graph editing engine
- `src/auditor.py` — structural audit / compliance signals
- `src/provider.py` — fixture loading
- `apps/review-workbench/` — TypeScript/React frontend application
- `apps/review-workbench/README.md` — frontend commands and entry points
- `spec.md` — full 371-line product and architecture specification
- `sources.md` — file mapping across both worktrees
- `reconstruction.md` — 337-line merge guide
- `desk/SPEC.md` — delivery spec (4-step proof)
- `desk/STANDARDS.md` — desk operating rules
- `desk/tasks/Board.md` — task board
- `desk/fixtures/ecosystem_slice.json` — canonical graph fixture
- `changelog.md` — resolved task timeline
