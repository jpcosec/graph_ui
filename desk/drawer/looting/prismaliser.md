# Code Context

## Files Retrieved
1. `/tmp/loot/prismaliser/src/util/layout.ts` (lines 1-126) - ELK setup, complete layout config, fixed node size heuristics, and ELK input/output mapping.
2. `/tmp/loot/prismaliser/src/util/prismaToFlow.ts` (lines 22-38, 214-268, 287-296, 298-356, 363-428) - node/edge construction from Prisma DMMF plus how ELK positions are written back onto React Flow nodes.
3. `/tmp/loot/prismaliser/src/components/FlowView.tsx` (lines 34-41, 48-76, 78-106, 110-150) - React Flow wiring, viewport-related props, and when re-layout happens.
4. `/tmp/loot/prismaliser/src/util/layout.test.ts` (lines 8-12, 54-127) - executable expectations for node sizing heuristics used before ELK.
5. `/tmp/loot/prismaliser/src/components/ModelNode.tsx` (lines 18-147) - model node rendering, readable table layout, min/max width, relation handles, and focus-on-related-node behavior.
6. `/tmp/loot/prismaliser/src/components/EnumNode.tsx` (lines 9-80) - enum node rendering, collapsible long lists, readable sizing constraints.
7. `/tmp/loot/prismaliser/src/components/Node.module.css` (lines 3-29) - handle placement and row border cleanup that affect node readability.

## Key Code

### Repo overview
Prismaliser builds React Flow nodes and edges from Prisma DMMF in `src/util/prismaToFlow.ts`, renders custom `model` and `enum` node types in `src/components/`, and runs ELK on demand from `src/util/layout.ts`. It does **not** auto-layout on initial load. Initial positions are `0,0` unless restored from a saved `positionSeed` or previous node state.

---

### 1. INITIAL LAYOUT

#### Complete ELK config actually present
From `/tmp/loot/prismaliser/src/util/layout.ts:83-125`:

```ts
export const getLayout = async (
  nodes: Array<Node<EnumNodeData> | Node<ModelNodeData>>,
  edges: Edge[],
) => {
  elkPromise ??= import("elkjs/lib/elk.bundled").then(
    ({ default: ElkConstructor }) =>
      new ElkConstructor({
        defaultLayoutOptions: {
          "elk.algorithm": "layered",
          "elk.direction": "DOWN",
          "elk.spacing.nodeNode": "75",
          "elk.layered.spacing.nodeNodeBetweenLayers": "75",
        },
      }),
  );
  const elk = await elkPromise;

  const elkNodes: ElkNode[] = [];
  const elkEdges: ElkExtendedEdge[] = [];

  nodes.forEach((node) => {
    elkNodes.push({
      id: node.id,
      width: calculateWidth(node),
      height: calculateHeight(node),
    });
  });

  edges.forEach((edge) => {
    elkEdges.push({
      id: edge.id,
      targets: [edge.target],
      sources: [edge.source],
    });
  });

  const layout = await elk.layout({
    id: "root",
    children: elkNodes,
    edges: elkEdges,
  });

  return layout;
};
```

**Full ELK option list in this repo:**
- `elk.algorithm = layered`
- `elk.direction = DOWN`
- `elk.spacing.nodeNode = 75`
- `elk.layered.spacing.nodeNodeBetweenLayers = 75`

That is the entire config. There are **no other `elk.*` spacing keys** in this clone.

#### How width/height are fed into ELK
From `/tmp/loot/prismaliser/src/util/layout.ts:14-21,27-42,47-81`:

```ts
const MAX_ENUM_HEIGHT = 600;
const FIELD_HEIGHT = 50;
const CHAR_WIDTH = 10;
const MIN_SIZE = 100;
const MARGIN = 50;

const normalizeSize = (value: number) => Math.max(value, MIN_SIZE) + MARGIN * 2;
```

