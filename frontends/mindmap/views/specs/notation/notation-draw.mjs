// Dibujo puro de la vista de notación: de una escena (notation.mjs) a primitivas de dibujo, sin React ni DOM.
// Lo usan la vista interactiva (notation-view.js, que las pinta con htm) y el exportador estático
// (notation-svg.mjs, que las serializa a SVG): el mismo dibujo en las dos salidas, sin un segundo layout.
// Cubre lo que no resuelve bestLayout: la geometría de secuencias (laneScene) y matrices (gridScene) ya viene
// calculada en la escena; aquí se traduce a rutas, rótulos y celdas.
import {LANE, LANE_TEXT, cellKey} from './notation.mjs';
import {approximateMeasure} from './notation-layout.mjs';

// ---- Terminales (puntas de línea) como datos: path o círculo en un viewBox 12x12 ----
// cls: 'solid' (relleno del trazo) | 'hollow' (relleno del fondo) | null (sin relleno).
export const TERMINAL_MARKERS = {
  'open-arrow': {d: 'M1,1 L11,6 L1,11', cls: null},
  'filled-arrow': {d: 'M1,1 L11,6 L1,11 Z', cls: 'solid'},
  'hollow-triangle': {d: 'M1,1 L11,6 L1,11 Z', cls: 'hollow'},
  'filled-triangle': {d: 'M1,1 L11,6 L1,11 Z', cls: 'solid'},
  'hollow-diamond': {d: 'M1,6 L6,2 L11,6 L6,10 Z', cls: 'hollow'},
  'filled-diamond': {d: 'M1,6 L6,2 L11,6 L6,10 Z', cls: 'solid'},
  'filled-circle': {circle: {cx: 6, cy: 6, r: 4}, cls: 'solid'},
  'hollow-circle': {circle: {cx: 6, cy: 6, r: 4}, cls: 'hollow'},
  'bar': {d: 'M10,1 L10,11', cls: null},
  'crowfoot': {d: 'M11,1 L1,6 L11,11 M1,6 L11,6', cls: null},
};

// ---- Carriles (secuencias) ----
// La pestaña de un fragmento: su ancho sale del operador o del rótulo (12,5 px).
export const tabWidth = text => Math.max(34, String(text || '').length * 7.6 + 14);

// Cabeceras de participante: la caja de cada una, en coordenadas del diagrama.
export function laneHeads(scene) {
  return scene.lanes.map(l => ({id: l.id, glyph: l.glyph, lines: l.lines, left: l.x - l.width / 2, top: LANE.top + scene.head - l.height,
    x: l.x, width: l.width, height: l.height}));
}

// Línea de vida, marcos de fragmento y mensajes (ruta, trazo, puntas y rótulo en líneas con su posición).
export function laneDrawing(scene) {
  const {lanes, messages, lifelineTop, height} = scene;
  const lifelines = lanes.map(l => ({id: l.id, x: l.x, y1: lifelineTop, y2: height - LANE.top}));
  const frames = (scene.frames || []).map(f => ({id: f.id, orders: f.orders, operator: f.operator, label: f.label,
    x: f.x, y: f.y, width: f.width, height: f.height,
    tab: `M${f.x},${f.y + 18} h${tabWidth(f.operator || f.label)} l6,-6 v-12`,
    title: {x: f.x + 6, y: f.y + 14, text: f.operator || f.label},
    guard: f.operator && f.label ? {x: f.x + tabWidth(f.operator) + 14, y: f.y + 14, text: `[${f.label}]`} : null}));
  const drawn = messages.map(m => {
    const path = m.self
      ? `M${m.x1},${m.y - LANE.row / 3} h${LANE.loop} v${LANE.row / 3 * 2} h${-LANE.loop}`
      : `M${m.x1},${m.y} L${m.x2},${m.y}`;
    // Rótulo en líneas: encima de la flecha (la última pegada a ella) o, en una autollamada, a la derecha del bucle.
    const lines = m.lines || [`${m.order}. ${m.label}`];
    const x = m.labelX ?? (m.self ? m.x1 + LANE.loop + 6 : (m.x1 + m.x2) / 2);
    const lineY = i => (m.self ? m.y + 4 + i * LANE_TEXT.line : m.y - 6 - (lines.length - 1 - i) * LANE_TEXT.line);
    return {id: m.id, link: m.link || '', order: m.order, from: m.from, to: m.to, y: m.y, self: m.self, path, dash: m.dash,
      sourceEnd: m.sourceEnd, targetEnd: m.targetEnd, anchor: m.self ? 'start' : 'middle',
      lines: lines.map((text, i) => ({text, x, y: lineY(i)}))};
  });
  return {width: scene.width, height, lifelines, frames, messages: drawn};
}

// ---- Grilla (matrices) ----
// Un modelo por vista de la grilla: columnas, y por fila sus celdas (marcada o no, con su detalle). G7: una celda
// marcada es una marca; lo que diga el link queda como detalle (la columna ya nombra la vista).
export function gridModel(scene) {
  return scene.grids.map(grid => ({view: grid.view, label: grid.label, columns: grid.columns,
    rows: scene.rows.map(r => ({id: r.id, label: r.label, depth: r.depth,
      cells: grid.columns.map(c => {
        const labels = scene.cells[cellKey(r.id, c.id)];
        const detail = labels ? labels.filter(Boolean).join(', ') : '';
        return {col: c.id, filled: Boolean(labels), detail, title: labels ? detail || c.label : undefined};
      })}))}));
}

export const GRID = {rowHead: 120, indent: 16, col: 78, row: 28, headRow: 30, caption: 26, gap: 24, pad: 10, text: 12.5};

// El mismo modelo con geometría (para el SVG): cada tabla en su posición, columnas y filas con su caja.
export function gridDrawing(scene, {measure = approximateMeasure} = {}) {
  const grids = [];
  let y = GRID.pad, width = 0;
  for (const model of gridModel(scene)) {
    const headW = Math.max(GRID.rowHead, ...model.rows.map(r => measure(r.label, GRID.text) + GRID.pad * 2 + r.depth * GRID.indent));
    const colW = model.columns.map(c => Math.max(GRID.col, measure(c.label, GRID.text) + GRID.pad * 2));
    const x = GRID.pad, top = y + GRID.caption;
    let cx = x + headW;
    const columns = model.columns.map((c, i) => { const box = {...c, x: cx, y: top, width: colW[i], height: GRID.headRow}; cx += colW[i]; return box; });
    const rows = model.rows.map((r, i) => {
      const ry = top + GRID.headRow + i * GRID.row;
      return {...r, x, y: ry, width: cx - x, height: GRID.row, head: {x, y: ry, width: headW, height: GRID.row},
        cells: r.cells.map((cell, j) => ({...cell, x: columns[j].x, y: ry, width: columns[j].width, height: GRID.row}))};
    });
    const height = GRID.caption + GRID.headRow + rows.length * GRID.row;
    grids.push({view: model.view, label: model.label, x, y, width: cx - x, height, caption: {x, y: y + GRID.caption - 8}, headWidth: headW, columns, rows});
    width = Math.max(width, cx - x);
    y += height + GRID.gap;
  }
  return {grids, width: width + GRID.pad * 2, height: Math.max(y - GRID.gap + GRID.pad, GRID.pad * 2)};
}
