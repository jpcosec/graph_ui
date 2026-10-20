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
