import {createContext, useContext} from 'react';
import {createRequest, joinUrl} from './api.js';

// What a view needs from its host: the injected `request` and the server
// base URL (for stylesheets and any other non-/api asset). Views never import
// shell/api.js; whoever mounts them (app.js today) provides this context.
export function createViewContext(baseUrl = '') {
  return {baseUrl, request: createRequest(baseUrl), resolveUrl: path => joinUrl(baseUrl, path)};
}

export const ViewContext = createContext(createViewContext(''));
export const useViewContext = () => useContext(ViewContext);
