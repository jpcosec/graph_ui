---
source: https://reactflow.dev/examples/nodes/easy-connect
title: Easy Connect
---

# Easy Connect

Fed up with tiny little connection handles? Make your whole node act as
one! Keep in mind though that you need to define separate drag handles
in this case to still be able to drag the node.

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

CustomConnectionLine.jsx

CustomNode.jsx

FloatingEdge.jsx

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
import './index.css';
 
import {
  Background,
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
 
 
import CustomNode from './CustomNode';
import FloatingEdge from './FloatingEdge';
import CustomConnectionLine from './CustomConnectionLine';
 
const initialNodes = [
  {
    id: '1',
    type: 'custom',
    position: { x: 0, y: 0 },
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 250, y: 320 },
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 40, y: 300 },
  },
  {
    id: '4',
    type: 'custom',
    position: { x: 300, y: 0 },
  },
];
 
const initialEdges = [];
 
const connectionLineStyle = {
  stroke: '#b1b1b7',
};
 
const nodeTypes = {
  custom: CustomNode,
};
 
const edgeTypes = {
  floating: FloatingEdge,
};
 
const defaultEdgeOptions = {
  type: 'floating',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#b1b1b7',
  },
};
 
const EasyConnectExample = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 
  const onConnect = useCallback(
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
      fitView
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      connectionLineComponent={CustomConnectionLine}
      connectionLineStyle={connectionLineStyle}
      colorMode="system"
    >
      <Background />
    </ReactFlow>
  );
};
 
export default EasyConnectExample;
```

</div>

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-CustomConnectionLine.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-CustomConnectionLine.jsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-CustomNode.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-CustomNode.jsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-FloatingEdge.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-FloatingEdge.jsx"
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