```ts
const calculateHeight = (node: Node<EnumNodeData> | Node<ModelNodeData>) => {
  if (node.data.type === "enum") {
    const fieldsHeight = node.data.values.length * FIELD_HEIGHT;
    const height =
      fieldsHeight > MAX_ENUM_HEIGHT
        ? MAX_ENUM_HEIGHT
        : fieldsHeight + FIELD_HEIGHT;

    return normalizeSize(height);
  }

  const fieldsHeight = node.data.columns.length * FIELD_HEIGHT;
  const heightWithTitle = fieldsHeight + FIELD_HEIGHT;

  return normalizeSize(heightWithTitle);
};
```

```ts
const calculateWidth = (node: Node<EnumNodeData> | Node<ModelNodeData>) => {
  if (node.data.type === "enum") {
    const width =
      node.data.values.reduce(
        (acc, curr) => (acc < curr.length ? curr.length : acc),
        node.data.name.length + (node.data.dbName?.length || 0),
      ) * CHAR_WIDTH;

    return normalizeSize(width);
  }

  const headerLength = node.data.name.length + (node.data.dbName?.length || 0);

  const [nameLength, typeLength, defaultValueLength] = node.data.columns.reduce(
    (acc, curr) => {
      const currDefaultValueLength = curr.defaultValue?.length || 0;

      return [
        acc[0] < curr.name.length ? curr.name.length : acc[0],
        acc[1] < curr.type.length ? curr.type.length : acc[1],
        acc[2] < currDefaultValueLength ? currDefaultValueLength : acc[2],
      ];
    },
    [0, 0, 0],
  );

  const columnsLength = nameLength + typeLength + defaultValueLength;

  const width =
    headerLength > columnsLength
      ? headerLength * CHAR_WIDTH
      : columnsLength * CHAR_WIDTH;

  return normalizeSize(width);
};
```

So Prismaliser uses **fixed heuristics**, not measured DOM size:
- per-row height: `50`
- per-character width: `10`
- minimum content size: `100`
- extra margin added to both sides: `50 * 2`
- enum height clamp: `600`

#### How ELK positions are written back to React Flow nodes
From `/tmp/loot/prismaliser/src/util/prismaToFlow.ts:404-428`:

```ts
const positionNodes = (
  nodeData: Array<EnumNodeData | ModelNodeData>,
  previousNodes: Array<Node<EnumNodeData> | Node<ModelNodeData>>,
  layout: ElkNode | null,
): Array<Node<EnumNodeData> | Node<ModelNodeData>> =>
  nodeData.map((n) => {
    const positionedNode = layout?.children?.find(
      (layoutNode) => layoutNode.id === n.name,
    );
    const previousNode = previousNodes.find((prev) => prev.id === n.name);

    return {
      id: n.name,
      type: n.type,
      position: {
        x: positionedNode?.x ?? previousNode?.position.x ?? 0,
        y: positionedNode?.y ?? previousNode?.position.y ?? 0,
      },
      width: previousNode?.width ?? 0,
      height: previousNode?.height ?? 0,
      data: n as any,
    };
  });
```

This is the exact writeback rule:
- use `layout.children[].x/y` if ELK returned them
- else keep previous React Flow `position`
- else fall back to `(0,0)`

#### Do they wait for measured node sizes first?
**No.** I found **no** usage of:
- `useNodesInitialized`
- `useUpdateNodeInternals`
- `node.measured`
- DOM measurement before layout

Instead, ELK always gets width/height from `calculateWidth()` and `calculateHeight()`.

#### Sizing tests that prove the heuristic contract
From `/tmp/loot/prismaliser/src/util/layout.test.ts:70-127`:

```ts
it("uses a minimum width based on MIN_SIZE and MARGIN", async () => {
  const nodes = [baseModelNode("User", [scalarColumn("id", "Int")])];

  const layout = await getLayout(nodes, []);
  const userLayout = layout.children!.find((child) => child.id === "User")!;

  expect(userLayout.width).toBe(MIN_SIZE + MARGIN * 2);
});
```

