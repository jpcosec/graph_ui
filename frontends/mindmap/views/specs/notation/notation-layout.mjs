// Layout del grafo de notación con ELK (layered, jerárquico): tamaños desde el texto, contenedores
// con su cabecera reservada, hijos sueltos en una grilla 2D, aristas ortogonales ruteadas por ELK con
// sus rótulos colocados por ELK. Lógica pura: el texto se mide con una función inyectada (canvas en
// el navegador, una aproximación en los tests) y ELK se pasa como argumento.
//
// Issues que resuelve (desk/drawer/issues): G2 cabecera de contenedor tapada, G3 hijos en una fila,
// G4 cajas que no crecen con el texto, G5 aristas en un carril con rótulos encimados, G6 rótulo de
// la decisión fuera del rombo y bucles sobre el flujo.

import {compartmentLine} from './notation.mjs';
import {shapeBox} from './notation-style.mjs';

// Todo el texto del diagrama a 12.5 px: con el zoom de «Ver todo» por encima de 0.8 se lee a ≥10 px.
export const FONT = {label: 12.5, small: 12.5, edge: 12.5, line: 1.3};
export const MIN_TEXT_PX = 10;
export const POINT_SHAPES = ['filled-circle', 'bullseye'];
const POINT_SIZES = {'filled-circle': [22, 22], bullseye: [26, 26]};
const FIXED = {'stick-figure': [90, 86]};
const MIN = {box: [120, 40], 'rounded-box': [120, 40], 'class-box': [150, 40], 'lifeline': [150, 52], 'boundary-lifeline': [150, 52]};
const PAD_X = 14, PAD_Y = 10, CONTAINER_SIDE = 10, ICON_SPACE = 20;
export const DIAMOND_RATIO = 2;

// Ancho aproximado para los tests y para cuando no hay canvas: ~0.55 em por carácter.
export const approximateMeasure = (text, size) => (text || '').length * size * 0.56;

const lineHeight = size => Math.ceil(size * FONT.line);
const KEYWORD = lineHeight(FONT.small), COMPARTMENT_ROW = lineHeight(FONT.small);

// Corte en palabras para que una línea no pase de maxWidth; una palabra más larga se parte.
export function wrapText(text, maxWidth, size, measure = approximateMeasure) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  const push = word => {
    let rest = word;
    while (measure(rest, size) > maxWidth && rest.length > 1) {
      let cut = rest.length - 1;
      while (cut > 1 && measure(rest.slice(0, cut), size) > maxWidth) cut--;
      lines.push(rest.slice(0, cut));
      rest = rest.slice(cut);
    }
    return rest;
  };
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (measure(candidate, size) <= maxWidth) { current = candidate; continue; }
    if (current) lines.push(current);
    current = push(word);
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

function block(text, maxWidth, size, measure) {
  const lines = wrapText(text, maxWidth, size, measure);
  return {lines, width: Math.max(...lines.map(l => measure(l, size))), height: lines.length * lineHeight(size)};
}

