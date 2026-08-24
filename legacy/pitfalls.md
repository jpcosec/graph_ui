# Architectural Pitfalls

Lessons learned during the node-editor refactor. Each pitfall was a real mistake caught in review. Do not re-introduce these.

---

## P1 — Hardcoding domain in the Node Type Registry

**What went wrong:** `register-defaults.ts` registered `person`, `skill`, `project` types statically. The editor only worked for CVs and could not be reused.

**Rule:** The registry is populated at runtime by L1 from a schema JSON. `register-defaults.ts` is test/sandbox only — never imported in production pages.

```tsx
// ✓ Correct: L1 loads schema and registers dynamically
const { data: schema } = useQuery({ queryKey: ['schema'], queryFn: fetchSchema });
useEffect(() => {
  schema.node_types.forEach(type => registry.register({ typeId: type.id, ... }));
}, [schema]);
```

---

## P2 — Opaque payload type `Record<string, unknown>`

**What went wrong:** Payload typed as `Record<string, unknown>` forced unsafe casts everywhere: `node.data.payload.name as string`.

**Rule:** Use Zod schemas in the registry. The store holds `payload: { typeId: string; value: unknown }`. Narrowing happens at the registry boundary via `validatePayload`, never with `as` casts.

```typescript
// ✓ Correct: registry validates and narrows
const result = registry.validatePayload(node.data.typeId, node.data.payload?.value);
if (!result.success) { /* render ErrorNode */ }
const safe = result.data; // typed by Zod schema
```

---

## P3 — Visual actions polluting the undo stack

**What went wrong:** Group collapse/expand was pushed to `undoStack`, so Ctrl+Z would "undo" a visual toggle instead of the last semantic edit. Confusing UX.

**Rule:** Any action that is purely visual (collapse, expand, layout reposition, zoom) must use `{ isVisualOnly: true }`. Only semantic actions (create, delete, edit node/edge) go on the undo stack.

```typescript
// ✓ Correct: collapse is visual-only
updateNode(nodeId, { hidden: true }, { isVisualOnly: true });

// ✓ Correct: edit is semantic (undoable)
updateNode(nodeId, { data: { ...node.data, label: 'New label' } });
```

---

## P4 — Running ELKjs on the main thread

**What went wrong:** `await elk.layout(graph)` on the main thread froze the UI for 1+ seconds with >50 nodes.

**Rule:** ELK always runs in a Web Worker. The `use-graph-layout` hook sends a message to `elk.worker.ts` and awaits the result asynchronously. After layout, node positions are applied with `isVisualOnly: true`.

```typescript
// ✓ Correct: Web Worker
const worker = new Worker(new URL('./elk.worker.ts', import.meta.url));
worker.postMessage({ type: 'layout', payload: graph });
worker.onmessage = (e) => applyLayout(e.data.payload); // isVisualOnly: true
```

---

## P5 — Not wiring ReactFlow's delete callbacks

**What went wrong:** ReactFlow handled Delete key internally and removed nodes from its own state, but Zustand was not notified. The store held "ghost" nodes — save would persist deleted nodes.

**Rule:** Always wire `onNodesDelete` and `onEdgesDelete` on `<ReactFlow>`. Never implement a manual `keydown` Delete handler — ReactFlow already handles it.

```tsx
// ✓ Correct
<ReactFlow
  onNodesDelete={(deleted) => {
    const nodeIds = deleted.map(n => n.id);
    const edgeIds = edges
      .filter(e => nodeIds.includes(e.source) || nodeIds.includes(e.target))
      .map(e => e.id);
    removeElements(nodeIds, edgeIds);
  }}
  onEdgesDelete={(deleted) => removeElements([], deleted.map(e => e.id))}
/>
```

---

## P6 — Circular dependency: Registry imports L3 before L3 exists

**What went wrong:** `register-defaults.ts` imported `EntityCard` during Step 3 of the build-up, but `EntityCard` was only created in Step 4. Build failed on the incremental implementation path.

**Rule:** Register placeholder renderers in Step 3. Replace with real L3 components in Step 4 after they exist.

```typescript
// Step 3 — placeholder (avoids circular dep)
const PlaceholderDetail = (props: unknown) => <div>{String(props)}</div>;
registry.register({ renderers: { detail: PlaceholderDetail } });

// Step 4 — replace with real L3
import { EntityCard } from '@/components/content/EntityCard';
registry.register({ renderers: { detail: (props) => <EntityCard {...(props as EntityCardProps)} /> } });
```

---

## P7 — ProxyEdge approach for group collapse

**What went wrong (ui-redesign):** The old `CvGraphCanvas.tsx` used a ProxyEdge pattern that created new edge objects when a group collapsed and destroyed them on expand. This caused React key conflicts, animation glitches, and state desync.

**Rule:** Use Edge Inheritance instead. On collapse: hide child nodes (`isVisualOnly: true`), reroute existing edges by updating `source`/`target` to the group node, preserve originals in `data._originalSource`/`_originalTarget`. On expand: restore originals. No edges are created or destroyed.

---

## P8 — L3 components importing from `@xyflow/react`

**What went wrong (ui-redesign):** `EntryNode.tsx`, `GroupNode.tsx`, `SkillNode.tsx` all imported `Handle`, `Position`, `NodeProps` from ReactFlow. This made them impossible to reuse outside a ReactFlow canvas (in a Sheet, a table, a preview panel).

**Rule:** L3 components know nothing about ReactFlow. `Handle` and `Position` belong in `NodeShell.tsx` (L2). L3 receives `{ title, category, properties, visualToken, onChange }` and renders content only.

---

## P9 — Dagre for compound layout

**What went wrong (ui-redesign):** `@dagrejs/dagre` was used for auto-layout. Dagre cannot handle compound nodes (ReactFlow subflows / grouped nodes). Group children would escape their parent boundaries after layout.

**Rule:** Use ELKjs. It natively supports compound layouts. The `hierarchical` layout algorithm places group children inside their parent boundaries correctly.

---

## Architecture checklist

Before committing graph editor code:

- [ ] Does L1 load schema dynamically? No hardcoded type IDs in production?
- [ ] Does L2 have zero mentions of `job_id`, `source`, `CvProfile`, or any domain term?
- [ ] Do L3 components have zero imports from `@xyflow/react` or any Zustand store?
- [ ] Are all visual actions using `{ isVisualOnly: true }`?
- [ ] Is ELK running in a Web Worker?
- [ ] Are `onNodesDelete` and `onEdgesDelete` wired on `<ReactFlow>`?
- [ ] Are payloads validated through the registry with Zod, not cast with `as`?
- [ ] Is dagre absent from the dependency tree?
