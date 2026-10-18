# Code Context

## Repo overview
- Repo inspected: `/tmp/loot/liam` at commit `92156ea`.
- Area inspected: `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/` and the React Flow wrapper at `/tmp/loot/liam/frontend/packages/erd-core/src/features/reactflow/`.
- Liam does **not** implement per-node collapse/expand toggles. Instead it has a **global show mode** (`ALL_FIELDS` / `KEY_ONLY` / `TABLE_NAME`) that changes how every table node renders. That is the closest copyable pattern for “collapsed vs expanded”.
- Liam also hides/show tables, and every layout pass excludes hidden nodes from ELK.

## Files Retrieved
1. `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/utils/computeAutoLayout/getElkLayout.ts` (lines 1-44) - ELK instance, complete layout options object, graph assembly, and `elk.layout(...)` call.
2. `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/utils/computeAutoLayout/convertNodesToElkNodes.ts` (lines 1-41) - how React Flow node dimensions are fed into ELK via `node.measured?.width/height`.
3. `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/utils/computeAutoLayout/convertElkNodesToNodes.ts` (lines 1-31) - how ELK positions and sizes are written back to React Flow nodes.
4. `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/utils/computeAutoLayout/computeAutoLayout.ts` (lines 1-30) - filters hidden nodes/edges before layout, then merges hidden nodes back.
5. `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/components/ERDContent/hooks/useInitialAutoLayout.ts` (lines 1-82) - initial layout trigger; waits for measured table nodes before running auto-layout, then `fitView(...)`.
6. `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/components/ERDContent/hooks/useQueryParamsChanged.ts` (lines 1-63) - re-layout only on browser popstate/query-param navigation.
7. `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/components/ERDContent/ErdContent.tsx` (lines 1-180) - `ReactFlow` setup, min/max zoom, node types, and the related-tables override to `TABLE_NAME` mode.
8. `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/components/ERDRenderer/ErdRenderer.tsx` (lines 160-190) - remount key `key={`${schemaKey}-${showMode}`}`; changing show mode recreates `ERDContent`, which reruns initial layout.
9. `/tmp/loot/liam/frontend/packages/erd-core/src/features/reactflow/hooks/useCustomReactflow.ts` (lines 1-23) - fitView wrapper that always injects `MIN_ZOOM`/`MAX_ZOOM`.
10. `/tmp/loot/liam/frontend/packages/erd-core/src/features/reactflow/constants.ts` (lines 1-2) - `MIN_ZOOM = 0.1`, `MAX_ZOOM = 2`.
11. `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/utils/convertSchemaToNodes.ts` (lines 1-103) - initial nodes/edges produced at `{ x: 0, y: 0 }`, with edge handles depending on show mode.
12. `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/components/ERDContent/components/TableNode/TableNode.tsx` (lines 1-59) - actual custom table node rendering; columns included/omitted by show mode.
13. `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/components/ERDContent/components/TableNode/TableColumnList/TableColumnList.tsx` (lines 1-59) - `KEY_ONLY` filtering logic.
14. `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/components/ERDContent/components/TableNode/TableHeader/TableHeader.tsx` (lines 1-127) - tooltip/truncation logic and handle rendering for `TABLE_NAME` mode.
15. `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/hooks/useTableSelection/useTableSelection.ts` (lines 1-54) - focused-node `fitView` behavior.
16. `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/components/ERDContent/utils/updateNodesHiddenState.ts` (lines 1-20) - hidden-node flagging before layout.

## Key Code

### 1. Initial layout: exact ELK options and layout call
From `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/utils/computeAutoLayout/getElkLayout.ts:9-18`:

```ts
const layoutOptions: LayoutOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.baseValue': '40',
  'elk.spacing.componentComponent': '80',
  'elk.layered.spacing.edgeNodeBetweenLayers': '120',
  'elk.layered.considerModelOrder.strategy': 'PREFER_EDGES',
  'elk.layered.crossingMinimization.forceNodeModelOrder': 'true',
  'elk.layered.mergeEdges': 'true',
  'elk.layered.nodePlacement.strategy': 'INTERACTIVE',
  'elk.layered.layering.strategy': 'INTERACTIVE',
}
```

Important: Liam does **not** set an explicit ELK direction (`elk.direction`). If you need left-to-right or top-to-bottom in `graph_ui`, you must add that yourself.

From `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/utils/computeAutoLayout/getElkLayout.ts:26-43`:

```ts
export async function getElkLayout({ nodes, edges }: Params): Promise<Node[]> {
  const graph: ElkNode = {
    id: 'root',
    layoutOptions,
    children: convertNodesToElkNodes(nodes),
    edges: edges.map(({ id, source, target }) => ({
      id,
      sources: [source],
      targets: [target],
    })),
  }

  const layout = await elk.layout(graph)
  if (!layout.children) {
    return nodes
  }

  return convertElkNodesToNodes(layout.children, nodes)
}
```

### 2. Node sizing fed into ELK
From `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/utils/computeAutoLayout/convertNodesToElkNodes.ts:8-23`:

```ts
for (const node of nodes) {
  const elkNode: ElkNode = {
    ...node,
    width: node.measured?.width ?? 0,
    height: node.measured?.height ?? 0,
    layoutOptions: {
      /**
       * NOTE
       * For NonRelatedTableGroup Nodes, arrange child Nodes in a vertical layout.
       * For all other cases, use default values.
       */
      'elk.aspectRatio':
        node.type === 'nonRelatedTableGroup' ? '0.5625' : '1.6f',
      'elk.alignment': 'LEFT',
    },
  }
```

So yes: Liam relies on **React Flow measured node dimensions** (`node.measured?.width` / `node.measured?.height`), not hard-coded widths/heights.

### 3. Does Liam wait for rendered node measurement first?
Yes, but **not** via `useNodesInitialized`. I grepped the package and found **no usage** of `useNodesInitialized` and **no usage** of `defaultViewport`.

Instead, `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/components/ERDContent/hooks/useInitialAutoLayout.ts:24-28` gates layout on `node.measured`:

```ts
const tableNodesInitialized = useMemo(() => {
  return nodes
    .filter((node) => node.type === 'table')
    .some((node) => node.measured)
}, [nodes])
```

Then `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/components/ERDContent/hooks/useInitialAutoLayout.ts:35-63` runs layout only after that becomes true:

```ts
if (tableNodesInitialized) {
  setLoading(true)

  const updateNodes =
    displayArea === 'main'
      ? updateNodesHiddenState({
          nodes,
          hiddenNodeIds,
          shouldHideGroupNodeId: !hasNonRelatedChildNodes(nodes),
        })
      : nodes
  const { nodes: highlightedNodes, edges: highlightedEdges } =
    highlightNodesAndEdges(updateNodes, getEdges(), {
      activeTableName: activeTableName ?? undefined,
    })
  const { nodes: layoutedNodes, edges: layoutedEdges } =
    await computeAutoLayout(highlightedNodes, highlightedEdges)

  setNodes(layoutedNodes)
  setEdges(layoutedEdges)

  const fitViewOptions =
    displayArea === 'main' && activeTableName
      ? { maxZoom: 1, duration: 300, nodes: [{ id: activeTableName }] }
      : { duration: 0 }
  fitView(fitViewOptions)

  setInitializeComplete(true)
  setLoading(false)
}
```

Caveat: it uses `.some((node) => node.measured)`, not `.every(...)`. That means Liam only waits until **at least one** table has measured dimensions. If you copy this, you may want stricter gating in `graph_ui` for 100+ nodes.

### 4. How ELK positions are written back
From `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/utils/computeAutoLayout/convertElkNodesToNodes.ts:13-21`:

```ts
nodes.push({
  ...originNode,
  position: {
    x: elkNode.x ?? 0,
    y: elkNode.y ?? 0,
  },
  width: elkNode.width ?? 0,
  height: elkNode.height ?? 0,
})
```

And recursion keeps child nodes from grouped ELK nodes:

```ts
if (elkNode.children) {
  for (const child of elkNode.children) {
    nodes.push(...convertElkNodesToNodes([child], originNodes))
  }
}
```

### 5. Hidden nodes are excluded from ELK and merged back
From `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/utils/computeAutoLayout/computeAutoLayout.ts:4-29`:

```ts
export const computeAutoLayout = async (nodes: Node[], edges: Edge[]) => {
  const hiddenNodes: Node[] = []
  const visibleNodes: Node[] = []
  for (const node of nodes) {
    if (node.hidden) {
      hiddenNodes.push(node)
    } else {
      visibleNodes.push(node)
    }
  }

  // NOTE: Only include edges where both the source and target are in the nodes
  const nodeMap = new Map(visibleNodes.map((node) => [node.id, node]))
  const visibleEdges = edges.filter((edge) => {
    return nodeMap.get(edge.source) && nodeMap.get(edge.target)
  })

  const newNodes = await getElkLayout({
    nodes: visibleNodes,
    edges: visibleEdges,
  })

  return {
    nodes: [...hiddenNodes, ...newNodes],
    edges,
  }
}
```

