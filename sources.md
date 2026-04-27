# Sources — Where each piece lives

Both worktrees live under:
```
~/proyectos/phd-workspaces/dev01/.worktrees/
├── ui-redesign/      — full review-workbench app, monolithic graph component
└── node-editor/      — 3-layer graph editor refactor, toy dataset only
```

All paths below are relative to each worktree root.

---

## node-editor — what is implemented and clean

This worktree has the 3-layer architecture fully implemented and tested. Use it as the source of truth for the editor subsystem.

### Stores (authoritative state)

| File | What it contains |
|---|---|
| `apps/review-workbench/src/stores/types.ts` | `ASTNode`, `ASTEdge`, `SemanticAction`, `NodePayload`, `NodeData` type definitions |
| `apps/review-workbench/src/stores/graph-store.ts` | Zustand graph store: nodes, edges, undo/redo, `isDirty`, `isVisualOnly` support |
| `apps/review-workbench/src/stores/ui-store.ts` | Zustand UI store: selection, focus mode, filters, sidebar state |

### Schema / Registry

| File | What it contains |
|---|---|
| `apps/review-workbench/src/schema/registry.ts` | `NodeTypeRegistry` class — register, get, getRenderer, validatePayload, canConnect |
| `apps/review-workbench/src/schema/registry.types.ts` | `NodeTypeDefinition` interface |
| `apps/review-workbench/src/schema/graph-validation.ts` | Zod schema for graph structure validation |
| `apps/review-workbench/src/schema/register-defaults.ts` | Hardcoded vehicle types — **only for tests/sandbox** |

### Translation layer (lib)

| File | What it contains |
|---|---|
| `apps/review-workbench/src/features/graph-editor/lib/schema-to-graph.ts` | 4-phase translation: matchNodes → resolveTopology → resolveEdges → validateAST |
| `apps/review-workbench/src/features/graph-editor/lib/graph-to-domain.ts` | Inverse: AST → domain JSON |
| `apps/review-workbench/src/features/graph-editor/lib/data-provider.ts` | Fetch abstraction (mock / real toggle) |
| `apps/review-workbench/src/features/graph-editor/lib/types.ts` | `GraphSchema`, `GraphEditorProps` etc. |

### L1 — App layer

| File | What it contains |
|---|---|
| `apps/review-workbench/src/features/graph-editor/L1-app/GraphEditorPage.tsx` | Fetches schema + data, calls `registerSchemaTypes`, translates, mounts `<GraphEditor>`. No ReactFlow imports. |

### L2 — Canvas layer

| File | What it contains |
|---|---|
| `apps/review-workbench/src/features/graph-editor/L2-canvas/GraphEditor.tsx` | Root L2 component: composes Canvas + Sidebar + Panels |
| `apps/review-workbench/src/features/graph-editor/L2-canvas/GraphCanvas.tsx` | ReactFlow wrapper: node/edge types, change handlers, delete handlers |
| `apps/review-workbench/src/features/graph-editor/L2-canvas/NodeShell.tsx` | Zoom-aware node shell: renders dot / label / detail based on zoom level |
| `apps/review-workbench/src/features/graph-editor/L2-canvas/GroupShell.tsx` | Compound group node with collapse toggle |
| `apps/review-workbench/src/features/graph-editor/L2-canvas/edges/FloatingEdge.tsx` | Bezier edge with floating endpoints |
| `apps/review-workbench/src/features/graph-editor/L2-canvas/edges/ButtonEdge.tsx` | Edge with delete button on midpoint |
| `apps/review-workbench/src/features/graph-editor/L2-canvas/edges/edge-helpers.ts` | Shared edge utilities |
| `apps/review-workbench/src/features/graph-editor/L2-canvas/sidebar/CanvasSidebar.tsx` | Accordion sidebar container |
| `apps/review-workbench/src/features/graph-editor/L2-canvas/sidebar/ActionsSection.tsx` | Undo, Redo, Save buttons |
| `apps/review-workbench/src/features/graph-editor/L2-canvas/sidebar/FiltersSection.tsx` | Search, relation-type toggles, attribute filter |
| `apps/review-workbench/src/features/graph-editor/L2-canvas/sidebar/CreationSection.tsx` | Draggable node type cards |
| `apps/review-workbench/src/features/graph-editor/L2-canvas/sidebar/ViewSection.tsx` | Auto-layout button, zoom controls |
| `apps/review-workbench/src/features/graph-editor/L2-canvas/panels/NodeInspector.tsx` | Sheet panel: edit node name + properties |
| `apps/review-workbench/src/features/graph-editor/L2-canvas/panels/EdgeInspector.tsx` | Sheet panel: edit edge relation type |
| `apps/review-workbench/src/features/graph-editor/L2-canvas/hooks/use-graph-layout.ts` | ELK Web Worker hook |
| `apps/review-workbench/src/features/graph-editor/L2-canvas/hooks/use-edge-inheritance.ts` | Group collapse/expand edge rerouting |
| `apps/review-workbench/src/features/graph-editor/L2-canvas/hooks/use-keyboard.ts` | Browse/edit mode keyboard shortcuts |
| `apps/review-workbench/src/features/graph-editor/L2-canvas/CommandMenu.tsx` | Ctrl+K command palette |
| `apps/review-workbench/src/features/graph-editor/L2-canvas/DeleteConfirm.tsx` | AlertDialog for delete confirmation |

