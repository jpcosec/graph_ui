---
source: https://reactflow.dev/ui/components/animated-svg-edge
title: Animated SVG Edge
---

# Animated SVG Edge

An edge that animates a custom SVG element along the edge’s path. This
component is based on the
<a href="/examples/edges/animating-edges">animating SVG elements example</a>.

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

<div id="radix-_R_4pct5fiv5tlqlb_-content-shadcn" state="active"
orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_4pct5fiv5tlqlb_-trigger-shadcn" tabindex="0"
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

<div id="headlessui-tabs-panel-_R_6lcpct5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="0"
headlessui-state="selected" data-selected="">

```tsx
npx shadcn@latest add https://ui.reactflow.dev/animated-svg-edge
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_alcpct5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
pnpm dlx shadcn@latest add https://ui.reactflow.dev/animated-svg-edge
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_elcpct5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
yarn dlx shadcn@latest add https://ui.reactflow.dev/animated-svg-edge
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_ilcpct5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
bun x shadcn@latest add https://ui.reactflow.dev/animated-svg-edge
```

</div>

</div>

</div>

</div>

<div id="radix-_R_4pct5fiv5tlqlb_-content-manual" state="inactive"
orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_4pct5fiv5tlqlb_-trigger-manual" hidden=""
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
 
import { AnimatedSvgEdge } from "@/registry/components/animated-svg-edge";
 
const defaultNodes = [
  {
    id: "1",
    position: { x: 200, y: 200 },
    data: { label: "A" },
  },
  {
    id: "2",
    position: { x: 400, y: 400 },
    data: { label: "B" },
  },
];
 
const defaultEdges = [
  {
    id: "1->2",
    source: "1",
    target: "2",
    type: "animatedSvgEdge",
    data: {
      duration: 2,
      shape: "package",
      path: "smoothstep",
    },
  } satisfies AnimatedSvgEdge,
];
 
const edgeTypes = {
  animatedSvgEdge: AnimatedSvgEdge,
};
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow
        defaultNodes={defaultNodes}
        edgeTypes={edgeTypes}
        defaultEdges={defaultEdges}
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

## Custom shapes

It is intended that you add your own SVG shapes to the module. Each
shape should be a React component that takes one prop,
`animateMotionProps`, and returns some SVG.

You can define these shapes in a separate file or in the same file as
the edge component. In order to use them, you need to add them to the
`shapes` record like so:

```tsx
const shapes = {
  box: ({ animateMotionProps }) => (
    <rect width="5" height="5" fill="#ff0073">
      <animateMotion {...animateMotionProps} />
    </rect>
  ),
} satisfies Record<string, AnimatedSvg>;
```

</div>

The keys of the `shapes` record are valid values for the `shape` field
of the edge’s data:

```tsx
const initialEdges = [
  {
    // ...
    type: 'animatedSvgEdge',
    data: {
      duration: 2,
      shape: 'box',
    },
  } satisfies AnimatedSvgEdge,
];
```

</div>

<div
class="nextra-callout x:overflow-x-auto x:not-first:mt-[1.25em] x:flex x:rounded-lg x:border x:py-[.5em] x:pe-[1em] x:contrast-more:border-current! x:bg-blue-100 x:dark:bg-blue-900/30 x:text-blue-700 x:dark:text-blue-400 x:border-blue-700 x:dark:border-blue-600">

<div
style="font-family:"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol""

</div>

<div>

If you want to render regular HTML elements, be sure to wrap them in an
SVG `   <foreignObject />` element. Make sure to give the
`<foreignObject />` an `id` attribute and use that as the `href`
attribute when rendering the `<animateMotion />` element.

</div>

</div>
