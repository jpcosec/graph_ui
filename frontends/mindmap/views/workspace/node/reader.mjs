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

/** Opciones del motor Markdown (markdown-it): el HTML del documento nunca se interpreta. */
export const MARKDOWN_OPTIONS = Object.freeze({html: false, linkify: false});

/** Instancia el motor con las opciones del lector; el constructor llega del import map. */
export const createMarkdown = MarkdownIt => new MarkdownIt({...MARKDOWN_OPTIONS});

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

/**
 * Fuente -> bloques para el lector, con el motor real (markdown-it, md.parse).
 *
 * Cada bloque lleva line_start/line_end en base 1 e inclusivos, tomados de token.map
 * ([inicio, fin) en base 0) y desplazados por el frontmatter, que se separa antes de parsear.
 * Los inline quedan como arbol de nodos de datos (sin HTML): text, softbreak, hardbreak, em,
 * strong, code, std_link (enlace Markdown estandar, sin clasificar) y span (marca sin render
 * propio). Los [[…]] se resuelven despues con splitInline sobre los nodos text.
 */
export function renderBlocks(text, md) {
  const lines = String(text ?? '').split('\n');
  const blocks = [];
  let offset = 0;
  if (lines[0]?.replace(/\r$/, '') === '---') {
    const close = lines.findIndex((l, idx) => idx > 0 && l.trim() === '---');
    if (close > 0) {
      blocks.push({kind: 'frontmatter', line_start: 1, line_end: close + 1, lines: lines.slice(1, close).map(l => l.replace(/\r$/, ''))});
      offset = close + 1;
    }
  }
  const body = lines.slice(offset).join('\n');
  const tokens = md.parse(body, {});
  const span = t => ({line_start: t.map[0] + 1 + offset, line_end: t.map[1] + offset});
  const srcLines = t => lines.slice(t.map[0] + offset, t.map[1] + offset).map(l => l.replace(/\r$/, ''));

  // Recorre tokens de bloque desde i hasta el cierre `stop` (o el final); devuelve [bloques, siguiente].
  function walk(i, stop) {
    const out = [];
    while (i < tokens.length) {
      const t = tokens[i];
      if (stop && t.type === stop) return [out, i + 1];
      if (t.type === 'heading_open') {
        const inl = tokens[i + 1];
        out.push({kind: 'heading', level: Number(t.tag.slice(1)), text: inl.content.trim(), inline: inlineNodes(inl.children), ...span(t)});
        i += 3;
      } else if (t.type === 'paragraph_open') {
        out.push({kind: 'paragraph', tight: !!t.hidden, inline: inlineNodes(tokens[i + 1].children), ...span(t)});
        i += 3;
      } else if (t.type === 'fence' || t.type === 'code_block') {
        const content = t.content.endsWith('\n') ? t.content.slice(0, -1) : t.content;
        out.push({kind: 'code', info: t.info || '', lines: content.split('\n'), ...span(t)});
        i += 1;
      } else if (t.type === 'blockquote_open') {
        const [children, next] = walk(i + 1, 'blockquote_close');
        out.push({kind: 'quote', blocks: children, ...span(t)});
        i = next;
      } else if (t.type === 'bullet_list_open' || t.type === 'ordered_list_open') {
        const ordered = t.type === 'ordered_list_open';
        const close = ordered ? 'ordered_list_close' : 'bullet_list_close';
        const list = {kind: 'list', ordered, start: ordered ? Number(t.attrGet('start') ?? 1) : null, items: [], ...span(t)};
        i += 1;
        while (i < tokens.length && tokens[i].type !== close) {
          const item = tokens[i]; // list_item_open
          const [children, next] = walk(i + 1, 'list_item_close');
          list.items.push({line: item.map[0] + 1 + offset, ...span(item), blocks: children});
          i = next;
        }
        out.push(list);
        i += 1;
      } else if (t.type === 'hr') {
        out.push({kind: 'hr', ...span(t)});
        i += 1;
      } else if (t.map && t.nesting >= 0) {
        // Bloque sin render propio (p. ej. tablas): su fuente se muestra literal, como texto.
        let next = i + 1;
        if (t.nesting === 1) {
          let depth = 1;
          while (next < tokens.length && depth > 0) { depth += tokens[next].nesting; next++; }
        }
        out.push({kind: 'raw', lines: srcLines(t), ...span(t)});
        i = next;
      } else {
        i += 1;
      }
    }
    return [out, i];
  }

  return blocks.concat(walk(0, null)[0]);
}

const INLINE_PAIRS = {em_open: 'em', strong_open: 'strong'};

