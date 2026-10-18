---
source: https://reactflow.dev/ui/components/node-search
title: Node Search
---

# Node Search

A search bar component that can be used to search for nodes in the flow.

It uses the
<a href="https://ui.shadcn.com/docs/components/command">Command </a>
component from
<a href="https://ui.shadcn.com">shadcn ui </a>.

By default, it will check for lowercase string inclusion in the node’s
label, and select the node and fit the view to the node when it is
selected. You can override this behavior by passing a custom `onSearch`
function. You can also override the default `onSelectNode` function to
customize the behavior when a node is selected.

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
class="react-flow__panel bg-primary-foreground text-foreground flex gap-1 rounded-md p-1 top left">

<div
class="bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-lg border shadow-md md:min-w-[450px]"
tabindex="-1" data-slot="command" cmdk-root="">

<div
data-slot="command-input-wrapper">

</div>

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

<a href="https://www.npmjs.com/package/@xyflow/react">@xyflow/react</a><a href="https://www.npmjs.com/package/cmdk">cmdk</a><a href="https://ui.shadcn.com/docs/components/command">shadcn/ui/command</a>

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

<div id="radix-_R_2ect5fiv5tlqlb_-content-shadcn" state="active"
orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_2ect5fiv5tlqlb_-trigger-shadcn" tabindex="0"
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

<div id="headlessui-tabs-panel-_R_3amect5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="0"
headlessui-state="selected" data-selected="">

```tsx
npx shadcn@latest add https://ui.reactflow.dev/node-search
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_5amect5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
pnpm dlx shadcn@latest add https://ui.reactflow.dev/node-search
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_7amect5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
yarn dlx shadcn@latest add https://ui.reactflow.dev/node-search
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_9amect5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
bun x shadcn@latest add https://ui.reactflow.dev/node-search
```

</div>

</div>

</div>

</div>

<div id="radix-_R_2ect5fiv5tlqlb_-content-manual" state="inactive"
orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_2ect5fiv5tlqlb_-trigger-manual" hidden=""
tabindex="0">

</div>

</div>

</div>

<div>

## Usage

</div>

## 1. Connect the component with your React Flow application.

```tsx
import { NodeSearch } from "@/registry/components/node-search/";
import { Background, Node, Panel, ReactFlow } from "@xyflow/react";
 
type NodeData = {
  label: string;
};
 
const graphSize = 20;
 
const initNodes: Node<NodeData>[] = Array.from(
  { length: graphSize },
  (_, index) => {
    // Calculate grid dimensions (aim for roughly square grid)
    const cols = Math.ceil(Math.sqrt(graphSize));
    // const rows = Math.ceil(graphSize / cols);
 
    // Calculate position in grid
    const col = index % cols;
    const row = Math.floor(index / cols);
 
    // Grid spacing
    const spacing = 200;
    const startX = 100;
    const startY = 100;
 
    return {
      id: `node-${index}`,
      data: { label: `Node ${index}` },
      position: {
        x: startX + col * spacing,
        y: startY + row * spacing,
      },
    };
  },
);
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow defaultNodes={initNodes} defaultEdges={[]} fitView>
        <Background />
        <Panel
          className="bg-primary-foreground text-foreground flex gap-1 rounded-md p-1"
          position="top-left"
        >
          <NodeSearch />
        </Panel>
      </ReactFlow>
    </div>
  );
}
```

</div>

</div>
