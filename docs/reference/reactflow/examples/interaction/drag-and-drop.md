---
source: https://reactflow.dev/examples/interaction/drag-and-drop
title: Drag and Drop
---

# Drag and Drop

In these examples, we use a custom Sidebar component to create new nodes
when dragging from the sidebar into the React Flow pane.

A drag and drop user interface is very common for node-based workflow
editors. The drag and drop behavior outside of the React Flow pane is
not built in but can be implemented with the native
<a href="https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API">HTML Drag and Drop API </a>,
<a href="https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events">Pointer Events </a>,
or a third party library like
<a href="https://github.com/react-grid-layout/react-draggable">react-draggable </a>.

## Drag and Drop with HTML Drag and Drop API

The HTML Drag and Drop API is a native API that is supported by all
major browsers. It is a simple API that allows you to drag and drop
elements between different elements on the page.

**Note:** HTML Drag and Drop API is not properly supported on touch
devices. See the example below for an alternative approach using pointer
events.

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

DnDContext.jsx

Sidebar.jsx

xy-theme.css

index.css

</div>

<div
class="col-span-1 flex h-10 justify-end gap-1 self-center p-1 text-sm">

</div>

</div>

<div>

<div id="radix-_R_2bkt5fiv5tlqlb_-content-App.jsx"
state="active" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_2bkt5fiv5tlqlb_-trigger-App.jsx" tabindex="0"
style="animation-duration:0s">

```tsx
import { useRef, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  useReactFlow,
  Background,
} from '@xyflow/react';
import './index.css';
 
import Sidebar from './Sidebar';
import { DnDProvider, useDnD } from './DnDContext';
 
const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'input node' },
    position: { x: 250, y: 5 },
  },
];
 
let id = 0;
const getId = () => `dndnode_${id++}`;
 
const DnDFlow = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();
 
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
 
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
 
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
 
      // check if the dropped element is valid
      if (!type) {
        return;
      }
 
      // project was renamed to screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };
 
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type],
  );
 
  const onDragStart = (event, nodeType) => {
    setType(nodeType);
    event.dataTransfer.setData('text/plain', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
 
  return (
    <div className="dndflow">
      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          fitView
          colorMode="system"
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      <Sidebar />
    </div>
  );
};
 
export default () => (
  <ReactFlowProvider>
    <DnDProvider>
      <DnDFlow />
    </DnDProvider>
  </ReactFlowProvider>
);
```

</div>

</div>

<div id="radix-_R_2bkt5fiv5tlqlb_-content-DnDContext.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_2bkt5fiv5tlqlb_-trigger-DnDContext.jsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_2bkt5fiv5tlqlb_-content-Sidebar.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_2bkt5fiv5tlqlb_-trigger-Sidebar.jsx" hidden=""
tabindex="0">

</div>

<div id="radix-_R_2bkt5fiv5tlqlb_-content-xy-theme.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_2bkt5fiv5tlqlb_-trigger-xy-theme.css"
hidden="" tabindex="0">

</div>

<div id="radix-_R_2bkt5fiv5tlqlb_-content-index.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_2bkt5fiv5tlqlb_-trigger-index.css" hidden=""
tabindex="0">

</div>

</div>

</div>

</div>

</div>

------------------------------------------------------------------------

## Drag and Drop with Pointer Events

Another way to implement drag and drop is to use **pointer events**.

The Pointer Events API is a modern API that is supported by all major
browsers. It is slightly more complex to implement than the HTML Drag
and Drop API, but by using pointer events we can make sure that the drag
and drop behavior is consistent across all devices, both mouse and
touch.

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

Sidebar.tsx

xy-theme.css

index.css

index.tsx

useDnD.tsx

</div>

<div
class="col-span-1 flex h-10 justify-end gap-1 self-center p-1 text-sm">

</div>

</div>

<div>

<div id="radix-_R_2lkt5fiv5tlqlb_-content-App.tsx"
state="active" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_2lkt5fiv5tlqlb_-trigger-App.tsx" tabindex="0"
style="animation-duration:0s">

