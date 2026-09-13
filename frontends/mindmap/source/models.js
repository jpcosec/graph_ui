import {useState, useEffect, useCallback} from 'react';

// Schema/model facet. Wiring note: the documents facet's reload() already
// fetches /api/schema alongside /api/graph in a single combined load (the
// map view needs both together); rather than issuing a second /api/schema
// request here on every load, this facet mirrors documents.models whenever
// it changes. Its own reload() still performs an independent GET /api/schema
// so the facet is usable/testable on its own and the contract is complete,
// but nothing in the app currently calls it directly (source.reload() only
// drives documents.reload(), and this facet picks up the result via the
// effect below).
export function useModelsFacet(request, documents) {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [models, setModels] = useState([]);

  useEffect(() => {
    setModels(documents.models);
    setStatus(documents.status);
    setError(documents.error);
  }, [documents.models, documents.status, documents.error]);

  const reload = useCallback(async () => {
    setStatus('loading'); setError('');
    try {
      const schema = await request('/api/schema');
      setModels(schema.models);
      setStatus('ready');
    } catch (e) { setStatus('error'); setError(e.message); }
  }, [request]);

  // Documents per class from the live working copy (not the saved
  // baseline): the class sidebar counts must move as you add/remove
  // documents locally, before saving — this mirrors the original
  // App's `counts`, which read from the working `documents` state.
  const counts = Object.fromEntries(models.map(m => [m.id,
    documents.working.documents.filter(d => d.model_name === m.id).length]));

  return {status, error, models, counts, reload};
}
