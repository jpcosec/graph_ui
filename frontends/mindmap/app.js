import {createRoot} from 'react-dom/client';
import {html} from './shared/html.js';
import {request} from './shell/api.js';
import {SourceProvider} from './source/source.js';
import {ShellDialogsProvider} from './shell/dialogs.js';
import {Shell} from './shell/shell.js';

createRoot(document.getElementById('root')).render(
  html`<${SourceProvider} request=${request}><${ShellDialogsProvider}><${Shell}/></${ShellDialogsProvider}></${SourceProvider}>`
);