```tsx
import { useCallback } from 'react';
import {
  Background,
  Connection,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import './index.css';
 
import { Sidebar } from './Sidebar';
import { DnDProvider } from './useDnD';
 
const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'input node' },
    position: { x: 250, y: 5 },
  },
];
 
function DnDFlow() {
  const [nodes, _, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
 
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [],
  );
 
  return (
    <div className="dndflow">
      <div className="reactflow-wrapper">
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
        </ReactFlow>
      </div>
      <Sidebar />
    </div>
  );
}
 
export default () => (
  <ReactFlowProvider>
    <DnDProvider>
      <DnDFlow />
    </DnDProvider>
  </ReactFlowProvider>
);
```

</div>

</div>

<div id="radix-_R_2lkt5fiv5tlqlb_-content-Sidebar.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_2lkt5fiv5tlqlb_-trigger-Sidebar.tsx" hidden=""
tabindex="0">

</div>

<div id="radix-_R_2lkt5fiv5tlqlb_-content-xy-theme.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_2lkt5fiv5tlqlb_-trigger-xy-theme.css"
hidden="" tabindex="0">

</div>

<div id="radix-_R_2lkt5fiv5tlqlb_-content-index.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_2lkt5fiv5tlqlb_-trigger-index.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_2lkt5fiv5tlqlb_-content-index.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_2lkt5fiv5tlqlb_-trigger-index.tsx" hidden=""
tabindex="0">

</div>

<div id="radix-_R_2lkt5fiv5tlqlb_-content-useDnD.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_2lkt5fiv5tlqlb_-trigger-useDnD.tsx" hidden=""
tabindex="0">

</div>

</div>

</div>

</div>

</div>

------------------------------------------------------------------------

## Drag and Drop with Neodrag

<a href="https://github.com/puruvj/neodrag">Neodrag </a>
is a library that provides a simple and easy to use drag and drop API.
In a real-world application, you may want to use the Neodrag library to
handle the drag and drop behavior in a cross-platform compatible way,
compatible with both mouse and touch devices.

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

Sidebar.tsx

xy-theme.css

index.css

index.tsx

utils.ts

</div>

<div
class="col-span-1 flex h-10 justify-end gap-1 self-center p-1 text-sm">

</div>

</div>

<div>

<div id="radix-_R_2tkt5fiv5tlqlb_-content-App.tsx"
state="active" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_2tkt5fiv5tlqlb_-trigger-App.tsx" tabindex="0"
style="animation-duration:0s">

```tsx
import { useCallback } from 'react';
import {
  Background,
  Connection,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import './index.css';
 
import { Sidebar } from './Sidebar';
 
const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'input node' },
    position: { x: 250, y: 5 },
  },
];
 
function DnDFlow() {
  const [nodes, _, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
 
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [],
  );
 
  return (
    <div className="dndflow">
      <div className="reactflow-wrapper">
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
        </ReactFlow>
      </div>
      <Sidebar />
    </div>
  );
}
 
export default () => (
  <ReactFlowProvider>
    <DnDFlow />
  </ReactFlowProvider>
);
```

</div>

</div>

<div id="radix-_R_2tkt5fiv5tlqlb_-content-Sidebar.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_2tkt5fiv5tlqlb_-trigger-Sidebar.tsx" hidden=""
tabindex="0">

</div>

<div id="radix-_R_2tkt5fiv5tlqlb_-content-xy-theme.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_2tkt5fiv5tlqlb_-trigger-xy-theme.css"
hidden="" tabindex="0">

</div>

<div id="radix-_R_2tkt5fiv5tlqlb_-content-index.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_2tkt5fiv5tlqlb_-trigger-index.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_2tkt5fiv5tlqlb_-content-index.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_2tkt5fiv5tlqlb_-trigger-index.tsx" hidden=""
tabindex="0">

</div>

<div id="radix-_R_2tkt5fiv5tlqlb_-content-utils.ts"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_2tkt5fiv5tlqlb_-trigger-utils.ts" hidden=""
tabindex="0">

</div>

</div>

</div>

</div>

</div>
