---
source: https://reactflow.dev/api-reference/types/aria-label-config
title: AriaLabelConfig
---

# AriaLabelConfig

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/constants.ts/">Source on GitHub </a>

With the `AriaLabelConfig` you can customize the aria labels used by
React Flow. This is useful if you want to translate the labels or if you
want to change them to better suit your application.

## Fields

| Name                                                                                                                                                                                                                                                                                                                                        | Type                                                                            | Default |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------|---------|
| `node.a11yDescription.default`                   | `string`                                                                        |         |
| `node.a11yDescription.keyboardDisabled` | `string`                                                                        |         |
| `node.a11yDescription.ariaLiveMessage`   | `({ direction, x, y }: { direction: string; x: number; y: number; }) => string` |         |
| `edge.a11yDescription.default`                   | `string`                                                                        |         |
| `controls.ariaLabel`                                      | `string`                                                                        |         |
| `controls.zoomIn.ariaLabel`                         | `string`                                                                        |         |
| `controls.zoomOut.ariaLabel`                       | `string`                                                                        |         |
| `controls.fitView.ariaLabel`                       | `string`                                                                        |         |
| `controls.interactive.ariaLabel`               | `string`                                                                        |         |
| `minimap.ariaLabel`                                        | `string`                                                                        |         |
| `handle.ariaLabel`                                          | `string`                                                                        |         |

## Default config

```tsx
const defaultAriaLabelConfig = {
  'node.a11yDescription.default':
    'Press enter or space to select a node. Press delete to remove it and escape to cancel.',
  'node.a11yDescription.keyboardDisabled':
    'Press enter or space to select a node. You can then use the arrow keys to move the node around. Press delete to remove it and escape to cancel.',
  'node.a11yDescription.ariaLiveMessage': ({ direction, x, y }: { direction: string; x: number; y: number }) =>
    `Moved selected node ${direction}. New position, x: ${x}, y: ${y}`,
  'edge.a11yDescription.default':
    'Press enter or space to select an edge. You can then press delete to remove it or escape to cancel.',
 
  // Control elements
  'controls.ariaLabel': 'Control Panel',
  'controls.zoomIn.ariaLabel': 'Zoom In',
  'controls.zoomOut.ariaLabel': 'Zoom Out',
  'controls.fitView.ariaLabel': 'Fit View',
  'controls.interactive.ariaLabel': 'Toggle Interactivity',
 
  // Mini map
  'minimap.ariaLabel': 'Mini Map',
 
  // Handle
  'handle.ariaLabel': 'Handle',
};
```

</div>
