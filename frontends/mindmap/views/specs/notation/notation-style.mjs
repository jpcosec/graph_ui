// Estilo resuelto por spec2viz (contrato §13), en lógica pura: qué color toca en cada tema, de dónde
// sale el color del texto sobre un relleno y el contorno de las formas que no son una caja. graph_ui
// no recalcula precedencias: node.style y link.color ya vienen resueltos.

// Formas dibujadas como contorno SVG detrás del contenido (viewBox 0 0 100 100, estiradas a la caja).
export const OUTLINE_SHAPES = ['cylinder', 'queue', 'cloud', 'package', 'note'];
export const OUTLINES = {
  cylinder: 'M0,10 A50,10 0 0 1 100,10 L100,90 A50,10 0 0 1 0,90 Z M0,10 A50,10 0 0 0 100,10',
  queue: 'M10,0 L90,0 A10,50 0 0 1 90,100 L10,100 A10,50 0 0 1 10,0 Z M90,0 A10,50 0 0 0 90,100',
  cloud: 'M25,90 C8,90 2,72 14,62 C4,48 18,30 34,36 C38,16 64,12 72,30 C88,26 100,42 92,56 C102,68 94,90 78,90 Z',
  package: 'M0,14 L0,100 L100,100 L100,14 Z M0,14 L0,0 L38,0 L42,14',
  note: 'M0,0 L86,0 L100,14 L100,100 L0,100 Z M86,0 L86,14 L100,14',
};
// Área interior de cada contorno, en fracciones de la caja (top, right, bottom, left): lo que queda
// libre entre las tapas del cilindro y de la cola, los lóbulos de la nube, la pestaña del paquete y
// la esquina doblada de la nota. El texto (keyword, ícono y rótulo) va ahí dentro; como el contorno
// se estira con la caja, el área interior escala igual.
export const SHAPE_INNER = {
  cylinder: [0.22, 0.03, 0.12, 0.03],
  queue: [0.04, 0.22, 0.04, 0.11],
  cloud: [0.36, 0.14, 0.13, 0.18],
  package: [0.17, 0.03, 0.04, 0.03],
  note: [0.17, 0.03, 0.04, 0.03],
};

// Caja que necesita una forma para que su área interior mida (width, height).
export function shapeBox(shape, width, height) {
  const inner = SHAPE_INNER[shape];
  if (!inner) return [width, height];
  const [t, r, b, l] = inner;
  return [width / (1 - l - r), height / (1 - t - b)];
}

// Variables CSS del área interior (porcentajes de la caja) para colocar la cabecera dentro.
export function innerVars(shape) {
  const inner = SHAPE_INNER[shape];
  if (!inner) return {};
  const pct = f => `${+(f * 100).toFixed(2)}%`;
  const [t, r, b, l] = inner;
  return {'--inner-top': pct(t), '--inner-right': pct(r), '--inner-bottom': pct(b), '--inner-left': pct(l)};
}

// Un valor resuelto por tema ({light, dark}) en el tema activo; un string vale para los dos.
export function themed(value, skin = 'light') {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value[skin] || value.light || null;
}

// Los dos inks (texto sobre un relleno, {light, dark}) de la paleta de la vista; la paleta es un
// PaletteDoc del store (lo nombra view.palette).
export function paletteInk(documents, paletteRef) {
  if (!paletteRef) return null;
  const name = String(paletteRef).split(':').pop();
  const doc = (documents || []).find(d => d && d.model_name === 'PaletteDoc' && (d.id === name || d.payload?.name === name));
  const ink = doc?.payload?.ink;
  return ink ? (typeof ink === 'string' ? {light: ink, dark: ink} : ink) : null;
}

// Luminancia relativa (WCAG) de un color #rgb/#rrggbb; null si no es hex.
export function luminance(colour) {
  let hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(colour || '').trim())?.[1];
  if (!hex) return null;
  if (hex.length === 3) hex = [...hex].map(c => c + c).join('');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

// El texto sobre un relleno: el ink de la paleta que más contrasta con ESE relleno, no el del tema.
// Un color literal (#fff1c2) vale igual en los dos temas, y en oscuro su texto debe seguir oscuro.
export function readableInk(fill, inks) {
  const lf = luminance(fill);
  if (lf == null) return null;
  const light = inks?.light || '#1f2328', dark = inks?.dark || '#e6edf3';
  const ll = luminance(light), ld = luminance(dark);
  if (ll == null || ld == null) return lf > 0.4 ? light : dark;
  return contrast(lf, ll) >= contrast(lf, ld) ? light : dark;
}