### L3 — Content components

| File | What it contains |
|---|---|
| `apps/review-workbench/src/components/content/EntityCard.tsx` | Card renderer for a node at detail zoom level |
| `apps/review-workbench/src/components/content/PropertiesPreview.tsx` | Read-only key-value property list |
| `apps/review-workbench/src/components/content/PropertyEditor.tsx` | Editable key-value property list |
| `apps/review-workbench/src/components/content/PlaceholderNode.tsx` | Fallback renderer for unknown types |
| `apps/review-workbench/src/components/content/types.ts` | `EntityCardProps` and related types |

### Tests

All test files are co-located next to their source:
- `stores/graph-store.test.ts`, `stores/ui-store.test.ts`
- `schema/registry.test.ts`, `schema/register-defaults.test.ts`
- `features/graph-editor/lib/schema-to-graph.test.ts`, `graph-to-domain.test.ts`, `data-provider.test.ts`
- `features/graph-editor/L2-canvas/NodeShell.test.ts`, `GroupShell.test.ts`
- `features/graph-editor/L2-canvas/hooks/use-edge-inheritance.test.ts`, `use-keyboard.test.ts`
- `features/graph-editor/L2-canvas/edges/ButtonEdge.test.ts`
- `features/graph-editor/L1-app/GraphEditorPage.test.ts`

### Reference data (toy dataset)

The node-editor is wired to a vehicles knowledge graph (loaded from mock fixtures in `src/mock/`). This is not domain-specific code — it's the test dataset that exercises the dynamic schema loading path. Replace with real domain data in the integrated app.

---

## ui-redesign — what to extract and keep

This worktree has the full application (all pages, API client, mock fixtures, design system) but the graph component is a monolith. Extract these pieces and keep them:

### Domain adapters (use as reference for L1 implementation)

| File | What it has |
|---|---|
| `apps/review-workbench/src/features/job-pipeline/lib/matchToGraph.ts` | `matchToGraph(ViewMatch)` → `{ nodes, edges }` and `graphToMatchEdits` — adapt to emit `ASTNode`/`ASTEdge` |
| `apps/review-workbench/src/features/base-cv/lib/cvToGraph.ts` | `cvProfileToGraph` and `graphToCvProfile` — adapt to emit `ASTNode`/`ASTEdge` |

### API hooks (keep as-is)

All `features/*/api/use*.ts` hooks are clean and do not touch the graph layer. Keep them.

| Hook | What it fetches |
|---|---|
| `useViewMatch.ts` | Match view payload |
| `useCvProfileGraph.ts` | CV profile as graph payload |
| `useJobTimeline.ts` | Pipeline stage timeline |
| `usePortfolioSummary.ts` | Portfolio dashboard data |
| `useArtifacts.ts`, `useViewExtract.ts`, etc. | Other pipeline views |

### Pages (keep, but rewire graph usage)

All pages in `pages/job/` and `pages/global/` are keepers. The only change needed is replacing direct usage of the old `KnowledgeGraph.tsx` or `CvGraphCanvas.tsx` with the new `<GraphEditorPage>` wrapped with the appropriate L1 adapter.

### Design system atoms (keep as-is)

`components/atoms/`, `components/molecules/`, `components/layouts/` — all clean, no graph knowledge.

### What to discard from ui-redesign

| File | Why |
|---|---|
| `pages/global/KnowledgeGraph.tsx` (2,950 lines) | The God Component being replaced entirely |
| `features/base-cv/components/CvGraphCanvas.tsx` | ReactFlow imported directly in a feature component — replace with L1 adapter + `<GraphEditor>` |
| `features/base-cv/components/EntryNode.tsx`, `GroupNode.tsx`, `SkillNode.tsx`, `SkillBallNode.tsx`, `ProxyEdge.tsx` | ReactFlow Handle/Position imported directly — these become L3 content components or are replaced by NodeShell/GroupShell |
| `components/organisms/GraphCanvas.tsx` | Thin wrapper that still couples domain to ReactFlow |

### Mock fixtures (keep)

`src/mock/fixtures/` — 32 JSON fixtures covering all pipeline views. Wire the graph editor mock through the existing `data-provider.ts` abstraction.
