---
source: https://reactflow.dev/examples/styling/dark-mode
title: Dark Mode
---

# Dark Mode

React Flow comes with a built-in light & dark mode. You can set the
<a href="/api-reference/react-flow#colormode"><code dir="ltr">colorMode</code></a>
prop that allows you to switch between `'dark'`, `'light'` and
`'system'`.

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
import { useCallback, useState, type ChangeEventHandler } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  MiniMap,
  Background,
  Controls,
  Panel,
  Position,
  type Node,
  type Edge,
  type ColorMode,
  type OnConnect,
} from '@xyflow/react';
import './index.css';
 
const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
};
 
const initialNodes: Node[] = [
  {
    id: 'A',
    type: 'input',
    position: { x: 0, y: 150 },
    data: { label: 'A' },
    ...nodeDefaults,
  },
  {
    id: 'B',
    position: { x: 250, y: 0 },
    data: { label: 'B' },
    ...nodeDefaults,
  },
  {
    id: 'C',
    position: { x: 250, y: 150 },
    data: { label: 'C' },
    ...nodeDefaults,
  },
  {
    id: 'D',
    position: { x: 250, y: 300 },
    data: { label: 'D' },
    ...nodeDefaults,
  },
];
 
const initialEdges: Edge[] = [
  {
    id: 'A-B',
    source: 'A',
    target: 'B',
  },
  {
    id: 'A-C',
    source: 'A',
    target: 'C',
  },
  {
    id: 'A-D',
    source: 'A',
    target: 'D',
  },
];
 
const ColorModeFlow = () => {
  const [colorMode, setColorMode] = useState<ColorMode>('dark');
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );
 
  const onChange: ChangeEventHandler<HTMLSelectElement> = (evt) => {
    setColorMode(evt.target.value as ColorMode);
  };
 
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
      <MiniMap />
      <Background />
      <Controls />
 
      <Panel position="top-right">
        <select
          className="xy-theme__select"
          onChange={onChange}
          data-testid="colormode-select"
        >
          <option value="dark">dark</option>
          <option value="light">light</option>
          <option value="system">system</option>
        </select>
      </Panel>
    </ReactFlow>
  );
};
 
export default ColorModeFlow;
```

</div>

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