```ts
it("scales model width with the longest column text", async () => {
  const nodes = [
    baseModelNode("VeryLongUserName", [
      scalarColumn("veryLongColumnName", "VeryLongColumnType"),
    ]),
  ];

  const layout = await getLayout(nodes, []);
  const layoutNode = layout.children![0]!;
  const expectedWidth = (16 + 20) * CHAR_WIDTH + MARGIN * 2;

  expect(layoutNode.width).toBe(expectedWidth);
});
```

```ts
it("scales model height with field count plus a title row", async () => {
  const nodes = [
    baseModelNode("User", [
      scalarColumn("id", "Int"),
      scalarColumn("name", "String"),
      scalarColumn("email", "String"),
    ]),
  ];

  const layout = await getLayout(nodes, []);
  const layoutNode = layout.children![0]!;
  const expectedHeight = 3 * FIELD_HEIGHT + FIELD_HEIGHT + MARGIN * 2;

  expect(layoutNode.height).toBe(expectedHeight);
});
```

```ts
it("clamps enum height at MAX_ENUM_HEIGHT", async () => {
  const values = Array.from({ length: 100 }, (_, index) => `VALUE_${index}`);
  const nodes = [baseEnumNode("HugeEnum", values)];

  const layout = await getLayout(nodes, []);
  const layoutNode = layout.children![0]!;

  expect(layoutNode.height).toBe(MAX_ENUM_HEIGHT + MARGIN * 2);
});
```

---

### 2. VIEWPORT

From `/tmp/loot/prismaliser/src/components/FlowView.tsx:110-120`:

```tsx
<ReactFlow
  nodes={nodes}
  edges={edges}
  edgeTypes={edgeTypes}
  nodeTypes={nodeTypes}
  minZoom={0.05}
  style={{ gridArea: "flow" }}
  onNodesChange={onNodesChange}
  onNodeDragStop={() =>
    onPositionsChange?.(captureNodePositions(nodesRef.current))
  }
>
```

What is present:
- `minZoom={0.05}`

What is **not** present anywhere in this clone:
- `fitView`
- `fitViewOptions`
- `defaultViewport`
- `maxZoom`
- explicit initial `viewport` state

So Prismaliser does **not** provide a special initial viewport strategy beyond React Flow defaults plus `minZoom=0.05`.

One viewport-related behavior does exist inside nodes. From `/tmp/loot/prismaliser/src/components/ModelNode.tsx:22-36`:

```ts
const focusNode = (nodeId: string) => {
  const { nodeInternals } = store.getState();
  const nodes = Array.from(nodeInternals).map(([, node]) => node);

  if (nodes.length > 0) {
    const node = nodes.find((iterNode) => iterNode.id === nodeId);

    if (!node) return;

    const x = node.position.x + node.width! / 2;
    const y = node.position.y + node.height! / 2;
    const zoom = getZoom();

    setCenter(x, y, { zoom, duration: 1000 });
  }
};
```

That is for clicking relation fields to center the related node while keeping current zoom.

---

### 3. RE-LAYOUT

#### When layout re-runs
From `/tmp/loot/prismaliser/src/components/FlowView.tsx:72-76,129-133`:

```ts
const refreshLayout = async () => {
  const layout = await getLayout(nodes, edges);
  const newNodes = regenerateNodes(layout);
  onPositionsChange?.(captureNodePositions(newNodes));
};
```

```tsx
<Controls>
  <ControlButton title="Disperse nodes" onClick={refreshLayout}>
    <ListTreeIcon height={24} width={24} />
  </ControlButton>
  <DownloadButton />
</Controls>
```

So ELK re-layout runs only when the user presses the **“Disperse nodes”** control button.

#### What happens on schema change / add node
From `/tmp/loot/prismaliser/src/components/FlowView.tsx:53-70,93-106`:

