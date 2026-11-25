// Exportador estático del modo lector: de un payload de GET /api/notation/view a un SVG autocontenido.
// No hay un segundo layout: sceneFor + bestLayout (grafo y carriles de activity), laneScene (secuencias) y
// gridScene (matrices) son los de la vista, y el dibujo de secuencias y matrices sale de notation-draw.mjs,
// el mismo módulo que usa la vista. Lógica pura: sin DOM; la medida de texto es inyectable (en node no hay canvas).
import {sceneFor, compartmentLine, POINT_SHAPES, TERMINALS} from './notation.mjs';
import {bestLayout, absoluteBoxes, pathOf, approximateMeasure, FONT} from './notation-layout.mjs';
import {themed, glyphVars, paletteInk, OUTLINES, OUTLINE_SHAPES, containerOutline} from './notation-style.mjs';
import {TERMINAL_MARKERS, laneHeads, laneDrawing, gridDrawing, GRID} from './notation-draw.mjs';

// Colores del tema (los tokens de notation.css, resueltos para un SVG que no tiene CSS).
const THEMES = {
  light: {ink: '#1f2328', muted: '#57606a', stroke: '#57606a', fill: '#ffffff', panel: '#f6f8fa', edge: '#6e7781', accent: '#0969da', mark: '#0969da'},
  dark: {ink: '#e6edf3', muted: '#8b949e', stroke: '#8b949e', fill: '#161b22', panel: '#0d1117', edge: '#8b949e', accent: '#58a6ff', mark: '#58a6ff'},
};
const LINE = Math.ceil(FONT.label * FONT.line);
const r = n => +Number(n).toFixed(2);
export const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const attrs = o => Object.entries(o).filter(([, v]) => v != null && v !== false && v !== '').map(([k, v]) => ` ${k}="${esc(v)}"`).join('');
const el = (tag, o, body) => (body == null ? `<${tag}${attrs(o)}/>` : `<${tag}${attrs(o)}>${body}</${tag}>`);

// Texto en varias líneas centrado (anchor middle) o a la izquierda (start), la primera con su base en y0.
function textLines(lines, x, y0, {anchor = 'middle', size = FONT.label, weight, fill, step = LINE, extra = {}} = {}) {
  return lines.map((t, i) => el('text', {x: r(x), y: r(y0 + i * step), 'text-anchor': anchor, 'font-size': size, 'font-weight': weight, fill, ...extra}, esc(t))).join('');
}

function defs(terminals, c) {
  const used = [...terminals].filter(t => TERMINALS.includes(t));
  if (!used.length) return '';
  return `<defs>${used.map(t => {
    const m = TERMINAL_MARKERS[t];
    const shape = m.circle ? el('circle', m.circle) : el('path', {d: m.d});
    const fill = m.cls === 'solid' ? c.edge : m.cls === 'hollow' ? c.fill : 'none';
    return el('marker', {id: `nv-${t}`, viewBox: '0 0 12 12', refX: 11, refY: 6, markerWidth: 14, markerHeight: 14, markerUnits: 'userSpaceOnUse',
      orient: 'auto-start-reverse', fill, stroke: c.edge, 'stroke-width': 1.2}, shape);
  }).join('')}</defs>`;
}

// ---- Grafo (bestLayout: ELK o carriles de activity) ----
function glyphLook(g, c, skin, inks) {
  const vars = glyphVars(g.style, skin, inks);
  const fill = vars['--glyph-fill'] || (g.derived && g.function === 'partition' ? c.panel : c.fill);
  return {fill, stroke: vars['--glyph-stroke'] || c.stroke, ink: vars['--glyph-ink'] || c.ink};
}

