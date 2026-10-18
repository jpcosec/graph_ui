---
source: https://reactflow.dev/examples/nodes/drag-handle
title: Drag Handle
---

# Drag Handle

You can restrict dragging to a specific part of a node, by specifying a
class that will act as a
<a href="/api-reference/types/node"><code dir="ltr">dragHandle</code></a>.
To prevent specific elements within a drag handle from triggering a
drag, you can use the
<a href="/learn/customization/utility-classes#nodrag"><code dir="ltr">nodrag</code></a>
class name on those elements.

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

DragHandleNode.jsx

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
import { ReactFlow, useNodesState, useEdgesState, Background } from '@xyflow/react';
import './index.css';
 
import DragHandleNode from './DragHandleNode';
 
const nodeTypes = {
  dragHandleNode: DragHandleNode,
};
 
const initialNodes = [
  {
    id: '2',
    type: 'dragHandleNode',
 
    // Specify the custom class acting as a drag handle
    dragHandle: '.drag-handle__custom',
    position: { x: 200, y: 200 },
  },
];
 
const DragHandleFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
      colorMode="system"
    >
      <Background />
    </ReactFlow>
  );
};
 
export default DragHandleFlow;
```

</div>

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-DragHandleNode.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-DragHandleNode.jsx"
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
