// Layout del grafo de notación con ELK (layered, jerárquico): tamaños desde el texto, contenedores
// con su cabecera reservada, hijos sueltos en una grilla 2D, aristas ortogonales ruteadas por ELK con
// sus rótulos colocados por ELK. Lógica pura: el texto se mide con una función inyectada (canvas en
// el navegador, una aproximación en los tests) y ELK se pasa como argumento.
//
// Issues que resuelve (desk/drawer/issues): G2 cabecera de contenedor tapada, G3 hijos en una fila,
// G4 cajas que no crecen con el texto, G5 aristas en un carril con rótulos encimados, G6 rótulo de
// la decisión fuera del rombo y bucles sobre el flujo.

import {compartmentLine} from './notation.mjs';

// Todo el texto del diagrama a 12.5 px: con el zoom de «Ver todo» por encima de 0.8 se lee a ≥10 px.
export const FONT = {label: 12.5, small: 12.5, edge: 12.5, line: 1.3};
export const MIN_TEXT_PX = 10;
export const POINT_SHAPES = ['filled-circle', 'bullseye'];
const POINT_SIZES = {'filled-circle': [22, 22], bullseye: [26, 26]};
const FIXED = {'stick-figure': [90, 86]};
const MIN = {box: [120, 40], 'rounded-box': [120, 40], 'class-box': [150, 40], 'lifeline': [150, 52], 'boundary-lifeline': [150, 52]};
const PAD_X = 14, PAD_Y = 10, CONTAINER_SIDE = 10;
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
  const width = Math.ceil(Math.max(minW, Math.max(label.width, itemWidth, glyph.keyword ? measure(glyph.keyword, FONT.small) : 0) + PAD_X * 2));
  const height = Math.ceil(Math.max(minH, keyword + label.height + PAD_Y * 2 + body));
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
const TIGHT = {'elk.edgeLabels.inline': 'true', 'elk.spacing.nodeNode': '16', 'elk.layered.spacing.nodeNodeBetweenLayers': '28'};
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

// Grafo ELK de una escena (buildScene) con los tamaños medidos de un candidato.
export function elkGraph(scene, {measure = approximateMeasure, wrapWidth = 200, options = {}} = {}) {
  const kids = new Map();
  for (const n of scene.nodes) kids.set(n.parent || '', [...(kids.get(n.parent || '') || []), n]);
  const sizes = new Map();
  const make = n => {
    const children = kids.get(n.id) || [];
    if (n.container && children.length) {
      const head = containerHeader(n.glyph, {measure, wrapWidth: wrapWidth + 60});
      sizes.set(n.id, {header: head});
      return {id: n.id, children: children.map(make), layoutOptions: {
        'elk.padding': `[top=${head.height + 6},left=${CONTAINER_SIDE},bottom=${CONTAINER_SIDE},right=${CONTAINER_SIDE}]`,
        'elk.nodeSize.minimum': `(${head.width + CONTAINER_SIDE * 2},${head.height + 20})`, 'elk.nodeSize.constraints': 'MINIMUM_SIZE'}};
    }
    const size = sizeGlyph(n.glyph, {measure, wrapWidth});
    sizes.set(n.id, size);
    const node = {id: n.id, width: size.width, height: size.height};
    if (size.outside) {
      node.labels = [{id: `${n.id}#label`, text: n.glyph.label, width: Math.ceil(size.outside.width + 4), height: size.outside.height}];
      node.layoutOptions = {'elk.nodeLabels.placement': 'OUTSIDE V_BOTTOM H_CENTER'};
    }
    return node;
  };
  const labels = new Map();
  const edges = scene.edges.map(e => {
    const box = edgeLabelBox(e.label, {measure});
    if (box) labels.set(e.id, box);
    return {id: e.id, sources: [e.source], targets: [e.target], labels: box ? [{id: `${e.id}#label`, text: e.label, width: box.width, height: box.height}] : []};
  });
  return {
    graph: {id: 'root', layoutOptions: {'elk.algorithm': 'layered', 'elk.direction': ELK_DIRECTION[scene.direction] || 'DOWN',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN', 'elk.edgeRouting': 'ORTHOGONAL', 'elk.json.edgeCoords': 'ROOT', 'elk.json.shapeCoords': 'PARENT',
      ...BASE, ...options}, children: (kids.get('') || []).map(make), edges: [...edges, ...gridEdges(scene)]},
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
      const outside = child.labels?.[0];
      nodes.push({id: child.id, parent: n.parent, depth, x: child.x, y: child.y, width: child.width, height: child.height,
        container: Boolean(n.container && child.children?.length), glyph: n.glyph, lines: size.lines || size.header?.lines || [],
        header: size.header || null, outside: outside && size.outside ? {x: outside.x, y: outside.y, width: outside.width, height: outside.height, lines: size.outside.lines} : null});
      walk(child, depth + 1);
    }
  };
  walk(result, 0);
  const sceneEdges = new Map(scene.edges.map(e => [e.id, e]));
  const edges = (result.edges || []).filter(e => sceneEdges.has(e.id)).map(e => {
    const points = (e.sections || []).flatMap(s => [s.startPoint, ...(s.bendPoints || []), s.endPoint]);
    const label = e.labels?.[0];
    const box = labels.get(e.id);
    return {...sceneEdges.get(e.id), points,
      labelBox: label && box ? {x: label.x, y: label.y, width: label.width, height: label.height, lines: box.lines} : null};
  });
  return {nodes, edges, width: result.width, height: result.height};
}

// Zoom con el que el diagrama entero cabe en el lienzo (con un margen relativo).
export const fitZoom = (layout, canvas, padding = 0.05) => Math.min(canvas.width / layout.width, canvas.height / layout.height) / (1 + padding);

// Corre los candidatos con ELK y devuelve el layout que mejor cabe en el lienzo.
// Se prueba primero la dirección de la notación; si así el texto no llega a MIN_TEXT_PX, también la
// perpendicular, y gana la que mejor cabe.
const PERPENDICULAR = {TB: 'LR', BT: 'RL', LR: 'TB', RL: 'BT'};
export const legibleZoom = MIN_TEXT_PX / FONT.label;
export async function bestLayout(elk, scene, {measure = approximateMeasure, canvas = {width: 1200, height: 900}, candidates = LAYOUT_CANDIDATES} = {}) {
  let best = await bestIn(elk, scene, {measure, canvas, candidates});
  if (best && best.zoom < legibleZoom) {
    const turned = await bestIn(elk, {...scene, direction: PERPENDICULAR[scene.direction] || 'LR'}, {measure, canvas, candidates});
    if (turned && turned.zoom > best.zoom) best = turned;
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
    if (!best || layout.zoom > best.zoom + 1e-6) best = layout;
    if (candidate.ordered && (!bestOrdered || layout.zoom > bestOrdered.zoom + 1e-6)) bestOrdered = layout;
  }
  return bestOrdered && bestOrdered.zoom >= legibleZoom ? bestOrdered : best;
}

// Recorrido ortogonal como path SVG.
export const pathOf = points => points.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');
