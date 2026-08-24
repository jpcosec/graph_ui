---
source: https://reactflow.dev/api-reference/hooks/use-viewport
title: useViewport()
---

# useViewport()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useViewport.ts">Source on GitHub </a>

The `useViewport` hook is a convenient way to read the current state of
the
<a href="/api-reference/types/viewport"><code dir="ltr">Viewport</code></a>
in a component. Components that use this hook will re-render **whenever
the viewport changes**.

```tsx
import { useViewport } from '@xyflow/react';
 
export default function ViewportDisplay() {
  const { x, y, zoom } = useViewport();
 
  return (
    <div>
      <p>
        The viewport is currently at ({x}, {y}) and zoomed to {zoom}.
      </p>
    </div>
  );
}
```

</div>

## Signature

**Parameters:**

This function does not accept any parameters.

**Returns:**

| Name                                                                                                                                                                                                                                                                        | Type     |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `x`       | `number` |
| `y`       | `number` |
| `zoom` | `number` |

## Notes

-   This hook can only be used in a component that is a child of a
    <a href="/api-reference/react-flow-provider"><code dir="ltr"><ReactFlowProvider /></code></a>
    or a
    <a href="/api-reference/react-flow"><code dir="ltr"><ReactFlow /></code></a>
    component.
