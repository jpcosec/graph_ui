---
source: https://reactflow.dev/api-reference/types/coordinate-extent
title: CoordinateExtent
---

# CoordinateExtent

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/utils.ts/#L36-L37">Source on GitHub </a>

A coordinate extent represents two points in a coordinate system: one in
the top left corner and one in the bottom right corner. It is used to
represent the bounds of nodes in the flow or the bounds of the viewport.

```tsx
export type CoordinateExtent = [[number, number], [number, number]];
```

</div>

## Notes

-   Props that expect a `CoordinateExtent` usually default to
    `[[-∞, -∞], [+∞, +∞]]` to represent an unbounded extent.
