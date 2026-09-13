import {html} from '../shared/html.js';
import {titleOf} from '../shared/documents.mjs';

export function ConflictDialog({conflicts,documents,onClose,onReload}) {
  const local=new Map(documents.map(d=>[d.id,d]));
  return html`<dialog open className="document-dialog conflict-dialog" aria-labelledby="conflict-title"><form onSubmit=${e=>{e.preventDefault();onClose();}}>
    <header className="dialog-header"><span className="dialog-icon" style=${{'--class-color':'var(--danger)'}}>⚠</span><div><span className="eyebrow">Conflicto de guardado</span><h2 id="conflict-title">Otra sesión modificó estos documentos</h2></div><button type="button" className="icon-button" aria-label="Cerrar" onClick=${onClose}>×</button></header>
    <div className="dialog-body"><p className="quick-create-note">El guardado fue rechazado para no pisar el trabajo de otra sesión. El resto del lote quedó sin aplicar. Tus cambios siguen en el mapa; recargar los descarta.</p>
      ${conflicts.map(c=>html`<div key=${c.id} className="conflict-row"><code>${c.id}</code><div><span className="eyebrow">Tu versión</span><strong>${titleOf(local.get(c.id)||{payload:{},id:c.id})||'(eliminado)'}</strong></div><div><span className="eyebrow">Versión actual en SLDB</span><strong>${c.current?titleOf(c.current):'(ya no existe)'}</strong></div></div>`)}
    </div><footer className="dialog-footer"><span>Elige cómo continuar</span><button type="button" onClick=${onReload}>Descartar mis cambios y recargar</button><button className="primary" type="submit">Mantener mis cambios</button></footer>
  </form></dialog>`;
}
