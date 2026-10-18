---
source: https://reactflow.dev/ui/components/zoom-slider
title: Zoom Slider
---

# Zoom Slider

A zoom control that lets you zoom in and out seamlessly using a slider.

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
class="react-flow__panel bg-primary-foreground text-foreground flex gap-1 rounded-md p-1 flex-row top left">

<div>

<span
class="relative flex touch-none select-none items-center data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-[disabled]:opacity-50 w-[140px]"
dir="ltr" orientation="horizontal" aria-disabled="false"
data-slot="slider"
style="--radix-slider-thumb-transform:translateX(-50%)"><span
class="bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-1.5"
orientation="horizontal" data-slot="slider-track"><span
class="bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
orientation="horizontal" data-slot="slider-range"
style="left:0%;right:66.66666666666666%"></span></span><span
style="transform:var(--radix-slider-thumb-transform);position:absolute;left:calc(0% + 0px)"><span
class="border-primary ring-ring/50 focus-visible:outline-hidden block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50"
role="slider" aria-valuemin="0.5" aria-valuemax="2"
aria-orientation="horizontal" orientation="horizontal" tabindex="0"
data-slot="slider-thumb" style="display:none"
radix-collection-item=""></span></span></span>

</div>

100%

</div>

<div>

Toggle orientation

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

<a href="https://www.npmjs.com/package/@xyflow/react">@xyflow/react</a><a href="https://www.npmjs.com/package/lucide-react">lucide-react</a><a href="https://ui.shadcn.com/docs/components/button">shadcn/ui/button</a><a href="https://ui.shadcn.com/docs/components/slider">shadcn/ui/slider</a>

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
npx shadcn@latest add https://ui.reactflow.dev/zoom-slider
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_2lb7ct5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
pnpm dlx shadcn@latest add https://ui.reactflow.dev/zoom-slider
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_3lb7ct5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
yarn dlx shadcn@latest add https://ui.reactflow.dev/zoom-slider
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_4lb7ct5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
bun x shadcn@latest add https://ui.reactflow.dev/zoom-slider
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

</div>

## 1. Connect the component with your React Flow application.

```tsx
import { Background, Panel, ReactFlow } from "@xyflow/react";
import { ZoomSlider } from "@/registry/components/zoom-slider/";
import { Button } from "@/components/ui/button";
import { useState } from "react";
 
const defaultNodes = [
  {
    id: "1",
    position: { x: 200, y: 200 },
    data: { label: "Node" },
  },
];
 
export default function App() {
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">(
    "horizontal",
  );
 
  return (
    <div className="h-full w-full">
      <ReactFlow defaultNodes={defaultNodes} fitView>
        <Background />
        <ZoomSlider position="top-left" orientation={orientation} />
        <Panel position="bottom-right">
          <Button
            onClick={() =>
              setOrientation(
                orientation === "horizontal" ? "vertical" : "horizontal",
              )
            }
          >
            Toggle orientation
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
```

</div>

</div>
