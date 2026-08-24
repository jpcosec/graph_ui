---
source: https://reactflow.dev/examples/overview
title: Feature Overview
---

# Feature Overview

This is an overview example of what’s possible with React Flow. Below
you can see features like: built-in node and edge types,
<a href="/learn/layouting/sub-flows">sub flows</a>,
<a href="/api-reference/components/node-toolbar"><code dir="ltr">NodeToolbar</code></a>,
<a href="/api-reference/components/node-resizer"><code dir="ltr">NodeResizer</code></a>
components. On the bottom you see the
<a href="/api-reference/components/controls">Controls</a>
and the
<a href="/api-reference/components/minimap">MiniMap</a>
components.

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

AnnotationNode.jsx

App.jsx

ButtonEdge.jsx

CircleNode.jsx

ResizerNode.jsx

TextInputNode.jsx

ToolbarNode.jsx

xy-theme.css

index.css

initial-elements.jsx

</div>

<div
class="col-span-1 flex h-10 justify-end gap-1 self-center p-1 text-sm">

</div>

</div>

<div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-AnnotationNode.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-AnnotationNode.jsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-App.jsx"
state="active" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-App.jsx" tabindex="0"
style="animation-duration:0s">

```tsx
import { useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import './index.css';
 
import { nodes as initialNodes, edges as initialEdges } from './initial-elements';
 
import AnnotationNode from './AnnotationNode';
import ToolbarNode from './ToolbarNode';
import ResizerNode from './ResizerNode';
import CircleNode from './CircleNode';
import TextInputNode from './TextInputNode';
import ButtonEdge from './ButtonEdge';
 
const nodeTypes = {
  annotation: AnnotationNode,
  tools: ToolbarNode,
  resizer: ResizerNode,
  circle: CircleNode,
  textinput: TextInputNode,
};
 
const edgeTypes = {
  button: ButtonEdge,
};
 
const nodeClassName = (node) => node.type;
 
const OverviewFlow = () => {
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
      fitView
      attributionPosition="top-right"
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      colorMode="system"
    >
      <MiniMap zoomable pannable nodeClassName={nodeClassName} />
      <Controls />
      <Background />
    </ReactFlow>
  );
};
 
export default OverviewFlow;
```

</div>

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-ButtonEdge.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-ButtonEdge.jsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-CircleNode.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-CircleNode.jsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-ResizerNode.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-ResizerNode.jsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-TextInputNode.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-TextInputNode.jsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-ToolbarNode.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-ToolbarNode.jsx"
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

<div id="radix-_R_bkt5fiv5tlqlb_-content-initial-elements.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-initial-elements.jsx"
hidden="" tabindex="0">

</div>

</div>

</div>

</div>

</div>
