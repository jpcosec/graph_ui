---
source: https://reactflow.dev/examples/edges/markers
title: Edge Markers
---

# Edge Markers

React Flow has built-in support for different marker types for your
edges. It’s possible to add your own
<a href="https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker">SVG markers </a>,
too.

The markers are defined as SVG elements, so you can use any SVG you
want. The React Flow edge renderer will expect the marker definition to
be in a `<defs>` element.

If, for example, your custom edge is wrapping a built-in `<BaseEdge/>`
component, you can pass the `markerStart` and `markerEnd` props to the
`<BaseEdge/>` component. The built-in React Flow edge components will
expect the `markerStart` and `markerEnd` props to be in the format
`"url(#markerId)"`, where `markerId` is the ID of your marker
definition.

This allows you to customize the marker for a specific edge, depending
on the state of the edge.

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

CustomEdge.tsx

xy-theme.css

index.css

index.tsx

</div>

<div
class="col-span-1 flex h-10 justify-end gap-1 self-center p-1 text-sm">

</div>

</div>

<div>

<div id="radix-_R_19kt5fiv5tlqlb_-content-App.tsx"
state="active" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_19kt5fiv5tlqlb_-trigger-App.tsx" tabindex="0"
style="animation-duration:0s">

```tsx
import { ReactFlow, Background, MarkerType, BezierEdge } from '@xyflow/react';
import './index.css';
 
import CustomEdge from './CustomEdge';
 
const edgeTypes = {
  default: BezierEdge,
  custom: CustomEdge,
};
 
const defaultNodes = [
  {
    id: 'A',
    position: { x: 20, y: 20 },
    data: { label: 'A' },
  },
  {
    id: 'B',
    position: { x: 100, y: 200 },
    data: { label: 'B' },
  },
  {
    id: 'C',
    position: { x: 300, y: 20 },
    data: { label: 'C' },
  },
  {
    id: 'D',
    position: { x: 300, y: 170 },
    data: { label: 'D' },
  },
  {
    id: 'E',
    position: { x: 250, y: 300 },
    data: { label: 'E' },
  },
  {
    id: 'F',
    position: { x: 250, y: 450 },
    data: { label: 'F' },
  },
  {
    id: 'G',
    position: { x: 20, y: 450 },
    data: { label: 'G' },
  },
  {
    id: 'H',
    position: { x: 500, y: 450 },
    data: { label: 'H' },
  },
];
 
const defaultEdges = [
  {
    id: 'A->B',
    source: 'A',
    target: 'B',
    markerEnd: {
      type: MarkerType.Arrow,
    },
    label: 'default arrow',
  },
  {
    id: 'C->D',
    source: 'C',
    target: 'D',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    label: 'default closed arrow',
  },
  {
    id: 'D->E',
    source: 'D',
    target: 'E',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    markerStart: {
      type: MarkerType.ArrowClosed,
      orient: 'auto-start-reverse',
    },
    label: 'marker start and marker end',
  },
  {
    id: 'E->F',
    source: 'E',
    target: 'F',
    markerEnd: 'logo',
    label: 'custom marker',
  },
  {
    id: 'E->H',
    source: 'E',
    target: 'H',
    type: 'custom',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
    },
    label: 'change color on selection',
  },
  {
    id: 'B->G',
    source: 'B',
    target: 'G',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#FF0072',
    },
    label: 'marker size and color',
    style: {
      strokeWidth: 2,
      stroke: '#FF0072',
    },
  },
];
 
export default function MarkersExample() {
  return (
    <>
      <svg style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <marker
            id="logo"
            viewBox="0 0 40 40"
            markerHeight={20}
            markerWidth={20}
            refX={20}
            refY={40}
          >
            <path
              d="M35 23H25C23.8954 23 23 23.8954 23 25V35C23 36.1046 23.8954 37 25 37H35C36.1046 37 37 36.1046 37 35V25C37 23.8954 36.1046 23 35 23Z"
              stroke="#1A192B"
              stroke-width="2"
              fill="white"
            />
            <path
              d="M35 3H25C23.8954 3 23 3.89543 23 5V15C23 16.1046 23.8954 17 25 17H35C36.1046 17 37 16.1046 37 15V5C37 3.89543 36.1046 3 35 3Z"
              stroke="#FF0072"
              stroke-width="2"
              fill="white"
            />
            <path
              d="M15 23H5C3.89543 23 3 23.8954 3 25V35C3 36.1046 3.89543 37 5 37H15C16.1046 37 17 36.1046 17 35V25C17 23.8954 16.1046 23 15 23Z"
              stroke="#1A192B"
              stroke-width="2"
              fill="white"
            />
            <path
              d="M15 3H5C3.89543 3 3 3.89543 3 5V15C3 16.1046 3.89543 17 5 17H15C16.1046 17 17 16.1046 17 15V5C17 3.89543 16.1046 3 15 3Z"
              stroke="#1A192B"
              stroke-width="2"
              fill="white"
            />
            <path
              d="M17 13C18.6569 13 20 11.6569 20 10C20 8.34315 18.6569 7 17 7C15.3431 7 14 8.34315 14 10C14 11.6569 15.3431 13 17 13Z"
              fill="white"
            />
            <path
              d="M23 13C24.6569 13 26 11.6569 26 10C26 8.34315 24.6569 7 23 7C21.3431 7 20 8.34315 20 10C20 11.6569 21.3431 13 23 13Z"
              fill="white"
            />
            <path
              d="M30 20C31.6569 20 33 18.6569 33 17C33 15.3431 31.6569 14 30 14C28.3431 14 27 15.3431 27 17C27 18.6569 28.3431 20 30 20Z"
              fill="white"
            />
            <path
              d="M30 26C31.6569 26 33 24.6569 33 23C33 21.3431 31.6569 20 30 20C28.3431 20 27 21.3431 27 23C27 24.6569 28.3431 26 30 26Z"
              fill="white"
            />
            <path
              d="M17 33C18.6569 33 20 31.6569 20 30C20 28.3431 18.6569 27 17 27C15.3431 27 14 28.3431 14 30C14 31.6569 15.3431 33 17 33Z"
              fill="white"
            />
            <path
              d="M23 33C24.6569 33 26 31.6569 26 30C26 28.3431 24.6569 27 23 27C21.3431 27 20 28.3431 20 30C20 31.6569 21.3431 33 23 33Z"
              fill="white"
            />
            <path
              d="M30 25C31.1046 25 32 24.1046 32 23C32 21.8954 31.1046 21 30 21C28.8954 21 28 21.8954 28 23C28 24.1046 28.8954 25 30 25Z"
              fill="#1A192B"
            />
            <path
              d="M17 32C18.1046 32 19 31.1046 19 30C19 28.8954 18.1046 28 17 28C15.8954 28 15 28.8954 15 30C15 31.1046 15.8954 32 17 32Z"
              fill="#1A192B"
            />
            <path
              d="M23 32C24.1046 32 25 31.1046 25 30C25 28.8954 24.1046 28 23 28C21.8954 28 21 28.8954 21 30C21 31.1046 21.8954 32 23 32Z"
              fill="#1A192B"
            />
            <path opacity="0.35" d="M22 9.5H18V10.5H22V9.5Z" fill="#1A192B" />
            <path opacity="0.35" d="M29.5 17.5V21.5H30.5V17.5H29.5Z" fill="#1A192B" />
            <path opacity="0.35" d="M22 29.5H18V30.5H22V29.5Z" fill="#1A192B" />
            <path
              d="M17 12C18.1046 12 19 11.1046 19 10C19 8.89543 18.1046 8 17 8C15.8954 8 15 8.89543 15 10C15 11.1046 15.8954 12 17 12Z"
              fill="#1A192B"
            />
            <path
              d="M23 12C24.1046 12 25 11.1046 25 10C25 8.89543 24.1046 8 23 8C21.8954 8 21 8.89543 21 10C21 11.1046 21.8954 12 23 12Z"
              fill="#FF0072"
            />
            <path
              d="M30 19C31.1046 19 32 18.1046 32 17C32 15.8954 31.1046 15 30 15C28.8954 15 28 15.8954 28 17C28 18.1046 28.8954 19 30 19Z"
              fill="#FF0072"
            />
          </marker>
        </defs>
      </svg>
      <ReactFlow
        defaultNodes={defaultNodes}
        defaultEdges={defaultEdges}
        fitView
        edgeTypes={edgeTypes}
        colorMode="system"
      >
        <Background />
      </ReactFlow>
    </>
  );
}
```

</div>

</div>

<div id="radix-_R_19kt5fiv5tlqlb_-content-CustomEdge.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_19kt5fiv5tlqlb_-trigger-CustomEdge.tsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_19kt5fiv5tlqlb_-content-xy-theme.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_19kt5fiv5tlqlb_-trigger-xy-theme.css"
hidden="" tabindex="0">

</div>

<div id="radix-_R_19kt5fiv5tlqlb_-content-index.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_19kt5fiv5tlqlb_-trigger-index.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_19kt5fiv5tlqlb_-content-index.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_19kt5fiv5tlqlb_-trigger-index.tsx" hidden=""
tabindex="0">

</div>

</div>

</div>

</div>

</div>
