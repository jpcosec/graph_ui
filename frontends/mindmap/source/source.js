import React, {createContext, useContext, useEffect} from 'react';
import {useDocumentsFacet} from './documents.js';
import {useModelsFacet} from './models.js';
import {useDraftFacet} from './draft.js';

const SourceContext = createContext(null);

// Composes the three data facets (documents/models/draft) behind a single
// context so App (and any future view) consumes one source layer instead of
// owning fetch/mutation state itself.
export function SourceProvider({request, children}) {
  const documents = useDocumentsFacet(request);
  const models = useModelsFacet(request, documents);
  const draft = useDraftFacet(request, models, documents);

  useEffect(() => { documents.reload(); }, [documents.reload]);

  const dirtyAny = documents.dirty || draft.pending > 0;
  const value = {documents, models, draft, status: documents.status, error: documents.error,
    reload: documents.reload, dirtyAny};
  return React.createElement(SourceContext.Provider, {value}, children);
}

export function useSource() {
  return useContext(SourceContext);
}
