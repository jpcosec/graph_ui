/**
 * WS13.1: funciones puras del lector de documento (sin DOM).
 *
 * El texto, la revision y las secciones llegan de GET /api/workspace/source, de los mismos
 * bytes. Este modulo solo reparte ese texto en bloques para mostrarlo y decide que elementos
 * de cada representacion corresponden al foco, usando unicamente procedencia ya presente en
 * los datos (span de seccion, field_path, objeto de referencia, procedencia de arista).
 */

const INLINE_PREDICATE = /\[([a-zA-Z0-9_-]+)::\s*(!)?\[\[([^\]]+)\]\]\]/;
const STANDARD_LINK = /(!)?\[\[([^\]]+)\]\]/;
const LINK_SCAN = new RegExp(`${INLINE_PREDICATE.source}|${STANDARD_LINK.source}`, 'g');
const HEADING = /^(#{1,6})[ \t]+(.*?)[ \t]*#*[ \t]*$/;
const FENCE = /^[ \t]*(```|~~~)/;
const LIST_ITEM = /^[ \t]*(?:[-*+]|\d+[.)])[ \t]+/;

/** Parte una linea en segmentos de texto y de enlace; el enlace lleva su resolucion si existe. */
export function splitInline(line, linksByRaw = {}) {
  const out = [];
  let last = 0;
  const re = new RegExp(LINK_SCAN.source, 'g');
  let m;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) out.push({type: 'text', text: line.slice(last, m.index)});
    const raw = m[0];
    const label = (m[3] ?? m[5] ?? raw).trim();
    out.push({type: 'link', raw, label, link: linksByRaw[raw] || null});
    last = m.index + raw.length;
  }
  if (last < line.length) out.push({type: 'text', text: line.slice(last)});
  return out;
}

/** Texto -> bloques con line_start/line_end (1-based, mismas lineas que la fuente). */
export function renderBlocks(text) {
  const lines = String(text ?? '').split('\n').map(l => l.replace(/\r$/, ''));
  if (lines.length && lines[lines.length - 1] === '') lines.pop();
  const blocks = [];
  let i = 0;
  if (lines[0] === '---') {
    const close = lines.findIndex((l, idx) => idx > 0 && l.trim() === '---');
    if (close > 0) {
      blocks.push({kind: 'frontmatter', line_start: 1, line_end: close + 1, lines: lines.slice(1, close)});
      i = close + 1;
    }
  }
  let para = null;
  const flush = () => { if (para) { blocks.push(para); para = null; } };
  while (i < lines.length) {
    const line = lines[i];
    const n = i + 1;
    if (FENCE.test(line)) {
      flush();
      let j = i + 1;
      while (j < lines.length && !FENCE.test(lines[j])) j++;
      const end = Math.min(j, lines.length - 1);
      blocks.push({kind: 'code', line_start: n, line_end: end + 1, lines: lines.slice(i + 1, j)});
      i = end + 1;
      continue;
    }
    const h = HEADING.exec(line);
    if (h) {
      flush();
      blocks.push({kind: 'heading', level: h[1].length, text: h[2].trim(), line_start: n, line_end: n});
    } else if (LIST_ITEM.test(line)) {
      if (!para || para.kind !== 'list') { flush(); para = {kind: 'list', line_start: n, line_end: n, items: []}; }
      para.items.push({line: n, text: line.replace(LIST_ITEM, '')});
      para.line_end = n;
    } else if (line.trim() === '') {
      flush();
    } else {
      if (!para || para.kind !== 'paragraph') { flush(); para = {kind: 'paragraph', line_start: n, line_end: n, lines: []}; }
      para.lines.push(line);
      para.line_end = n;
    }
    i++;
  }
  flush();
  return blocks;
}

export const linksByRaw = links => Object.fromEntries((links || []).map(l => [l.raw, l]));

/** Seccion cuyo titulo o slug coincide con el ancla (sin distinguir mayusculas). */
export function sectionForAnchor(sections, anchor) {
  const a = String(anchor ?? '').trim().toLowerCase();
  if (!a) return null;
  return (sections || []).find(s => (s.title || '').trim().toLowerCase() === a || (s.slug || '').toLowerCase() === a) || null;
}

/** Seccion mas especifica (la de menor span) que contiene la linea. */
export function sectionAtLine(sections, line) {
  let best = null;
  for (const s of sections || []) {
    if (s.line_start == null || s.line_end == null) continue;
    if (line >= s.line_start && line <= s.line_end) {
      if (!best || (s.line_end - s.line_start) <= (best.line_end - best.line_start)) best = s;
    }
  }
  return best;
}

// ---------------------------------------------------------------- foco (navegacion §6.1)

export const sectionFocus = s => ({kind: 'section', path: s.path ?? s.name ?? '', title: s.title ?? '', line_start: s.line_start ?? null, line_end: s.line_end ?? null});
export const fieldFocus = fieldPath => ({kind: 'field', field_path: fieldPath});
export const referenceFocus = f => ({kind: 'reference', doc: f.doc ?? '', field: f.field, position: f.position, value: f.value});
export const edgeFocus = e => ({kind: 'edge', source: e.source, target: e.target, type: e.type, relationDoc: e.relationDoc ?? null});

export const edgeKey = e => [e.source, e.target, e.type, e.relationDoc ?? ''].join('|');
export const referenceKey = f => `${f.doc ?? ''}|${f.field}|${f.position}`;

/** Campos (field_path) de procedencia de una arista: field y, en composicion, source_field. */
export function edgeFields(edge) {
  const out = new Set();
  for (const p of edge?.provenance || []) {
    if (p?.field) out.add(p.field);
    if (p?.source_field) out.add(p.source_field);
  }
  return Array.from(out);
}

export function sectionHighlighted(section, focus) {
  return !!focus && focus.kind === 'section' && !!section && (section.path ?? section.name) === focus.path;
}

/** Campo del documento: por field_path; la referencia de Code fija foco en su campo. */
export function fieldHighlighted(fieldPath, focus, edges = []) {
  if (!focus) return false;
  if (focus.kind === 'field') return focus.field_path === fieldPath;
  if (focus.kind === 'reference') return focus.field === fieldPath;
  if (focus.kind === 'edge') {
    const edge = edges.find(e => edgeKey(e) === edgeKey(focus));
    return edge ? edgeFields(edge).includes(fieldPath) : false;
  }
  return false;
}

export function edgeHighlighted(edge, focus) {
  if (!focus) return false;
  if (focus.kind === 'edge') return edgeKey(edge) === edgeKey(focus);
  if (focus.kind === 'field') return edgeFields(edge).includes(focus.field_path);
  if (focus.kind === 'reference') return edgeFields(edge).includes(focus.field);
  return false;
}

export function referenceHighlighted(file, focus) {
  if (!focus) return false;
  if (focus.kind === 'reference') return referenceKey(file) === referenceKey(focus);
  if (focus.kind === 'field') return file.field === focus.field_path;
  return false;
}

export function lineInFocus(line, focus, fields = []) {
  if (!focus) return false;
  if (focus.kind === 'section') return focus.line_start != null && line >= focus.line_start && line <= focus.line_end;
  if (focus.kind === 'field') {
    const f = fields.find(x => x.field_path === focus.field_path);
    return !!f?.span && line >= f.span.line_start && line <= f.span.line_end;
  }
  return false;
}

/** Cuantos elementos de cada representacion corresponden al foco (solo procedencia real). */
export function correspondence(focus, {sections = [], fields = [], edges = [], files = []} = {}) {
  if (!focus) return null;
  return {
    document: focus.kind === 'section'
      ? sections.filter(s => sectionHighlighted(s, focus)).length
      : fields.filter(f => fieldHighlighted(f.field_path, focus, edges)).length,
    graph: edges.filter(e => edgeHighlighted(e, focus)).length,
    code: files.filter(f => referenceHighlighted(f, focus)).length,
  };
}

export function describeFocus(focus) {
  if (!focus) return '';
  if (focus.kind === 'section') return `sección ${focus.title || focus.path} (L${focus.line_start}-L${focus.line_end})`;
  if (focus.kind === 'field') return `campo ${focus.field_path}`;
  if (focus.kind === 'reference') return `referencia ${focus.field}[${focus.position}] ${focus.value}`;
  if (focus.kind === 'edge') return `arista ${focus.source} ─[${focus.type}]→ ${focus.target}`;
  return '';
}

// ---------------------------------------------------------------- rango local de Code

/** Clic fija el rango en una linea; mayusculas + clic lo extiende desde el ancla. */
export function nextRange(range, line, shift) {
  if (shift && range && range.anchor != null) return {anchor: range.anchor, start: Math.min(range.anchor, line), end: Math.max(range.anchor, line)};
  return {anchor: line, start: line, end: line};
}

export const inRange = (range, line) => !!range && line >= range.start && line <= range.end;
export const rangeLabel = range => range ? (range.start === range.end ? `L${range.start}` : `L${range.start}-L${range.end}`) : '';

// ---------------------------------------------------------------- URL

/** Seleccion de la URL: id o path, excluyentes; ambos o ninguno => null. */
export function targetFromSearch(search) {
  const p = new URLSearchParams(search || '');
  const id = p.get('id');
  const path = p.get('path');
  if (id && !path) return {id};
  if (path && !id) return {path};
  return null;
}

export const targetKey = t => t ? (t.id ? `id:${t.id}` : `path:${t.path}`) : '';