```ts
const regenerateNodes = (
  layout: ElkNode | null,
  previousNodes = nodesRef.current,
  positions: readonly NodePosition[] | null = null,
) => {
  const { nodes: generatedNodes, edges: newEdges } = dmmf
    ? generateFlowFromDMMF(dmmf, previousNodes, layout)
    : ({ nodes: [], edges: [] } as DMMFToElementsResult);
  const newNodes = positions
    ? applyNodePositions(generatedNodes, positions)
    : generatedNodes;

  nodesRef.current = newNodes;
  setNodes(newNodes);
  setEdges(newEdges);

  return newNodes;
};
```

```ts
useEffect(() => {
  const seedChanged =
    positionSeed !== undefined &&
    positionSeed.key !== lastAppliedPositionSeedKey.current;

  regenerateNodes(
    null,
    seedChanged ? [] : nodesRef.current,
    seedChanged ? positionSeed.positions : null,
  );

  if (dmmf && seedChanged)
    lastAppliedPositionSeedKey.current = positionSeed.key;
}, [dmmf]);
```

On schema/DMMF change, they **regenerate nodes and edges without running ELK** (`layout` is passed as `null`). Positions come from:
1. `positionSeed.positions` if a new seed is applied,
2. else prior node positions,
3. else `0,0` from `positionNodes()`.

#### Debounce / thrash avoidance
I found **no debounce** and no automatic repeated layout cycle. Thrash is avoided simply because:
- layout is **manual**, not reactive,
- `getLayout` is only called inside `refreshLayout()`,
- schema changes call `regenerateNodes(null, ...)`, not `getLayout(...)`.

There is also lazy-loading/caching of ELK to avoid reload cost. From `/tmp/loot/prismaliser/src/util/layout.ts:10-12,87-98`:

```ts
// elkjs is ~1.6MB and only needed when dispersing nodes — load it on demand
// instead of in the initial bundle.
let elkPromise: Promise<ElkInstance> | null = null;
```

```ts
elkPromise ??= import("elkjs/lib/elk.bundled").then(
  ({ default: ElkConstructor }) =>
    new ElkConstructor({
      defaultLayoutOptions: {
        "elk.algorithm": "layered",
        "elk.direction": "DOWN",
        "elk.spacing.nodeNode": "75",
        "elk.layered.spacing.nodeNodeBetweenLayers": "75",
      },
    }),
);
const elk = await elkPromise;
```

---

### 4. NODE SIZING & LEGIBILITY

#### Model node rendering constraints
From `/tmp/loot/prismaliser/src/components/ModelNode.tsx:39-57`:

```tsx
<table
  className="font-sans bg-white border-2 border-separate border-black rounded-lg"
  style={{ minWidth: 200, maxWidth: 500, borderSpacing: 0 }}
>
  <thead title={data.documentation}>
    <tr>
      <th
        className="p-2 font-extrabold bg-gray-200 border-b-2 border-black rounded-t-md"
        colSpan={4}
      >
        {data.name}
        {!!data.dbName && (
          <span className="font-mono font-normal">
            &nbsp;({data.dbName})
          </span>
        )}
      </th>
    </tr>
  </thead>
```

Readable choices here:
- real `<table>` layout instead of absolute positioning,
- `minWidth: 200`, `maxWidth: 500`,
- monospaced field/type text,
- bold header,
- borders between cells.

From `/tmp/loot/prismaliser/src/components/ModelNode.tsx:113-140`:

```tsx
<tr key={col.name} className={styles.row} title={col.documentation}>
  <td className="font-mono font-semibold border-t-2 border-r-2 border-gray-300">
    <button
      type="button"
      className={cc([
        "relative",
        "p-2",
        { "cursor-pointer": reled },
      ])}
      onClick={() => {
        if (!reled) return;
        focusNode(col.type);
      }}
    >
      {col.name}
      {targetHandle}
    </button>
  </td>
  <td className="p-2 font-mono border-t-2 border-r-2 border-gray-300">
    {col.displayType}
  </td>
  <td className="font-mono border-t-2 border-gray-300">
    <div className="relative p-2">
      {col.defaultValue || ""}
      {sourceHandle}
    </div>
  </td>
</tr>
```

This improves legibility by keeping each concern in its own column: field name, type, default value.

