---
source: https://reactflow.dev/examples/misc/download-image
title: Download Image
---

# Download Image

This example shows how to download a flow as an image with
<a href="https://github.com/bubkoo/html-to-image">html-to-image </a>.

<div
class="nextra-callout x:overflow-x-auto x:not-first:mt-[1.25em] x:flex x:rounded-lg x:border x:py-[.5em] x:pe-[1em] x:contrast-more:border-current! x:bg-blue-100 x:dark:bg-blue-900/30 x:text-blue-700 x:dark:text-blue-400 x:border-blue-700 x:dark:border-blue-600">

<div
style="font-family:"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol""

</div>

<div>

The `version` of the
<a href="https://www.npmjs.com/package/html-to-image">html-to-image </a>
package used in this example, has been locked to `1.11.11`, which is the
latest working `version` for the package. The recent versions, after
`1.11.11`, are not exporting images properly and there is open
<a href="https://github.com/bubkoo/html-to-image/issues/516">issue </a>
for this on Github.

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

CustomNode.jsx

DownloadButton.jsx

xy-theme.css

index.css

initialElements.js

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
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
} from '@xyflow/react';
import './index.css';
 
import DownloadButton from './DownloadButton';
import CustomNode from './CustomNode';
import { initialNodes, initialEdges } from './initialElements';
 
const connectionLineStyle = { stroke: '#ffff' };
const snapGrid = [25, 25];
const nodeTypes = {
  custom: CustomNode,
};
 
const defaultEdgeOptions = {
  animated: true,
  type: 'smoothstep',
};
 
const defaultViewport = { x: 0, y: 0, zoom: 1.5 };
 
const DownloadImageFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      connectionLineStyle={connectionLineStyle}
      connectionLineType="smoothstep"
      snapToGrid={true}
      snapGrid={snapGrid}
      defaultViewport={defaultViewport}
      fitView
      attributionPosition="bottom-left"
      defaultEdgeOptions={defaultEdgeOptions}
      className="download-image"
      colorMode="system"
    >
      <Controls />
      <Background />
      <DownloadButton />
    </ReactFlow>
  );
};
 
export default DownloadImageFlow;
```

</div>

</div>

<div id="radix-_R_lkt5fiv5tlqlb_-content-CustomNode.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_lkt5fiv5tlqlb_-trigger-CustomNode.jsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_lkt5fiv5tlqlb_-content-DownloadButton.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_lkt5fiv5tlqlb_-trigger-DownloadButton.jsx"
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

<div id="radix-_R_lkt5fiv5tlqlb_-content-initialElements.js"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_lkt5fiv5tlqlb_-trigger-initialElements.js"
hidden="" tabindex="0">

</div>

</div>

</div>

</div>

</div>
