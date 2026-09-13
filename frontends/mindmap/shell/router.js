// URL-as-source-of-truth router for the shell's facet/view switch. Skin stays
// a separate localStorage preference (./skin.js); this module only owns
// which registered view is active, mapped 1:1 to /{facet}/{view.id}.
import {useState, useEffect} from 'react';
import {VIEWS} from './registry.js';

const STORAGE_KEY = 'kb-editor-route';
const DEFAULT_PATH = '/documents/map';
const DEFAULT_VIEW = VIEWS.find(v => routeFor(v) === DEFAULT_PATH) || VIEWS[0];

export function routeFor(descriptor) {
  return `/${descriptor.facet}/${descriptor.id}`;
}

export function parseRoute(pathname) {
  return VIEWS.find(v => routeFor(v) === pathname) || null;
}

function persist(path) {
  try { localStorage.setItem(STORAGE_KEY, path); } catch {}
}

function resolveInitial() {
  const fromPath = parseRoute(location.pathname);
  if (fromPath) {
    persist(routeFor(fromPath));
    return fromPath;
  }
  let stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch {}
  const fromStorage = stored && parseRoute(stored);
  const view = fromStorage || DEFAULT_VIEW;
  const path = routeFor(view);
  try { history.replaceState(null, '', path); } catch {}
  persist(path);
  return view;
}

// {view, navigate}: view is the active descriptor from ./registry.js;
// navigate accepts either a descriptor or a path string (TreeView doesn't
// import the registry to avoid a cycle with tree-view.js, so it navigates by
// path). localStorage['kb-editor-route'] is the fallback used only when a
// fresh load has no route in the URL itself (a bare `/`): the initial
// resolve and explicit navigate() calls keep it in sync. Back/forward
// (popstate) only updates the on-screen view — the browser's own history
// already remembers that URL, so there's nothing to persist.
export function useRoute() {
  const [view, setView] = useState(resolveInitial);

  useEffect(() => {
    const onPopState = () => {
      setView(parseRoute(location.pathname) || DEFAULT_VIEW);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = descriptorOrPath => {
    const target = typeof descriptorOrPath === 'string'
      ? parseRoute(descriptorOrPath)
      : descriptorOrPath;
    const next = target || DEFAULT_VIEW;
    const path = routeFor(next);
    try { history.pushState(null, '', path); } catch {}
    persist(path);
    setView(next);
  };

  return {view, navigate};
}