/** Tokens inline de markdown-it -> nodos de datos. El HTML nunca se interpreta: llega como texto. */
export function inlineNodes(children) {
  const root = {children: []};
  const stack = [root];
  const top = () => stack[stack.length - 1];
  for (const c of children || []) {
    const parent = top();
    if (c.type === 'text' || c.type === 'text_special' || c.type === 'html_inline') {
      const last = parent.children[parent.children.length - 1];
      if (last && last.type === 'text') last.text += c.content;
      else parent.children.push({type: 'text', text: c.content});
    } else if (c.type === 'softbreak') {
      parent.children.push({type: 'softbreak'});
    } else if (c.type === 'hardbreak') {
      parent.children.push({type: 'hardbreak'});
    } else if (c.type === 'code_inline') {
      parent.children.push({type: 'code', text: c.content});
    } else if (c.type === 'image') {
      parent.children.push({type: 'std_link', href: c.attrGet('src') ?? '', text: c.content});
    } else if (c.type === 'link_open') {
      const node = {type: 'std_link', href: c.attrGet('href') ?? '', text: '', children: []};
      parent.children.push(node);
      stack.push(node);
    } else if (c.nesting === 1) {
      const node = {type: INLINE_PAIRS[c.type] || 'span', children: []};
      parent.children.push(node);
      stack.push(node);
    } else if (c.nesting === -1) {
      if (stack.length > 1) {
        const node = stack.pop();
        if (node.type === 'std_link') { node.text = inlineText(node.children); delete node.children; }
      }
    } else if (c.content) {
      parent.children.push({type: 'text', text: c.content});
    }
  }
  return root.children;
}

/** Texto plano de un arbol de nodos inline (el texto visible de un enlace estandar). */
export function inlineText(nodes) {
  return (nodes || []).map(n => {
    if (n.type === 'text' || n.type === 'code' || n.type === 'std_link') return n.text;
    if (n.type === 'softbreak' || n.type === 'hardbreak') return ' ';
    return inlineText(n.children);
  }).join('');
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

/**
 * Procedencias de una arista que el documento abierto declara con un campo propio.
 * Cada procedencia lleva `owner`: el documento cuyo campo la declara (lo fija el servidor desde
 * el source del registro de arista). Sin propietario (relation_doc, structural) no hay campo
 * que resaltar. Una arista de otro documento nunca resalta campos del documento abierto.
 */
export function ownedProvenance(edge, docId) {
  if (!docId) return [];
  return (edge?.provenance || []).filter(p => p && p.owner === docId && (p.field || p.source_field));
}

/** Campos (field_path) del documento abierto que declaran la arista: solo los que le pertenecen. */
export function edgeFields(edge, docId) {
  const out = new Set();
  for (const p of ownedProvenance(edge, docId)) {
    if (p.field) out.add(p.field);
    if (p.source_field) out.add(p.source_field);
  }
  return Array.from(out);
}

/** Declaraciones de una arista, de cualquier dueño, para mostrarlas: {owner, field, declared}. */
export function edgeDeclarations(edge) {
  const out = [];
  for (const p of edge?.provenance || []) {
    if (!p || !p.field) continue;
    const d = {owner: p.owner ?? null, field: p.field, declared: p.declared ?? null};
    if (!out.some(x => x.owner === d.owner && x.field === d.field && x.declared === d.declared)) out.push(d);
  }
  return out;
}

export function sectionHighlighted(section, focus) {
  return !!focus && focus.kind === 'section' && !!section && (section.path ?? section.name) === focus.path;
}

/** Campo del documento abierto: por field_path; la referencia de Code fija foco en su campo. */
export function fieldHighlighted(fieldPath, focus, edges = [], docId = '') {
  if (!focus) return false;
  if (focus.kind === 'field') return focus.field_path === fieldPath;
  if (focus.kind === 'reference') return !!docId && focus.doc === docId && focus.field === fieldPath;
  if (focus.kind === 'edge') {
    const edge = edges.find(e => edgeKey(e) === edgeKey(focus));
    return edge ? edgeFields(edge, docId).includes(fieldPath) : false;
  }
  return false;
}

/**
 * Arista resaltada por el foco. Por campo o referencia solo cuentan las procedencias del
 * documento abierto; una referencia exige ademas que la procedencia declare ese mismo valor,
 * de modo que un campo propio que apunta a otro destino no cuenta.
 */
export function edgeHighlighted(edge, focus, docId = '') {
  if (!focus) return false;
  if (focus.kind === 'edge') return edgeKey(edge) === edgeKey(focus);
  if (focus.kind === 'field') return edgeFields(edge, docId).includes(focus.field_path);
  if (focus.kind === 'reference') {
    if (!docId || focus.doc !== docId) return false;
    return ownedProvenance(edge, docId).some(p => p.field === focus.field && p.declared === focus.value);
  }
  return false;
}

export function referenceHighlighted(file, focus, docId = '') {
  if (!focus) return false;
  if (focus.kind === 'reference') return referenceKey(file) === referenceKey(focus);
  if (focus.kind === 'field') return !!docId && file.doc === docId && file.field === focus.field_path;
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
export function correspondence(focus, {sections = [], fields = [], edges = [], files = [], docId = ''} = {}) {
  if (!focus) return null;
  return {
    document: focus.kind === 'section'
      ? sections.filter(s => sectionHighlighted(s, focus)).length
      : fields.filter(f => fieldHighlighted(f.field_path, focus, edges, docId)).length,
    graph: edges.filter(e => edgeHighlighted(e, focus, docId)).length,
    code: files.filter(f => referenceHighlighted(f, focus, docId)).length,
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