function drawNode(n, box, c, skin, inks) {
  const g = n.glyph, look = glyphLook(g, c, skin, inks);
  const {x, y, width: w, height: h} = box;
  const base = {fill: look.fill, stroke: look.stroke, 'stroke-width': 1.4};
  const lines = n.lines && n.lines.length ? n.lines : [g.label];
  let body = '';
  const cx = x + w / 2;
  if (g.shape === 'filled-circle') body = el('circle', {cx: r(cx), cy: r(y + h / 2), r: r(Math.min(w, h) / 2), fill: look.stroke === c.stroke && !g.style?.stroke ? c.ink : look.stroke});
  else if (g.shape === 'bullseye') body = el('circle', {cx: r(cx), cy: r(y + h / 2), r: r(Math.min(w, h) / 2 - 1), ...base, fill: 'none'})
    + el('circle', {cx: r(cx), cy: r(y + h / 2), r: r(Math.min(w, h) / 2 - 6), fill: c.ink});
  else if (g.shape === 'diamond') body = el('polygon', {points: `${r(cx)},${r(y)} ${r(x + w)},${r(y + h / 2)} ${r(cx)},${r(y + h)} ${r(x)},${r(y + h / 2)}`, ...base})
    + textLines(lines, cx, y + h / 2 - ((lines.length - 1) * LINE) / 2 + 4, {fill: look.ink});
  else if (g.shape === 'stick-figure') {
    const hx = cx, top = y + 4;
    body = el('circle', {cx: r(hx), cy: r(top + 9), r: 9, ...base})
      + el('path', {d: `M${r(hx)},${r(top + 18)} V${r(top + 44)} M${r(hx - 16)},${r(top + 28)} H${r(hx + 16)} M${r(hx)},${r(top + 44)} L${r(hx - 14)},${r(top + 62)} M${r(hx)},${r(top + 44)} L${r(hx + 14)},${r(top + 62)}`, fill: 'none', stroke: look.stroke, 'stroke-width': 1.4})
      + textLines(lines, hx, y + h - 6 - (lines.length - 1) * LINE, {fill: look.ink});
  } else if (OUTLINE_SHAPES.includes(g.shape) && !(n.container && g.shape === 'package')) {
    body = el('path', {d: OUTLINES[g.shape], transform: `translate(${r(x)} ${r(y)}) scale(${r(w / 100)} ${r(h / 100)})`, 'vector-effect': 'non-scaling-stroke', ...base})
      + textLines(lines, cx, y + h / 2 - ((lines.length - 1) * LINE) / 2 + 4, {fill: look.ink});
  } else if (n.container) {
    const hd = n.header || {x: 0, y: 0, width: w, height: 30, lines};
    const frame = g.shape === 'package' ? containerOutline('package', {width: w, height: h, header: hd}) : null;
    body = frame ? el('path', {d: frame.d, transform: `translate(${r(x)} ${r(y)})`, ...base})
      : el('rect', {x: r(x), y: r(y), width: r(w), height: r(h), rx: g.function === 'partition' ? 0 : 6, ...base, fill: g.function === 'partition' ? c.panel : 'none', stroke: look.stroke});
    const hl = hd.lines || lines, hx = hd.width && hd.x != null ? x + hd.x + hd.width / 2 : cx;
    body += (g.keyword ? textLines([g.keyword], hx, y + (hd.y || 0) + 14, {size: 11, fill: c.muted}) : '')
      + textLines(hl, hx, y + (hd.y || 0) + (g.keyword ? 28 : 16), {fill: look.ink, weight: 600});
  } else {
    // Caja: «rounded-box» redondeada, el resto casi recta; clases con keyword y compartimentos.
    const rows = (g.compartments || []).filter(cp => cp.items && cp.items.length);
    body = el('rect', {x: r(x), y: r(y), width: r(w), height: r(h), rx: g.shape === 'rounded-box' ? 10 : 3, ...base});
    let ty = y + 8;
    if (g.keyword) { body += textLines([g.keyword], cx, ty + 10, {size: 11, fill: c.muted}); ty += 14; }
    if (g.function === 'note') body += textLines(lines, x + 8, ty + 12, {anchor: 'start', fill: look.ink});
    else body += textLines(lines, rows.length ? cx : cx, rows.length || lines.length * LINE + 16 > h ? ty + 12 : y + h / 2 - ((lines.length - 1) * LINE) / 2 + 4 + (g.keyword ? 7 : 0), {fill: look.ink, weight: rows.length ? 700 : 600});
    if (rows.length) {
      ty += lines.length * LINE + 4;
      for (const cp of rows) {
        body += el('line', {x1: r(x), x2: r(x + w), y1: r(ty), y2: r(ty), stroke: look.stroke, 'stroke-width': 1});
        body += textLines(cp.items.map(compartmentLine), x + 8, ty + 14, {anchor: 'start', size: 12, step: 17, fill: look.ink});
        ty += 10 + cp.items.length * 17;
      }
    }
  }
  if (POINT_SHAPES.includes(g.shape) && n.outside) body += textLines(n.outside.lines, x + n.outside.x + n.outside.width / 2, y + n.outside.y + 12, {fill: c.ink, size: 12});
  return el('g', {class: 'nv-node' + (n.container ? ' is-container' : ''), 'data-id': n.id, 'data-x': r(x), 'data-y': r(y), 'data-w': r(w), 'data-h': r(h), 'data-shape': g.shape}, body);
}

