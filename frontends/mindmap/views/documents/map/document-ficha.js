import {useState, useEffect} from 'react';
import {html} from '../../../shared/html.js';
import {request} from '../../../shell/api.js';
import {classStyle} from '../../../shared/classes.mjs';
import {irSectionsWithCleanMeta, irFields, irMeta} from '../../../shared/document-ir.mjs';

function SpanBadge({span}) {
  if (!span) return html``;
  return html`<code className="ficha-span" title="Líneas en el documento original">L${span.line_start ?? '?'}–${span.line_end ?? '?'}</code>`;
}

function Section({section, depth}) {
  return html`<li className="ficha-section" style=${{paddingLeft: depth * 14}} data-section=${section.name}>
    <span className="ficha-section-title">${section.title}</span>
    <${SpanBadge} span=${section.span}/>
    ${section.children?.length ? html`<ul className="ficha-sections">${section.children.map(c => html`<${Section} key=${c.name} section=${c} depth=${depth + 1}/>`)}</ul>` : ''}
  </li>`;
}

function FieldRow({field}) {
  const value = typeof field.value === 'object' && field.value !== null
    ? JSON.stringify(field.value, null, 2)
    : String(field.value ?? '—');
  return html`<tr className="ficha-field-row" data-field=${field.field_path}>
    <td><code>${field.field_path}</code></td>
    <td><pre className="ficha-field-value">${value}</pre></td>
    <td><${SpanBadge} span=${field.span}/></td>
  </tr>`;
}

// Ficha de documento desde el IR de sldb serve (GET /api/document?id=…):
// renderiza secciones reales (structure) y campos (nodes con field_path),
// nunca el markdown crudo. Solo lectura; la edición sigue en el formulario
// del diálogo. Si el IR no trae spans, no se inventan (SpanBadge no pinta).
export function DocumentFicha({doc, payload}) {
  const [state, setState] = useState({status: 'loading', ir: null, error: ''});
  useEffect(() => {
    let alive = true;
    setState({status: 'loading', ir: null, error: ''});
    request('/api/document?id=' + encodeURIComponent(doc.id))
      .then(d => { if (alive) setState({status: 'ready', ir: d.ir ?? {}, error: ''}); })
      .catch(e => { if (alive) setState({status: 'error', ir: null, error: e.message}); });
    return () => { alive = false; };
  }, [doc.id]);

  if (state.status === 'loading') return html`<p className="ficha-note">Leyendo el documento desde SLDB…</p>`;
  if (state.status === 'error') return html`<p className="form-error" role="alert">No se pudo leer el IR: ${state.error}</p>`;

  const sections = irSectionsWithCleanMeta(state.ir);
  const fields = irFields(state.ir, payload);
  const meta = irMeta(state.ir, doc);
  const style = classStyle(meta.model_name);
  return html`<div className="ficha" aria-label="Ficha del documento">
    <div className="ficha-meta"><span className="ficha-icon">${style.icon}</span>
      <span>${style.name}</span><code className="ficha-id">${doc.id}</code>
      ${meta.path ? html`<code className="ficha-path">${meta.path}</code>` : ''}
    </div>
    ${sections.length ? html`<section><h4 className="ficha-heading">Secciones</h4><ul className="ficha-sections">
      ${sections.map(s => html`<${Section} key=${s.name} section=${s} depth=${0}/>`)}
    </ul></section>` : ''}
    ${fields.length ? html`<section><h4 className="ficha-heading">Campos</h4>
      <table className="ficha-fields"><tbody>${fields.map(f => html`<${FieldRow} key=${f.field_path} field=${f}/>`)}</tbody></table>
    </section>` : html`<p className="ficha-note">El documento no tiene campos en el IR.</p>`}
  </div>`;
}