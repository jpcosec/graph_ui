import {createRoot} from 'react-dom/client';
import {html} from './shared/html.js';
import {ViewContext, createViewContext} from './shell/view-context.js';
import {SourceProvider} from './source/source.js';
import {ShellDialogsProvider} from './shell/dialogs.js';
import {Shell} from './shell/shell.js';
import {VIEWS} from './shell/registry.js';

// Each registered view owns its own stylesheet(s) (descriptor.styles); this
// is the single place that links them, in VIEWS order, so the cascade stays
// skins -> base -> shell -> views no matter which views are registered.
// index.html only links the shell-level sheets that exist before any view
// does. Runs once, before the first render, so nothing flashes unstyled.
// The server base URL comes from the host element (data-base-url), default
// '' = same origin; stylesheets and requests both resolve against it.
const root = document.getElementById('root');
const viewContext = createViewContext(root.dataset.baseUrl || '');
const linked = new Set();
for (const view of VIEWS) {
  for (const href of view.styles || []) {
    if (linked.has(href)) continue;
    linked.add(href);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = viewContext.resolveUrl(href);
    document.head.appendChild(link);
  }
}

createRoot(root).render(
  html`<${ViewContext.Provider} value=${viewContext}><${SourceProvider} request=${viewContext.request}><${ShellDialogsProvider}><${Shell}/></${ShellDialogsProvider}></${SourceProvider}></${ViewContext.Provider}>`
);
