---
source: https://reactflow.dev/examples/edges/edge-label-renderer
title: Edge Label Renderer
---

# Edge Label Renderer

If you want to escape SVG world within an edge, you can use the
<a href="/api-reference/components/edge-label-renderer"><code dir="ltr"><EdgeLabelRenderer /></code></a>.
It’s a portal component that lets you render edge labels as divs on top
of the edges. If you want to add mouse interactions you need to set
`pointer-events: all` on the label.

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

CustomEdge.tsx

CustomEdgeStartEnd.tsx

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
  Controls,
  Background,
  addEdge,
  useEdgesState,
  useNodesState,
  type EdgeTypes,
  type Edge,
  type OnConnect,
  type Node,
} from '@xyflow/react';
import './index.css';
 
import CustomEdge from './CustomEdge';
import CustomEdgeStartEnd from './CustomEdgeStartEnd';
 
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Node 1' },
    position: { x: 0, y: 0 },
  },
  { id: '2', data: { label: 'Node 2' }, position: { x: 0, y: 300 } },
  { id: '3', data: { label: 'Node 3' }, position: { x: 200, y: 0 } },
  { id: '4', data: { label: 'Node 4' }, position: { x: 200, y: 300 } },
];
 
const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    data: {
      label: 'edge label',
    },
    type: 'custom',
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    data: {
      startLabel: 'start edge label',
      endLabel: 'end edge label',
    },
    type: 'start-end',
  },
];
 
const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
  'start-end': CustomEdgeStartEnd,
};
 
const EdgesFlow = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      edgeTypes={edgeTypes}
      fitView
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

<div id="radix-_R_bkt5fiv5tlqlb_-content-CustomEdge.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-CustomEdge.tsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-CustomEdgeStartEnd.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-CustomEdgeStartEnd.tsx"
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