// Tamaño de un glifo desde su texto (G4). Un rombo (decisión) contiene su rótulo (G6): para un
// rectángulo w×h dentro de un rombo de proporción r, el ancho es w + r·h.
export function sizeGlyph(glyph, {measure = approximateMeasure, wrapWidth = 200} = {}) {
  const shape = glyph.shape;
  if (POINT_SIZES[shape]) {
    const [w, h] = POINT_SIZES[shape];
    const label = glyph.label ? block(glyph.label, 160, FONT.small, measure) : null;
    return {width: w, height: h, lines: [], outside: label};
  }
  if (FIXED[shape]) {
    const label = block(glyph.label, 140, FONT.small, measure);
    return {width: Math.max(FIXED[shape][0], label.width + 8), height: FIXED[shape][1], lines: label.lines};
  }
  if (shape === 'diamond') {
    const label = block(glyph.label, Math.min(wrapWidth, 150), FONT.small, measure);
    const width = Math.max(46, Math.ceil(label.width + DIAMOND_RATIO * label.height + 18));
    return {width, height: Math.max(46, Math.ceil(width / DIAMOND_RATIO)), lines: label.lines};
  }
  const label = block(glyph.label, wrapWidth, FONT.label, measure);
  const keyword = glyph.keyword ? KEYWORD : 0;
  const rows = (glyph.compartments || []).filter(c => c.items && c.items.length);
  const itemWidth = Math.max(0, ...rows.flatMap(c => c.items.map(i => measure(compartmentLine(i), FONT.small))));
  const body = rows.reduce((h, c) => h + 8 + c.items.length * COMPARTMENT_ROW, 0);
  const [minW, minH] = MIN[shape] || [120, 40];
  // Un ícono va antes del rótulo; en las formas de contorno, el texto va en su área interior y la caja
  // crece hasta que quepa (shapeBox).
  const icon = glyph.style?.icon ? ICON_SPACE : 0;
  const contentW = Math.max(label.width + icon, itemWidth, glyph.keyword ? measure(glyph.keyword, FONT.small) : 0) + PAD_X * 2;
  const contentH = keyword + label.height + PAD_Y * 2 + body;
  const [boxW, boxH] = shapeBox(shape, contentW, contentH);
  const width = Math.ceil(Math.max(minW, boxW));
  const height = Math.ceil(Math.max(minH, boxH));
  return {width, height, lines: label.lines};
}

// Cabecera de un contenedor: su rótulo (con keyword) envuelto; los hijos empiezan debajo (G2).
export function containerHeader(glyph, {measure = approximateMeasure, wrapWidth = 260} = {}) {
  const label = block(glyph.label, wrapWidth, FONT.label, measure);
  return {lines: label.lines, width: Math.ceil(label.width + PAD_X * 2), height: Math.ceil((glyph.keyword ? KEYWORD : 0) + label.height + 12)};
}

// Rótulo de arista envuelto en un ancho fijo: ELK le reserva su caja (G5).
export function edgeLabelBox(text, {measure = approximateMeasure, wrapWidth = 130} = {}) {
  if (!text) return null;
  const label = block(text, wrapWidth, FONT.edge, measure);
  return {lines: label.lines, width: Math.ceil(label.width + 8), height: Math.ceil(label.height + 2)};
}

// Candidatos de layout: en la dirección de la notación, varía el ancho de corte de los rótulos y
// cómo ELK reparte capas y rótulos. La vista se queda con el que mejor cabe en su lienzo.
const BASE = {'elk.spacing.nodeNode': '22', 'elk.layered.spacing.nodeNodeBetweenLayers': '34', 'elk.spacing.edgeLabel': '4',
  'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX'};
// Con el orden del spec, el flujo principal baja en ese orden y solo las aristas que vuelven a un paso
// anterior son bucles, ruteados al costado (G6). Se prefiere mientras el texto se lea.
const MODEL_ORDER = {'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES', 'elk.layered.cycleBreaking.strategy': 'MODEL_ORDER'};
const TIGHT = {'elk.spacing.nodeNode': '16', 'elk.layered.spacing.nodeNodeBetweenLayers': '28'};
const VARIANTS = [{}, TIGHT, {...TIGHT, 'elk.layered.layering.strategy': 'LONGEST_PATH'},
  {...TIGHT, 'elk.layered.wrapping.strategy': 'MULTI_EDGE', 'elk.aspectRatio': '1.6'}];
export const LAYOUT_CANDIDATES = [130, 170, 240].flatMap(wrapWidth => VARIANTS.flatMap(options => [
  {wrapWidth, ordered: true, options: {...options, ...MODEL_ORDER}},
  {wrapWidth, ordered: false, options},
]));

const ELK_DIRECTION = {TB: 'DOWN', BT: 'UP', LR: 'RIGHT', RL: 'LEFT'};
export const GRID_MIN = 4;