#### Enum node collapsibility
From `/tmp/loot/prismaliser/src/components/EnumNode.tsx:9-18,34-64`:

```ts
const MAX_VALUES = 12;
```

```tsx
<table
  className="font-sans bg-white border-2 border-separate border-black rounded-lg"
  style={{ minWidth: 200, maxWidth: 500, borderSpacing: 0 }}
>
```

```tsx
<tbody
  className={cc([
    "flex",
    "flex-col",
    "overflow-hidden",
    { "max-h-[500px]": !expanded && data.values.length > MAX_VALUES },
  ])}
>
  {data.values.map((val) => (
    <tr key={val} className={styles.row}>
      <td className="flex p-2 font-mono border-t-2 border-gray-300">
        {val}
      </td>
    </tr>
  ))}
</tbody>
{data.values.length > MAX_VALUES && (
  <tbody>
    <tr>
      <td className="flex">
        <button
          type="button"
          className="w-full px-4 py-2 font-semibold bg-blue-200 rounded-sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Fold" : "Expand"}
        </button>
      </td>
    </tr>
  </tbody>
)}
```

This is the only real collapsible-node behavior in the repo. It is **inside the node body**, not a React Flow parent/group node.

#### Handle placement/readability
From `/tmp/loot/prismaliser/src/components/Node.module.css:11-29`:

```css
.handle {
  @apply border-4! h-4! w-4! bg-gray-700!;

  &.bottom {
    @apply -bottom-2!;
  }

  &.left {
    left: calc(-2px - var(--spacing) * 2) !important;
  }

  &.right {
    right: calc(-2px - var(--spacing) * 2) !important;
  }

  &.top {
    @apply -top-2!;
  }
}
```

This pushes handles outward so they do not overlap text.

#### Important limitation: no measured resize sync
Prismaliser does **not** update React Flow node internals when enum nodes expand/collapse. `EnumNode` changes its own rendered height with local state, but there is **no** `useUpdateNodeInternals(id)` call. That means the visual size may change without any corresponding ELK rerun or React Flow handle recomputation hook in this codebase.

---

## Architecture
- `generateFlowFromDMMF()` in `/tmp/loot/prismaliser/src/util/prismaToFlow.ts:22-38` is the main translation layer from Prisma schema metadata to React Flow nodes/edges.
- `getModelRelations()` and `relationsToEdges()` in `/tmp/loot/prismaliser/src/util/prismaToFlow.ts:97-190` and `214-268` derive relation semantics and edge handles.
- `positionNodes()` in `/tmp/loot/prismaliser/src/util/prismaToFlow.ts:404-428` merges three sources of position truth: ELK result, previous node state, or zero fallback.
- `FlowView` in `/tmp/loot/prismaliser/src/components/FlowView.tsx:43-196` owns the live React Flow state, seeds/restores positions, and exposes one manual ELK action via `refreshLayout()`.
- `layout.ts` is a pure utility. It does not know about DOM or React lifecycle; it only accepts current nodes/edges and returns an ELK layout.
- `ModelNode` and `EnumNode` are presentation-first nodes built with semantic tables and a few readability constraints.

## What to copy for graph_ui

### A. Initial auto-layout pattern to adopt
Use Prismaliser's ELK input/output shape, but trigger it automatically after your nodes have usable dimensions.

Copy from `layout.ts`:
1. Build `children` as `{ id, width, height }`.
2. Build `edges` as `{ id, sources: [source], targets: [target] }`.
3. Call `elk.layout({ id: "root", children, edges })`.
4. Write ELK `x/y` back onto React Flow `node.position`.

For `graph_ui`, adapt the sizing source:
- Prismaliser uses fixed heuristics.
- Your editor should probably prefer measured sizes for heterogeneous nodes/groups.
- Keep Prismaliser's heuristic as a fallback for first pass or headless tests.

### B. Auto-layout on first load
Prismaliser does **not** solve your load-overlap problem because it never auto-runs layout.

