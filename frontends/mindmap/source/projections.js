import {useState, useCallback, useMemo} from 'react';
import {projectionsOf, applyProjection, titleFor as titleForDoc} from './projections.mjs';

const STORAGE_KEY = 'kb-projection';

// The active projection (a ProjectionDoc among the store's own documents),
// remembered per origin like the skin (shell/skin.js) rather than in the
// URL: each store already runs on its own server/port (see CLAUDE.md), so a
// single localStorage key is already scoped per store. A store with no
// ProjectionDoc has an empty `available` and behaves exactly as before —
// `documents` here is the same array reference as `documentsFacet.working.documents`.
export function useProjectionsFacet(documentsFacet) {
  const allDocuments = documentsFacet.working.documents;
  const available = useMemo(() => projectionsOf(allDocuments), [allDocuments]);
  const [activeName, setActiveNameState] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || ''; } catch { return ''; }
  });
  const setActiveName = useCallback(name => {
    setActiveNameState(name);
    try { name ? localStorage.setItem(STORAGE_KEY, name) : localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);
  const active = useMemo(
    () => (activeName ? available.find(d => d.payload?.name === activeName) || null : null),
    [available, activeName]
  );
  const documents = useMemo(() => applyProjection(allDocuments, active), [allDocuments, active]);
  const titleFor = useCallback(doc => titleForDoc(doc, active, allDocuments), [active, allDocuments]);
  return {available, activeName, setActiveName, active, documents, titleFor};
}
