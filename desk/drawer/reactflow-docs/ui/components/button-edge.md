---
source: https://reactflow.dev/ui/components/button-edge
title: Button Edge
---

# Button Edge

An edge with a button that can be used to trigger a custom action.

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

<a href="https://www.npmjs.com/package/@xyflow/react">@xyflow/react</a><a href="https://www.npmjs.com/package/lucide-react">lucide-react</a><a href="https://ui.shadcn.com/docs/components/button">shadcn/ui/button</a>

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

<div id="radix-_R_17ct5fiv5tlqlb_-content-shadcn" state="active"
orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_17ct5fiv5tlqlb_-trigger-shadcn" tabindex="0"
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

<div id="headlessui-tabs-panel-_R_1lb7ct5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="0"
headlessui-state="selected" data-selected="">

```tsx
npx shadcn@latest add https://ui.reactflow.dev/button-edge
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_2lb7ct5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
pnpm dlx shadcn@latest add https://ui.reactflow.dev/button-edge
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_3lb7ct5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
yarn dlx shadcn@latest add https://ui.reactflow.dev/button-edge
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_4lb7ct5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
bun x shadcn@latest add https://ui.reactflow.dev/button-edge
```

</div>

</div>

</div>

</div>

<div id="radix-_R_17ct5fiv5tlqlb_-content-manual" state="inactive"
orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_17ct5fiv5tlqlb_-trigger-manual" hidden=""
tabindex="0">

</div>

</div>

</div>

<div>

## Usage

## 1. Copy the component into your app

```tsx
import { EdgeProps } from "@xyflow/react";
import { memo } from "react";
 
import { Button } from "@/components/ui/button";
import { MousePointerClick } from "lucide-react";
import { ButtonEdge } from "@/components/button-edge";
 
const ButtonEdgeDemo = memo((props: EdgeProps) => {
  const onEdgeClick = () => {
    window.alert(`Edge has been clicked!`);
  };
 
  return (
    <ButtonEdge {...props}>
      <Button onClick={onEdgeClick} size="icon" variant="secondary">
        <MousePointerClick size={16} />
      </Button>
    </ButtonEdge>
  );
});
 
ButtonEdgeDemo.displayName = "ButtonEdgeDemo";
 
export default ButtonEdgeDemo;
```

</div>

</div>

## 2. Connect the component with your React Flow application.

```tsx
import { Background, ReactFlow } from "@xyflow/react";
import ButtonEdgeDemo from "./component-example";
 
const defaultNodes = [
  {
    id: "1",
    position: { x: 200, y: 200 },
    data: { label: "Node" },
  },
  {
    id: "2",
    position: { x: 500, y: 500 },
    data: { label: "Node" },
  },
];
 
const defaultEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "buttonedge",
  },
];
 
const edgeTypes = {
  buttonedge: ButtonEdgeDemo,
};
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow
        defaultNodes={defaultNodes}
        defaultEdges={defaultEdges}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
      </ReactFlow>
    </div>
  );
}
```

</div>

</div>
