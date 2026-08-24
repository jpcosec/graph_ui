---
source: https://reactflow.dev/examples/nodes/node-resizer
title: Node Resizer
---

# Node Resizer

The
<a href="/api-reference/components/node-resizer"><code dir="ltr"><NodeResizer /></code></a>
component can be used to add a resize UI for a custom node. React Flow
also exports a `<NodeResizeControl />` component for implementing a
custom resizing UI as shown in this example.

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

CustomResizerNode.jsx

ResizableNode.jsx

ResizableNodeSelected.jsx

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
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
} from '@xyflow/react';
import './index.css';
 
import ResizableNode from './ResizableNode';
import ResizableNodeSelected from './ResizableNodeSelected';
import CustomResizerNode from './CustomResizerNode';
 
 
const nodeTypes = {
  ResizableNode,
  ResizableNodeSelected,
  CustomResizerNode,
};
 
const initialNodes = [
  {
    id: '1',
    type: 'ResizableNode',
    data: { label: 'NodeResizer' },
    position: { x: 0, y: 50 },
  },
  {
    id: '2',
    type: 'ResizableNodeSelected',
    data: { label: 'NodeResizer when selected' },
    position: { x: -100, y: 150 },
  },
  {
    id: '3',
    type: 'CustomResizerNode',
    data: { label: 'Custom Resize Icon' },
    position: { x: 150, y: 150 },
    style: {
      height: 100,
    },
  },
];
 
const initialEdges = [];
 
export default function NodeToolbarExample() {
  return (
    <ReactFlow
      defaultNodes={initialNodes}
      defaultEdges={initialEdges}
      minZoom={0.2}
      maxZoom={4}
      fitView
      nodeTypes={nodeTypes}
      fitViewOptions={{ padding: 0.5 }}
      colorMode="system"
    >
      <Background variant={BackgroundVariant.Dots} />
      <Controls />
    </ReactFlow>
  );
}
```

</div>

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-CustomResizerNode.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-CustomResizerNode.jsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-ResizableNode.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-ResizableNode.jsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-ResizableNodeSelected.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-ResizableNodeSelected.jsx"
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
