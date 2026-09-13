import {useState, useEffect} from 'react';
import {readDraft, writeDraft, brainstormIssues, brainstormToSource} from './draft.mjs';

// Brainstorm draft facet: owns the localStorage-backed idea tree and the
// plan+compile conversion into real SLDB documents. Moved out of the
// Brainstorm tree view's own state (state + convert()); messages/texts stay
// in the view, this only returns structured results.
export function useDraftFacet(request, models, documents) {
  const [ideas, setIdeas] = useState(() => readDraft() || []);
  useEffect(() => { writeDraft(ideas); }, [ideas]);

  const issues = brainstormIssues(ideas, models.models);
  const pending = ideas.filter(i => !i.convertedDocId).length;

  const update = fn => setIdeas(fn);
  const discard = () => setIdeas([]);

  const convert = async () => {
    const invalid = new Set(issues.map(i => i.id));
    const subset = ideas.filter(i => !i.convertedDocId && !invalid.has(i.id) && !invalid.has(i.parentId));
    if (!subset.length) return {ok: false, report: null};
    const {source, docIds} = brainstormToSource(subset, models.models, documents.working.documents.map(d => d.id));
    if (!source.documents.length) return {ok: false, report: null};
    try {
      const plan = await request('/api/plan', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({source})});
      if (!plan.applicable) return {ok: false, report: plan};
      const done = await request('/api/compile', {method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({source, planToken: plan.planToken})});
      const converted = Object.keys(docIds);
      setIdeas(list => list.map(i => converted.includes(i.id) ? {...i, convertedDocId: docIds[i.id]} : i));
      await documents.reload();
      return {ok: true, docIds, report: done};
    } catch (e) {
      return {ok: false, report: e.body || {ok: false, error: e.message}, error: e.message};
    }
  };

  return {ideas, update, pending, issues, convert, discard};
}
