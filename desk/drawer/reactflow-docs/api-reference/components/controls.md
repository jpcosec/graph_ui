---
source: https://reactflow.dev/api-reference/components/controls
title: The Controls component
---

# <Controls />

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/additional-components/Controls/Controls.tsx">Source on GitHub </a>

The `<Controls />` component renders a small panel that contains
convenient buttons to zoom in, zoom out, fit the view, and lock the
viewport.

```tsx
import { ReactFlow, Controls } from '@xyflow/react'
 
export default function Flow() {
  return (
    <ReactFlow nodes={[...]} edges={[...]}>
      <Controls />
    </ReactFlow>
  )
}
```

</div>

## Props

For TypeScript users, the props type for the `<Controls />` component is
exported as `ControlProps`.

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th>Default</th>
</tr>
</thead>
<tbody>
<tr id="showzoom">
<td><code dir="ltr">showZoom</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Whether or not to show the zoom in and zoom out buttons. These buttons will adjust the viewport zoom by a fixed amount each press.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="showfitview">
<td><code dir="ltr">showFitView</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Whether or not to show the fit view button. By default, this button will adjust the viewport so that all nodes are visible at once.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="showinteractive">
<td><code dir="ltr">showInteractive</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Show button for toggling interactivity</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="fitviewoptions">
<td><code dir="ltr">fitViewOptions</code></td>
<td><code dir="ltr">FitViewOptionsBase<NodeType></code>
<div>
<p>Customise the options for the fit view button. These are the same options you would pass to the fitView function.</p>
</div></td>
<td></td>
</tr>
<tr id="onzoomin">
<td><code dir="ltr">onZoomIn</code></td>
<td><code dir="ltr">() => void</code>
<div>
<p>Called in addition the default zoom behavior when the zoom in button is clicked.</p>
</div></td>
<td></td>
</tr>
<tr id="onzoomout">
<td><code dir="ltr">onZoomOut</code></td>
<td><code dir="ltr">() => void</code>
<div>
<p>Called in addition the default zoom behavior when the zoom out button is clicked.</p>
</div></td>
<td></td>
</tr>
<tr id="onfitview">
<td><code dir="ltr">onFitView</code></td>
<td><code dir="ltr">() => void</code>
<div>
<p>Called when the fit view button is clicked. When this is not provided, the viewport will be adjusted so that all nodes are visible.</p>
</div></td>
<td></td>
</tr>
<tr id="oninteractivechange">
<td><code dir="ltr">onInteractiveChange</code></td>
<td><code dir="ltr">(interactiveStatus: boolean) => void</code>
<div>
<p>Called when the interactive (lock) button is clicked.</p>
</div></td>
<td></td>
</tr>
<tr id="position">
<td><code dir="ltr">position</code></td>
<td><code dir="ltr">PanelPosition</code>
<div>
<p>Position of the controls on the pane</p>
</div></td>
<td><code dir="ltr">PanelPosition.BottomLeft</code></td>
</tr>
<tr id="children">
<td><code dir="ltr">children</code></td>
<td><code dir="ltr">ReactNode</code></td>
<td></td>
</tr>
<tr id="style">
<td><code dir="ltr">style</code></td>
<td><code dir="ltr">CSSProperties</code>
<div>
<p>Style applied to container</p>
</div></td>
<td></td>
</tr>
<tr id="classname">
<td><code dir="ltr">className</code></td>
<td><code dir="ltr">string</code>
<div>
<p>Class name applied to container</p>
</div></td>
<td></td>
</tr>
<tr id="aria-label">
<td><code dir="ltr">aria-label</code></td>
<td><code dir="ltr">string</code></td>
<td><code dir="ltr">'React Flow controls'</code></td>
</tr>
<tr id="orientation">
<td><code dir="ltr">orientation</code></td>
<td><code dir="ltr">"horizontal" | "vertical"</code></td>
<td><code dir="ltr">'vertical'</code></td>
</tr>
</tbody>
</table>

## Notes

-   To extend or customize the controls, you can use the
    <a href="/api-reference/components/control-button"><code dir="ltr"><ControlButton /></code></a>
    component
