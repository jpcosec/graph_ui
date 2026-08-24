---
source: https://reactflow.dev/examples/edges/edge-toolbar
title: Edge Toolbar
---

# Edge Toolbar

The
<a href="/api-reference/components/edge-toolbar"><code dir="ltr">EdgeToolbar</code> component</a>
can be used to display unscaled content on top of an edge. You can use
it to display a button at the center of the edge or a toolbar that
floats above the edge for example.

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

EdgeWithButton.tsx

EdgeWithToolbar.tsx

xy-theme.css

index.css

index.tsx

preview.png

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
import {
  Background,
  Controls,
  Edge,
  EdgeTypes,
  MiniMap,
  Node,
  Position,
  ReactFlow,
} from '@xyflow/react';
import './index.css';
 
import { EdgeWithToolbar } from './EdgeWithToolbar';
import { EdgeWithButton } from './EdgeWithButton';
 
const edgeTypes: EdgeTypes = {
  edgeButton: EdgeWithButton,
  edgeToolbar: EdgeWithToolbar,
};
 
const initialNodes: Node[] = [
  {
    id: '1',
    data: { label: 'Node 1' },
    position: { x: 150, y: 100 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: '2',
    data: { label: 'Node 2' },
    position: { x: 550, y: 0 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
 
  {
    id: '3',
    data: { label: 'Node 3' },
    position: { x: 0, y: 300 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: '4',
    data: { label: 'Node 4' },
    position: { x: 750, y: 200 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
];
 
const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'edgeButton',
  },
 
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    type: 'edgeToolbar',
  },
];
 
export default function EdgeToolbarExample() {
  return (
    <ReactFlow
      defaultNodes={initialNodes}
      defaultEdges={initialEdges}
      fitView
      edgeTypes={edgeTypes}
      colorMode="system"
    >
      <Background />
      <MiniMap />
      <Controls />
    </ReactFlow>
  );
}
```

</div>

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-EdgeWithButton.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-EdgeWithButton.tsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-EdgeWithToolbar.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-EdgeWithToolbar.tsx"
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

<div id="radix-_R_bkt5fiv5tlqlb_-content-preview.png"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-preview.png" hidden=""
tabindex="0">

</div>

</div>

</div>

</div>

</div>