### 6. Collapse/expand behavior actually present in Liam
Liam has **no per-table expand/collapse state** and no `collapsed` field on table nodes in this package.

What Liam does have is a **global show mode** that changes node content height:
- `ALL_FIELDS` = header + all columns
- `KEY_ONLY` = header + filtered subset of columns
- `TABLE_NAME` = header only

From `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/components/ERDContent/components/TableNode/TableNode.tsx:39-43`:

```ts
<TableHeader data={data} />
{showMode === 'ALL_FIELDS' && <TableColumnList data={data} />}
{showMode === 'KEY_ONLY' && (
  <TableColumnList data={data} filter="KEY_ONLY" />
)}
```

From `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/components/ERDContent/components/TableNode/TableColumnList/TableColumnList.tsx:18-24`:

```ts
if (filter === 'KEY_ONLY') {
  return (
    isPrimaryKey(column.name, table.constraints) ||
    targetColumnCardinalities?.[column.name] !== undefined
  )
}
return true
```

For true “collapsed” rendering, the closest Liam analogue is `TABLE_NAME` mode. In that mode, handles move to the header instead of column rows. From `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/components/ERDContent/components/TableNode/TableHeader/TableHeader.tsx:104-123`:

```ts
{showMode === 'TABLE_NAME' && (
  <>
    {isTarget && (
      <Handle
        id={name}
        type="target"
        position={Position.Left}
        className={styles.handle}
      />
    )}
    {isSource && (
      <Handle
        id={name}
        type="source"
        position={Position.Right}
        className={styles.handle}
      />
    )}
  </>
)}
```

### 7. How node height is recomputed after “collapse/expand” equivalent
Liam does **not** manually recompute height. It relies on React Flow measuring the rendered DOM again after the show mode changes.

The key mechanism is that the main ERD is remounted when `showMode` changes. From `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/components/ERDRenderer/ErdRenderer.tsx:170-175`:

```tsx
<ERDContent
  key={`${schemaKey}-${showMode}`}
  nodes={nodes}
  edges={edges}
  displayArea="main"
/>
```

Because `ERDContent` remounts, nodes render at the new DOM height, React Flow measures them again, and `useInitialAutoLayout` reruns when `node.measured` exists.

There is **no** node-local collapse handler that immediately calls layout. The re-layout triggers I found are:
1. initial mount once measured nodes exist,
2. browser popstate/query-param navigation,
3. explicit “Tidy up” button,
4. opening the related-tables view into the main pane.

### 8. Re-layout triggers actually found
Initial mount: `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/components/ERDContent/hooks/useInitialAutoLayout.ts:79-81`

```ts
useEffect(() => {
  initialize()
}, [initialize])
```

Browser navigation/query params: `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/components/ERDContent/hooks/useQueryParamsChanged.ts:21-47`

```ts
// NOTE: Only execute layout calculation during browser navigation
if (!isPopstateInProgress) return
...
const { nodes: layoutedNodes, edges: layoutedEdges } =
  await computeAutoLayout(highlightedNodes, highlightedEdges)
...
await fitView(fitViewOptions)
```

Manual tidy-up: `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/components/ERDRenderer/Toolbar/TidyUpButton/TidyUpButton.tsx:39-42`

```ts
const { nodes } = await computeAutoLayout(getNodes(), getEdges())
setNodes(nodes)
fitView()
```

Related-tables -> main pane: `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/components/ERDContent/components/TableNode/TableDetail/TableDetail.tsx:56-60`

```ts
const { nodes: layoutedNodes, edges: layoutedEdges } =
  await computeAutoLayout(updatedNodes, getEdges())
setNodes(layoutedNodes)
setEdges(layoutedEdges)
fitView()
```

### 9. Viewport / fitView behavior
There is **no `defaultViewport`** in the inspected package.

React Flow itself is configured with zoom bounds only. From `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/components/ERDContent/ErdContent.tsx:152-173`:

```tsx
<ReactFlow
  colorMode="dark"
  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes}
  edgeTypes={edgeTypes}
  edgesFocusable={false}
  edgesReconnectable={false}
  minZoom={MIN_ZOOM}
  maxZoom={MAX_ZOOM}
  ...
  nodesConnectable={false}
>
```

Zoom constants are from `/tmp/loot/liam/frontend/packages/erd-core/src/features/reactflow/constants.ts:1-2`:

```ts
export const MIN_ZOOM = 0.1
export const MAX_ZOOM = 2
```