Concrete adaptation:
1. Create a `getLayout(nodes, edges)` utility modeled on `/tmp/loot/prismaliser/src/util/layout.ts`.
2. In your flow container, wait until nodes are initialized/measured (`useNodesInitialized()` in your app, not present here).
3. Run layout once for the incoming graph and set positions from ELK.
4. Gate it with a ref/hash so it only runs once per graph version.

### C. Re-layout policy
Prismaliser's anti-thrash idea is worth copying:
- **do not** re-layout on every drag,
- **do not** re-layout on every tiny state change,
- keep a manual "disperse / arrange" action.

For your editor, add one auto-run only when:
- graph version changes materially,
- node set changes,
- or group collapse/expand changes measured sizes.

Then debounce your own re-layout if needed; Prismaliser has **no debounce implementation to copy**.

### D. Collapsible groups
Prismaliser has **no React Flow group nodes** and no parent-child/subflow implementation. The closest pattern is the enum node's internal collapse/expand UI in `/tmp/loot/prismaliser/src/components/EnumNode.tsx:34-64`.

Concrete adaptation:
- Reuse the idea of local collapse state + max-height clipping + explicit Expand/Fold control.
- But for true group nodes, you will need extra graph_ui work not present here:
  - parent/group node type,
  - child visibility toggling,
  - re-measure + `useUpdateNodeInternals` after collapse,
  - re-layout after group size changes.

### E. Node sizing strategy
What Prismaliser gives you:
- quick deterministic size heuristic for ELK,
- `minWidth`/`maxWidth` rendering constraints,
- table-based content layout,
- handle offsets to keep connectors off text.

Concrete adaptation for `graph_ui`:
1. Keep a fallback heuristic similar to `calculateWidth`/`calculateHeight` for first-pass layout.
2. Add measured dimensions for second-pass refinement.
3. Set node UI constraints like Prismaliser's `minWidth: 200, maxWidth: 500`.
4. Offset handles away from text like `Node.module.css` does.
5. If a node expands/collapses, call `useUpdateNodeInternals` and optionally re-run ELK.

## Start Here
Open `/tmp/loot/prismaliser/src/util/layout.ts` first. It is the smallest file that answers the core questions: exact ELK config, whether sizing is measured or heuristic, and how layout input is constructed.

## Explicit answers to the 4 requested points

1. **Initial layout:** ELK config is exactly layered/down with spacing keys `elk.spacing.nodeNode=75` and `elk.layered.spacing.nodeNodeBetweenLayers=75`; widths/heights come from fixed text/row-count heuristics; ELK `x/y` are copied to `node.position`; no DOM measurement step exists.
2. **Viewport:** only `minZoom={0.05}` is set. No `fitView`, `fitViewOptions`, `defaultViewport`, or `maxZoom` found.
3. **Re-layout:** only on explicit `refreshLayout()` from the “Disperse nodes” button. Schema changes regenerate nodes without ELK. No debounce found.
4. **Node sizing & legibility:** custom nodes are semantic tables with `minWidth: 200`, `maxWidth: 500`, monospaced cell text, offset handles, and enums have internal expand/fold UI. No measured-size synchronization hooks are present.

