---
source: https://reactflow.dev/examples/edges/multi-connection-line
title: Multi Connection Line
---

# Multi Connection Line

React Flow typically only allows one connection to be created at a time.
This example builds on the
<a href="/examples/edges/custom-connectionline">custom connection line</a>
example to show how to draw multiple connection lines from any selected
nodes at once.

<div
class="nextra-callout x:overflow-x-auto x:not-first:mt-[1.25em] x:flex x:rounded-lg x:border x:py-[.5em] x:pe-[1em] x:contrast-more:border-current! x:bg-blue-100 x:dark:bg-blue-900/30 x:text-blue-700 x:dark:text-blue-400 x:border-blue-700 x:dark:border-blue-600">

<div
style="font-family:"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol""

</div>

<div>

Pay attention to the `onConnect` handler. If you forget to include this
then only one connection will be created even if you have multiple
selected nodes!

</div>

</div>

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

ConnectionLine.jsx

xy-theme.css

index.css

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
import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import './index.css';
 
import ConnectionLine from './ConnectionLine';
 
const initialNodes = [
  {
    id: 'a',
    type: 'input',
    data: { label: 'Click to select' },
    position: { x: 100, y: -100 },
  },
  {
    id: 'b',
    type: 'input',
    data: { label: 'these nodes' },
    position: { x: 300, y: -50 },
  },
  {
    id: 'c',
    type: 'input',
    data: { label: 'then drag... ' },
    position: { x: 150, y: 0 },
  },
  {
    id: 'd',
    type: 'output',
    data: { label: '...and connect to me!' },
    position: { x: 250, y: 200 },
  },
];
 
const ConnectionLineFlow = () => {
  const [nodes, _, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback(
    ({ source, target }) => {
      return setEdges((eds) =>
        nodes
          .filter((node) => node.id === source || node.selected)
          .reduce(
            (eds, node) => addEdge({ source: node.id, target }, eds),
            eds,
          ),
      );
    },
    [nodes],
  );
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      connectionLineComponent={ConnectionLine}
      onConnect={onConnect}
      fitView
      fitViewOptions={{
        padding: 0.2,
      }}
      colorMode="system"
    >
      <Background />
    </ReactFlow>
  );
};
 
export default ConnectionLineFlow;
```

</div>

</div>

<div id="radix-_R_lkt5fiv5tlqlb_-content-ConnectionLine.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_lkt5fiv5tlqlb_-trigger-ConnectionLine.jsx"
hidden="" tabindex="0">

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

</div>

</div>

</div>

</div>

<div
class="nextra-callout x:overflow-x-auto x:not-first:mt-[1.25em] x:flex x:rounded-lg x:border x:py-[.5em] x:pe-[1em] x:contrast-more:border-current! x:bg-yellow-50 x:dark:bg-yellow-700/30 x:text-yellow-700 x:dark:text-yellow-500 x:border-yellow-700">

<div
style="font-family:"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol""

</div>

<div>

This example makes use of the special `internalsSymbol` to access
properties on a node you won’t typically need access to. Properties
hidden behind this symbol don’t have the same stability guarantees as
the public API, so use them with caution.

</div>

</div>
