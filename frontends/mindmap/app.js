import {createRoot} from 'react-dom/client';
import {html} from './shared/html.js';
import {request} from './shell/api.js';
import {SourceProvider} from './source/source.js';
import {ShellDialogsProvider} from './shell/dialogs.js';
import {Shell} from './shell/shell.js';
import {VIEWS} from './shell/registry.js';

// Each registered view owns its own stylesheet(s) (descriptor.styles); this
// is the single place that links them, in VIEWS order, so the cascade stays
// skins -> base -> shell -> views no matter which views are registered.
// index.html only links the shell-level sheets that exist before any view
// does. Runs once, before the first render, so nothing flashes unstyled.
const linked = new Set();
for (const view of VIEWS) {
  for (const href of view.styles || []) {
    if (linked.has(href)) continue;
    linked.add(href);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}

createRoot(document.getElementById('root')).render(
  html`<${SourceProvider} request=${request}><${ShellDialogsProvider}><${Shell}/></${ShellDialogsProvider}></${SourceProvider}>`
);