const labelBox = (b, c, extra = {}) => (b && b.lines ? el('g', {class: 'nv-label', 'data-x': r(b.x), 'data-y': r(b.y), ...extra},
  el('rect', {x: r(b.x), y: r(b.y), width: r(b.width), height: r(b.height), fill: c.fill, opacity: .85})
  + textLines(b.lines, b.x + b.width / 2, b.y + 12, {size: 12, fill: c.ink})) : '');

function graphBody(layout, c, skin, inks, used) {
  const abs = absoluteBoxes(layout);
  const order = [...layout.nodes].sort((a, b) => (a.depth || 0) - (b.depth || 0));
  const nodes = order.map(n => drawNode(n, abs.get(n.id), c, skin, inks)).join('');
  const edges = layout.edges.map(e => {
    if (!e.points || e.points.length < 2) return '';
    if (e.sourceEnd) used.add(e.sourceEnd);
    if (e.targetEnd) used.add(e.targetEnd);
    const path = el('path', {d: pathOf(e.points.map(p => ({x: r(p.x), y: r(p.y)}))), fill: 'none', stroke: themed(e.color, skin) || c.edge, 'stroke-width': 1.4,
      'stroke-dasharray': e.dash, 'marker-end': e.targetEnd ? `url(#nv-${e.targetEnd})` : undefined, 'marker-start': e.sourceEnd ? `url(#nv-${e.sourceEnd})` : undefined});
    return el('g', {class: 'nv-edge', 'data-edge': e.id, 'data-source': e.source, 'data-target': e.target, 'data-link': e.link}, path
      + labelBox(e.labelBox, c) + labelBox(e.sourceLabelBox && {...e.sourceLabelBox, lines: [e.sourceLabel]}, c) + labelBox(e.targetLabelBox && {...e.targetLabelBox, lines: [e.targetLabel]}, c));
  }).join('');
  return {body: nodes + edges, width: layout.width, height: layout.height};
}

// ---- Carriles de secuencia ----
function lanesBody(scene, c, skin, inks, used) {
  const draw = laneDrawing(scene);
  const heads = laneHeads(scene).map(l => {
    const look = glyphLook(l.glyph, c, skin, inks), g = l.glyph;
    const body = g.shape === 'stick-figure' ? drawNode({id: l.id, glyph: g, lines: l.lines, container: false}, {x: l.left, y: l.top, width: l.width, height: l.height}, c, skin, inks)
      : el('rect', {x: r(l.left), y: r(l.top), width: r(l.width), height: r(l.height), rx: 3, fill: look.fill, stroke: look.stroke, 'stroke-width': 1.4})
        + (g.keyword ? textLines([g.keyword], l.x, l.top + 14, {size: 11, fill: c.muted}) : '')
        + textLines(l.lines, l.x, l.top + l.height / 2 + 4 + (g.keyword ? 7 : 0) - ((l.lines.length - 1) * 17) / 2, {size: 12.5, step: 17, fill: look.ink, weight: 600});
    return el('g', {class: 'nv-lane-head', 'data-lane': l.id, 'data-x': r(l.x), 'data-w': r(l.width), 'data-top': r(l.top), 'data-h': r(l.height)}, body);
  }).join('');
  const life = draw.lifelines.map(l => el('line', {class: 'nv-lifeline', 'data-lifeline': l.id, x1: r(l.x), x2: r(l.x), y1: r(l.y1), y2: r(l.y2), stroke: c.edge, 'stroke-dasharray': '5 4'})).join('');
  const frames = draw.frames.map(f => el('g', {class: 'nv-frame', 'data-fragment': f.id, 'data-orders': f.orders.join(',')},
    el('rect', {x: r(f.x), y: r(f.y), width: r(f.width), height: r(f.height), fill: 'none', stroke: c.muted, 'stroke-width': 1})
    + el('path', {d: f.tab, fill: 'none', stroke: c.muted})
    + el('text', {x: r(f.title.x), y: r(f.title.y), 'font-size': 12, 'font-weight': 700, fill: c.ink}, esc(f.title.text))
    + (f.guard ? el('text', {x: r(f.guard.x), y: r(f.guard.y), 'font-size': 12, fill: c.muted}, esc(f.guard.text)) : ''))).join('');
  const messages = draw.messages.map(m => {
    if (m.sourceEnd) used.add(m.sourceEnd);
    if (m.targetEnd) used.add(m.targetEnd);
    const line = el('path', {d: m.path, fill: 'none', stroke: c.edge, 'stroke-width': 1.4, 'stroke-dasharray': m.dash,
      'marker-end': m.targetEnd ? `url(#nv-${m.targetEnd})` : undefined, 'marker-start': m.sourceEnd ? `url(#nv-${m.sourceEnd})` : undefined});
    const text = m.lines.map(t => el('text', {x: r(t.x), y: r(t.y), 'text-anchor': m.anchor, 'font-size': 12.5, fill: c.ink}, esc(t.text))).join('');
    return el('g', {class: 'nv-message', 'data-message': m.id, 'data-order': m.order, 'data-from': m.from, 'data-to': m.to, 'data-y': r(m.y), 'data-link': m.link}, line + text);
  }).join('');
  return {body: life + frames + messages + heads, width: draw.width, height: draw.height};
}

