---
source: https://reactflow.dev/examples/whiteboard/lasso-selection
title: Lasso Selection
---

# Lasso Selection

In this example, you can select multiple items on the pane using a lasso
selection tool. Click and drag to create a selection area, and all items
within that area will be selected.

-   **Lasso Drawing**: Draw freehand selection areas using pointer
    events
-   **Partial/Full Selection**: Toggle between selecting nodes partially
    or fully enclosed by the lasso
-   **Visual Feedback**: Real-time visual feedback while drawing the
    selection area
-   **Canvas Rendering**: Uses HTML5 Canvas for smooth drawing
    performance

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

Lasso.tsx

xy-theme.css

index.css

utils.ts

</div>

<div
class="col-span-1 flex h-10 justify-end gap-1 self-center p-1 text-sm">

</div>

</div>

<div>

<div id="radix-_R_lkt5fiv5tlqlb_-content-App.jsx"
state="active" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_lkt5fiv5tlqlb_-trigger-App.jsx" tabindex="0"
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
import { Lasso } from './Lasso';
import './index.css';
 
const initialNodes = [
  {
    id: '1',
    position: { x: 0, y: 0 },
    data: { label: 'Hello' },
  },
  {
    id: '2',
    position: { x: 300, y: 0 },
    data: { label: 'World' },
  },
];
 
const initialEdges = [];
 
export default function LassoSelectionFlow() {
  const [nodes, _, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback((params) => setEdges((els) => addEdge(params, els)), []);
 
  const [partial, setPartial] = useState(false);
  const [isLassoActive, setIsLassoActive] = useState(true);
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      colorMode="system"
    >
      <Controls />
      <Background />
      {isLassoActive && <Lasso partial={partial} />}
 
      <Panel position="top-left" className="lasso-controls">
        <div className="xy-theme__button-group">
          <button
            className={`xy-theme__button ${isLassoActive ? 'active' : ''}`}
            onClick={() => setIsLassoActive(true)}
          >
            Lasso Mode
          </button>
          <button
            className={`xy-theme__button ${!isLassoActive ? 'active' : ''}`}
            onClick={() => setIsLassoActive(false)}
          >
            Selection Mode
          </button>
        </div>
 
        <label>
          <input
            type="checkbox"
            checked={partial}
            onChange={() => setPartial((p) => !p)}
            className="xy-theme__checkbox"
          />
          Partial selection
        </label>
      </Panel>
    </ReactFlow>
  );
}
```

</div>

</div>

<div id="radix-_R_lkt5fiv5tlqlb_-content-Lasso.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_lkt5fiv5tlqlb_-trigger-Lasso.tsx" hidden=""
tabindex="0">

</div>

<div id="radix-_R_lkt5fiv5tlqlb_-content-xy-theme.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_lkt5fiv5tlqlb_-trigger-xy-theme.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_lkt5fiv5tlqlb_-content-index.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_lkt5fiv5tlqlb_-trigger-index.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_lkt5fiv5tlqlb_-content-utils.ts"
state="inactive" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_lkt5fiv5tlqlb_-trigger-utils.ts" hidden=""
tabindex="0">

</div>

</div>

</div>

</div>

</div>
