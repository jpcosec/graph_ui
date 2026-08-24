---
source: https://reactflow.dev/api-reference/types/delete-elements
title: DeleteElements
---

# DeleteElements

DeleteElements deletes provided nodes and edges and handles deleting any
connected edges as well as child nodes. Returns successfully deleted
edges and nodes asynchronously.

```tsx
export type DeleteElements = (payload: {
  nodes?: (Partial<Node> & { id: Node['id'] })[];
  edges?: (Partial<Edge> & { id: Edge['id'] })[];
}) => Promise<{
  deletedNodes: Node[];
  deletedEdges: Edge[];
}>;
```

</div>