// Variables CSS de un glifo: relleno, trazo y texto. Sin estilo declarado no hay variables y el glifo
// se ve como siempre (los colores del tema). `inks` son los dos inks de la paleta ({light, dark}).
export function glyphVars(style, skin = 'light', inks = null) {
  const vars = {};
  const fill = themed(style?.fill, skin), stroke = themed(style?.stroke, skin);
  if (fill) vars['--glyph-fill'] = fill;
  if (stroke) vars['--glyph-stroke'] = stroke;
  const ink = fill && readableInk(fill, inks);
  if (ink) vars['--glyph-ink'] = ink;
  return vars;
}

// Nombre de ícono de lucide (kebab-case, como lo declara la paleta) -> clave del objeto `icons`.
export const iconKey = name => String(name || '').split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');

// ---- Contorno real, para que las aristas lleguen a la forma y no a su caja ----
// El borde exterior de cada forma como polígono en las mismas unidades que su path (0..100, estirado a
// la caja): las tapas del cilindro y de la cola, los lóbulos de la nube, la pestaña del paquete, la
// esquina doblada de la nota y el rombo.
const arc = (cx, cy, rx, ry, from, to, steps = 24) => Array.from({length: steps + 1}, (_, i) => {
  const t = from + (to - from) * i / steps;
  return [cx + rx * Math.cos(t), cy + ry * Math.sin(t)];
});
const bezier = ([x0, y0], [x1, y1], [x2, y2], [x3, y3], steps = 16) => Array.from({length: steps}, (_, i) => {
  const t = (i + 1) / steps, u = 1 - t;
  return [u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3];
});
const CLOUD = [[25, 90], [8, 90], [2, 72], [14, 62], [4, 48], [18, 30], [34, 36], [38, 16], [64, 12], [72, 30],
  [88, 26], [100, 42], [92, 56], [102, 68], [94, 90], [78, 90]];
export const CONTOURS = {
  cylinder: [...arc(50, 10, 50, 10, Math.PI, 2 * Math.PI), ...arc(50, 90, 50, 10, 0, Math.PI)],
  queue: [...arc(90, 50, 10, 50, -Math.PI / 2, Math.PI / 2), ...arc(10, 50, 10, 50, Math.PI / 2, 1.5 * Math.PI)],
  cloud: [CLOUD[0], ...[1, 4, 7, 10, 13].flatMap(i => bezier(CLOUD[i - 1], CLOUD[i], CLOUD[i + 1], CLOUD[i + 2]))],
  package: [[0, 0], [38, 0], [42, 14], [100, 14], [100, 100], [0, 100]],
  note: [[0, 0], [86, 0], [100, 14], [100, 100], [0, 100]],
  diamond: [[50, 0], [100, 50], [50, 100], [0, 50]],
};

// Primer punto del contorno (en la caja `box`) que toca el rayo que sale de `from` en la dirección
// (dx, dy); null si no lo toca.
function rayHit(polygon, box, from, dx, dy) {
  const pts = polygon.map(([x, y]) => ({x: box.x + x / 100 * box.width, y: box.y + y / 100 * box.height}));
  let best = null;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const ex = b.x - a.x, ey = b.y - a.y, den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-9) continue;
    const t = ((a.x - from.x) * ey - (a.y - from.y) * ex) / den;
    const u = ((a.x - from.x) * dy - (a.y - from.y) * dx) / den;
    if (t >= -1e-6 && u >= -1e-6 && u <= 1 + 1e-6 && (!best || t < best.t)) best = {t, x: from.x + t * dx, y: from.y + t * dy};
  }
  return best;
}

// Recorta (alarga) el extremo de un recorrido para que toque el contorno real de la forma: sigue la
// dirección del último tramo, así un recorrido ortogonal sigue siéndolo. Los recorridos que salen de
// una forma se tratan igual, desde su primer tramo.
export function clipToContour(points, box, shape, atStart = false) {
  const polygon = CONTOURS[shape];
  if (!polygon || !box || !points || points.length < 2) return points;
  const pts = atStart ? [...points].reverse() : [...points];
  const end = pts[pts.length - 1], prev = pts[pts.length - 2];
  const len = Math.hypot(end.x - prev.x, end.y - prev.y);
  if (!len) return points;
  const hit = rayHit(polygon, box, prev, (end.x - prev.x) / len, (end.y - prev.y) / len);
  if (!hit) return points;
  pts[pts.length - 1] = {x: hit.x, y: hit.y};
  return atStart ? pts.reverse() : pts;
}
