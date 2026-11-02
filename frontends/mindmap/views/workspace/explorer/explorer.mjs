/**
 * Logica pura del explorador de documentos (WS13.2). Sin DOM, sin red.
 *
 * Entrada: la respuesta de GET /api/workspace/explorer ({modeled, unmodeled, ...}) y la de
 * GET /api/workspace/nodes (titulo y estado de carga del modelo por documento). Nada se inventa:
 * lo que el servidor no entrega queda ausente.
 */

export function matches(query, ...fields) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return true;
  return fields.some(f => String(f || '').toLowerCase().includes(q));
}

/** Modelados agrupados por modelo (orden alfabetico de modelo, y de titulo dentro del grupo). */
export function modeledGroups(modeled = [], catalog = [], query = '') {
  const byId = new Map((catalog || []).map(n => [n.id, n]));
  const groups = new Map();
  for (const m of modeled || []) {
    const node = byId.get(m.id);
    const entry = {
      id: m.id,
      name: m.name,
      model_name: m.model_name,
      path: m.path,
      title: (node && node.title) || m.title || m.name,
      // /nodes sabe si el modelo carga; /explorer solo conoce la guardia de ruta.
      estado: m.estado !== 'ok' ? m.estado : ((node && node.estado) || 'ok'),
      causa: (node && node.causa) || null,
    };
    if (!matches(query, entry.id, entry.title, entry.path, entry.model_name)) continue;
    if (!groups.has(entry.model_name)) groups.set(entry.model_name, []);
    groups.get(entry.model_name).push(entry);
  }
  return Array.from(groups.keys()).sort().map(model => ({
    model,
    entries: groups.get(model).sort((a, b) => String(a.title).localeCompare(String(b.title)) || a.id.localeCompare(b.id)),
  }));
}

/** Arbol de carpetas de los no modelados: carpetas antes que archivos, ambos por nombre. */
export function buildTree(unmodeled = [], query = '') {
  const root = {name: '', path: '', folders: new Map(), files: []};
  for (const item of unmodeled || []) {
    if (!matches(query, item.path)) continue;
    const parts = String(item.path).split('/');
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const path = parts.slice(0, i + 1).join('/');
      if (!node.folders.has(parts[i])) node.folders.set(parts[i], {name: parts[i], path, folders: new Map(), files: []});
      node = node.folders.get(parts[i]);
    }
    node.files.push({name: parts[parts.length - 1], path: item.path});
  }
  const finish = n => ({
    name: n.name,
    path: n.path,
    folders: Array.from(n.folders.values()).sort((a, b) => a.name.localeCompare(b.name)).map(finish),
    files: n.files.sort((a, b) => a.name.localeCompare(b.name)),
  });
  return finish(root);
}

export function countFiles(tree) {
  return tree.files.length + tree.folders.reduce((acc, f) => acc + countFiles(f), 0);
}

export const REASON_LABELS = {
  ruta_absoluta: 'ruta absoluta',
  'contiene_..': 'contiene ..',
  symlink: 'es un enlace simbólico',
  fuera_del_repo: 'fuera del repositorio',
  vacia: 'vacía',
};

export function describeInvalidRoots(roots_invalid = []) {
  return (roots_invalid || []).map(r => `${r.entry} (${REASON_LABELS[r.reason] || r.reason})`);
}