// ---- Matrices ----
function gridBody(scene, c, measure) {
  const draw = gridDrawing(scene, {measure});
  const body = draw.grids.map(g => {
    const cap = el('text', {x: r(g.caption.x), y: r(g.caption.y), 'font-size': 13, 'font-weight': 700, fill: c.ink}, esc(g.label));
    const cols = g.columns.map(col => el('g', {class: 'nv-col', 'data-col': col.id, 'data-x': r(col.x), 'data-w': r(col.width)},
      el('rect', {x: r(col.x), y: r(col.y), width: r(col.width), height: r(col.height), fill: c.panel, stroke: c.stroke})
      + el('text', {x: r(col.x + col.width / 2), y: r(col.y + col.height / 2 + 4), 'text-anchor': 'middle', 'font-size': GRID.text, 'font-weight': 600, fill: c.ink}, esc(col.label)))).join('');
    const cellSvg = (row, cell) => el('g', {class: 'nv-cell' + (cell.filled ? ' is-filled' : ''), 'data-cell': `${row.id}|${cell.col}`, 'data-x': r(cell.x), 'data-y': r(cell.y)},
      el('rect', {x: r(cell.x), y: r(cell.y), width: r(cell.width), height: r(cell.height), fill: c.fill, stroke: c.stroke})
      + (cell.filled ? el('circle', {cx: r(cell.x + cell.width / 2), cy: r(cell.y + cell.height / 2), r: 5, fill: c.mark}, cell.title ? `<title>${esc(cell.title)}</title>` : '') : ''));
    const rowSvg = row => el('g', {class: 'nv-row', 'data-row': row.id, 'data-y': r(row.y), 'data-depth': row.depth},
      el('rect', {x: r(row.head.x), y: r(row.head.y), width: r(row.head.width), height: r(row.head.height), fill: c.panel, stroke: c.stroke})
      + el('text', {x: r(row.head.x + 10 + row.depth * GRID.indent), y: r(row.head.y + row.head.height / 2 + 4), 'font-size': GRID.text, fill: c.ink}, esc(row.label))
      + row.cells.map(cell => cellSvg(row, cell)).join(''));
    const rows = g.rows.map(rowSvg).join('');
    return el('g', {class: 'nv-grid', 'data-view': g.view}, cap + cols + rows);
  }).join('');
  return {body, width: draw.width, height: draw.height};
}

// Un payload de GET /api/notation/view -> un SVG (string). Es asíncrono porque el layout de grafo (bestLayout) lo es:
// `elk` es la instancia de elkjs (hace falta solo en diagramas de grafo con ELK; las activities con carriles, las
// secuencias y las matrices no la usan). `measure` mide texto (px): el del navegador mide con canvas; sin él, la
// aproximada de notation-layout.mjs, la misma con la que se calcula la escena que se compara en las pruebas.
export async function exportSvg(view, {elk = null, measure = approximateMeasure, headMeasure, canvas = {width: 1200, height: 900}, skin = 'light', documents = null, title = null} = {}) {
  const c = THEMES[skin] || THEMES.light;
  const inks = paletteInk(documents, view.palette);
  const scene = sceneFor(view, {measure, ...(headMeasure ? {headMeasure} : {}), canvas: null});
  const used = new Set();
  let out;
  if (scene.kind === 'lanes') out = lanesBody(scene, c, skin, inks, used);
  else if (scene.kind === 'grid') out = gridBody(scene, c, measure);
  else {
    const layout = await bestLayout(elk, scene, {measure, canvas});
    out = layout ? graphBody(layout, c, skin, inks, used) : {body: '', width: 0, height: 0};
  }
  const pad = scene.kind === 'graph' ? 16 : 0;
  const width = Math.ceil(out.width + pad * 2), height = Math.ceil(out.height + pad * 2);
  const name = title || view.title || view.spec || 'Notación';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(name)}"`
    + ` font-family="system-ui, sans-serif" data-kind="${scene.kind}" data-diagram="${esc(view.diagram_type || '')}">`
    + `<title>${esc(name)}</title>${defs(used, c)}<rect width="100%" height="100%" fill="${c.fill}"/>`
    + `<g transform="translate(${pad} ${pad})">${out.body}</g></svg>`;
}
