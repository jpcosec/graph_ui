# Code Context

## Files Retrieved
1. `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/layout/useLayout.ts` (lines 1-155) - the only auto-layout logic; uses Dagre for parent pipeline containers and special-cycle edge routing.
2. `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/useClientNodes.tsx` (lines 1-172) - computes parent container width/height and all child node positions inside each parent.
3. `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/useEdgeCreator.tsx` (lines 1-161) - defines how child nodes are connected within a pipeline and how connector edges become inter-parent layout edges.
4. `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/ReactFlow.tsx` (lines 1-301) - main canvas; wires nodes/edges/layout together and defines viewport behavior.
5. `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/node-types/ParentsNode.tsx` (lines 1-92) - renders the parent/group container with explicit `height` and `width` from node data.
6. `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/node-types/ParentNodeTag.tsx` (lines 1-36) - renders the parent label/tag.
7. `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/node-types/Node.tsx` (lines 1-120) - base child-node sizing and text legibility rules.
8. `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/node-types/ReceiversNode.tsx` (lines 1-19) - receiver node wrapper and handle placement.
9. `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/node-types/ProcessorsNode.tsx` (lines 1-19) - processor node wrapper and handle placement.
10. `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/node-types/ExportersNode.tsx` (lines 1-19) - exporter node wrapper and handle placement.

## Repo overview
`packages/otelbin/src/components/react-flow/` contains the graph editor. The flow is:
- YAML config -> `useClientNodes.tsx` creates parent + child React Flow nodes.
- `useEdgeCreator.tsx` creates intra-pipeline edges and connector edges across pipelines.
- `layout/useLayout.ts` runs Dagre only on parent pipeline nodes, then writes the resulting positions back into those parent nodes.
- `ReactFlow.tsx` loads those nodes/edges into React Flow and repeatedly calls `fitView()` for initial and updated viewport framing.

## Key Code

### 1. Initial layout library and full config
Otelbin uses **Dagre**, not ELK.

From `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/layout/useLayout.ts:48-68`:

```ts
const g = new Dagre.graphlib.Graph({ directed: true }).setDefaultEdgeLabel(() => ({}));
g.setGraph({ rankdir: "LR" });

const pipelineNodes = nodes.filter((node) => node.type === "parentNodeType");
const otherNodes = nodes.filter((node) => node.type !== "parentNodeType");

edges.forEach((edge) => {
	if (edge.data?.sourcePipeline && edge.data?.targetPipeline) {
		g.setEdge(edge.data.sourcePipeline, edge.data.targetPipeline);
	}
});

pipelineNodes.forEach((node) => {
	g.setNode(node.id, { width: node.data?.width, height: node.data?.height });
});

Dagre.layout(g);

const layoutedPipelineNodes = pipelineNodes.map((node) => {
	return { ...node, position: dagrePosition2FlowPosition(g.node(node.id)) };
});
```

And from `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/layout/useLayout.ts:28-40`:

```ts
const dagrePosition2FlowPosition = ({
	x,
	y,
	height,
	width,
}: {
	x: number;
	y: number;
	height: number;
	width: number;
}) => {
	// shift the dagre node position (anchor is center) to matche the React Flow node anchor point (top left).
	return { x: x - width / 2, y: y - height / 2 };
};
```

**Complete layout config actually present in the repo:**
- Library: `@dagrejs/dagre`
- Graph option: `{ directed: true }`
- Default edge label: `() => ({})`
- `setGraph(...)`: **only** `{ rankdir: "LR" }`
- Additional spacing keys like `nodesep`, `ranksep`, `marginx`, `marginy`, `edgesep`, ELK options, etc.: **absent**.

So otelbin does **not** provide a richer spacing config to copy. If your app needs better readability for 100+ nodes, this repo is only a proof of using Dagre and feeding it parent-node dimensions.

How sizes are fed in and positions written back:
- Parent width/height come from `node.data.width` and `node.data.height`.
- Dagre positions are center-anchored.
- They are converted to React Flow top-left coordinates by subtracting half width/height.
- Only `parentNodeType` nodes get new positions; child nodes keep their precomputed positions relative to the parent.