And `fitView` is wrapped so every call inherits those bounds. From `/tmp/loot/liam/frontend/packages/erd-core/src/features/reactflow/hooks/useCustomReactflow.ts:8-15`:

```ts
const fitView = useCallback(
  (options?: FitViewOptions) => {
    reactFlowInstance.fitView({
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      ...options,
    })
  },
  [reactFlowInstance],
)
```

Initial fit behavior after auto-layout: `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/components/ERDContent/hooks/useInitialAutoLayout.ts:56-60`

```ts
const fitViewOptions =
  displayArea === 'main' && activeTableName
    ? { maxZoom: 1, duration: 300, nodes: [{ id: activeTableName }] }
    : { duration: 0 }
fitView(fitViewOptions)
```

Selection fit behavior: `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/hooks/useTableSelection/useTableSelection.ts:29-34`

```ts
if (displayArea === 'main') {
  await fitView({
    maxZoom: 1,
    duration: 300,
    nodes: [{ id: tableId }],
  })
}
```

### 10. Node sizing + legibility details
Initial node positions are all dumped at `(0,0)` before layout. From `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/utils/convertSchemaToNodes.ts:51-65`:

```ts
return {
  id: table.name,
  type: 'table',
  data: {
    table,
    sourceColumnName: sourceColumns.get(table.name),
    targetColumnCardinalities: tableColumnCardinalities.get(table.name),
  },
  position: { x: 0, y: 0 },
  ariaLabel: `${table.name} table`,
  zIndex: zIndex.nodeDefault,
  ...(isNonRelatedTable
    ? { parentId: NON_RELATED_TABLE_GROUP_NODE_ID }
    : {}),
}
```

So Liam has the same “all nodes start overlapped” condition until auto-layout runs.

Legibility handling actually found:
- zoom floor/ceiling via `MIN_ZOOM`/`MAX_ZOOM`,
- global show modes (`ALL_FIELDS` / `KEY_ONLY` / `TABLE_NAME`) to reduce content density,
- tooltip for truncated table names.

From `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/components/ERDContent/components/TableNode/TableHeader/TableHeader.tsx:51-68`:

```ts
const handleHoverEvent = (event: MouseEvent<HTMLSpanElement>) => {
  // Get computed styles to check if text is truncated
  const element = event.currentTarget
  // Create a range to measure the text
  const range = document.createRange()
  range.selectNodeContents(element)

  // Get the text width using getBoundingClientRect
  const textWidth = range.getBoundingClientRect().width
  const containerWidth = element.getBoundingClientRect().width
  const isTruncated = textWidth > containerWidth + 0.018

  updateNode(name, {
    data: {
      ...data,
      isTooltipVisible: isTruncated,
    },
  })
}
```

I did **not** find any zoom-threshold-based automatic mode switching or any custom “report measured dimensions” callback beyond React Flow’s built-in `node.measured` field.

## Architecture
1. Schema is converted to React Flow nodes/edges by `convertSchemaToNodes(...)`, with every table starting at `{ x: 0, y: 0 }`.
2. `ERDContent` mounts those nodes inside `<ReactFlow>` using the custom `TableNode` renderer.
3. React Flow measures rendered node DOM and stores dimensions on `node.measured`.
4. `useInitialAutoLayout` waits until measured table nodes exist, then calls `computeAutoLayout(...)`.
5. `computeAutoLayout(...)` strips hidden nodes/edges, calls `getElkLayout(...)`, then merges hidden nodes back.
6. `getElkLayout(...)` converts measured React Flow nodes to ELK nodes, runs `elk.layout(graph)`, and `convertElkNodesToNodes(...)` writes `x/y/width/height` back onto the original nodes.
7. After layout, Liam calls `fitView(...)`, optionally focusing a selected table.
8. When global `showMode` changes, `ERDContent` remounts via `key={`${schemaKey}-${showMode}`}`, which causes new DOM measurement and a fresh initial layout.

## What to copy for graph_ui
1. **Run an initial ELK layout immediately after node measurement exists.**
   - Copy the Liam pattern of rendering nodes first, waiting for React Flow measurement, then calling ELK.
   - Prefer `every(node => node.measured?.width && node.measured?.height)` instead of Liam’s looser `.some(...)` for your 100+ node case.
2. **Feed ELK actual measured dimensions, not guessed sizes.**
   - Copy:
   ```ts
   width: node.measured?.width ?? 0,
   height: node.measured?.height ?? 0,
   ```
