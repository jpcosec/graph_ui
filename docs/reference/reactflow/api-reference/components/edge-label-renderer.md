---
source: https://reactflow.dev/api-reference/components/edge-label-renderer
title: The EdgeLabelRenderer component
---

# <EdgeLabelRenderer />

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/EdgeLabelRenderer/index.tsx">Source on GitHub </a>

Edges are SVG-based. If you want to render more complex labels you can
use the `<EdgeLabelRenderer />` component to access a div based
renderer. This component is a portal that renders the label in a
`<div />` that is positioned on top of the edges. You can see an example
usage of the component in the
<a href="/examples/edges/edge-label-renderer">edge label renderer</a>
example.

```tsx
import React from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';
 
const CustomEdge = ({ id, data, ...props }) => {
  const [edgePath, labelX, labelY] = getBezierPath(props);
 
  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: '#ffcc00',
            padding: 10,
            borderRadius: 5,
            fontSize: 12,
            fontWeight: 700,
          }}
          className="nodrag nopan"
        >
          {data.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
 
export default CustomEdge;
```

</div>

## Props

| Name                                                                                                                                                                                                                                                                                | Type        | Default |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|---------|
| `children` | `ReactNode` |         |

## Notes

-   The `<EdgeLabelRenderer />` has no pointer events by default. If you
    want to add mouse interactions you need to set the style
    `pointerEvents: 'all'` and add the `nopan` class on the label or the
    element you want to interact with.
