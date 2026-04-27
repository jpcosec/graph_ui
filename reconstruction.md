# Reconstruction Guide

How to build the complete integrated system from the two source worktrees.

## Starting point

You need two directories:
- `node-editor` worktree: the clean 3-layer editor implementation
- `ui-redesign` worktree: the full application with all pages and features

The goal is a single `apps/review-workbench` that has both: all application pages from ui-redesign, powered by the 3-layer graph editor from node-editor.

---

## Phase 0 — Bootstrap the target repo

```bash
# Start from ui-redesign as the base (it has the full app structure)
cp -r .worktrees/ui-redesign/apps/review-workbench <target>/apps/review-workbench
cd <target>/apps/review-workbench
npm install
```

---

## Phase 1 — Transplant the graph editor core from node-editor

Copy these directories verbatim from node-editor. They have no domain dependencies and are fully tested.

```bash
SRC=.worktrees/node-editor/apps/review-workbench/src
DST=<target>/apps/review-workbench/src

# Stores
cp -r $SRC/stores $DST/stores

# Schema / Registry
cp -r $SRC/schema $DST/schema

# Shared content components (L3)
cp -r $SRC/components/content $DST/components/content

# Graph editor feature (L1 + L2 + lib)
cp -r $SRC/features/graph-editor $DST/features/graph-editor

# Shared utilities
cp $SRC/lib/utils.ts $DST/lib/utils.ts
cp $SRC/utils/cn.ts $DST/utils/cn.ts
```

Add the required packages that node-editor has but ui-redesign may not:

```bash
npm install elkjs zustand zod dompurify
npm install -D @types/dompurify
```

Remove dagre (replaced by elkjs):

```bash
npm uninstall dagre @dagrejs/dagre
```

Copy the shadcn UI primitives node-editor uses:

```bash
# From node-editor's components/ui/
cp $SRC/components/ui/accordion.tsx $DST/components/ui/
cp $SRC/components/ui/alert-dialog.tsx $DST/components/ui/
cp $SRC/components/ui/sheet.tsx $DST/components/ui/
cp $SRC/components/ui/command.tsx $DST/components/ui/
cp $SRC/components/ui/context-menu.tsx $DST/components/ui/
cp $SRC/components/ui/popover.tsx $DST/components/ui/
cp $SRC/components/ui/sonner.tsx $DST/components/ui/
# (keep the rest already in ui-redesign)
```

---

## Phase 2 — Wire the standalone graph page

The simplest integration: the standalone `KnowledgeGraph` page that lets the operator explore any domain graph.

**Step 2.1** — Delete the God Component:
```bash
rm $DST/pages/global/KnowledgeGraph.tsx  # 2,950 lines — gone
```

**Step 2.2** — Replace with a thin page that mounts L1:
```tsx
// pages/global/KnowledgeGraph.tsx  (~10 lines)
import { GraphEditorPage } from '@/features/graph-editor/L1-app/GraphEditorPage';

export function KnowledgeGraph() {
  return <GraphEditorPage />;
}
```

The `GraphEditorPage` from node-editor already fetches schema + data from `graphDataProvider`. Point `graphDataProvider` at your real API endpoint or a mock fixture.

**Step 2.3** — Verify:
```bash
npm run dev
# Navigate to /knowledge-graph — should render the graph editor
npm test -- --testPathPattern=graph-editor
```

---

## Phase 3 — Wire the Match view

The Match page needs a domain-specific L1 that translates `ViewMatch` data into AST.

**Step 3.1** — Update the match adapter to emit `ASTNode`/`ASTEdge`:

```typescript
// features/job-pipeline/lib/matchToGraph.ts
import type { ASTNode, ASTEdge } from '@/stores/types';

export function matchToGraph(data: ViewMatch): { nodes: ASTNode[]; edges: ASTEdge[] } {
  // Requirements → left column (x=0), grouped by category
  const requirementGroups = groupBy(data.requirements, r => r.category);
  const requirementGroupNodes: ASTNode[] = Object.entries(requirementGroups).map(
    ([category, reqs], i) => ({
      id: `grp-req-${category}`,
      type: 'group',
      position: { x: 0, y: i * 300 },
      data: { typeId: 'requirement-group', label: category, visualToken: 'token-requirement' },
    })
  );
  const requirementNodes: ASTNode[] = data.requirements.map((req) => ({
    id: req.id,
    type: 'default',
    position: { x: 20, y: 0 },
    parentId: `grp-req-${req.category}`,
    extent: 'parent',
    data: { typeId: 'requirement', label: req.text, visualToken: 'token-requirement',
            properties: { weight: String(req.weight), category: req.category } },
  }));

  // Profile evidence → right column (x=700), grouped by category
  const profileGroups = groupBy(data.profile_nodes, p => p.category);
  const profileGroupNodes: ASTNode[] = Object.entries(profileGroups).map(
    ([category, nodes], i) => ({
      id: `grp-prof-${category}`,
      type: 'group',
      position: { x: 700, y: i * 300 },
      data: { typeId: 'profile-group', label: category, visualToken: 'token-profile' },
    })
  );
  const profileNodes: ASTNode[] = data.profile_nodes.map((node) => ({
    id: node.id,
    type: 'default',
    position: { x: 20, y: 0 },
    parentId: `grp-prof-${node.category}`,
    extent: 'parent',
    data: { typeId: 'profile-evidence', label: node.label, visualToken: 'token-profile',
            properties: { category: node.category } },
  }));

  // Match edges with score label
  const edges: ASTEdge[] = data.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'floating',
    data: { relationType: 'match', properties: { score: `${e.score}%` } },
  }));

  return {
    nodes: [...requirementGroupNodes, ...requirementNodes, ...profileGroupNodes, ...profileNodes],
    edges,
  };
}

export function graphToMatchEdits(
  original: { nodes: ASTNode[]; edges: ASTEdge[] },
  current: { nodes: ASTNode[]; edges: ASTEdge[] },
): MatchEdits {
  const originalEdgeIds = new Set(original.edges.map(e => e.id));
  const currentEdgeIds = new Set(current.edges.map(e => e.id));
  return {
    addedEdges: current.edges.filter(e => !originalEdgeIds.has(e.id)),
    removedEdges: original.edges.filter(e => !currentEdgeIds.has(e.id)),
    addedNodes: current.nodes.filter(n => !original.nodes.find(o => o.id === n.id)),
  };
}
```

**Step 3.2** — Build the Match L1 page:

```tsx
// pages/job/Match.tsx
import { useViewMatch } from '@/features/job-pipeline/api/useViewMatch';
import { useGateDecide } from '@/features/job-pipeline/api/useGateDecide';
import { matchToGraph, graphToMatchEdits } from '@/features/job-pipeline/lib/matchToGraph';
import { GraphEditor } from '@/features/graph-editor/L2-canvas/GraphEditor';
import { useGraphStore } from '@/stores/graph-store';
import { registry } from '@/schema/registry';
import { useEffect, useRef } from 'react';
import { matchNodeTypes } from '@/features/job-pipeline/lib/matchNodeTypes'; // register requirement/profile types

export function Match() {
  const { source, jobId } = useParams();
  const { data, isLoading } = useViewMatch(source, jobId);
  const loadGraph = useGraphStore(s => s.loadGraph);
  const initialGraphRef = useRef<ReturnType<typeof matchToGraph> | null>(null);

  useEffect(() => {
    if (!data) return;
    matchNodeTypes.forEach(t => registry.register(t)); // register match-specific types
    const graph = matchToGraph(data);
    initialGraphRef.current = graph;
    loadGraph(graph.nodes, graph.edges);
  }, [data, loadGraph]);

  const decide = useGateDecide(source, jobId);

  const handleSave = () => {
    const { nodes, edges } = useGraphStore.getState();
    const edits = graphToMatchEdits(initialGraphRef.current!, { nodes, edges });
    decide.mutate({ decision: 'approve', edits });
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <GraphEditor
      initialNodes={[]}  // loadGraph handles hydration
      initialEdges={[]}
      onSave={handleSave}
    />
  );
}
```

