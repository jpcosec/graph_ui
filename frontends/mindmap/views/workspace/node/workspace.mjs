/**
 * Pure helper functions for the multi-projection workspace view.
 */

export const TABS = [
  { id: 'document', label: 'Documento' },
  { id: 'graph', label: 'Grafo Local' },
  { id: 'code', label: 'Código' }
];

export function filterCatalog(nodes = [], query = '', model = '') {
  const q = (query || '').trim().toLowerCase();
  const m = (model || '').trim().toLowerCase();
  return (nodes || []).filter(node => {
    if (!node) return false;
    const matchesModel = !m || (node.model_name || '').toLowerCase() === m;
    if (!matchesModel) return false;
    if (!q) return true;
    const id = (node.id || '').toLowerCase();
    const title = (node.title || '').toLowerCase();
    const modelName = (node.model_name || '').toLowerCase();
    return id.includes(q) || title.includes(q) || modelName.includes(q);
  });
}

export function formatHash(hash, length = 8) {
  if (!hash || typeof hash !== 'string') return '';
  return hash.slice(0, length);
}

export function parseCodeSnippet(content = '', targetLine = null, context = 3) {
  if (typeof content !== 'string') return { lines: [], startLine: 1, endLine: 1 };
  const allLines = content.split('\n');
  if (targetLine === null || targetLine === undefined || targetLine <= 0) {
    return {
      lines: allLines.map((text, idx) => ({
        number: idx + 1,
        text,
        isTarget: false
      })),
      startLine: 1,
      endLine: allLines.length
    };
  }
  const lineIdx = targetLine - 1;
  const start = Math.max(0, lineIdx - context);
  const end = Math.min(allLines.length, lineIdx + context + 1);
  const slice = allLines.slice(start, end);
  return {
    lines: slice.map((text, offset) => {
      const num = start + offset + 1;
      return {
        number: num,
        text,
        isTarget: num === targetLine
      };
    }),
    startLine: start + 1,
    endLine: end
  };
}

export function formatProblems(problemsData) {
  if (!problemsData) {
    return { state: 'clean', hasProblems: false, list: [], count: 0, storeTotal: 0, error: null };
  }
  const list = Array.isArray(problemsData.problems) ? problemsData.problems : [];
  const storeTotal = problemsData.store_problems_count || 0;
  const error = problemsData.error || null;

  if (error) {
    return { state: 'error', hasProblems: true, list: [], count: 0, storeTotal, error };
  }
  if (list.length > 0) {
    return { state: 'node_problems', hasProblems: true, list, count: list.length, storeTotal, error: null };
  }
  if (storeTotal > 0) {
    return { state: 'store_problems', hasProblems: true, list: [], count: 0, storeTotal, error: null };
  }
  return { state: 'clean', hasProblems: false, list: [], count: 0, storeTotal: 0, error: null };
}

export function filterGraphEdges(edges = [], typeFilter = '') {
  const tf = (typeFilter || '').trim();
  if (!tf) return edges || [];
  return (edges || []).filter(e => (e.type || e.rel) === tf);
}

export function distinctEdgeTypes(edges = []) {
  const types = new Set();
  for (const e of edges || []) {
    const t = e.type || e.rel;
    if (t) types.add(t);
  }
  return Array.from(types).sort();
}
