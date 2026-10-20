// Lógica pura de la vista de notación: catálogo de specs y escena a dibujar.
// La notación NO se interpreta aquí: el JSON de GET /api/notation/view ya trae
// el glifo, la forma, los compartimentos y el `draw` de cada link, resueltos
// por spec2viz (resolve_view, spec2viz/docs/notation-contract.md). Este módulo
// solo traduce ese resultado a cajas y aristas, y avisa de lo que la vista
// todavía no sabe dibujar en vez de inventarlo.

// Layouts: grafo (y árbol, que dagre resuelve igual), carriles (secuencias)
// y grilla (matrices). Lo demás se dibuja como grafo/línea con aviso (§9).
export const SUPPORTED_LAYOUTS = ['graph', 'tree', 'lanes', 'grid'];
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

// Glifo de un nodo derivado (carril o nota): sin documento ni notación propia; su forma la fija §14.
const derivedGlyph = (doc, label, fn) => ({doc, element: '', label, glyph: '', shape: fn, function: fn,
  label_style: '', keyword: '', compartments: [], markers: [], refs: [], data: {}, style: {}, derived: true});

const terminal = end => (TERMINALS.includes(end) ? end : null);
// Trazo de un link (LinkDoc.line); el mismo en el diagrama y en la muestra de la leyenda.
export const dash = line => (line === 'dashed' ? '6 4' : line === 'dotted' ? '2 3' : undefined);