// Grilla para los hijos de un contenedor que no se conectan entre sí (G3): aristas invisibles que
// apilan filas de `cols` hijos. Solo cuentan para el layout; no se dibujan.
export function gridEdges(scene, aspect = 1) {
  const byId = new Map(scene.nodes.map(n => [n.id, n]));
  const kids = new Map();
  for (const n of scene.nodes) if (n.parent) kids.set(n.parent, [...(kids.get(n.parent) || []), n]);
  const edges = [];
  for (const [parent, children] of kids) {
    const linked = id => scene.edges.some(e => (e.source === id && byId.get(e.target)?.parent === parent)
      || (e.target === id && byId.get(e.source)?.parent === parent));
    const free = children.filter(c => !linked(c.id));
    if (free.length < GRID_MIN) continue;
    const cols = Math.max(2, Math.ceil(Math.sqrt(free.length * aspect)));
    for (let i = 0; i + cols < free.length; i++) edges.push({id: `grid:${free[i].id}>${free[i + cols].id}`, sources: [free[i].id], targets: [free[i + cols].id]});
  }
  return edges;
}

const VERTICES = ['N', 'E', 'S', 'W'];
const VERTICAL = new Set(['TB', 'BT']);
const vertex = (side, {width, height}) => ({N: {x: width / 2, y: 0}, S: {x: width / 2, y: height}, E: {x: width, y: height / 2}, W: {x: 0, y: height / 2}})[side];
export const headerId = id => `${id}#title`;
// Vértice de entrada y de salida de cada arista de un rombo según la dirección: se entra por el
// vértice que mira al flujo y las ramas salen por los otros tres, en orden.
const FLOW_SIDES = {TB: ['N', ['S', 'E', 'W']], BT: ['S', ['N', 'E', 'W']], LR: ['W', ['E', 'S', 'N']], RL: ['E', ['W', 'S', 'N']]};
export function diamondPorts(scene, direction = 'TB') {
  const [inSide, outSides] = FLOW_SIDES[direction] || FLOW_SIDES.TB;
  const diamond = new Set(scene.nodes.filter(n => n.glyph.shape === 'diamond').map(n => n.id));
  const ports = new Map(), used = new Map();
  for (const e of scene.edges) {
    if (diamond.has(e.target)) ports.set(`${e.id}>target`, `${e.target}#${inSide}`);
    if (diamond.has(e.source)) {
      const k = used.get(e.source) || 0;
      used.set(e.source, k + 1);
      ports.set(`${e.id}>source`, `${e.source}#${outSides[Math.min(k, outSides.length - 1)]}`);
    }
  }
  return ports;
}

