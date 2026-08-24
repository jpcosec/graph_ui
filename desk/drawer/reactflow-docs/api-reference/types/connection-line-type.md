---
source: https://reactflow.dev/api-reference/types/connection-line-type
title: ConnectionLineType
---

# ConnectionLineType

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/edges.ts/#L62">Source on GitHub </a>

If you set the `connectionLineType` prop on your
<a href="/api-reference/react-flow#connection-connectionLineType"><code dir="ltr"><ReactFlow /></code></a>
component, it will dictate the style of connection line rendered when
creating new edges.

```tsx
export enum ConnectionLineType {
  Bezier = 'default',
  Straight = 'straight',
  Step = 'step',
  SmoothStep = 'smoothstep',
  SimpleBezier = 'simplebezier',
}
```

</div>

## Notes

-   If you choose to render a custom connection line component, this
    value will be passed to your component as part of its
    <a href="/api-reference/types/connection-line-component-props"><code dir="ltr">ConnectionLineComponentProps</code></a>.
