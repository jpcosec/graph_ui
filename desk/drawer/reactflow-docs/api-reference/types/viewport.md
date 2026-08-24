---
source: https://reactflow.dev/api-reference/types/viewport
title: Viewport
---

# Viewport

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts/#L149-L153">Source on GitHub </a>

Internally, React Flow maintains a coordinate system that is independent
of the rest of the page. The `Viewport` type tells you where in that
system your flow is currently being display at and how zoomed in or out
it is.

## Fields

| Name                                                                                                                                                                                                                                                                        | Type     | Default |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|---------|
| `x`       | `number` |         |
| `y`       | `number` |         |
| `zoom` | `number` |         |

## Notes

-   A `Transform` has the same properties as the viewport, but they
    represent different things. Make sure you don’t get them muddled up
    or things will start to look weird!