### 2. Parent/group nodes: rendering and sizing
The parent node is just a styled div sized from `data.height` and `data.width`.

From `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/node-types/ParentsNode.tsx:67-86`:

```tsx
const ParentsNode = ({ data }: { data: IData }) => {
	return (
		<>
			{parentNodesConfig
				.filter((config) => data.label.match(config.typeRegex))
				.map((node, idx) => {
					return (
						<div
							id={"parentNode"}
							key={idx}
							style={{
								backgroundColor: node.backgroundColor,
								border: node.borderColor,
								height: data.height,
								width: data.width,
							}}
							className="rounded-[4px] text-[10px] text-black"
						>
							<ParentNodeTag tag={data.label} />
						</div>
					);
				})}
		</>
	);
};
```

The parent height is computed from child counts in `useClientNodes.tsx`.

From `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/useClientNodes.tsx:143-167`:

```ts
for (const [pipelineName, pipeline] of Object.entries(pipelines)) {
	const receivers = pipeline.receivers?.length ?? 0;
	const exporters = pipeline.exporters?.length ?? 0;
	const maxNodes = Math.max(receivers, exporters) ?? 1;
	const spaceBetweenParents = 40;
	const spaceBetweenNodes = 90;
	const totalSpacing = maxNodes * spaceBetweenNodes;
	const parentHeight = totalSpacing + maxNodes * childNodesHeight;

	nodesToAdd.push({
		id: pipelineName,
		type: "parentNodeType",
		position: { x: 0, y: 0 },
		data: {
			label: pipelineName,
			parentNode: pipelineName,
			width: 430 + 200 * (pipeline.processors?.length ?? 0),
			height: maxNodes === 1 ? parentHeight : parentHeight + spaceBetweenParents,
			type: "parentNodeType",
			childNodes: createNode(pipelineName, pipeline, parentHeight + spaceBetweenParents, connectors),
		},
		draggable: false,
		ariaLabel: pipelineName,
		expandParent: true,
	});
```

That gives the exact sizing rule:
- `childNodesHeight = 80`
- `spaceBetweenNodes = 90`
- `spaceBetweenParents = 40`
- `maxNodes = max(receivers.length, exporters.length)`
- `parentHeight = maxNodes * 90 + maxNodes * 80`
- final parent `data.height = maxNodes === 1 ? parentHeight : parentHeight + 40`
- final parent `data.width = 430 + 200 * processorCount`

This is not a collapsed/expanded implementation. It is a fixed expanded-size formula based on child counts.

How child positions are computed inside the parent:

From `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/useClientNodes.tsx:14-51`:

```ts
const calcYPosition = (index: number, parentHeight: number, nodes: string[]): number | undefined => {
	const childNodePositions = [];
	const spaceBetweenNodes = (parentHeight - nodes.length * childNodesHeight) / (nodes.length + 1);

	for (let i = 0; i < nodes.length; i++) {
		const yPosition = spaceBetweenNodes + i * (childNodesHeight + spaceBetweenNodes);

		childNodePositions.push(yPosition);
	}
	switch (nodes.length) {
		case 0:
			return;
		case 1:
			return (parentHeight - 40) / 2 - 20;
		default:
			return childNodePositions[index];
	}
};

const processorPosition = (index: number, parentHeight: number, receivers: string[]): XYPosition => {
	const receiverLength = receivers.length ? 250 : 0;
	return { x: receiverLength + index * 200, y: (parentHeight - 40) / 2 - 20 };
};

const receiverPosition = (index: number, parentHeight: number, receivers: string[]): XYPosition => {
	const positionY = calcYPosition(index, parentHeight, receivers);
	return { x: 50, y: positionY ?? parentHeight / 2 };
};

const exporterPosition = (
	index: number,
	parentHeight: number,
	exporters: string[],
	processors: string[]
): XYPosition => {
	const positionY = calcYPosition(index, parentHeight, exporters);
	const processorLength = (processors?.length ?? 0) * 200 + 260;
	return { x: processorLength, y: positionY ?? parentHeight / 2 };
};
```