// Grafo ELK de una escena (buildScene) con los tamaños medidos de un candidato.
export function elkGraph(scene, {measure = approximateMeasure, wrapWidth = 200, options = {}} = {}) {
  const kids = new Map();
  for (const n of scene.nodes) kids.set(n.parent || '', [...(kids.get(n.parent || '') || []), n]);
  const sizes = new Map();
  const direction = scene.direction || 'TB';
  const ports = diamondPorts(scene, direction);
  const titleEdges = [];
  const make = n => {
    const children = kids.get(n.id) || [];
    if (n.container && children.length) {
      // R5: el título es un nodo hijo en la primera capa del contenedor: ELK rutea las aristas
      // alrededor de él como de cualquier nodo, así que ninguna cruza el encabezado.
      const head = containerHeader(n.glyph, {measure, wrapWidth: wrapWidth + 60});
      const inner = {'elk.layered.spacing.nodeNodeBetweenLayers': '10', 'elk.spacing.nodeNode': '12'};
      if (!VERTICAL.has(direction)) {
        // En horizontal las aristas entran por los costados: el título va en el padding de arriba.
        sizes.set(n.id, {header: {...head, x: CONTAINER_SIDE, y: 0}});
        return {id: n.id, children: children.map(make), layoutOptions: {...inner,
          'elk.padding': `[top=${head.height + 6},left=${CONTAINER_SIDE},bottom=${CONTAINER_SIDE},right=${CONTAINER_SIDE}]`,
          'elk.nodeSize.minimum': `(${head.width + CONTAINER_SIDE * 2},${head.height + 20})`, 'elk.nodeSize.constraints': 'MINIMUM_SIZE'}};
      }
      sizes.set(n.id, {header: head});
      const title = {id: headerId(n.id), width: head.width, height: head.height,
        layoutOptions: {'elk.layered.layering.layerConstraint': 'FIRST'}};
      // El título va solo en su fila: aristas invisibles del título a cada hijo los bajan a las siguientes.
      for (const child of children) titleEdges.push({id: `title:${n.id}>${child.id}`, sources: [title.id], targets: [child.id]});
      return {id: n.id, children: [title, ...children.map(make)], layoutOptions: {...inner,
        'elk.padding': `[top=${CONTAINER_SIDE},left=${CONTAINER_SIDE},bottom=${CONTAINER_SIDE},right=${CONTAINER_SIDE}]`}};
    }
    const size = sizeGlyph(n.glyph, {measure, wrapWidth});
    sizes.set(n.id, size);
    const node = {id: n.id, width: size.width, height: size.height, layoutOptions: {}};
    // R1: el inicial abre el flujo (primera capa) y el final lo cierra (última).
    if (n.glyph.shape === 'filled-circle') node.layoutOptions['elk.layered.layering.layerConstraint'] = 'FIRST';
    if (n.glyph.shape === 'bullseye') node.layoutOptions['elk.layered.layering.layerConstraint'] = 'LAST';
    if (size.outside) {
      node.labels = [{id: `${n.id}#label`, text: n.glyph.label, width: Math.ceil(size.outside.width + 4), height: size.outside.height}];
      node.layoutOptions['elk.nodeLabels.placement'] = 'OUTSIDE V_BOTTOM H_CENTER';
    }
    if (n.glyph.shape === 'diamond') {
      // R2: las aristas de una decisión llegan y salen por los vértices del rombo, no por su caja.
      node.ports = VERTICES.map(side => ({id: `${n.id}#${side}`, width: 0, height: 0, ...vertex(side, size)}));
      node.layoutOptions['elk.portConstraints'] = 'FIXED_POS';
    }
    return node;
  };
  const labels = new Map();
  const edges = scene.edges.map(e => {
    const box = edgeLabelBox(e.label, {measure});
    if (box) labels.set(e.id, box);
    // Los rótulos los coloca placeLabels junto a su tramo (R3); ELK solo les reserva espacio.
    return {id: e.id, sources: [ports.get(`${e.id}>source`) || e.source], targets: [ports.get(`${e.id}>target`) || e.target],
      labels: box ? [{id: `${e.id}#label`, text: e.label, width: box.width, height: box.height}] : []};
  });
  return {
    graph: {id: 'root', layoutOptions: {'elk.algorithm': 'layered', 'elk.direction': ELK_DIRECTION[scene.direction] || 'DOWN',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN', 'elk.edgeRouting': 'ORTHOGONAL', 'elk.json.edgeCoords': 'ROOT', 'elk.json.shapeCoords': 'PARENT',
      ...BASE, ...options}, children: (kids.get('') || []).map(make), edges: [...edges, ...gridEdges(scene), ...titleEdges]},
    sizes, labels,
  };
}

// Resultado de ELK -> nodos de React Flow (posición relativa a su padre), aristas con su
// recorrido y su rótulo en coordenadas del lienzo, y el tamaño total.
export function fromElk(result, scene, {sizes, labels}) {
  const byId = new Map(scene.nodes.map(n => [n.id, n]));
  const nodes = [];
  const walk = (elkNode, depth) => {
    for (const child of elkNode.children || []) {
      const n = byId.get(child.id);
      if (!n) continue;
      const size = sizes.get(child.id) || {};
      const title = (child.children || []).find(c => c.id === headerId(child.id));
      if (title && size.header) size.header = {...size.header, x: title.x, y: title.y, width: title.width};
      const outside = child.labels?.[0];
      nodes.push({id: child.id, parent: n.parent, depth, x: child.x, y: child.y, width: child.width, height: child.height,
        container: Boolean(n.container && child.children?.length), glyph: n.glyph, lines: size.lines || size.header?.lines || [],
        header: size.header || null, outside: outside && size.outside ? {x: outside.x, y: outside.y, width: outside.width, height: outside.height, lines: size.outside.lines} : null});
      walk(child, depth + 1);
    }
  };
  walk(result, 0);
  const sceneEdges = new Map(scene.edges.map(e => [e.id, e]));
  const edges = (result.edges || []).filter(e => sceneEdges.has(e.id)).map(e => ({...sceneEdges.get(e.id), points: routeOf(e.sections || []),
    labelSize: labels.get(e.id) || null, labelBox: null}));
  const layout = {nodes, edges, width: result.width, height: result.height};
  placeLabels(layout);
  return layout;
}

