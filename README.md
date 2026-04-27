# graph_ui

Specification and reconstruction guide for the domain-agnostic visual graph editor built as part of the PhD 2.0 review workbench.

## Documents

| File | What it covers |
|---|---|
| [spec.md](spec.md) | Full product and architecture specification |
| [sources.md](sources.md) | Where each piece lives in the two source worktrees |
| [reconstruction.md](reconstruction.md) | Step-by-step guide to rebuild the complete system |
| [pitfalls.md](pitfalls.md) | Architectural pitfalls and how to avoid them |

## The short version

We were building a single, reusable graph editor component that can render and edit any knowledge graph regardless of domain (CVs, job requirements, documents, vehicles — anything). The editor is used inside the PhD pipeline review workbench to let the operator inspect and edit match results and CV structure visually.

Two worktrees accumulated parallel work toward this goal:

- **`ui-redesign`** — the full review-workbench application with all pages and features, but a monolithic 2,950-line `KnowledgeGraph.tsx` God Component doing everything.
- **`node-editor`** — a focused refactor that replaced `KnowledgeGraph.tsx` with a clean 3-layer architecture (L1/L2/L3), implemented and tested, but only wired to a toy vehicles dataset, not yet integrated back into the full app.

The task is to merge both: take node-editor's architecture and wire it into ui-redesign's full feature set.
