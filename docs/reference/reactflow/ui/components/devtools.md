---
source: https://reactflow.dev/ui/components/devtools
title: DevTools
---

# DevTools

A debugging tool that provides data on the viewport, the state of each
node, and logs change events. This component is based on
<a href="/learn/advanced-use/devtools-and-debugging">DevTools and Debugging</a>
under Advanced Use.

You can import the entire `<DevTools />` component, or optionally,
import individual components for greater flexibility. These components
include:

-   A `<ViewportLogger />` component that shows the current position and
    zoom level of the viewport.
-   A `<NodeInspector />` component that reveals the state of each node.
-   A `<ChangeLogger />` that wraps your flow’s onNodesChange handler
    and logs each change as it is dispatched.

You can read more about the individual components at
<a href="/learn/advanced-use/devtools-and-debugging">DevTools and Debugging</a>.
While we find these tools useful for making sure React Flow is working
properly, you might also find them useful for debugging your
applications as your flows and their interactions become more complex.

<div>

<div>

<div hidden="">

</div>

<div>

<span data-slot="select-value"
style="pointer-events:none"></span>

</div>

<div>

<div testid="rf__wrapper"
style="width:100%;height:100%;overflow:hidden;position:relative;z-index:0"
role="application">

<div
style="position:absolute;width:100%;height:100%;top:0;left:0">

<div
style="position:absolute;width:100%;height:100%;top:0;left:0">

<div
style="transform:translate(0px,0px) scale(1)">

<div>

</div>

<div>

</div>

<div
style="position:absolute;width:100%;height:100%;top:0;left:0">

</div>

<div>

</div>

</div>

</div>

</div>

<div
class="react-flow__panel bg-card shadow-xs rounded border p-1 top left">

<div
class="group/toggle-group data-[spacing=default]:data-[variant=outline]:shadow-xs flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md"
role="group" dir="ltr" data-slot="toggle-group" spacing="0"
style="outline:none;--gap:0" tabindex="-1">

Node Inspector

Change Logger

Viewport Logger

</div>

</div>

<div
message="Please only hide this attribution when you are subscribed to React Flow Pro: https://reactflow.dev?utm_source=attribution">

[React Flow](https://reactflow.dev?utm_source=attribution)

</div>

<div id="react-flow__node-desc-1" style="display:none">

Press enter or space to select a node. You can then use the arrow keys
to move the node around. Press delete to remove it and escape to cancel.

</div>

<div id="react-flow__edge-desc-1" style="display:none">

Press enter or space to select an edge. You can then press delete to
remove it or escape to cancel.

</div>

<div id="react-flow__aria-live-1" aria-live="assertive"
aria-atomic="true"
style="position:absolute;width:1px;height:1px;margin:-1px;border:0;padding:0;overflow:hidden;clip:rect(0px, 0px, 0px, 0px);clip-path:inset(100%)">

</div>

</div>

</div>

</div>

<div>

<div>

Dependencies:

</div>

<a href="https://www.npmjs.com/package/@xyflow/react">@xyflow/react</a><a href="https://ui.shadcn.com/docs/components/toggle-group">shadcn/ui/toggle-group</a>

</div>

<div>

## Installation

<div dir="ltr" orientation="horizontal">

<div role="tablist"
aria-orientation="horizontal" tabindex="-1" orientation="horizontal"
style="outline:none">

CLI

Manual

</div>

<div id="radix-_R_2est5fiv5tlqlb_-content-shadcn" state="active"
orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_2est5fiv5tlqlb_-trigger-shadcn" tabindex="0"
style="animation-duration:0s">

Make sure to follow the
<a href="/components#prerequisites">prerequisites</a>
before installing the component.

<div
class="nextra-scrollbar x:overflow-x-auto x:overscroll-x-contain x:overflow-y-hidden x:mt-4 x:flex x:w-full x:gap-2 x:border-b x:border-gray-200 x:pb-px x:dark:border-neutral-800 x:focus-visible:nextra-focus"
role="tablist" aria-orientation="horizontal">

npm

pnpm

yarn

bun

</div>

<div>

<div id="headlessui-tabs-panel-_R_3amest5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="0"
headlessui-state="selected" data-selected="">

```tsx
npx shadcn@latest add https://ui.reactflow.dev/devtools
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_5amest5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
pnpm dlx shadcn@latest add https://ui.reactflow.dev/devtools
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_7amest5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
yarn dlx shadcn@latest add https://ui.reactflow.dev/devtools
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_9amest5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
bun x shadcn@latest add https://ui.reactflow.dev/devtools
```

</div>

</div>

</div>

</div>

<div id="radix-_R_2est5fiv5tlqlb_-content-manual" state="inactive"
orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_2est5fiv5tlqlb_-trigger-manual" hidden=""
tabindex="0">

</div>

</div>

</div>

<div>

## Usage

</div>

## 1. Connect the component with your React Flow application.

```tsx
import { Background, ReactFlow } from "@xyflow/react";
 
import { DevTools } from "@/registry/components/devtools/";
 
const defaultNodes = [
  {
    id: "1a",
    type: "input",
    data: { label: "Node 1" },
    position: { x: 250, y: 5 },
  },
];
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow defaultNodes={defaultNodes} fitView>
        <Background />
        <DevTools position="top-left" />
      </ReactFlow>
    </div>
  );
}
```

</div>

</div>
