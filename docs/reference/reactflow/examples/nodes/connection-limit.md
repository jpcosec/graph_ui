---
source: https://reactflow.dev/examples/nodes/connection-limit
title: Connection Limit
---

# Connection Limit

This is an example of a custom node with a custom handle that can limit
the amount of connections a handle can have using the `isConnectable`
prop. You can use a boolean, a number (the number of max. connections
the handle should have) or a callback function that returns a boolean as
an arg for the `isConnectable` prop of the CustomHandle component.

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

CustomHandle.jsx

CustomNode.jsx

xy-theme.css

index.css

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
import {
  Background,
  ReactFlow,
  addEdge,
  Position,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import './index.css';
 
import CustomNode from './CustomNode';
 
const nodeTypes = {
  custom: CustomNode,
};
 
const CustomNodeFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: '1',
      type: 'input',
      data: { label: 'Node 1' },
      position: { x: 0, y: 25 },
      sourcePosition: Position.Right,
    },
    {
      id: '2',
      type: 'custom',
      data: {},
      position: { x: 250, y: 50 },
    },
    {
      id: '3',
      type: 'input',
      data: { label: 'Node 2' },
      position: { x: 0, y: 100 },
      sourcePosition: Position.Right,
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
 
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
      nodeTypes={nodeTypes}
      fitView
      colorMode="system"
    >
      <Background />
    </ReactFlow>
  );
};
 
export default CustomNodeFlow;
```

</div>

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-CustomHandle.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-CustomHandle.jsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-CustomNode.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-CustomNode.jsx"
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

</div>

</div>

</div>

</div>
