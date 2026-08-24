---
source: https://reactflow.dev/examples/edges/custom-edges
title: Custom Edges
---

# Custom Edges

React Flow comes with four different edge types - `default` (bezier),
`straight`, `step` and `smoothstep`. It’s also possible to create a
<a href="/api-reference/types/edge-props">custom edge</a>,
if you need special edge routing or controls at the edge. In this
example we are demonstrating how to implement an edge with a button, a
bi-directional edge, a self connecting edge. In all examples we are
using the
<a href="/api-reference/components/base-edge">BaseEdge</a>
component as a helper.

<div
class="remote-code-viewer border-border mt-5 flex flex-col overflow-hidden rounded-xl border dark:border-gray-700">

<div style="aspect-ratio:16/9">

<div>

<div id="app">

</div>

</div>

</div>

<div>

<div dir="ltr" orientation="horizontal">

<div
class="grid grid-flow-col grid-cols-[1fr_min-content] gap-2 border-t border-b border-border dark:border-gray-700">

<div
class="border-border mb-4 flex gap-x-0 border-b tablist h-full overflow-x-auto overflow-y-hidden text-nowrap border-none"
role="tablist" aria-orientation="horizontal" tabindex="-1"
orientation="horizontal" style="outline:none">

App.tsx

BiDirectionalEdge.tsx

BiDirectionalNode.tsx

ButtonEdge.tsx

SelfConnectingEdge.tsx

xy-theme.css

index.css

index.tsx

</div>

<div
class="col-span-1 flex h-10 justify-end gap-1 self-center p-1 text-sm">

</div>

</div>

<div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-App.tsx"
state="active" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-App.tsx" tabindex="0"
style="animation-duration:0s">

```tsx
import { useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  Position,
  ConnectionMode,
  MarkerType,
  type OnConnect,
  type Node,
  type Edge,
} from '@xyflow/react';
import './index.css';
 
import ButtonEdge from './ButtonEdge';
import SelfConnectingEdge from './SelfConnectingEdge';
import BiDirectionalEdge from './BiDirectionalEdge';
import BiDirectionalNode from './BiDirectionalNode';
 
const initialNodes: Node[] = [
  {
    id: 'button-1',
    type: 'input',
    data: { label: 'Button Edge 1' },
    position: { x: 125, y: 0 },
  },
  {
    id: 'button-2',
    data: { label: 'Button Edge 2' },
    position: { x: 125, y: 200 },
  },
  {
    id: 'bi-1',
    data: { label: 'Bi Directional 1' },
    position: { x: 0, y: 300 },
    type: 'bidirectional',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'bi-2',
    data: { label: 'Bi Directional 2' },
    position: { x: 250, y: 300 },
    type: 'bidirectional',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'self-1',
    data: { label: 'Self Connecting' },
    position: { x: 125, y: 500 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
];
 
const initialEdges: Edge[] = [
  {
    id: 'edge-button',
    source: 'button-1',
    target: 'button-2',
    type: 'buttonedge',
  },
  {
    id: 'edge-bi-1',
    source: 'bi-1',
    target: 'bi-2',
    type: 'bidirectional',
    sourceHandle: 'right',
    targetHandle: 'left',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'edge-bi-2',
    source: 'bi-2',
    target: 'bi-1',
    type: 'bidirectional',
    sourceHandle: 'left',
    targetHandle: 'right',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'edge-self',
    source: 'self-1',
    target: 'self-1',
    type: 'selfconnecting',
    markerEnd: { type: MarkerType.Arrow },
  },
];
 
const edgeTypes = {
  bidirectional: BiDirectionalEdge,
  selfconnecting: SelfConnectingEdge,
  buttonedge: ButtonEdge,
};
 
const nodeTypes = {
  bidirectional: BiDirectionalNode,
};
 
const EdgesFlow = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      edgeTypes={edgeTypes}
      nodeTypes={nodeTypes}
      fitView
      attributionPosition="top-right"
      connectionMode={ConnectionMode.Loose}
      colorMode="system"
    >
      <Controls />
      <Background />
    </ReactFlow>
  );
};
 
export default EdgesFlow;
```

</div>

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-BiDirectionalEdge.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-BiDirectionalEdge.tsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-BiDirectionalNode.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-BiDirectionalNode.tsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-ButtonEdge.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-ButtonEdge.tsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-SelfConnectingEdge.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-SelfConnectingEdge.tsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-xy-theme.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-xy-theme.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-index.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-index.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-index.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-index.tsx" hidden=""
tabindex="0">

</div>

</div>

</div>

</div>

</div>