And child nodes are attached with `parentNode` and `extent: "parent"`.
From `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/useClientNodes.tsx:62-76`, `85-99`, and `107-121`:

```ts
nodesToAdd.push({
	id: id,
	parentNode: pipelineName,
	extent: "parent",
	type: "processorsNode",
	position: processorPosition(index, height, processors),
	...
	draggable: false,
});
```

```ts
nodesToAdd.push({
	id: id,
	parentNode: pipelineName,
	extent: "parent",
	type: "receiversNode",
	position: receiverPosition(index, height, receivers),
	...
	draggable: false,
});
```

```ts
nodesToAdd.push({
	id: id,
	parentNode: pipelineName,
	extent: "parent",
	type: "exportersNode",
	position: exporterPosition(index, height, exporters, processors ?? []),
	...
	draggable: false,
});
```

**Important absence:** there is no real collapse/expand state, no dynamic resize from measured child bounds, and no `hidden` toggling for children. `expandParent: true` is present on the parent node, but this repo does not implement a collapsible parent-group UX.

### 3. Viewport / initial zoom / fitView
Otelbin does not set `defaultViewport`.

From `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/ReactFlow.tsx:66-80`:

```ts
useEffect(() => {
	reactFlowInstance.fitView();
}, [reactFlowWidth, reactFlowInstance]);

useEffect(() => {
	if (jsonData) {
		setEdges(layoutedEdges);
		setNodes(layoutedNodes !== undefined ? layoutedNodes : []);
		reactFlowInstance.fitView();
	} else {
		setNodes(EmptyStateNodeData);
		setEdges([]);
		reactFlowInstance.fitView();
	}
}, [layoutedNodes, layoutedEdges, value, jsonData, setEdges, setNodes, reactFlowInstance]);
```

And the canvas itself, `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/ReactFlow.tsx:235-247`:

```tsx
<ReactFlow
	nodes={jsonData.service ? nodes : EmptyStateNodeData}
	edges={edges}
	defaultEdgeOptions={edgeOptions}
	nodeTypes={jsonData.service ? nodeTypes : EmptyStateNodeType}
	edgeTypes={edgeTypes}
	fitView
	className="disable-attribution bg-default"
	proOptions={{
		hideAttribution: process.env.NEXT_PUBLIC_HIDE_REACT_FLOW_ATTRIBUTION === "true",
	}}
	maxZoom={!jsonData.service ? 1 : undefined}
>
```

Other viewport behavior exists only for editor-to-graph navigation:
- Parent focus zoom: `zoom: 1.2` at `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/ReactFlow.tsx:132-136`
- Child focus zoom: `zoom: 2` at `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/ReactFlow.tsx:150-153` and `166-169`

So the initial viewport pattern to copy is simply: set nodes/edges, then call `fitView()`; no explicit starting `{x,y,zoom}` is configured.

### 4. Node sizing and legibility
The child node box is fixed-size.

From `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/node-types/Node.tsx:64-116`:

```tsx
<div
	className={`flex h-20 w-[120px] flex-col items-center rounded-lg shadow-node ${
		type === "exporter" ? "ml-3" : type === "receiver" ? "mr-3" : "mx-3"
	} ${isFocused === data.id ? (isConnector ? "animate-connectorFocus" : "animate-focus") : ""}
    ${isFocused === data.id && type === "processor" ? "animate-processorFocus" : ""}
    `}
>
	<div
		style={customNodeHeaderStyle}
		className={`px-3   ${
			isConnector && (type === "exporter" || type === "receiver")
				? "bg-green-500 text-green-950"
				: type === "processor"
					? "bg-blue-500"
					: "bg-violet-500"
		}
         text-xs font-medium h-[35%] overflow-hidden whitespace-nowrap overflow-ellipsis w-full flex items-center justify-center`}
	>
		{splitLabel[0]}
	</div>
	<div
		style={customNodeStyles}
		className="cursor-pointer flex-col"
		...
	>
		{handle1}
		<div
			className={`flex w-full flex-col items-center justify-center gap-y-1 px-2 ${
				splitLabel[1] && splitLabel[1].length > 0 && "mt-[2px]"
			}`}
		>
			<div style={iconColor}>{isConnector ? <ConnectorIcon /> : icon}</div>
			{splitLabel.length > 1 && (
				<div
					className={`${
						hovered ? "text-neutral-900" : "text-neutral-600"
					} text-[10px] font-normal  overflow-hidden whitespace-nowrap overflow-ellipsis max-w-[90%]`}
				>
					{splitLabel[1]}
				</div>
			)}
		</div>
		{handle2}
	</div>
</div>
```

