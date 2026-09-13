import {useState, useEffect, useRef} from 'react';
import {html} from '../../../shared/html.js';
import {titleOf, quickPayload, slugify} from '../../../shared/documents.mjs';
import {classStyle, classVar} from '../../../shared/classes.mjs';

export function QuickCreateDialog({spec,models,documents,onClose,onApply}) {
  const parent=documents.find(d=>d.id===spec.parentId);
  const choices=models.filter(m=>!spec.options||spec.options.some(o=>o.model===m.id));
  const [model,setModel]=useState(spec.model&&choices.some(m=>m.id===spec.model)?spec.model:choices[0]?.id);
  const [title,setTitle]=useState('');
  const [error,setError]=useState('');
  const inputRef=useRef(null),ref=useRef(null);
  const descriptor=models.find(m=>m.id===model),style=classStyle(model);
  const option=spec.options?.find(o=>o.model===model);
  useEffect(()=>{const d=ref.current;d.showModal();inputRef.current?.focus();return()=>d.close();},[]);
  const create=()=>{
    if(!descriptor)return setError('No hay clases disponibles.');
    const id=slugify(title)||'nuevo-'+crypto.randomUUID().slice(0,8);
    if(documents.some(d=>d.id===id))return setError(`Ya existe el documento ${id}; cambia el título.`);
    onApply({id,model_name:model,payload:quickPayload(descriptor,title,id)},option?.field||spec.field);
  };
  return html`<dialog ref=${ref} className="document-dialog quick-create" aria-labelledby="quick-title" onCancel=${onClose} onClick=${e=>{if(e.target===ref.current)onClose();}}><form onSubmit=${e=>{e.preventDefault();create();}}>
    <header className="dialog-header"><span className="dialog-icon" style=${{'--class-color':classVar(style.slot)}}>${style.icon}</span><div><span className="eyebrow">Captura rápida</span><h2 id="quick-title">${parent?'Dentro de '+titleOf(parent):spec.sibling?'Nuevo hermano':'Nuevo documento'}</h2></div><button type="button" className="icon-button" aria-label="Cerrar captura" onClick=${onClose}>×</button></header>
    <div className="dialog-body">
      ${parent?html`<div className="parent-note">${titleOf(parent)} · <code>${option?.field||spec.field}</code></div>`:''}
      <div className="form-field"><span>Clase</span><div className="class-picker">${choices.map(m=>{const s=classStyle(m.id);return html`<button type="button" key=${m.id} className=${'class-choice'+(model===m.id?' selected':'')} style=${{'--class-color':classVar(s.slot)}} onClick=${()=>setModel(m.id)}><span>${s.icon}</span>${s.name}</button>`})}</div></div>
      <label className="form-field" htmlFor="quick-title-input"><span>Título</span><input id="quick-title-input" ref=${inputRef} value=${title} placeholder="Escribe el título y pulsa Enter…" onInput=${e=>{setTitle(e.target.value);setError('');}} required/></label>
      ${error?html`<p className="form-error" role="alert">${error}</p>`:''}
      <p className="quick-create-note">Los demás campos parten con defaults válidos; complétalos después con ✎ Editar.</p>
    </div><footer className="dialog-footer"><span>Enter crea · Escape cancela</span><button type="button" onClick=${onClose}>Cancelar</button><button className="primary" type="submit">Añadir</button></footer>
  </form></dialog>`;
}
