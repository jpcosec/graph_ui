# Graph UI — Product & Architecture Specification

## 1. What we are building

A **domain-agnostic visual graph editor** embedded in the PhD 2.0 review workbench. It lets the operator inspect, edit, and approve knowledge graphs produced by the pipeline — without writing JSON.

The editor is used in three contexts inside the workbench:

| Page | Graph content | Operator action |
|---|---|---|
| `Match` | Requirements (left) ↔ Profile evidence (right), scored edges | Accept/reject/add/remove match edges; trigger regeneration |
| `BaseCvEditor` | CV structure as a grouped node graph (sections → entries) | Reorder, edit, delete CV entries |
| `KnowledgeGraph` (standalone) | Any domain graph loaded from a JSON schema | General-purpose inspect and edit |

The editor must work for all three with zero domain knowledge baked in. Domain mapping happens in a translation layer (L1) that sits above the editor. The editor itself only speaks AST — node types, edge types, visual tokens.

---

## 2. Product behavior (what the user can do)

### Canvas navigation
- Pan by dragging empty space; zoom with scroll wheel
- Fit-view button (Controls, bottom-left); MiniMap (bottom-right)

### Node interactions
- Click to select; click empty space to deselect
- Drag to reposition; drag into a group to parent it
- Double-click or click Edit in hover toolbar → opens Node Inspector Sheet (slides from right)
- Right-click → context menu: Focus, Edit, Duplicate, Delete, Add child

### Node Inspector Sheet
- Edit name, properties (key-value pairs: string / number / boolean / date)
- Add / delete properties inline
- Save (Ctrl+S) or discard (Escape / close)

### Edge interactions
- Drag from a node handle to connect; incompatible types show red handle (blocked)
- Click edge to select; click × button on midpoint to delete
- Click Edit on selected edge → opens Edge Inspector Sheet
- Edit relation type in Edge Inspector

### Node creation
- Drag a type card from Sidebar → Creation section onto canvas
- Ctrl+K command palette: type a name, pick a type
- Right-click empty canvas → create node at cursor

### Groups (compound nodes)
- Collapse/expand via chevron on group header
- Collapsed: group shrinks to header; child edges rerouted to group boundary via Edge Inheritance (edges are rerouted, not destroyed)
- Drag group header to move entire group with children

### Undo / Redo
- Ctrl+Z / Ctrl+Y (Cmd+Z / Cmd+Shift+Z on Mac)
- Sidebar Actions section has Undo/Redo buttons
- Semantic actions only: create, delete, edit node/edge. Pan, zoom, collapse/expand are NOT undoable (they use `isVisualOnly: true` in the store)

### Filters (Sidebar → Filters)
- Text search: dims non-matching nodes
- Filter by relation type: toggle visibility per type
- Filter by attribute value
- Neighbors-only mode: hide everything except focused node's neighbors
- Clear all filters

### Auto-layout
- Sidebar → View → Auto Layout: runs ELK in a Web Worker and repositions all nodes
- Manual drag overrides layout; saved with graph on Ctrl+S

### Save
- Ctrl+S or Sidebar → Actions → Save
- Dirty indicator (bullet prefix in title or highlighted save button) when unsaved changes exist

### Keyboard modes
- **Browse mode** (default): arrow keys navigate nodes, Delete removes selection, Enter opens Inspector
- **Edit mode** (Inspector open): keyboard goes to form fields, Escape returns to browse

### Visual style
- Dark tactical aesthetic ("Terran Command"): near-black background, dark-grey surfaces, cyan/teal primary accent
- Node borders colored by category (each node type has its own CSS token)
- Selected nodes: bright cyan border
- Collapsed-group inherited edges: dashed stroke, reduced opacity
- Font: `font-mono`, small sizes, uppercase labels with letter-spacing

---

## 3. Architecture — The 3-Layer Model

The entire editor is structured into three layers with strict dependency rules.

```
┌─────────────────────────────────────────────────────────┐
│  L1 — App Layer  (features/graph-editor/L1-app/)        │
│  Knows: domain data, API, schema JSON                   │
│  Does NOT know: ReactFlow, Zustand, edges, canvas       │
│  Size: ~30–60 lines                                     │
├─────────────────────────────────────────────────────────┤
│  L2 — Canvas Layer  (features/graph-editor/L2-canvas/)  │
│  Knows: ReactFlow, Zustand stores, elkjs, edges         │
│  Does NOT know: domain ("Jobs", "CVs", "match")         │
│  Size: sidebar, inspectors, hooks, edges all live here  │
├─────────────────────────────────────────────────────────┤
│  L3 — Content Components  (components/content/)         │
│  Knows: props it receives                               │
│  Does NOT know: ReactFlow, stores, graph, domain        │
│  Reusable: works in a node, a Sheet, a table, anywhere  │
└─────────────────────────────────────────────────────────┘
```

### Layer contracts

**L1 → L2 contract** (the only API between layers 1 and 2):

```typescript
interface GraphEditorProps {
  initialNodes: ASTNode[];
  initialEdges: ASTEdge[];
  onSave: (nodes: ASTNode[], edges: ASTEdge[]) => void;
  readOnly?: boolean;
}
```