And the sizing inputs in `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/useClientNodes.tsx:8` and `72,95,117`:

```ts
const childNodesHeight = 80;
```

Each child node also stores `data.height: childNodesHeight`, but actual visual width/height is hard-coded in the React component via Tailwind classes (`h-20 w-[120px]`).

Legibility techniques actually used:
- fixed node size: `h-20 w-[120px]`
- split labels on `/`: `const splitLabel = label.includes("/") ? label.split("/") : [label];`
- one-line header with ellipsis: `overflow-hidden whitespace-nowrap overflow-ellipsis`
- optional second line for suffix with `text-[10px]` and ellipsis
- strong type color coding in header (`bg-green-500`, `bg-blue-500`, `bg-violet-500`)
- focus animation classes for highlighted nodes
- invisible handles to avoid visual clutter:

From `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/node-types/Node.tsx:10-13`:

```ts
export const handleStyle = {
	backgroundColor: "rgb(44 48 70 / 0%)",
	borderColor: "rgb(44 48 70 / 0%)",
};
```

### 5. Edge/data flow that matters for layout
Inter-parent layout is driven only by connector edges. From `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/useEdgeCreator.tsx:36-57`:

```ts
function createConnectorEdge(sourceNode: Node, targetNode: Node): Edge {
	const edgeId = `edge-${sourceNode.id}-${targetNode.id}`;
	return {
		id: edgeId,
		source: sourceNode.id,
		target: targetNode.id,
		type: "default",
		markerEnd: {
			type: MarkerType.Arrow,
			color: "#9CA2AB",
			width: 20,
			height: 25,
		},
		style: {
			stroke: "#9CA2AB",
		},
		data: {
			type: "connector",
			sourcePipeline: sourceNode.parentNode,
			targetPipeline: targetNode.parentNode,
		},
	};
}
```

Those `sourcePipeline` / `targetPipeline` fields are exactly what `useLayout.ts` reads to build the Dagre graph.

## Architecture
- `useClientNodes.tsx` is the structural source of truth.
  - Creates one `parentNodeType` per pipeline.
  - Computes its width from processor count and its height from the larger of receiver/exporter counts.
  - Creates children with positions relative to that parent and `extent: "parent"`.
- `useEdgeCreator.tsx` creates edges after nodes exist.
  - Intra-pipeline edges connect receivers -> processors -> exporters.
  - Cross-pipeline connector edges carry `sourcePipeline`/`targetPipeline` metadata.
- `useLayout.ts` ignores child geometry and lays out only the parent pipeline nodes with Dagre.
  - It feeds Dagre the precomputed parent widths/heights.
  - It writes Dagre output back into `node.position` for parents only.
- `ReactFlow.tsx` renders the result and calls `fitView()` whenever width or graph data changes.

## What to copy for graph_ui
1. **Use a two-level layout model.**
   - First compute parent/group container dimensions from child counts or measured child bounds.
   - Then run Dagre only on the parent/group nodes.
   - Keep child nodes positioned relative to their parent containers.

2. **Copy the coordinate conversion pattern exactly for Dagre -> React Flow.**
   - Dagre returns center anchors.
   - React Flow parent nodes expect top-left positions.
   - Use:
   ```ts
   position = { x: dagreX - width / 2, y: dagreY - height / 2 };
   ```

3. **Copy the parent sizing formula shape, but improve it for your scale.**
   OTelbin’s exact formula is:
   ```ts
   const childNodesHeight = 80;
   const spaceBetweenNodes = 90;
   const spaceBetweenParents = 40;
   const maxNodes = Math.max(receivers, exporters) ?? 1;
   const parentHeight = maxNodes * spaceBetweenNodes + maxNodes * childNodesHeight;
   const height = maxNodes === 1 ? parentHeight : parentHeight + spaceBetweenParents;
   const width = 430 + 200 * processorCount;
   ```
   For `graph_ui`, use this as a starting point for expanded groups, then add a collapsed height branch.

