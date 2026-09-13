import {useState, useEffect, useRef} from 'react';
import {html} from '../../../shared/html.js';
import {titleOf, labelFor} from '../../../shared/documents.mjs';
import {classStyle, classVar} from '../../../shared/classes.mjs';

export function ConnectDialog({spec,models,documents,onClose,onApply}) {
  const source=documents.find(d=>d.id===spec.sourceId),target=documents.find(d=>d.id===spec.targetId);
  const descriptor=models.find(m=>m.id===source?.model_name);
  const relationFields=(descriptor?.fields||[]).filter(f=>(descriptor.references||[]).includes(f.name)&&['string','stringlist','list','enumlist'].includes(f.kind));
  const [field,setField]=useState(spec.field||relationFields[0]?.name||'references');
  const ref=useRef(null);
  useEffect(()=>{const d=ref.current;d.showModal();return()=>d.close();},[]);
  return html`<dialog ref=${ref} className="document-dialog connect-dialog" aria-labelledby="connect-title" onCancel=${onClose} onClick=${e=>{if(e.target===ref.current)onClose();}}><form onSubmit=${e=>{e.preventDefault();onApply(source,target,field);}}>
    <header className="dialog-header"><span className="dialog-icon" style=${{'--class-color':classVar(classStyle(source?.model_name).slot)}}>⌁</span><div><span className="eyebrow">Nueva relación</span><h2 id="connect-title">Conectar documentos</h2></div><button type="button" className="icon-button" aria-label="Cerrar conexión" onClick=${onClose}>×</button></header>
    <div className="dialog-body"><div className="connection-card"><strong>${titleOf(source)}</strong><span>→</span><strong>${titleOf(target)}</strong></div>
      ${relationFields.length?html`<label className="form-field"><span>Campo de relación en ${source.model_name}</span><select value=${field} onChange=${e=>setField(e.target.value)}>${relationFields.map(f=>html`<option key=${f.name} value=${f.name}>${labelFor(f.name)} (${f.kind})</option>`)}</select><small>Se guardará el ID de destino en este campo. Las listas conservan las relaciones existentes.</small></label>`:html`<p className="form-error">${source.model_name} no declara un campo donde guardar referencias.</p>`}
    </div><footer className="dialog-footer"><span>La conexión quedará pendiente hasta guardar.</span><button type="button" onClick=${onClose}>Cancelar</button><button className="primary" type="submit" disabled=${!relationFields.length}>Conectar</button></footer>
  </form></dialog>`;
}
