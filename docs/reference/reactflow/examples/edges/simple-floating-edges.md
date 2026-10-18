---
source: https://reactflow.dev/examples/edges/simple-floating-edges
title: Simple Floating Edges
---

# Simple Floating Edges

This is a simplified version of the
<a href="/examples/edges/floating-edges">Floating Edges</a>
example. It’s not as flexible as the floating edges example, but the
edges stick to the top, right, bottom or left side of the nodes. You can
find the implementation details in the utils.js file.

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

App.jsx

CustomNode.jsx

SimpleFloatingEdge.jsx

xy-theme.css

index.css

utils.js

</div>

<div
class="col-span-1 flex h-10 justify-end gap-1 self-center p-1 text-sm">

</div>

</div>

<div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-App.jsx"
state="active" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-App.jsx" tabindex="0"
style="animation-duration:0s">

```tsx
import { useCallback } from 'react';
import { ReactFlow, addEdge, Background, useNodesState, useEdgesState, MarkerType, ConnectionMode } from '@xyflow/react';
import './index.css';
 
import SimpleFloatingEdge from './SimpleFloatingEdge';
import CustomNode from './CustomNode';
 
const nodeTypes = {
  custom: CustomNode,
};
 
const edgeTypes = {
  floating: SimpleFloatingEdge,
};
 
const initialNodes = [
  {
    id: '1',
    label: '1',
    position: { x: 0, y: 0 },
    data: { label: 'drag me around 😎' },
    type: 'custom',
  },
  {
    id: '2',
    label: '2',
    position: { x: 0, y: 150 },
    data: { label: '...or me' },
    type: 'custom',
  },
];
 
const initialEdges = [
  {
    id: '1-2',
    source: '1',
    target: '2',
    sourceHandle: 'c',
    targetHandle: 'a',
    type: 'floating',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];
 
const fitViewOptions = { padding: '50px' };
 
const NodeAsHandleFlow = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'floating',
            markerEnd: { type: MarkerType.Arrow },
          },
          eds,
        ),
      ),
    [],
  );
 
  return (
    <div className="simple-floatingedges">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={fitViewOptions}
        connectionMode={ConnectionMode.Loose}
        colorMode="system"
      >
        <Background />
      </ReactFlow>
    </div>
  );
};
 
export default NodeAsHandleFlow;
```

</div>

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-CustomNode.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-CustomNode.jsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-SimpleFloatingEdge.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-SimpleFloatingEdge.jsx"
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

<div id="radix-_R_bkt5fiv5tlqlb_-content-utils.js"
state="inactive" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-utils.js" hidden=""
tabindex="0">

</div>

</div>

</div>

</div>

</div>
