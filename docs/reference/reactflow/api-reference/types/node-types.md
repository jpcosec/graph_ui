---
source: https://reactflow.dev/api-reference/types/node-types
title: NodeTypes
---

# NodeTypes

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/nodes.ts">Source on GitHub </a>

The `NodeTypes` type is used to define custom node types. Each key in
the object represents a node type, and the value is the component that
should be rendered for that type.

```tsx
type NodeTypes = {
  [key: string]: React.ComponentType<NodeProps>;
};
```

</div>
