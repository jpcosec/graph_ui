---
source: https://reactflow.dev/api-reference/types/edge-types
title: EdgeTypes
---

# EdgeTypes

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/general.ts#L76">Source on GitHub </a>

The `EdgeTypes` type is used to define custom edge types. Each key in
the object represents an edge type, and the value is the component that
should be rendered for that type.

```tsx
export type EdgeTypes = {
  [key: string]: React.ComponentType<EdgeProps>;
};
```

</div>
