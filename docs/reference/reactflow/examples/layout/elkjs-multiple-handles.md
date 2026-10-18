---
source: https://reactflow.dev/examples/layout/elkjs-multiple-handles
title: Elkjs Multiple Handles
---

# Elkjs Multiple Handles

This example demonstrates how to configure
<a href="https://github.com/kieler/elkjs">elkjs </a>
to use specific handles (called ‘ports’ in elkjs). This is helpful to
reduce edge crossings and have more control over the layout. The
important things to configure are unique ids for the handles / ports,
the actual ports for elkjs with a correct side property and
`'org.eclipse.elk.portConstraints' : 'FIXED_ORDER'` for all nodes.

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

ElkNode.tsx

edges.ts

xy-theme.css

index.css

index.tsx

nodes.ts

useLayoutNodes.ts

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
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from '@xyflow/react';
import './index.css';
 
import ElkNode from './ElkNode';
import { nodes as initNodes } from './nodes';
import { edges as initEdges } from './edges';
import useLayoutNodes from './useLayoutNodes';
 
const nodeTypes = {
  elk: ElkNode,
};
 
function App() {
  const [nodes, , onNodesChange] = useNodesState(initNodes);
  const [edges, , onEdgesChange] = useEdgesState(initEdges);
 
  useLayoutNodes();
 
  return (
    <ReactFlow
      nodes={nodes}
      onNodesChange={onNodesChange}
      edges={edges}
      onEdgesChange={onEdgesChange}
      fitView
      nodeTypes={nodeTypes}
      colorMode="system"
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}
 
export default () => (
  <ReactFlowProvider>
    <App />
  </ReactFlowProvider>
);
```

</div>

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-ElkNode.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-ElkNode.tsx" hidden=""
tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-edges.ts"
state="inactive" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-edges.ts" hidden=""
tabindex="0">

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

<div id="radix-_R_bkt5fiv5tlqlb_-content-nodes.ts"
state="inactive" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-nodes.ts" hidden=""
tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-useLayoutNodes.ts"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-useLayoutNodes.ts"
hidden="" tabindex="0">

</div>

</div>

</div>

</div>

</div>