4. **For collapsible groups, note what otelbin does NOT provide.**
   - No collapse toggle
   - No alternate collapsed dimensions
   - No measured-bounds-based resize
   - No child hide/show logic
   So you can copy their expanded-group math, but you must design collapse state yourself.

5. **Copy the child placement strategy if your groups have lane semantics.**
   - Receivers left (`x: 50`)
   - Processors centered horizontally in a chain (`x: receiverLength + index * 200`)
   - Exporters right (`x: processorCount * 200 + 260`)
   - Vertical positions spread with computed gaps.

6. **Copy their legibility defaults if you need stable nodes under load.**
   - fixed node size (`120x80`)
   - ellipsis on header and suffix
   - split label on `/` into main label + sublabel
   - color-coded headers
   - invisible handles

7. **Viewport: use `fitView()` on initial load and after layout changes.**
   That is the only initial viewport strategy otelbin uses. There is no `defaultViewport` to copy.

## Risks / open questions
- The layout is sparse in configuration: only `rankdir: "LR"`. For 100+ nodes, you will likely need additional spacing knobs that otelbin simply does not define.
- OTelbin’s Dagre pass only repositions parents. If your unreadable overlaps happen among leaf nodes, you need either:
  - a second internal layout pass per parent/group, or
  - measured child bounds feeding parent resizing.
- `expandParent: true` exists, but there is no implemented collapse/expand behavior to borrow.
- Parent height is based only on `max(receivers, exporters)`, not processor count; that works for their left-middle-right lane design but may not fit other graph shapes.

## Start Here
Open `/tmp/loot/otelbin/packages/otelbin/src/components/react-flow/useClientNodes.tsx` first.

Why: it contains the most reusable part for your problem — explicit parent container width/height math plus child placement rules. `useLayout.ts` is much simpler once you understand that parent sizing is already solved upstream.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Produced the requested scoped scouting report from the local otelbin clone, with exact file paths, line references, verbatim code snippets, concrete copyable patterns, and explicit notes where functionality is absent."
    }
  ],
  "changedFiles": [
    "/home/jp/proyectos/hum-ecosystem/tools/graph_ui/desk/drawer/looting/otelbin.md",
    "/home/jp/.pi/agent/sessions/--home-jp-proyectos-hum-ecosystem-tools-graph_ui--/subagent-artifacts/progress/4d20f92d/progress.md"
  ],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "grep -R \"ReactFlow|fitView|defaultViewport\" /tmp/loot/otelbin/packages/otelbin/src",
      "result": "passed",
      "summary": "Located the main canvas component and verified fitView/defaultViewport usage."
    },
    {
      "command": "nl -ba <target files> | sed -n ...",
      "result": "passed",
      "summary": "Read exact source lines for layout, node creation, parent rendering, and viewport behavior."
    },
    {
      "command": "git -C /tmp/loot/otelbin status --short",
      "result": "passed",
      "summary": "No staged or unstaged changes were reported in the cloned repo."
    }
  ],
  "validationOutput": [
    "Verified otelbin uses Dagre with only rankdir: 'LR'.",
    "Verified no defaultViewport is configured; fitView is used instead.",
    "Verified no collapse/expand implementation exists for parent nodes beyond expandParent: true."
  ],
  "residualRisks": [
    "Otelbin does not include richer Dagre spacing config, so additional layout tuning for graph_ui remains a design task.",
    "Otelbin does not implement collapsible groups, only fixed expanded parent sizing."
  ],
  "noStagedFiles": true,
  "diffSummary": "Added a scouting report and a brief progress update; no application source files were modified.",
  "reviewFindings": [
    "no blockers"
  ],
  "manualNotes": "Report is based on actual files in /tmp/loot/otelbin and explicitly calls out missing collapse/defaultViewport behavior so the parent agent does not over-assume parity."
}
```
