---
source: https://reactflow.dev/ui/components/base-node
title: Base Node
---

# Base Node

A node wrapper with some basic styling used for creating a shared design
among all nodes in your application. Similarly to
<a href="https://ui.shadcn.com/docs/components/card">shadcn ui’s card </a>
the components file exports:

-   The `BaseNode` main container,
-   The `BaseNodeHeader` container where you would usually add actions
    and a `BaseNodeHeaderTitle`
-   The `BaseNodeContent` container where you would add the main
    contents of the node.
-   The `BaseNodeFooter` container where you may want to add extra
    information, or visible actions.

In case you need to fine-tune how interactions like dragging and
scrolling work with your custom components, React Flow provides
<a href="/learn/customization/utility-classes">several CSS utility classes</a>

You should use the `nodrag`
<a href="/learn/customization/utility-classes">React Flow utility class</a>
in interactive components of your node such as buttons, to disable
dragging the node inside the flow when the user is interacting with
buttons or sliders.

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

<a href="https://www.npmjs.com/package/@xyflow/react">@xyflow/react</a>

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

<div id="radix-_R_4qst5fiv5tlqlb_-content-shadcn" state="active"
orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_4qst5fiv5tlqlb_-trigger-shadcn" tabindex="0"
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

<div id="headlessui-tabs-panel-_R_6lcqst5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="0"
headlessui-state="selected" data-selected="">

```tsx
npx shadcn@latest add https://ui.reactflow.dev/base-node
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_alcqst5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
pnpm dlx shadcn@latest add https://ui.reactflow.dev/base-node
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_elcqst5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
yarn dlx shadcn@latest add https://ui.reactflow.dev/base-node
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_ilcqst5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
bun x shadcn@latest add https://ui.reactflow.dev/base-node
```

</div>

</div>

</div>

</div>

<div id="radix-_R_4qst5fiv5tlqlb_-content-manual" state="inactive"
orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_4qst5fiv5tlqlb_-trigger-manual" hidden=""
tabindex="0">

</div>

</div>

</div>

<div>

## Usage

## 1. Copy the component into your app

```tsx
import { memo } from "react";
 
import { Button } from "@/components/ui/button";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeFooter,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/components/base-node";
import { Rocket } from "lucide-react";
 
export const BaseNodeFullDemo = memo(() => {
  return (
    <BaseNode className="w-96">
      <BaseNodeHeader className="border-b">
        <Rocket className="size-4" />
        <BaseNodeHeaderTitle>Header</BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent>
        <h3 className="text-lg font-bold">Content</h3>
        <p className="text-xs">
          This is a full-featured node with a header, content, and footer. You
          can customize it as needed.
        </p>
      </BaseNodeContent>
      <BaseNodeFooter>
        <h4 className="text-md self-start font-bold">Footer</h4>
 
        <Button variant="outline" className="nodrag w-full">
          Action 1
        </Button>
      </BaseNodeFooter>
    </BaseNode>
  );
});
 
BaseNodeFullDemo.displayName = "BaseNodeFullDemo";
```

</div>

</div>

## 2. Connect the component with your React Flow application.

```tsx
import { Background, FitViewOptions, ReactFlow } from "@xyflow/react";
 
import { BaseNodeFullDemo } from "./component-example";
 
const nodeTypes = {
  baseNodeFull: BaseNodeFullDemo,
};
 
const defaultNodes = [
  {
    id: "2",
    position: { x: 200, y: 200 },
    data: {},
    type: "baseNodeFull",
  },
];
 
const fitViewOptions: FitViewOptions = {
  padding: "100px",
};
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow
        defaultNodes={defaultNodes}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={fitViewOptions}
      >
        <Background />
      </ReactFlow>
    </div>
  );
}
```

</div>

## Examples

<div>

### Action Bar Node

<div dir="ltr" orientation="horizontal">

<div role="tablist"
aria-orientation="horizontal" tabindex="-1" orientation="horizontal"
style="outline:none">

Preview

Code

</div>

<div id="radix-_R_2dqst5fiv5tlqlb_-content-preview" state="active"
orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_2dqst5fiv5tlqlb_-trigger-preview" tabindex="0"
style="animation-duration:0s">

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

</div>

<div id="radix-_R_2dqst5fiv5tlqlb_-content-code" state="inactive"
orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_2dqst5fiv5tlqlb_-trigger-code" hidden=""
tabindex="0">

</div>

</div>

</div>

<div>

### Annotation Node

<div dir="ltr" orientation="horizontal">

<div role="tablist"
aria-orientation="horizontal" tabindex="-1" orientation="horizontal"
style="outline:none">

Preview

Code

</div>

<div id="radix-_R_2lqst5fiv5tlqlb_-content-preview" state="active"
orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_2lqst5fiv5tlqlb_-trigger-preview" tabindex="0"
style="animation-duration:0s">

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

</div>

<div id="radix-_R_2lqst5fiv5tlqlb_-content-code" state="inactive"
orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_2lqst5fiv5tlqlb_-trigger-code" hidden=""
tabindex="0">

</div>

</div>

</div>

<div>

### Simple Node

<div dir="ltr" orientation="horizontal">

<div role="tablist"
aria-orientation="horizontal" tabindex="-1" orientation="horizontal"
style="outline:none">

Preview

Code

</div>

<div id="radix-_R_2tqst5fiv5tlqlb_-content-preview" state="active"
orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_2tqst5fiv5tlqlb_-trigger-preview" tabindex="0"
style="animation-duration:0s">

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

</div>

<div id="radix-_R_2tqst5fiv5tlqlb_-content-code" state="inactive"
orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_2tqst5fiv5tlqlb_-trigger-code" hidden=""
tabindex="0">

</div>

</div>

</div>

</div>

## Theming

To customize the visual appearance of your custom nodes, you can simply
use
<a href="https://tailwindcss.com/">Tailwind CSS </a>
classes. All of the React Flow components are based on
<a href="https://ui.shadcn.com/">shadcn UI </a>,
and you should follow the
<a href="https://ui.shadcn.com/docs/theming">shadcn UI theming guide </a>
to customize aspects like typography and colors in your application.

In most occasions though, when developing custom nodes, you may simply
need to add custom Tailwind CSS classes. All of the `BaseNode`
components are just light wrappers around `<div>`.

For example, to change the border color of a node, based on an
hypothetical execution status, you can pass extra `className`s:

```tsx
// Assuming your component is receiving a `data` prop
export const BaseNodeSimpleDemo = memo(({ data }: NodeProps) => {
  return (
    <BaseNode
      className={cn('w-[350px] p-0 hover:ring-orange-500', {
        'border-orange-500': data.status === 'loading',
        'border-red-500': data.status === 'error',
      })}
    >
      {/* Your custom node definiton goes here */}
    </BaseNode>
  );
});
```

</div>