// Secciones de una arista en el orden en que se conectan (incoming/outgoingSections), no en el del array.
export function routeOf(sections) {
  if (sections.length <= 1) return sections.flatMap(s => [s.startPoint, ...(s.bendPoints || []), s.endPoint]);
  const byId = new Map(sections.map(s => [s.id, s]));
  let current = sections.find(s => !(s.incomingSections || []).length) || sections[0];
  const points = [], seen = new Set();
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    points.push(...(points.length ? [] : [current.startPoint]), ...(current.bendPoints || []), current.endPoint);
    current = byId.get((current.outgoingSections || [])[0]);
  }
  return points;
}

// ---- geometría en coordenadas del lienzo ----
export function absoluteBoxes(layout) {
  const byId = new Map(layout.nodes.map(n => [n.id, n]));
  const abs = new Map();
  const place = n => {
    if (abs.has(n.id)) return abs.get(n.id);
    const parent = n.parent && byId.get(n.parent) ? place(byId.get(n.parent)) : {x: 0, y: 0};
    const box = {x: parent.x + n.x, y: parent.y + n.y, width: n.width, height: n.height};
    abs.set(n.id, box);
    return box;
  };
  layout.nodes.forEach(place);
  return abs;
}
const intersects = (a, b, m = 0) => a.x < b.x + b.width + m && b.x < a.x + a.width + m && a.y < b.y + b.height + m && b.y < a.y + a.height + m;
const segBox = (a, b) => ({x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(a.x - b.x), height: Math.abs(a.y - b.y)});
function boxToSegment(box, a, b) {
  const cx = Math.max(box.x, Math.min((a.x + b.x) / 2, box.x + box.width)), cy = Math.max(box.y, Math.min((a.y + b.y) / 2, box.y + box.height));
  const dx = b.x - a.x, dy = b.y - a.y, l = dx * dx + dy * dy;
  const t = l ? Math.max(0, Math.min(1, ((cx - a.x) * dx + (cy - a.y) * dy) / l)) : 0;
  const px = a.x + t * dx, py = a.y + t * dy;
  const qx = Math.max(box.x, Math.min(px, box.x + box.width)), qy = Math.max(box.y, Math.min(py, box.y + box.height));
  return Math.hypot(px - qx, py - qy);
}
export const LABEL_GAP = 4, LABEL_MAX_DISTANCE = 20;

// R3: cada rótulo va pegado a un tramo de su arista (al costado de un tramo vertical, encima o debajo de
// uno horizontal) sin pisar nodos, encabezados ni otros rótulos. R6: además tiene que estar al menos
// LABEL_MARGIN px más cerca de su arista que de cualquier otra, para que no se lea como de la vecina; y
// una guarda (rama que sale de un rombo) va en el primer tramo, justo a la salida del vértice.
export const LABEL_MARGIN = 8;
const segmentsOf = points => points.slice(1).map((b, i) => [points[i], b]);
const distanceTo = (box, segments) => Math.min(Infinity, ...segments.map(([a, b]) => boxToSegment(box, a, b)));

