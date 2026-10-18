---
source: https://reactflow.dev/api-reference/types/panel-position
title: PanelPosition
---

# PanelPosition

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts/#L111-L112">Source on GitHub </a>

This type is mostly used to help position things on top of the flow
viewport. For example both the
<a href="/api-reference/components/minimap"><code dir="ltr"><MiniMap /></code></a>
and
<a href="/api-reference/components/controls"><code dir="ltr"><Controls /></code></a>
components take a `position` prop of this type.

```tsx
export type PanelPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'center-left'
  | 'center-right';
```

</div>