## Acceptance report
```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Produced the requested scouting report from the actual local prismaliser clone, with exact file paths, line references, verbatim code snippets, explicit notes on absent features, and concrete adaptation guidance for graph_ui."
    }
  ],
  "changedFiles": [
    "/home/jp/proyectos/hum-ecosystem/tools/graph_ui/desk/drawer/looting/prismaliser.md",
    "/home/jp/.pi/agent/sessions/--home-jp-proyectos-hum-ecosystem-tools-graph_ui--/subagent-artifacts/progress/4d20f92d/progress.md"
  ],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "read /tmp/loot/prismaliser/src/util/layout.ts",
      "result": "passed",
      "summary": "Read ELK layout module."
    },
    {
      "command": "read /tmp/loot/prismaliser/src/util/prismaToFlow.ts",
      "result": "passed",
      "summary": "Read Prisma-to-React-Flow node/edge construction and position writeback."
    },
    {
      "command": "read /tmp/loot/prismaliser/src/components/FlowView.tsx",
      "result": "passed",
      "summary": "Read React Flow wiring and relayout trigger behavior."
    },
    {
      "command": "read /tmp/loot/prismaliser/src/util/layout.test.ts",
      "result": "passed",
      "summary": "Read sizing/layout tests."
    },
    {
      "command": "find /tmp/loot/prismaliser/src/components/**/*",
      "result": "passed",
      "summary": "Enumerated custom component files."
    },
    {
      "command": "read /tmp/loot/prismaliser/src/components/ModelNode.tsx",
      "result": "passed",
      "summary": "Read model node component."
    },
    {
      "command": "read /tmp/loot/prismaliser/src/components/EnumNode.tsx",
      "result": "passed",
      "summary": "Read enum node component."
    },
    {
      "command": "read /tmp/loot/prismaliser/src/components/RelationEdge.tsx",
      "result": "passed",
      "summary": "Read relation edge component for completeness."
    },
    {
      "command": "read /tmp/loot/prismaliser/src/components/Node.module.css",
      "result": "passed",
      "summary": "Read node handle styling."
    },
    {
      "command": "grep -R 'fitView|defaultViewport|maxZoom|useNodesInitialized|useUpdateNodeInternals|debounce|refreshLayout|getLayout\\(' /tmp/loot/prismaliser/src",
      "result": "passed",
      "summary": "Verified presence/absence of viewport and relayout hooks."
    },
    {
      "command": "nl -ba /tmp/loot/prismaliser/src/util/layout.ts | sed -n '1,220p'",
      "result": "passed",
      "summary": "Captured numbered lines for citation."
    },
    {
      "command": "nl -ba /tmp/loot/prismaliser/src/util/prismaToFlow.ts | sed -n '1,460p'",
      "result": "passed",
      "summary": "Captured numbered lines for citation."
    },
    {
      "command": "nl -ba /tmp/loot/prismaliser/src/components/FlowView.tsx | sed -n '1,240p'",
      "result": "passed",
      "summary": "Captured numbered lines for citation."
    },
    {
      "command": "nl -ba /tmp/loot/prismaliser/src/util/layout.test.ts | sed -n '1,220p'",
      "result": "passed",
      "summary": "Captured numbered lines for citation."
    },
    {
      "command": "nl -ba /tmp/loot/prismaliser/src/components/ModelNode.tsx | sed -n '1,240p'",
      "result": "passed",
      "summary": "Captured numbered lines for citation."
    },
    {
      "command": "nl -ba /tmp/loot/prismaliser/src/components/EnumNode.tsx | sed -n '1,220p'",
      "result": "passed",
      "summary": "Captured numbered lines for citation."
    },
    {
      "command": "nl -ba /tmp/loot/prismaliser/src/components/Node.module.css | sed -n '1,200p'",
      "result": "passed",
      "summary": "Captured numbered lines for citation."
    }
  ],
  "validationOutput": [
    "Report written to /home/jp/proyectos/hum-ecosystem/tools/graph_ui/desk/drawer/looting/prismaliser.md",
    "Progress update written to /home/jp/.pi/agent/sessions/--home-jp-proyectos-hum-ecosystem-tools-graph_ui--/subagent-artifacts/progress/4d20f92d/progress.md"
  ],
  "residualRisks": [
    "Prismaliser does not implement initial auto-layout, fitView/defaultViewport, true group nodes, measured node sizing, or debounce; those parts must be designed in graph_ui rather than copied directly.",
    "EnumNode expands visually without useUpdateNodeInternals, so copied collapse patterns need extra React Flow internals sync in graph_ui."
  ],
  "noStagedFiles": true,
  "diffSummary": "Added scouting report and progress update; no source-code changes to graph_ui or prismaliser.",
  "reviewFindings": [
    "no blockers"
  ],
  "manualNotes": "This was a read-only scouting task against /tmp/loot/prismaliser. All conclusions are based on actual files in the local clone."
}
```