L1 fetches raw domain data, loads a schema JSON, dynamically registers node types into the Node Type Registry, translates data to AST via `schemaToGraph()`, then renders `<GraphEditor {...props} />`. L2 receives the AST and owns everything else.

**L2 → L3 contract**: L3 components receive props only — `{ title, category, properties, badges, visualToken, onChange }`. They emit events upward. They never import from `@xyflow/react` or from any Zustand store.

### AST shape

The internal data model L1 produces and L2 consumes:

```typescript
interface ASTNode {
  id: string;
  type: string;                          // ReactFlow node type key
  position: { x: number; y: number };
  data: {
    typeId?: string;                     // matches a NodeTypeRegistry entry
    payload?: { typeId?: string; value?: unknown };
    properties?: Record<string, string>;
    visualToken?: string;                // CSS custom property token
    label?: string;
    name?: string;
  };
  parentId?: string;                     // enables ReactFlow subflows
  extent?: 'parent' | string;
  hidden?: boolean;
}

interface ASTEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  data?: {
    relationType: string;
    properties?: Record<string, string>;
    _originalSource?: string;            // for Edge Inheritance (collapse)
    _originalTarget?: string;
    _originalRelationType?: string;
  };
  hidden?: boolean;
}
```

---

## 4. Key subsystems

### 4.1 Node Type Registry

A runtime map from `typeId` → rendering + validation definition. Populated dynamically from a schema JSON by L1 — never hardcoded.

```typescript
interface NodeTypeDefinition {
  typeId: string;
  label: string;
  icon: string;
  category: string;
  colorToken: string;
  payloadSchema: z.ZodSchema;            // runtime validation
  sanitizer?: (payload: unknown) => unknown;
  renderers: {
    dot: ComponentType<{ colorToken: string }>;     // zoomed out
    label: ComponentType<{ title: string; icon: string }>; // medium zoom
    detail: ComponentType<unknown>;                 // zoomed in / inspector
  };
  defaultSize: { width: number; height: number };
  allowedConnections: string[];          // which typeIds this can connect to
}
```

Unknown or invalid payloads produce an `ErrorNode` — the editor never crashes on bad data.

### 4.2 schemaToGraph — the translation pipeline

Four independently-testable phases:

```
Phase 1: matchNodes      — assign typeId to each raw domain item
Phase 2: resolveTopology — build parent/child group structure
Phase 3: resolveEdges    — generate ASTEdge objects from array fields
Phase 4: validateAST     — Zod-validate each payload; invalid → ErrorNode
```

The schema JSON that drives this:

```json
{
  "nodeTypes": [
    {
      "matchRule": { "property": "nivel", "value": 1 },
      "typeId": "grupo-raiz",
      "renderAs": "group",
      "colorToken": "token-grupo-raiz",
      "attributes": { "name": { "type": "string", "required": true } }
    }
  ],
  "edgeTypes": [
    {
      "relation": "usa_componente",
      "source": "modelo-vehiculo",
      "targetArray": "conexiones_externas",
      "colorToken": "token-edge-dependencia"
    }
  ]
}
```

### 4.3 Zustand stores

Two stores. Atomic selectors — never subscribe to the whole store.

**`graph-store`**: authoritative graph state.
- `nodes`, `edges`: the live graph
- `undoStack`, `redoStack`: `SemanticAction[]` (only semantic changes — create/delete/edit)
- `isDirty()`: compares current state against `savedSnapshot`
- `updateNode(id, patch, { isVisualOnly? })`: `isVisualOnly: true` skips the undo stack
- `onNodesChange`, `onEdgesChange`, `onConnect`: ReactFlow change handlers wired here
- `loadGraph`, `markSaved`

**`ui-store`**: ephemeral UI state.
- `selectedNodeId`, `selectedEdgeId`
- `focusedNodeId`, `isFocusMode`
- `filters`: `{ searchText, relationTypes, attributeFilter, neighborsOnly }`
- `sidebarOpen`, `sidebarSection`
- `isReadOnly`

### 4.4 Edge Inheritance (group collapse)

When a group collapses, child nodes are hidden (`hidden: true`, `isVisualOnly: true` — not pushed to undo stack). Edges that connected to hidden children are rerouted to connect to the group boundary instead. The original source/target are preserved in `data._originalSource` / `data._originalTarget` so the rerouting can be reversed on expand.

This is deliberately NOT a ProxyEdge approach (which creates/destroys edges on collapse/expand). Edge Inheritance reroutes — no lifecycle complexity.

### 4.5 ELK layout (Web Worker)

ELKjs runs in a Web Worker to avoid blocking the main thread. The hook sends a `layout` message with the current graph, receives a `result` message with repositioned nodes, then calls `updateNode` with `isVisualOnly: true` for each node (layout changes are not semantic and not undoable).

---

## 5. File structure (target)