3. **Write ELK positions back into React Flow `position`, and keep returned sizes.**
   - Copy:
   ```ts
   position: { x: elkNode.x ?? 0, y: elkNode.y ?? 0 },
   width: elkNode.width ?? 0,
   height: elkNode.height ?? 0,
   ```
4. **Keep hidden/collapsed nodes out of ELK input.**
   - Copy Liam’s split into visible vs hidden nodes, and only pass visible edges whose endpoints are visible.
5. **For collapse/expand in `graph_ui`, use Liam’s show-mode idea as the starting pattern.**
   - Implement a node-local `collapsed`/`expanded` state or section toggles.
   - Render fewer rows when collapsed.
   - Let React Flow re-measure the DOM.
   - Re-run ELK after the state change.
   - Liam does not have this last step per-node; you will need to add it.
6. **If node content density changes, remount or otherwise force a fresh measurement before re-layout.**
   - Liam’s `key={`${schemaKey}-${showMode}`}` is the key copyable pattern.
7. **Use bounded fitView after layout.**
   - Liam wraps `fitView` with global min/max zoom and sometimes focuses one node with `{ nodes: [{ id }], maxZoom: 1, duration: 300 }`.
8. **Consider adding explicit ELK direction in `graph_ui`.**
   - Liam does not set `elk.direction`, so if you need deterministic LR/TB output, add it yourself.

## Start Here
Open `/tmp/loot/liam/frontend/packages/erd-core/src/features/erd/utils/computeAutoLayout/getElkLayout.ts` first. It is the narrowest entry point for the full ELK flow: options, graph assembly, and the call into ELK. Then read `convertNodesToElkNodes.ts` and `useInitialAutoLayout.ts` together, because those explain the sizing + timing behavior that matters most for your overlapping-on-load problem.

## Acceptance report
```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Produced a scoped scouting report only: inspected the requested Liam files and wrote a concrete, copyable report with exact paths, line refs, verbatim snippets, ELK options, viewport behavior, and explicit notes about missing per-node collapse/defaultViewport/useNodesInitialized patterns."
    }
  ],
  "changedFiles": [
    "/home/jp/proyectos/hum-ecosystem/tools/graph_ui/desk/drawer/looting/liam.md",
    "/home/jp/.pi/agent/sessions/--home-jp-proyectos-hum-ecosystem-tools-graph_ui--/subagent-artifacts/progress/4d20f92d/progress.md"
  ],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "grep search across /tmp/loot/liam/frontend/packages/erd-core/src/features/erd for useNodesInitialized|fitView|defaultViewport|collapse|hidden|TableNode|re-layout triggers",
      "result": "passed",
      "summary": "Located layout hooks, hidden-node utilities, TableNode component, fitView usage, and confirmed absence of useNodesInitialized/defaultViewport/per-node collapse in the scanned package."
    },
    {
      "command": "read/nl -ba on targeted source files under /tmp/loot/liam/frontend/packages/erd-core/src/features/erd and /features/reactflow",
      "result": "passed",
      "summary": "Captured exact code and line references for ELK options, measurement flow, node rendering, viewport behavior, and re-layout triggers."
    },
    {
      "command": "cd /tmp/loot/liam && git rev-parse --short HEAD",
      "result": "passed",
      "summary": "Verified inspected clone commit as 92156ea."
    },
    {
      "command": "cd /tmp/loot/liam && git status --short",
      "result": "passed",
      "summary": "No staged or modified files reported in the inspected repo clone."
    }
  ],
  "validationOutput": [
    "`useNodesInitialized`: no matches found under erd-core src.",
    "`defaultViewport`: no matches found under erd-core src.",
    "Per-node collapse/expand for table nodes: not present in inspected erd-core package.",
    "Report written to /home/jp/proyectos/hum-ecosystem/tools/graph_ui/desk/drawer/looting/liam.md"
  ],
  "residualRisks": [
    "Liam waits for `.some(node.measured)` rather than all nodes being measured; copying that exactly may still permit early layout in graph_ui.",
    "Liam has no node-local collapse/expand implementation, so graph_ui will need an extra re-measure + re-layout trigger beyond what Liam provides."
  ],
  "noStagedFiles": true,
  "diffSummary": "Added a scouting report and progress note; no source code in the inspected Liam clone was modified.",
  "reviewFindings": [
    "no blockers"
  ],
  "manualNotes": "This run was a read-only scout. The most relevant copy points for graph_ui are: use measured node sizes for ELK, gate initial layout until nodes are measured, exclude hidden/collapsed nodes from ELK input, and force a fresh measurement + layout when rendered node density changes."
}
```
