---
source: https://reactflow.dev/examples/whiteboard/rectangle
title: Rectangle
---

# Rectangle

In this example, you can draw rectangles on a whiteboard. Click and drag
to create a rectangle, and it will be added to the flow.

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

RectangleNode.tsx

RectangleTool.tsx

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
import { useCallback, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  Panel,
} from '@xyflow/react';
import './index.css';
 
import { RectangleNode } from './RectangleNode';
import { RectangleTool } from './RectangleTool';
 
 
const initialNodes = [
  {
    id: '1',
    type: 'rectangle',
    position: { x: 250, y: 5 },
    data: { color: '#ff7000' },
    width: 150,
    height: 100,
  },
];
const initialEdges = [];
 
const nodeTypes = {
  rectangle: RectangleNode,
};
 
export default function RectangleFlow() {
  const [nodes, _, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback((params) => setEdges((els) => addEdge(params, els)), []);
 
  const [isRectangleActive, setIsRectangleActive] = useState(true);
 
  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      colorMode="system"
    >
      <Controls />
      <Background />
 
      {isRectangleActive && <RectangleTool />}
 
      <Panel position="top-left">
        <div className="xy-theme__button-group">
          <button
            className={`xy-theme__button ${isRectangleActive ? 'active' : ''}`}
            onClick={() => setIsRectangleActive(true)}
          >
            Rectangle Mode
          </button>
          <button
            className={`xy-theme__button ${!isRectangleActive ? 'active' : ''}`}
            onClick={() => setIsRectangleActive(false)}
          >
            Selection Mode
          </button>
        </div>
      </Panel>
    </ReactFlow>
  );
}
```

</div>

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-RectangleNode.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-RectangleNode.tsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-RectangleTool.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-RectangleTool.tsx"
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
