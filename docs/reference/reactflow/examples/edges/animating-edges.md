---
source: https://reactflow.dev/examples/edges/animating-edges
title: Animating Edges
---

# Animating Edges

React Flow provides a simple built-in animation for the default edge
type, but it is possible to create more advanced animations by using
custom edges. Below are a collection of examples showing different ways
an edge path might be used in

## Animating SVG elements

It is possible to animate an SVG element along a path using the
`<animateMotion />` element. This example creates a custom edge that
animates a circle along the edge path.

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

AnimatedSVGEdge.tsx

App.tsx

xy-theme.css

index.css

index.tsx

</div>

<div
class="col-span-1 flex h-10 justify-end gap-1 self-center p-1 text-sm">

</div>

</div>

<div>

<div id="radix-_R_27kt5fiv5tlqlb_-content-AnimatedSVGEdge.tsx"
class="min-h-[500px]" state="active" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_27kt5fiv5tlqlb_-trigger-AnimatedSVGEdge.tsx"
tabindex="0" style="animation-duration:0s">

```tsx
import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
 
export function AnimatedSVGEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
 
  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <circle r="10" fill="#ff0073">
        <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
      </circle>
    </>
  );
}
```

</div>

</div>

<div id="radix-_R_27kt5fiv5tlqlb_-content-App.tsx"
state="inactive" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_27kt5fiv5tlqlb_-trigger-App.tsx" hidden=""
tabindex="0">

</div>

<div id="radix-_R_27kt5fiv5tlqlb_-content-xy-theme.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_27kt5fiv5tlqlb_-trigger-xy-theme.css"
hidden="" tabindex="0">

</div>

<div id="radix-_R_27kt5fiv5tlqlb_-content-index.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_27kt5fiv5tlqlb_-trigger-index.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_27kt5fiv5tlqlb_-content-index.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_27kt5fiv5tlqlb_-trigger-index.tsx" hidden=""
tabindex="0">

</div>

</div>

</div>

</div>

</div>

## Animating other nodes

If you want to animate more than SVG along an edge, you can do that with
the Web Animations API. This example demonstrates how to animate another
node in the flow along an edge path by using the `offsetPath` property
and animating the `offsetDistance` property.

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

AnimatedNodeEdge.tsx

App.tsx

xy-theme.css

index.css

index.tsx

</div>

<div
class="col-span-1 flex h-10 justify-end gap-1 self-center p-1 text-sm">

</div>

</div>

<div>

<div id="radix-_R_2dkt5fiv5tlqlb_-content-AnimatedNodeEdge.tsx"
class="min-h-[500px]" state="active" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_2dkt5fiv5tlqlb_-trigger-AnimatedNodeEdge.tsx"
tabindex="0" style="animation-duration:0s">

```tsx
import { useEffect, useMemo } from 'react';
import {
  BaseEdge,
  getBezierPath,
  useReactFlow,
  type Edge,
  type EdgeProps,
} from '@xyflow/react';
 
export type AnimatedNodeEdge = Edge<{ node: string }, 'animatedNode'>;
 
export function AnimatedNodeEdge({
  id,
  data = { node: '' },
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps<AnimatedNodeEdge>) {
  const { getNode, updateNode } = useReactFlow();
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const selector = useMemo(
    () => `.react-flow__node[data-id="${data.node}"]`,
    [data.node],
  );
 
  useEffect(() => {
    const node = document.querySelector(selector) as HTMLElement;
 
    if (!node) return;
 
    node.style.offsetPath = `path('${edgePath}')`;
    node.style.offsetRotate = '0deg';
    // This property is fairly new and not all versions of TypeScript have it
    // in the lib.dom.d.ts file. If you get an error here, you can either
    // ignore it or add the property to the CSSStyleDeclaration interface
    // yourself.
    //
    // @ts-expect-error
    node.style.offsetAnchor = 'center';
 
    let wasDraggable = getNode(data.node).draggable;
 
    updateNode(data.node, { draggable: false });
 
    return () => {
      node.style.offsetPath = 'none';
      updateNode(data.node, { draggable: wasDraggable });
    };
  }, [selector, edgePath]);
 
  useEffect(() => {
    const node = document.querySelector(selector) as HTMLElement;
 
    if (!node) return;
 
    const keyframes = [{ offsetDistance: '0%' }, { offsetDistance: '100%' }];
    const animation = node.animate(keyframes, {
      duration: 2000,
      direction: 'alternate',
      iterations: Infinity,
    });
 
    return () => {
      animation.cancel();
    };
  }, [selector]);
 
  return <BaseEdge id={id} path={edgePath} />;
}
```

</div>

</div>

<div id="radix-_R_2dkt5fiv5tlqlb_-content-App.tsx"
state="inactive" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_2dkt5fiv5tlqlb_-trigger-App.tsx" hidden=""
tabindex="0">

</div>

<div id="radix-_R_2dkt5fiv5tlqlb_-content-xy-theme.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_2dkt5fiv5tlqlb_-trigger-xy-theme.css"
hidden="" tabindex="0">

</div>

<div id="radix-_R_2dkt5fiv5tlqlb_-content-index.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_2dkt5fiv5tlqlb_-trigger-index.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_2dkt5fiv5tlqlb_-content-index.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_2dkt5fiv5tlqlb_-trigger-index.tsx" hidden=""
tabindex="0">

</div>

</div>

</div>

</div>

</div>

There are some important details in this example to take note of:

-   The animated node has its
    <a href="/api-reference/types/node#draggable"><code dir="ltr">draggable</code></a>
    property set to `false` while the animation is running. This
    prevents a user moving the node around and breaking the animation
    path.

-   The animation path and the animation itself are set up in separate
    `useEffect` hooks. This lets the animation continue playing smoothly
    even if the edge path is recalculated (for example when the source
    or target nodes are dragged.)
