---
source: https://reactflow.dev/examples/nodes/intersections
title: Intersections
---

# Intersections

The `useReactFlow` hook exports
<a href="/api-reference/types/react-flow-instance#intersections">helpers to check intersections</a>
of nodes and areas. In this example you can drag a node and get a visual
feedback when it intersects with another node.

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
import { useCallback, type MouseEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
  type Edge,
  type Node,
} from '@xyflow/react';
import './index.css';
 
const initialNodes: Node[] = [
  {
    id: '1',
    data: { label: 'Node 1' },
    position: { x: 0, y: 0 },
    style: {
      width: 200,
      height: 100,
    },
  },
  {
    id: '2',
    data: { label: 'Node 2' },
    position: { x: 0, y: 150 },
  },
  {
    id: '3',
    data: { label: 'Node 3' },
    position: { x: 250, y: 0 },
  },
  {
    id: '4',
    data: { label: 'Node' },
    position: { x: 350, y: 150 },
    style: {
      width: 50,
      height: 50,
    },
  },
];
 
const initialEdges: Edge[] = [];
 
const BasicFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const { getIntersectingNodes } = useReactFlow();
 
  const onNodeDrag = useCallback((_: MouseEvent, node: Node) => {
    const intersections = getIntersectingNodes(node).map((n) => n.id);
 
    setNodes((ns) =>
      ns.map((n) => ({
        ...n,
        className: intersections.includes(n.id) ? 'highlight' : '',
      })),
    );
  }, []);
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={initialEdges}
      onNodesChange={onNodesChange}
      onNodeDrag={onNodeDrag}
      className="intersection-flow"
      minZoom={0.2}
      maxZoom={4}
      fitView
      selectNodesOnDrag={false}
      colorMode="system"
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
};
 
export default function App() {
  return (
    <ReactFlowProvider>
      <BasicFlow />
    </ReactFlowProvider>
  );
}
```

</div>

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
