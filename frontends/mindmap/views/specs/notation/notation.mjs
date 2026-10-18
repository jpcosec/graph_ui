// Lógica pura de la vista de notación: catálogo de specs y escena a dibujar.
// La notación NO se interpreta aquí: el JSON de GET /api/notation/view ya trae
// el glifo, la forma, los compartimentos y el `draw` de cada link, resueltos
// por spec2viz (resolve_view, spec2viz/docs/notation-contract.md). Este módulo
// solo traduce ese resultado a cajas y aristas, y avisa de lo que la vista
// todavía no sabe dibujar en vez de inventarlo.

// Primera vista: layout de grafo (y árbol, que dagre resuelve igual) con
// líneas y anidado. El resto se dibuja como grafo/línea con aviso (contrato §9).
export const SUPPORTED_LAYOUTS = ['graph', 'tree'];
export const SUPPORTED_DRAWS = ['line', 'nest'];
export const TERMINALS = ['open-arrow', 'filled-arrow', 'hollow-triangle', 'filled-triangle',
  'hollow-diamond', 'filled-diamond', 'filled-circle', 'hollow-circle', 'bar', 'crowfoot'];
const UNCATEGORIZED = 'Sin categoría';

// Catálogo = los SpecDoc del store agrupados por `category` (contrato §2b): no
// hay otro documento de catálogo. Dentro de un grupo, por `nav` y luego título.
export function specCatalog(documents) {
  const specs = (documents || []).filter(d => d && d.model_name === 'SpecDoc').map(d => {
    const p = d.payload || {};
    return {id: d.id, title: p.title || d.id, nav: p.nav || p.title || d.id, summary: p.summary || '',
      category: p.category || UNCATEGORIZED, diagramType: p.diagram_type || '', notation: p.notation || ''};
  });
  const groups = new Map();
  for (const spec of specs) {
    if (!groups.has(spec.category)) groups.set(spec.category, []);
    groups.get(spec.category).push(spec);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a === UNCATEGORIZED) - (b === UNCATEGORIZED) || a.localeCompare(b))
    .map(([category, items]) => ({category, specs: items.sort((x, y) => x.nav.localeCompare(y.nav))}));
}

// Una línea de compartimento por item: los attributes/methods de un spec de
// clases son dicts con name y type/returns; lo demás se muestra tal cual.
export function compartmentLine(item) {
  if (item == null) return '';
  if (typeof item !== 'object') return String(item);
  if (!('name' in item)) return JSON.stringify(item);
  const params = Array.isArray(item.params) ? item.params.map(compartmentLine).join(', ') : null;
  const call = params != null || 'returns' in item ? `(${params || ''})` : '';
  const type = item.type || item.returns;
  return `${item.visibility || ''}${item.name}${call}${type ? ': ' + type : ''}`;
}

const SIZES = {
  'filled-circle': [22, 22], 'bullseye': [26, 26], 'diamond': [46, 46],
  'stick-figure': [90, 86], 'rounded-box': [170, 48], 'box': [170, 48],
  'lifeline': [150, 52], 'boundary-lifeline': [150, 52], 'boundary-box': [170, 56],
};
// Pseudoestados y conectores: la forma ES el glifo, el rótulo va aparte.
export const POINT_SHAPES = ['filled-circle', 'bullseye', 'diamond'];

export function glyphSize(node) {
  if (node.shape === 'class-box') {
    const rows = (node.compartments || []).filter(c => c.items && c.items.length);
    const head = 30 + (node.keyword ? 14 : 0);
    const body = rows.reduce((h, c) => h + 10 + c.items.length * 17, 0);
    const longest = Math.max(node.label.length, ...rows.flatMap(c => c.items.map(i => compartmentLine(i).length)));
    return [Math.min(Math.max(170, longest * 7 + 28), 340), head + body + 6];
  }
  const [w, h] = SIZES[node.shape] || [170, 48];
  if (POINT_SHAPES.includes(node.shape)) return [w, h];
  return [Math.min(Math.max(w, (node.label || '').length * 7.2 + 32), 320), h + (node.keyword ? 14 : 0)];
}

const terminal = end => (TERMINALS.includes(end) ? end : null);
const dash = line => (line === 'dashed' ? '6 4' : line === 'dotted' ? '2 3' : undefined);

// Escena: nodos con su contenedor (draw: nest → el destino vive dentro del
// origen), aristas dibujables y avisos. Un link cuyo `draw` no está soportado
// se dibuja como línea y se avisa; nunca se descarta en silencio.
export function buildScene(view) {
  const notices = [];
  const layout = view.layout || {kind: 'graph'};
  if (!SUPPORTED_LAYOUTS.includes(layout.kind)) {
    notices.push(`El layout «${layout.kind}» de la notación todavía no está soportado: se dibuja como grafo.`);
  }
  const ids = new Set((view.nodes || []).map(n => n.doc));
  const parentOf = new Map();
  const edges = [];
  const fallbackDraws = new Set();
  for (const [index, link] of (view.links || []).entries()) {
    if (!ids.has(link.source) || !ids.has(link.target)) continue;
    if (link.draw === 'nest' && link.source !== link.target && !parentOf.has(link.target)) {
      parentOf.set(link.target, link.source);
      continue;
    }
    if (!SUPPORTED_DRAWS.includes(link.draw)) fallbackDraws.add(link.draw);
    const ordered = layout.kind === 'lanes' && link.order;
    edges.push({
      id: link.doc || `${link.source}->${link.target}#${index}`, source: link.source, target: link.target,
      relation: link.relation, label: [ordered ? `${link.order}.` : '', link.label || ''].filter(Boolean).join(' '),
      dash: dash(link.line), sourceEnd: terminal(link.source_end), targetEnd: terminal(link.target_end), order: link.order || 0,
    });
  }
  for (const draw of fallbackDraws) notices.push(`El dibujo «${draw}» todavía no está soportado: esas relaciones se dibujan como líneas.`);
  if ((view.skipped || []).length) notices.push(`spec2viz omitió ${view.skipped.length} elemento(s) sin glifo ni link en la notación.`);
  // Un ciclo de anidado (A dentro de B dentro de A) no es dibujable: se corta.
  for (const [child] of parentOf) {
    const seen = new Set([child]);
    for (let p = parentOf.get(child); p; p = parentOf.get(p)) {
      if (seen.has(p)) { parentOf.delete(child); notices.push('Hay un ciclo de anidado: se ignora un nivel.'); break; }
      seen.add(p);
    }
  }
  const containers = new Set(parentOf.values());
  const nodes = (view.nodes || []).map(n => {
    const [width, height] = glyphSize(n);
    return {id: n.doc, parent: parentOf.get(n.doc) || null, container: containers.has(n.doc), width, height, glyph: n};
  });
  return {nodes, edges, notices, direction: layout.direction || 'TB'};
}

// Profundidad de anidado: React Flow exige que un padre aparezca antes que sus hijos.
export function byDepth(nodes) {
  const byId = new Map(nodes.map(n => [n.id, n]));
  const depth = n => { let d = 0; for (let p = n.parent; p; p = byId.get(p)?.parent) d++; return d; };
  return [...nodes].sort((a, b) => depth(a) - depth(b));
}
