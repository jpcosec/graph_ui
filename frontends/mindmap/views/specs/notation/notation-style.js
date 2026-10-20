// Piezas visuales del estilo de notación (contrato §13): ícono lucide, contorno de forma y leyenda.
import {useEffect, useState} from 'react';
import {html} from '../../../shared/html.js';
import {OUTLINES, OUTLINE_SHAPES, glyphVars, iconKey, themed} from './notation-style.mjs';
import {TERMINALS, dash} from './notation.mjs';

// La punta de un extremo, con el mismo <marker> que usa el diagrama (TerminalDefs).
const marker = end => (TERMINALS.includes(end) ? `url(#nv-${end})` : undefined);

let lucide = null;
const loadLucide = () => (lucide ||= import('lucide').then(m => m.icons || m.default?.icons || {}));

// Íconos de lucide 0.577.0 (el set que declara la paleta): se cargan una vez por CDN.
export function useIcons(names) {
  const [icons, setIcons] = useState(null);
  const wanted = names.filter(Boolean).length;
  useEffect(() => { if (wanted && !icons) loadLucide().then(setIcons); }, [wanted, icons]);
  return icons;
}

function iconChildren(node) {
  // lucide >= 0.4: [[tag, attrs], ...]; versiones viejas: ['svg', attrs, children].
  const list = Array.isArray(node) && node[0] === 'svg' ? node[2] : node;
  return (list || []).map(([tag, attrs], i) => html`<${tag} key=${i} ...${attrs}/>`);
}

export function GlyphIcon({icons, name, size = 15}) {
  const node = icons && name ? icons[iconKey(name)] : null;
  if (!node) return name ? html`<span className="glyph-icon is-pending" data-icon=${name} aria-hidden="true"></span>` : '';
  return html`<svg className="glyph-icon" data-icon=${name} width=${size} height=${size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">${iconChildren(node)}</svg>`;
}

export function ShapeOutline({shape}) {
  if (!OUTLINE_SHAPES.includes(shape)) return '';
  return html`<svg className="glyph-outline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <path d=${OUTLINES[shape]} vectorEffect="non-scaling-stroke"/></svg>`;
}

// Leyenda de la notación (legend del resolver, ya resuelta): glifo -> forma, color, ícono, rótulo;
// relación -> trazo y color; kinds con estilo del spec o de la paleta.
export function NotationLegend({legend, skin, ink, notation}) {
  const glyphs = legend?.glyphs || [], links = legend?.links || [], kinds = legend?.kinds || [];
  const icons = useIcons([...glyphs.map(g => g.style?.icon), ...kinds.map(k => k.icon)]);
  if (!glyphs.length && !links.length && !kinds.length) return '';
  const swatch = (shape, style) => html`<span className=${'legend-swatch glyph shape-' + shape} style=${glyphVars(style, skin, ink)}>
      <${ShapeOutline} shape=${shape}/></span>`;
  return html`<section className="notation-legend" aria-label="Leyenda de la notación" data-notation=${notation}>
    <h3>Leyenda · ${String(notation || '').replace(/^NotationDoc:/, '')}</h3>
    <ul>${glyphs.map(g => html`<li key=${g.glyph} className="legend-glyph" data-glyph=${g.glyph} data-shape=${g.shape}
        data-fill=${themed(g.style?.fill, skin) || ''} data-stroke=${themed(g.style?.stroke, skin) || ''} data-icon=${g.style?.icon || ''}>
      ${swatch(g.shape, g.style)}<${GlyphIcon} icons=${icons} name=${g.style?.icon}/><span className="legend-title">${g.title}</span><small>${g.shape}</small></li>`)}
    ${kinds.map(k => html`<li key=${'kind:' + k.kind} className="legend-kind" data-kind=${k.kind} data-fill=${themed(k.fill, skin) || ''}>
      ${swatch(k.shape || 'box', k)}<${GlyphIcon} icons=${icons} name=${k.icon}/><span className="legend-title">${k.kind}</span><small>kind</small></li>`)}
    ${links.map(l => html`<li key=${l.link} className="legend-link" data-link=${l.link} data-color=${themed(l.color, skin) || ''}>
      <svg className="legend-line" width="34" height="14" aria-hidden="true"><line x1="3" y1="7" x2="31" y2="7"
        style=${{stroke: themed(l.color, skin) || 'var(--edge)'}} strokeDasharray=${dash(l.line)}
        markerStart=${marker(l.source_end)} markerEnd=${marker(l.target_end)}/></svg>
      <span className="legend-title">${l.title}</span><small>${l.relation === '*' ? 'cualquier relación' : l.relation}</small></li>`)}</ul>
  </section>`;
}