function labelCandidates(segment, {width, height}, offsets) {
  const [a, b] = segment;
  const vertical = Math.abs(a.x - b.x) < 0.5, length = Math.hypot(b.x - a.x, b.y - a.y);
  return offsets(length).flatMap(t => {
    const px = a.x + (b.x - a.x) * t, py = a.y + (b.y - a.y) * t;
    return vertical ? [{x: px + LABEL_GAP, y: py - height / 2}, {x: px - LABEL_GAP - width, y: py - height / 2}]
      : [{x: px - width / 2, y: py - LABEL_GAP - height}, {x: px - width / 2, y: py + LABEL_GAP}];
  }).map(c => ({...c, width, height}));
}

export function placeLabels(layout) {
  const abs = absoluteBoxes(layout);
  const obstacles = layout.nodes.filter(n => !n.container).map(n => abs.get(n.id));
  for (const n of layout.nodes) if (n.container && n.header) { const c = abs.get(n.id); obstacles.push({x: c.x + n.header.x, y: c.y + n.header.y, width: n.header.width, height: n.header.height}); }
  const diamonds = new Set(layout.nodes.filter(n => n.glyph?.shape === 'diamond').map(n => n.id));
  const segs = new Map(layout.edges.map(e => [e.id, segmentsOf(e.points)]));
  const placed = [];
  const free = box => !obstacles.some(o => intersects(box, o, 1)) && !placed.some(o => intersects(box, o, 2));
  // Guardas primero: son las que más se confunden con la rama vecina.
  const ordered = [...layout.edges].sort((a, b) => diamonds.has(b.source) - diamonds.has(a.source));
  for (const e of ordered) {
    if (!e.labelSize || e.points.length < 2) continue;
    const own = segs.get(e.id);
    const others = layout.edges.filter(o => o.id !== e.id).flatMap(o => segs.get(o.id));
    const clear = box => distanceTo(box, others) >= distanceTo(box, own) + LABEL_MARGIN;
    const guard = diamonds.has(e.source);
    const byLength = [...own].sort(([a1, b1], [a2, b2]) => Math.hypot(b2.x - a2.x, b2.y - a2.y) - Math.hypot(b1.x - a1.x, b1.y - a1.y));
    const near = length => [8, 16, 28].filter(d => d < length).map(d => d / length).concat(length > 0 ? [0.5] : []);
    const spread = () => [0.5, 0.3, 0.7, 0.15, 0.85];
    const tries = [
      ...(guard ? labelCandidates(own[0], e.labelSize, near) : []),
      ...byLength.flatMap(seg => labelCandidates(seg, e.labelSize, spread)),
    ];
    let chosen = tries.find(c => free(c) && clear(c)) || tries.find(free);
    // Sin hueco libre: en el centro del tramo más largo (pegado igual a su arista).
    if (!chosen) { const [a, b] = byLength[0]; chosen = {x: (a.x + b.x) / 2 + LABEL_GAP, y: (a.y + b.y) / 2 - e.labelSize.height / 2, ...e.labelSize}; }
    placed.push(chosen);
    e.labelBox = {x: chosen.x, y: chosen.y, width: chosen.width, height: chosen.height, lines: e.labelSize.lines};
  }
}