```
apps/review-workbench/src/
├── features/
│   └── graph-editor/
│       ├── L1-app/
│       │   └── GraphEditorPage.tsx        # fetch + registerTypes + mount
│       ├── L2-canvas/
│       │   ├── GraphEditor.tsx            # root L2 component
│       │   ├── GraphCanvas.tsx            # ReactFlow wrapper
│       │   ├── NodeShell.tsx              # zoom-aware node shell
│       │   ├── GroupShell.tsx             # compound group node
│       │   ├── edges/
│       │   │   ├── FloatingEdge.tsx
│       │   │   ├── ButtonEdge.tsx
│       │   │   └── edge-helpers.ts
│       │   ├── sidebar/
│       │   │   ├── CanvasSidebar.tsx
│       │   │   ├── ActionsSection.tsx
│       │   │   ├── FiltersSection.tsx
│       │   │   ├── CreationSection.tsx
│       │   │   └── ViewSection.tsx
│       │   ├── panels/
│       │   │   ├── NodeInspector.tsx
│       │   │   └── EdgeInspector.tsx
│       │   ├── hooks/
│       │   │   ├── use-graph-layout.ts    # ELK Web Worker hook
│       │   │   ├── use-edge-inheritance.ts
│       │   │   └── use-keyboard.ts
│       │   └── CommandMenu.tsx
│       └── lib/
│           ├── schema-to-graph.ts         # 4-phase translation pipeline
│           ├── graph-to-domain.ts         # inverse serialization
│           ├── data-provider.ts           # fetch abstraction (mock/real)
│           └── types.ts
├── components/
│   └── content/                           # L3 — no graph knowledge
│       ├── EntityCard.tsx
│       ├── PropertiesPreview.tsx
│       ├── PropertyEditor.tsx
│       └── PlaceholderNode.tsx
├── stores/
│   ├── graph-store.ts
│   ├── ui-store.ts
│   └── types.ts                           # ASTNode, ASTEdge, SemanticAction
└── schema/
    ├── registry.ts                        # NodeTypeRegistry class
    ├── registry.types.ts                  # NodeTypeDefinition interface
    ├── graph-validation.ts
    └── register-defaults.ts              # ONLY for tests / sandbox
```

---

## 6. Domain-specific adapters (L1 per use case)

Each use case in the workbench gets its own thin L1 adapter that translates domain data into AST. L2 and L3 are shared.

### Match view adapter

```typescript
// features/job-pipeline/lib/matchToGraph.ts
export function matchToGraph(viewMatch: ViewMatch): { nodes: ASTNode[]; edges: ASTEdge[] }
export function graphToMatchEdits(nodes: ASTNode[], edges: ASTEdge[]): MatchEdits
```

Requirements → left column (x=0), grouped by category. Profile nodes → right column (x=700), grouped by category. Match edges carry `score%` label. `graphToMatchEdits` produces `{ addedEdges, removedEdges, addedNodes }` for the HITL review decision.

### CV editor adapter

```typescript
// features/base-cv/lib/cvToGraph.ts
export function cvProfileToGraph(profile: CvProfileGraphPayload): { nodes: ASTNode[]; edges: ASTEdge[] }
export function graphToCvProfile(nodes: ASTNode[], edges: ASTEdge[]): CvProfileGraphPayload
```

CV sections → `GroupNode`s. Entries within each section → child `ASTNode`s. Entry fields/descriptions/essential stored in `node.data.properties` for faithful round-trip.

---

## 7. Tech stack

```
@xyflow/react ^12       ReactFlow canvas
zustand                 State (graph-store, ui-store)
zod                     Runtime payload validation
elkjs                   Auto-layout (runs in Web Worker)
dompurify               HTML sanitization in node content
@radix-ui/react-*       UI primitives via shadcn (Sheet, Accordion, AlertDialog, ContextMenu, Command)
tailwindcss v4          Styling via Terran Command tokens
lucide-react            Icons
@tanstack/react-query   Data fetching in L1
```

Replaced / removed:
- `@dagrejs/dagre` → replaced by elkjs (dagre cannot handle compound/subflow layouts)

---

## 8. Non-negotiable decisions

| Decision | Reason |
|---|---|
| Layout engine: **elkjs** not dagre | Subflows require compound layouts; dagre cannot handle them |
| State: **Zustand** atomic selectors | React Context re-renders all consumers on any state change |
| Sidebar lives in **L2** not L1 | Editor owns its controls; L1 only mounts the editor |
| Schema loaded **dynamically** from JSON | Editor must be domain-agnostic; no hardcoded node types in production |
| Collapse: **Edge Inheritance** not ProxyEdge | Avoids edge create/destroy lifecycle issues |
| Delete: **ReactFlow callbacks** not manual keydown | `onNodesDelete`/`onEdgesDelete` are already provided; duplicating causes desync |
| **ELK in Web Worker** not main thread | Blocks UI for 1+ seconds with >50 nodes on main thread |
| **Visual actions use `isVisualOnly: true`** | Collapse/expand/layout must not pollute semantic undo stack |
| **Zod validation** in registry | TypeScript disappears at runtime; payload shape must be validated |
| **DOMPurify** default-deny | User-provided node content is an XSS vector |
