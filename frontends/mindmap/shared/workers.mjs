// Lógica pura del panel de workers (shell/workers-panel.js). Separada en .mjs
// para que `node --test tests/mindmap-workers.test.mjs` la pruebe sin cargar
// React. Sin dependencias: opera solo sobre el contrato JSON de /api/workers.
//
// Contrato: {workers:[..], spaces?:[{workspace,label,number,status,workers}], error?}
// 'workers' (plano) se mantiene por retrocompatibilidad; 'spaces' (agrupado)
// es lo nuevo. El panel usa 'spaces' si viene; si NO viene, agrupa la lista
// plana por 'workspace' como fallback. Tiene que funcionar en ambos casos.

const EMPTY_LABEL = '(sin space)';
const KNOWN_STATUS = ['working', 'idle', 'done', 'blocked', 'unknown'];

export function basename(path) {
  if (!path) return '—';
  const s = String(path).replace(/[\\/]+$/, '');
  const i = s.lastIndexOf('/');
  return i >= 0 ? s.slice(i + 1) : s;
}

export function normalizeStatus(status) {
  const s = String(status || '').toLowerCase();
  return KNOWN_STATUS.includes(s) ? s : 'unknown';
}

export function statusLabel(status) {
  const s = String(status || 'unknown');
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Unknown';
}

// [{workspace, label, number, status, workers}] ordenado por number
// ascendente (los sin number al final, desempatando por label). Los groups
// sin workers se descartan: una cabecera sin filas es ruido.
export function groupBySpace(payload) {
  const data = payload && typeof payload === 'object' ? payload : {};
  const workers = Array.isArray(data.workers) ? data.workers : [];
  const spaces = Array.isArray(data.spaces) && data.spaces.length ? data.spaces : null;
  const groups = spaces ? spaces.map(normalizeSpace) : groupByWorkspace(workers);
  return groups
    .filter(g => g.workers.length)
    .sort((a, b) => orderKey(a) - orderKey(b) || String(a.label).localeCompare(String(b.label)));
}

function normalizeSpace(s) {
  return {
    workspace: s && s.workspace,
    label: (s && s.label) || (s && s.workspace) || EMPTY_LABEL,
    number: s && typeof s.number === 'number' ? s.number : null,
    status: s && s.status,
    workers: Array.isArray(s && s.workers) ? s.workers : [],
  };
}

function groupByWorkspace(workers) {
  const by = new Map();
  for (const w of workers) {
    if (!w || typeof w !== 'object') continue;
    const ws = w.workspace || EMPTY_LABEL;
    if (!by.has(ws)) {
      by.set(ws, {workspace: w.workspace, label: ws, number: null, status: null, workers: []});
    }
    by.get(ws).workers.push(w);
  }
  return [...by.values()];
}

function orderKey(g) {
  return g.number == null ? Number.MAX_SAFE_INTEGER : g.number;
}