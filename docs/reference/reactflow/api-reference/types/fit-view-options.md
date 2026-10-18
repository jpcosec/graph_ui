---
source: https://reactflow.dev/api-reference/types/fit-view-options
title: FitViewOptions
---

# FitViewOptions

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/general.ts/#L67-L68">Source on GitHub </a>

When calling
<a href="/api-reference/types/react-flow-instance#fitview"><code dir="ltr">fitView</code></a>
these options can be used to customize the behavior. For example, the
`duration` option can be used to transform the viewport smoothly over a
given amount of time.

## Fields

| Name                                                                                                                                                                                                                                                                                                    | Type                             | Default |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|---------|
| `padding`                       | `Padding`                        |         |
| `includeHiddenNodes` | `boolean`                        |         |
| `minZoom`                       | `number`                         |         |
| `maxZoom`                       | `number`                         |         |
| `duration`                     | `number`                         |         |
| `ease`                             | `(t: number) => number`          |         |
| `interpolate`               | `"smooth" | "linear"`            |         |
| `nodes`                           | `(NodeType | { id: string; })[]` |         |