**Step 3.3** — Delete the old Match components that imported ReactFlow directly:
```bash
rm $DST/features/job-pipeline/components/MatchGraphCanvas.tsx
# RequirementNode.tsx and ProfileNode.tsx become unnecessary — NodeShell renders them
```

---

## Phase 4 — Wire the CV Editor

Same pattern as Match.

**Step 4.1** — Update `cvToGraph.ts` to emit `ASTNode`/`ASTEdge` (same interface as node-editor stores).

**Step 4.2** — Build a thin `BaseCvEditor.tsx` that:
- Fetches CV profile via `useCvProfileGraph`
- Registers CV node types into the registry
- Translates via `cvProfileToGraph`
- Mounts `<GraphEditor>` with `onSave` calling `graphToCvProfile` and posting back

**Step 4.3** — Delete the old CV canvas components that imported ReactFlow directly:
```bash
rm $DST/features/base-cv/components/CvGraphCanvas.tsx
rm $DST/features/base-cv/components/EntryNode.tsx
rm $DST/features/base-cv/components/GroupNode.tsx
rm $DST/features/base-cv/components/SkillNode.tsx
rm $DST/features/base-cv/components/SkillBallNode.tsx
rm $DST/features/base-cv/components/ProxyEdge.tsx
```

---

## Phase 5 — Replace placeholder L3 renderers with real ones

The node-editor's `GraphEditorPage` uses `PlaceholderDot`, `PlaceholderLabel`, `PlaceholderDetail` as renderers (to avoid circular dependencies during the build-up phase). Now that real L3 components exist, update the registry to use them:

```typescript
// In each L1 adapter's registerTypes call:
import { EntityCard } from '@/components/content/EntityCard';
import { PropertiesPreview } from '@/components/content/PropertiesPreview';

registry.register({
  typeId: 'requirement',
  renderers: {
    dot: ({ colorToken }) => <div className="h-3 w-3 rounded-full" style={{ backgroundColor: `var(--${colorToken})` }} />,
    label: ({ title }) => <span className="text-xs font-mono">{title}</span>,
    detail: (props) => <EntityCard {...(props as EntityCardProps)} />,
  },
  // ...
});
```

---

## Phase 6 — Validation

Run the full test suite:
```bash
cd apps/review-workbench
npm test
```

Check key layer violations:
```bash
# L1 must not import ReactFlow
grep -r "@xyflow" src/features/graph-editor/L1-app/
# Should be empty

# L3 must not import ReactFlow or stores
grep -r "@xyflow\|graph-store\|ui-store" src/components/content/
# Should be empty

# core/ai (Python backend) must not import from src/ai
grep -r "from src.ai" src/core/
# Should be empty (backend concern, separate check)
```

Manual smoke tests:
1. KnowledgeGraph page loads, nodes render, drag/drop works
2. Ctrl+Z undoes a node move but NOT a group collapse
3. Auto-layout runs without freezing the UI
4. Match page renders two-column layout with scored edges
5. CV editor loads profile as grouped nodes, saving round-trips correctly

---

## What is NOT yet implemented (gaps from node-editor)

These features are in the product spec but were not completed in node-editor:

| Feature | Status | Notes |
|---|---|---|
| Real L3 renderers replacing placeholders | Partial | `EntityCard` exists; not yet wired into all registry entries |
| Dynamic schema loading from real API | Partial | `data-provider.ts` has the abstraction; needs real endpoint |
| Copy/paste (Ctrl+C/V) | Not started | Spec'd in product doc, not implemented |
| Context menu (right-click) | Partial | `CommandMenu` exists; right-click wiring not complete |
| Neighbors-only filter mode | Not started | Spec'd in `FiltersSection`; needs `ui-store` + canvas filter logic |
| Drag-to-create from sidebar | Not started | `CreationSection` renders cards; drag-drop onto canvas not wired |
| Arrow-key node navigation | Not started | Spec'd in keyboard section |
| Dirty indicator in page title | Not started | `isDirty()` exists in store; UI indicator not connected |
| Edge Inheritance test coverage | Partial | Hook implemented; collapse/expand with inherited edges needs more test cases |
