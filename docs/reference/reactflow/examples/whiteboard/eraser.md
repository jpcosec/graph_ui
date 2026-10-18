---
source: https://reactflow.dev/examples/whiteboard/eraser
title: Eraser Tool
---

# Eraser Tool

This example shows how to create an eraser tool that allows you to
delete nodes and edges by wiping them out. It’s made up of two parts:

1.  The `Eraser` component that handles the erasing logic and rendering
    of the eraser trail.
2.  The custom `ErasableNode` and `ErasableEdge` that reacts to the
    `toBeDeleted` flag.

Determining if the trail intersects with a node is fairly straight
forward - however detecting intersections between the trail and an edge
is a bit more complex: We sample points along the edge through the
<a href="https://developer.mozilla.org/en-US/docs/Web/API/SVGGeometryElement/getPointAtLength"><code dir="ltr">getPointAtLength</code></a>
method of the SVG path element, construct a polyline that we can then
use to detect intersections with the eraser trail. This is a trade-off
between performance and accuracy - you can play around with the
`sampleDistance` variable to see the effect it has on the eraser trail.

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

ErasableEdge.tsx

ErasableNode.tsx

Eraser.tsx

xy-theme.css

index.css

utils.ts

</div>

<div
class="col-span-1 flex h-10 justify-end gap-1 self-center p-1 text-sm">

</div>

</div>

<div>

<div id="radix-_R_nkt5fiv5tlqlb_-content-App.jsx"
state="active" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_nkt5fiv5tlqlb_-trigger-App.jsx" tabindex="0"
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
 
import { ErasableNode } from './ErasableNode';
import { ErasableEdge } from './ErasableEdge';
import { Eraser } from './Eraser';
 
 
const initialNodes = [
  {
    id: '1',
    type: 'erasable-node',
    position: { x: 0, y: 0 },
    data: { label: 'Hello' },
  },
  {
    id: '2',
    type: 'erasable-node',
    position: { x: 300, y: 0 },
    data: { label: 'World' },
  },
];
 
const initialEdges = [
  {
    id: '1->2',
    type: 'erasable-edge',
    source: '1',
    target: '2',
  },
];
 
const nodeTypes = {
  'erasable-node': ErasableNode,
};
 
const edgeTypes = {
  'erasable-edge': ErasableEdge,
};
 
const defaultEdgeOptions = {
  type: 'erasable-edge',
};
 
export default function EraserFlow() {
  const [nodes, _, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback((params) => setEdges((els) => addEdge(params, els)), []);
 
  const [isEraserActive, setIsEraserActive] = useState(true);
 
  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      edges={edges}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      defaultEdgeOptions={defaultEdgeOptions}
      colorMode="system"
    >
      <Controls />
      <Background />
 
      {isEraserActive && <Eraser />}
 
      <Panel position="top-left">
        <div className="xy-theme__button-group">
          <button
            className={`xy-theme__button ${isEraserActive ? 'active' : ''}`}
            onClick={() => setIsEraserActive(true)}
          >
            Eraser Mode
          </button>
          <button
            className={`xy-theme__button ${!isEraserActive ? 'active' : ''}`}
            onClick={() => setIsEraserActive(false)}
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

<div id="radix-_R_nkt5fiv5tlqlb_-content-ErasableEdge.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_nkt5fiv5tlqlb_-trigger-ErasableEdge.tsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_nkt5fiv5tlqlb_-content-ErasableNode.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_nkt5fiv5tlqlb_-trigger-ErasableNode.tsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_nkt5fiv5tlqlb_-content-Eraser.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_nkt5fiv5tlqlb_-trigger-Eraser.tsx" hidden=""
tabindex="0">

</div>

<div id="radix-_R_nkt5fiv5tlqlb_-content-xy-theme.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_nkt5fiv5tlqlb_-trigger-xy-theme.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_nkt5fiv5tlqlb_-content-index.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_nkt5fiv5tlqlb_-trigger-index.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_nkt5fiv5tlqlb_-content-utils.ts"
state="inactive" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_nkt5fiv5tlqlb_-trigger-utils.ts" hidden=""
tabindex="0">

</div>

</div>

</div>

</div>

</div>
