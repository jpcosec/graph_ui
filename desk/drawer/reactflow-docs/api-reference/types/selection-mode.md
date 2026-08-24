---
source: https://reactflow.dev/api-reference/types/selection-mode
title: SelectionMode
---

# SelectionMode

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts#L223">Source on GitHub </a>

The `SelectionMode` enum provides two options for node selection
behavior:

-   `Full`: A node is only selected when the selection rectangle fully
    contains it
-   `Partial`: A node is selected when the selection rectangle partially
    overlaps with it

```tsx
enum SelectionMode {
  Partial = 'partial',
  Full = 'full',
}
```

</div>
