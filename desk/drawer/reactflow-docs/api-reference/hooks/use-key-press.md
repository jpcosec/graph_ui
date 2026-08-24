---
source: https://reactflow.dev/api-reference/hooks/use-key-press
title: useKeyPress()
---

# useKeyPress()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useKeyPress.ts">Source on GitHub </a>

This hook lets you listen for specific key codes and tells you whether
they are currently pressed or not.

```tsx
import { useKeyPress } from '@xyflow/react';
 
export default function () {
  const spacePressed = useKeyPress('Space');
  const cmdAndSPressed = useKeyPress(['Meta+s', 'Strg+s']);
 
  return (
    <div>
      {spacePressed && <p>Space pressed!</p>}
      {cmdAndSPressed && <p>Cmd + S pressed!</p>}
    </div>
  );
}
```

</div>

## Signature

**Parameters:**

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
<tr id="keycode">
<td><code dir="ltr">keyCode</code></td>
<td><code dir="ltr">KeyCode</code>
<div>
<p>The key code (string or array of strings) specifies which key(s) should trigger an action.</p>
<p>A <strong>string</strong> can represent:</p>
<ul>
<li>A <strong>single key</strong>, e.g. <code dir="ltr">'a'</code></li>
<li>A <strong>key combination</strong>, using <code dir="ltr">'+'</code> to separate keys, e.g. <code dir="ltr">'a+d'</code></li>
</ul>
<p>An <strong>array of strings</strong> represents <strong>multiple possible key inputs</strong>. For example, <code dir="ltr">['a', 'd+s']</code> means the user can press either the single key <code dir="ltr">'a'</code> or the combination of <code dir="ltr">'d'</code> and <code dir="ltr">'s'</code>.</p>
</div></td>
<td><code dir="ltr">null</code></td>
</tr>
<tr id="optionstarget">
<td><code dir="ltr">options.target</code></td>
<td><code dir="ltr">Window | Document | HTMLElement | ShadowRoot | null</code>
<div>
<p>Listen to key presses on a specific element.</p>
</div></td>
<td><code dir="ltr">document</code></td>
</tr>
<tr id="optionsactinsideinputwithmodifier">
<td><code dir="ltr">options.actInsideInputWithModifier</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>You can use this flag to prevent triggering the key press hook when an input field is focused.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="optionspreventdefault">
<td><code dir="ltr">options.preventDefault</code></td>
<td><code dir="ltr">boolean</code></td>
<td></td>
</tr>
</tbody>
</table>

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`boolean`

</div>

## Notes

-   This hook does not rely on a `ReactFlowInstance` so you are free to
    use it anywhere in your app!