// Escena: nodos con su contenedor (draw: nest → el destino vive dentro del
// origen), aristas dibujables y avisos. Un link cuyo `draw` no está soportado
// se dibuja como línea y se avisa; nunca se descarta en silencio.
export function buildScene(view) {
  const notices = [];
  const layout = view.layout || {kind: 'graph'};
  if (!['graph', 'tree'].includes(layout.kind)) {
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
    edges.push({
      id: link.doc || `${link.source}->${link.target}#${index}`, source: link.source, target: link.target,
      relation: link.relation, link: link.link || '', label: link.label || '',
      // Rótulos de extremo (§8d): plantillas del LinkDoc ya resueltas por spec2viz
      // (p. ej. multiplicidades de una asociación UML).
      sourceLabel: link.source_label || '', targetLabel: link.target_label || '',
      dash: dash(link.line), sourceEnd: terminal(link.source_end), targetEnd: terminal(link.target_end), order: link.order || 0,
      color: link.color || null,
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
  // Activity (contrato §14): un carril por `data.partition`, en orden de aparición (el layout los
  // dibuja como columnas, notation-swimlanes.mjs), y una nota UML por `data.notes`, unida a su paso por
  // una línea punteada. Carriles y notas son nodos derivados del spec, no documentos: viven solo en la
  // escena; la nota va justo después de su paso (el orden del spec es el que ELK respeta).
  const ordered = [], lanes = [], laneOf = new Map();
  const specId = String(view.spec || '').replace(/^SpecDoc:/, '');
  for (const n of view.nodes || []) {
    const name = n.data?.partition;
    if (name && !laneOf.has(name)) {
      const id = `${specId}#partition:${lanes.length}`;
      laneOf.set(name, id);
      lanes.push({id, name: String(name), glyph: derivedGlyph(id, String(name), 'partition')});
    }
    ordered.push(n);
    const text = n.data?.notes;
    if (!text) continue;
    const id = `${n.doc}#note`;
    ordered.push(derivedGlyph(id, String(text), 'note'));
    if (parentOf.has(n.doc)) parentOf.set(id, parentOf.get(n.doc));
    if (name) laneOf.set(id, laneOf.get(name));
    edges.push({id: `${n.doc}#note-link`, source: n.doc, target: id, relation: 'note', label: '', sourceLabel: '', targetLabel: '',
      dash: dash('dotted'), sourceEnd: null, targetEnd: null, order: 0, color: null, note: true});
  }
  const containers = new Set(parentOf.values());
  const nodes = ordered.map(n => {
    const [width, height] = glyphSize(n);
    const lane = laneOf.get(n.doc) || laneOf.get(n.data?.partition) || null;
    return {id: n.doc, parent: parentOf.get(n.doc) || null, container: containers.has(n.doc), width, height, glyph: n, lane};
  });
  return {nodes, edges, notices, lanes, direction: layout.direction || 'TB', diagramType: view.diagram_type || ''};
}

// Profundidad de anidado: React Flow exige que un padre aparezca antes que sus hijos.
export function byDepth(nodes) {
  const byId = new Map(nodes.map(n => [n.id, n]));
  const depth = n => { let d = 0; for (let p = n.parent; p; p = byId.get(p)?.parent) d++; return d; };
  return [...nodes].sort((a, b) => depth(a) - depth(b));
}

// ---- Carriles (layout lanes, contrato §8c) ----
// Un carril por nodo, en el orden de `nodes`; el tiempo baja por `order`.
// Cada mensaje ocupa su fila, también una autollamada (bucle sobre su carril).
// R11: el hueco entre dos carriles vecinos sale de sus cabeceras y de los rótulos que lo cruzan (no
// un ancho fijo por carril), los rótulos largos se parten en líneas y cada fila crece con su rótulo;
// antes de un fragmento queda aire para su pestaña. La vista encuadra el diagrama entero («Ver todo»).
export const LANE = {width: 200, gap: 24, row: 34, top: 24, loop: 34};
// selfWrap: el rótulo de una autollamada va a la derecha de su bucle y no condiciona ningún hueco: más ancho, menos líneas.
// margin: holgura de un rótulo en su tramo (4 px por lado y los 14 de la punta, que el rótulo esquiva).
export const LANE_TEXT = {size: 12.5, line: 15, frameGap: 8, margin: 22, head: 14, framePad: 30, wraps: [120, 150, 170, 190, 240], selfWrap: 280, aspect: 1.42};
const approximate = (text, size) => (text || '').length * size * 0.56;
// Cabecera de participante: chrome = 10 + 10 de padding, 1,5 + 1,5 de borde y holgura; ícono de 15 + 5 de hueco;
// pad = 6 + 6 de padding, el borde y holgura; un renglón de 12,5 px × 1,3.
const LANE_HEAD = {chrome: 28, icon: 20, pad: 20, line: 17};

// Corte en palabras a un ancho; una palabra más ancha que el ancho va sola en su línea.
export function wrapLabel(text, width, measure = approximate, size = LANE_TEXT.size) {
  const lines = [];
  let line = '';
  for (const word of String(text || '').split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, size) > width) { lines.push(line); line = word; } else line = next;
  }
  if (line || !lines.length) lines.push(line);
  return lines;
}

// Escala de «Ver todo» de una secuencia en un lienzo: todos los participantes a lo ancho y, si el
// diagrama entero cabe legible (texto >= 10 px), también a lo alto; si no, queda en la escala legible
// y los mensajes se recorren con scroll vertical (los participantes quedan fijos arriba).
export const LANE_LEGIBLE = 10 / LANE_TEXT.size;
export function laneFitScale(scene, canvas) {
  const whole = Math.min(canvas.width / scene.width, canvas.height / scene.height) * 0.995;
  if (whole >= LANE_LEGIBLE) return Math.min(1.1, whole);
  // Con scroll vertical, la barra le quita ancho al lienzo.
  return Math.min(1.1, (canvas.width - 16) / scene.width, LANE_LEGIBLE);
}

// El ancho de corte de los rótulos: con un lienzo, el que da la escala más alta (a igualdad, el que
// muestra más sin scroll); sin lienzo, el que más se acerca a su proporción típica.
export function laneScene(view, {measure = approximate, headMeasure = measure, canvas = null} = {}) {
  let best = null;
  for (const wrap of LANE_TEXT.wraps) {
    const scene = laneSceneAt(view, wrap, measure, headMeasure);
    const score = canvas
      ? [laneFitScale(scene, canvas), Math.min(canvas.width / scene.width, canvas.height / scene.height)]
      : [-Math.max(scene.width / LANE_TEXT.aspect, scene.height), 0];
    if (!best || score[0] > best.score[0] + 1e-6 || (Math.abs(score[0] - best.score[0]) <= 1e-6 && score[1] > best.score[1])) best = {scene, score};
  }
  return best.scene;
}

function laneSceneAt(view, wrap, measure, headMeasure = measure) {
  const notices = [];
  const nodes = view.nodes || [];
  // La cabecera de un participante tiene el ancho de su nombre (no el mínimo de un lifeline); un actor, el de su figura.
  // R14: el nombre se mide en el peso del rótulo y cuenta el ícono; si no cabe en LANE.width se parte en
  // líneas, y una palabra más ancha hace crecer la cabecera en vez de cortarse.
  const heads = nodes.map(n => { const [width, height] = glyphSize(n);
    if (n.shape === 'stick-figure') return {width: Math.min(width, LANE.width - 16), height};
    const icon = n.style?.icon ? LANE_HEAD.icon : 0;
    const lines = wrapLabel(n.label || '', LANE.width - 16 - LANE_HEAD.chrome - icon, headMeasure);
    const text = Math.max(...lines.map(t => headMeasure(t, LANE_TEXT.size)));
    return {lines, width: Math.ceil(Math.max(72, text + icon + LANE_HEAD.chrome)),
      height: Math.max(height, LANE_HEAD.pad + (n.keyword ? LANE_HEAD.line : 0) + lines.length * LANE_HEAD.line)}; });
  const index = new Map(nodes.map((n, i) => [n.doc, i]));
  const head = Math.max(0, ...heads.map(h => h.height));
  const offDraws = new Set();
  const links = (view.links || []).map((link, i) => ({link, index: i}))
    .filter(({link}) => index.has(link.source) && index.has(link.target) && link.draw !== 'nest')
    .sort((a, b) => (a.link.order || 0) - (b.link.order || 0) || a.index - b.index);
  const textOf = ({link}, row) => `${link.order || row + 1}. ${link.label || ''}`;
  // Huecos entre carriles vecinos: las dos medias cabeceras y lo que pida cada rótulo que los cruza.
  const gaps = nodes.slice(1).map((_, i) => heads[i].width / 2 + heads[i + 1].width / 2 + LANE.gap);
  const spans = links.map((l, row) => ({a: Math.min(index.get(l.link.source), index.get(l.link.target)), b: Math.max(index.get(l.link.source), index.get(l.link.target)),
    need: Math.min(measure(textOf(l, row), LANE_TEXT.size), wrap) + LANE_TEXT.margin})).filter(s => s.b > s.a).sort((x, y) => (x.b - x.a) - (y.b - y.a));
  for (const {a, b, need} of spans) {
    const have = gaps.slice(a, b).reduce((sum, g) => sum + g, 0);
    if (have < need) for (let i = a; i < b; i++) gaps[i] += (need - have) / (b - a);
  }
  const xs = [];
  nodes.forEach((_, i) => xs.push(i ? xs[i - 1] + gaps[i - 1] : LANE.gap + heads[0].width / 2));
  const lanes = nodes.map((n, i) => ({id: n.doc, index: i, x: xs[i], width: heads[i].width, height: heads[i].height, lines: heads[i].lines, glyph: n}));
  const fragmentStart = new Set((view.fragments || []).map(f => Math.min(...(f.orders || [Infinity]))));
  let y = LANE.top + head, prevBottom = LANE.top + head;
  const messages = links.map((l, row) => {
    const {link, index: i} = l;
    if (link.draw !== 'line') offDraws.add(link.draw);
    const from = lanes[index.get(link.source)], to = lanes[index.get(link.target)];
    const self = from.id === to.id, order = link.order || row + 1;
    const lines = wrapLabel(textOf(l, row), self ? Math.max(wrap, LANE_TEXT.selfWrap) : Math.max(60, Math.abs(to.x - from.x) - LANE_TEXT.margin), measure);
    const above = self ? LANE.row / 3 : lines.length * LANE_TEXT.line + 6;
    // Un fragmento que empieza deja aire bajo todo lo anterior (otro marco incluido) para su pestaña.
    y = fragmentStart.has(order)
      ? Math.max(y + LANE.row, prevBottom + LANE_TEXT.frameGap + Math.max(LANE.row * .85, above + 22))
      : Math.max(y + LANE.row, prevBottom + above + 10);
    prevBottom = y + (self ? Math.max(LANE.row / 3, 4 + lines.length * LANE_TEXT.line) : 6);
    const textW = Math.max(...lines.map(t => measure(t, LANE_TEXT.size)));
    // El rótulo va centrado en el tramo libre de punta: se corre hacia el origen la mitad de la punta.
    const mid = (from.x + to.x) / 2 - Math.sign(to.x - from.x) * (link.target_end ? LANE_TEXT.head / 2 : 0);
    return {id: link.doc || `${link.source}->${link.target}#${i}`, order, row,
      from: from.id, to: to.id, x1: from.x, x2: to.x, y, self, lines, labelTop: self ? y - LANE.row / 3 : y - above,
      labelBottom: self ? prevBottom : y, labelLeft: self ? from.x : mid - textW / 2, labelRight: self ? from.x + LANE.loop + 6 + textW : mid + textW / 2,
      labelX: self ? from.x + LANE.loop + 6 : mid,
      relation: link.relation, link: link.link || '', label: link.label || '', dash: dash(link.line),
      sourceEnd: terminal(link.source_end), targetEnd: terminal(link.target_end)};
  });
  for (const draw of offDraws) notices.push(`El dibujo «${draw}» no es un mensaje de secuencia: esas relaciones se dibujan como mensajes.`);
  if ((view.skipped || []).length) notices.push(`spec2viz omitió ${view.skipped.length} elemento(s) sin glifo ni link en la notación.`);
  const frames = laneFrames(view.fragments, messages);
  const right = Math.max(...lanes.map(l => l.x + l.width / 2),
    ...messages.filter(m => m.self).map(m => m.x1 + LANE.loop + 6 + Math.max(...m.lines.map(t => measure(t, LANE_TEXT.size)))),
    ...frames.map(f => f.x + f.width));
  const bottom = Math.max(prevBottom, ...frames.map(f => f.y + f.height)) + LANE.row / 2;
  return {kind: 'lanes', lanes, messages, frames, notices, head, wrap,
    lifelineTop: LANE.top + head, height: bottom + LANE.top, width: right + LANE.gap};
}

// Marcos de fragmento (§11 `fragments`: rachas de mensajes con el mismo
// `group`): de la primera a la última fila de sus `orders`, y de la línea de
// vida más a la izquierda a la más a la derecha que tocan sus mensajes. Un
// fragmento sin mensajes en la vista no se dibuja.
export function laneFrames(fragments, messages) {
  return (fragments || []).flatMap((fragment, index) => {
    const orders = new Set(fragment.orders || []);
    const inside = messages.filter(m => orders.has(m.order));
    if (!inside.length) return [];
    // Lo que ocupa cada mensaje: su flecha y, si se conoce, la caja de su rótulo (varias líneas encima,
    // o el bucle y el rótulo de una autollamada a la derecha y hacia abajo).
    const xs = inside.flatMap(m => [...(m.self ? [m.x1, m.x1 + LANE.loop] : [m.x1, m.x2]), ...(m.labelLeft != null ? [m.labelLeft, m.labelRight] : [])]);
    const ys = inside.map(m => m.y);
    const top = Math.min(...inside.map(m => Math.min(m.y - LANE.row * .85, m.labelTop != null ? m.labelTop - 22 : Infinity)));
    const bottom = Math.max(...inside.map(m => Math.max(m.y + LANE.row * .12, m.labelBottom != null ? m.labelBottom + 6 : -Infinity)));
    const pad = LANE_TEXT.framePad;
    // `kind` es el operador UML (alt, loop, opt…) o `group` si no lo hay;
    // la pestaña lleva el operador y el `label` va como condición al lado.
    const kind = fragment.kind || 'group';
    return [{id: `${kind}-${index}`, kind, operator: kind === 'group' ? '' : kind, label: fragment.label || '',
      // Arriba deja sitio para la pestaña sin pisar el rótulo del primer mensaje;
      // abajo cierra justo bajo el último, para que dos marcos seguidos no se monten.
      orders: inside.map(m => m.order), x: Math.min(...xs) - pad, y: Math.min(top, Math.min(...ys) - LANE.row * .85),
      width: Math.max(...xs) - Math.min(...xs) + pad * 2, height: bottom - Math.min(top, Math.min(...ys) - LANE.row * .85)}];
  });
}

// ---- Grilla (layout grid + draw cell, contrato §8c) ----
// Columnas: stages por `data.order`, una grilla por `data.view`. Filas:
// components en el orden de `nodes`, con la jerarquía de `draw: nest`
// (preorden, el hijo indentado). Celda: link `cell` fila → columna.
export function gridScene(view) {
  const notices = [];
  const nodes = view.nodes || [];
  const stages = nodes.filter(n => n.collection === 'stages');
  const rowsIn = nodes.filter(n => n.collection === 'components');
  const isRow = new Set(rowsIn.map(n => n.doc)), isCol = new Set(stages.map(n => n.doc));
  const outside = nodes.filter(n => !isRow.has(n.doc) && !isCol.has(n.doc));
  if (outside.length) notices.push(`${outside.length} elemento(s) no son filas ni columnas de la grilla y no se dibujan.`);
  const views = new Map();
  for (const st of stages) {
    const key = st.data?.view ?? '';
    if (!views.has(key)) views.set(key, {view: key, label: st.data?.view_label || key || 'Vista', stages: []});
    views.get(key).stages.push(st);
  }
  const parent = new Map(), cells = new Map(), offDraws = new Set();
  let stray = 0;
  for (const link of view.links || []) {
    if (link.draw === 'nest' && isRow.has(link.source) && isRow.has(link.target) && link.source !== link.target) {
      if (!parent.has(link.target)) parent.set(link.target, link.source);
    } else if (link.draw === 'cell' && isRow.has(link.source) && isCol.has(link.target)) {
      const key = cellKey(link.source, link.target);
      cells.set(key, [...(cells.get(key) || []), link.label || '']);
    } else if (link.draw === 'cell') stray++;
    else offDraws.add(link.draw);
  }
  if (stray) notices.push(`${stray} celda(s) no unen una fila con una columna y no se dibujan.`);
  for (const draw of offDraws) notices.push(`El dibujo «${draw}» no tiene lugar en una grilla: esas relaciones no se dibujan.`);
  // Preorden por anidado; un ciclo deja a sus miembros como raíces.
  const children = new Map(), rows = [], placed = new Set();
  for (const n of rowsIn) { const p = parent.get(n.doc); if (p) children.set(p, [...(children.get(p) || []), n]); }
  const visit = (n, depth) => {
    if (placed.has(n.doc)) return;
    placed.add(n.doc); rows.push({id: n.doc, label: n.label || n.title || n.doc, depth, glyph: n});
    for (const c of children.get(n.doc) || []) visit(c, depth + 1);
  };
  for (const n of rowsIn) if (!parent.has(n.doc)) visit(n, 0);
  for (const n of rowsIn) visit(n, 0);
  const grids = [...views.values()].map(v => ({view: v.view, label: v.label,
    columns: v.stages.map((st, i) => ({id: st.doc, label: st.label || st.title || st.doc, order: st.data?.order ?? i, index: i}))
      .sort((a, b) => a.order - b.order || a.index - b.index)}));
  if ((view.skipped || []).length) notices.push(`spec2viz omitió ${view.skipped.length} elemento(s) sin glifo ni link en la notación.`);
  return {kind: 'grid', grids, rows, cells: Object.fromEntries(cells), notices};
}

export const cellKey = (row, col) => `${row}\u0000${col}`;

// Qué escena toca según el layout de la vista. Una grilla sin columnas no es
// dibujable como grilla: cae a grafo con aviso.
export function sceneFor(view, {measure, headMeasure, canvas} = {}) {
  const kind = view.layout?.kind;
  if (kind === 'lanes') return laneScene(view, {...(measure ? {measure} : {}), ...(headMeasure ? {headMeasure} : {}), canvas: canvas || null});
  if (kind === 'grid') {
    if ((view.nodes || []).some(n => n.collection === 'stages')) return gridScene(view);
    const scene = buildScene({...view, layout: {...view.layout, kind: 'graph'}});
    scene.notices.unshift('La grilla no tiene columnas (nodos con collection «stages»): se dibuja como grafo.');
    return {kind: 'graph', ...scene};
  }
  return {kind: 'graph', ...buildScene(view)};
}