// Problemas que hacen descartar un candidato: aristas sin ruta ortogonal o con un extremo al aire
// (R2), rótulos lejos de su arista (R3) y aristas que cruzan el encabezado de un contenedor (R5).
export function layoutIssues(layout) {
  const abs = absoluteBoxes(layout);
  const heads = layout.nodes.filter(n => n.container && n.header).map(n => { const c = abs.get(n.id);
    return {id: n.id, box: {x: c.x + n.header.x, y: c.y + n.header.y, width: n.header.width, height: n.header.height}}; });
  const issues = {broken: 0, farLabels: 0, headerCrossings: 0, ambiguousGuards: 0};
  const diamonds = new Set(layout.nodes.filter(n => n.glyph?.shape === 'diamond').map(n => n.id));
  const segs = new Map(layout.edges.map(e => [e.id, segmentsOf(e.points)]));
  const touches = (p, box) => box && p.x >= box.x - 1.5 && p.x <= box.x + box.width + 1.5 && p.y >= box.y - 1.5 && p.y <= box.y + box.height + 1.5
    && Math.min(Math.abs(p.x - box.x), Math.abs(p.x - box.x - box.width), Math.abs(p.y - box.y), Math.abs(p.y - box.y - box.height)) <= 1.5;
  for (const e of layout.edges) {
    const pts = e.points;
    const diagonal = pts.some((p, i) => i && Math.abs(p.x - pts[i - 1].x) > 0.5 && Math.abs(p.y - pts[i - 1].y) > 0.5);
    if (pts.length < 2 || diagonal || !touches(pts[0], abs.get(e.source)) || !touches(pts[pts.length - 1], abs.get(e.target))) issues.broken++;
    if (e.labelBox && Math.min(...pts.slice(1).map((p, i) => boxToSegment(e.labelBox, pts[i], p))) > LABEL_MAX_DISTANCE) issues.farLabels++;
    if (e.labelBox && diamonds.has(e.source)) {
      const others = layout.edges.filter(o => o.id !== e.id).flatMap(o => segs.get(o.id));
      if (distanceTo(e.labelBox, others) < distanceTo(e.labelBox, segs.get(e.id)) + LABEL_MARGIN) issues.ambiguousGuards++;
    }
    for (let i = 1; i < pts.length; i++) {
      const seg = segBox(pts[i - 1], pts[i]);
      if (heads.some(h => intersects(seg, {x: h.box.x + 1, y: h.box.y + 1, width: h.box.width - 2, height: h.box.height - 2}))) { issues.headerCrossings++; break; }
    }
  }
  issues.total = issues.broken + issues.farLabels + issues.headerCrossings + issues.ambiguousGuards;
  return issues;
}

// Zoom con el que el diagrama entero cabe en el lienzo (con un margen relativo).
export const FIT_PADDING = 0.03;
export const fitZoom = (layout, canvas, padding = FIT_PADDING) => Math.min(canvas.width / layout.width, canvas.height / layout.height) / (1 + padding);

// Corre los candidatos con ELK y devuelve el layout que mejor cabe en el lienzo.
// Se prueba primero la dirección de la notación; si así el texto no llega a MIN_TEXT_PX, también la
// perpendicular, y gana la que mejor cabe.
const PERPENDICULAR = {TB: 'LR', BT: 'RL', LR: 'TB', RL: 'BT'};
export const legibleZoom = MIN_TEXT_PX / FONT.label;
export async function bestLayout(elk, scene, {measure = approximateMeasure, canvas = {width: 1200, height: 900}, candidates = LAYOUT_CANDIDATES} = {}) {
  let best = await bestIn(elk, scene, {measure, canvas, candidates});
  if (best && (best.zoom < legibleZoom || best.issues.total)) {
    const turned = await bestIn(elk, {...scene, direction: PERPENDICULAR[scene.direction] || 'LR'}, {measure, canvas, candidates});
    if (turned && (turned.issues.total < best.issues.total || (turned.issues.total === best.issues.total && turned.zoom > best.zoom))) best = turned;
  }
  return best;
}

async function bestIn(elk, scene, {measure, canvas, candidates}) {
  let best = null, bestOrdered = null;
  for (const candidate of candidates) {
    const built = elkGraph(scene, {measure, ...candidate});
    let result;
    try { result = await elk.layout(built.graph); } catch { continue; }
    const layout = fromElk(result, scene, built);
    layout.zoom = fitZoom(layout, canvas);
    layout.candidate = candidate;
    layout.direction = scene.direction;
    layout.issues = layoutIssues(layout);
    // Menos problemas gana; a igualdad, el que mejor cabe.
    const better = (a, b) => !b || a.issues.total < b.issues.total || (a.issues.total === b.issues.total && a.zoom > b.zoom + 1e-6);
    if (better(layout, best)) best = layout;
    if (candidate.ordered && better(layout, bestOrdered)) bestOrdered = layout;
  }
  return bestOrdered && bestOrdered.zoom >= legibleZoom && bestOrdered.issues.total <= best.issues.total ? bestOrdered : best;
}

// Recorrido ortogonal como path SVG.
export const pathOf = points => points.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');
