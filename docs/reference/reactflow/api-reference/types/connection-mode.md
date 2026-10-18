---
source: https://reactflow.dev/api-reference/types/connection-mode
title: ConnectionMode
---

# ConnectionMode

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts#L68">Source on GitHub </a>

The `ConnectionMode` enum provides two options for connection behavior
in React Flow:

-   `Strict`: Connections can only be made starting from a source handle
    and ending on a target handle
-   `Loose`: Connections can be made between any handles, regardless of
    type

```tsx
enum ConnectionMode {
  Strict = 'strict',
  Loose = 'loose',
}
```

</div>
