import {useState, useEffect, useRef} from 'react';
import {html} from '../../../shared/html.js';
import {titleOf, defaultsFor, quickPayload, slugify, searchDocuments, referenceFieldsOf, labelFor, isList} from '../../../shared/documents.mjs';
import {classStyle, classVar} from '../../../shared/classes.mjs';

export function ReferenceField({field,value,documents,onChange}) {
  // Referencias: búsqueda de documentos reales, nunca IDs inventados.
  const multi=['stringlist','list','enumlist'].includes(field.kind);
  const list=Array.isArray(value)?value:(value?[value]:[]);
  const [query,setQuery]=useState('');
  const matches=searchDocuments(documents.filter(d=>!list.includes(d.id)),query,8);
  const add=id=>{if(!id)return;onChange(multi?[...list,id]:id);setQuery('');};
  const remove=id=>onChange(multi?list.filter(x=>x!==id):'');
  return html`<div className="form-field reference-field" data-field=${field.name}><span>${labelFor(field.name)} ${field.required?html`<b aria-label="obligatorio">*</b>`:''}</span>
    <div className="reference-chips">${list.map(id=>{const doc=documents.find(d=>d.id===id)||{id,model_name:'?'};return html`<span key=${id} className="reference-chip" title=${doc.id}>${classStyle(doc.model_name).icon} ${titleOf(doc)}<button type="button" aria-label=${'Quitar '+id} onClick=${()=>remove(id)}>×</button></span>`})}${multi||!list.length?html`<input list="ref-docs-${field.name}" value=${query} placeholder="Buscar documento…" onInput=${e=>setQuery(e.target.value)} onKeyDown=${e=>{if(e.key==='Enter'){e.preventDefault();add(matches[0]?.id);}}}/>`:html`<button type="button" className="reference-swap" onClick=${()=>remove(list[0])}>Cambiar…</button>`}</div>
    ${matches.length?html`<div className="reference-matches" role="listbox" aria-label="Documentos encontrados">${matches.map(m=>html`<button type="button" key=${m.id} role="option" aria-selected="false" onClick=${()=>add(m.id)}><span>${classStyle(m.model_name).icon}</span><span className="reference-match-title">${m.title}</span><code>${m.id}</code></button>`)}</div>`:query?html`<small>Sin coincidencias para «${query}»</small>`:''}
    <small>Se guarda el ID del documento en ${labelFor(field.name)}.</small>
  </div>`;
}
export function Field({field,value,onChange,isNew}) {
  const id='field-'+field.name;
  const common={id,required:field.required&&!isNew,'data-field':field.name};
  const text=typeof value==='object'?JSON.stringify(value,null,2):String(value??'');
  return html`<label className="form-field" htmlFor=${id}><span>${labelFor(field.name)} ${field.required?html`<b aria-label="obligatorio">*</b>`:''}</span>
    ${field.kind==='enum'?html`<select ...${common} value=${value??''} onChange=${e=>onChange(e.target.value)}><option value="">Seleccionar…</option>${field.enum.map(v=>html`<option key=${v} value=${v}>${v}</option>`)}</select>`:
      field.kind==='boolean'?html`<select ...${common} value=${String(value??false)} onChange=${e=>onChange(e.target.value==='true')}><option value="false">No</option><option value="true">Sí</option></select>`:
      field.name==='id'?html`<input ...${common} value=${value||''} readOnly=${!isNew} onInput=${e=>onChange(e.target.value)}/>`:
      isList(field)&&field.kind==='stringlist'?html`<textarea ...${common} rows="3" value=${Array.isArray(value)?value.join('\n'):value||''} onInput=${e=>onChange(e.target.value.split('\n'))}/><small>Un valor por línea</small>`:
      html`<textarea ...${common} rows=${['title','name'].includes(field.name)?2:3} value=${text} onInput=${e=>onChange(e.target.value)}/>`}
    ${['object','list','enumlist'].includes(field.kind)?html`<small>Formato JSON</small>`:''}
  </label>`;
}
export function DocumentDialog({spec,models,documents,onClose,onApply}) {
  const existing=spec.id?documents.find(d=>d.id===spec.id):null;
  const [model,setModel]=useState(existing?.model_name||spec.model||models[0]?.id);
  const [values,setValues]=useState(existing?.payload||defaultsFor(models.find(m=>m.id===existing?.model_name||m.id===spec.model)||models[0])),[error,setError]=useState('');
  const ref=useRef(null),newId=useRef('mm-'+crypto.randomUUID()),isNew=!existing;
  const descriptor=models.find(m=>m.id===model),style=classStyle(model);
  const refFields=referenceFieldsOf(descriptor);
  const selectedOption=spec.options?.find(o=>o.model===model);
  const parent=documents.find(d=>d.id===spec.parentId);
  useEffect(()=>{const d=ref.current;d.showModal();return()=>d.close();},[]);
  const fields=(descriptor?.fields||[]).filter(f=>f.name!=='id');
  const requiredFields=fields.filter(f=>f.required||['title','name'].includes(f.name));
  const primary=isNew?(fields.filter(f=>['title','name'].includes(f.name)).length?fields.filter(f=>['title','name'].includes(f.name)):requiredFields.slice(0,1)):requiredFields;
  const secondary=fields.filter(f=>!primary.includes(f));
  const change=(key,value)=>setValues(v=>({...v,[key]:value,...(isNew&&key==='title'&&(!v.id||v.id.startsWith('nuevo-'))?{id:slugify(value)}:{})}));
  const changeModel=next=>{setModel(next);setValues(defaultsFor(models.find(m=>m.id===next)));setError('');};
  const submit=e=>{
    e.preventDefault();
    try {
      const payload={...values};
      if(isNew&&!payload.id)payload.id=slugify(payload.title||payload.name);
      for(const f of descriptor.fields) {
        if(f.name==='id'){payload.id=existing?.payload.id||newId.current;continue;}
        if(payload[f.name]===undefined)continue;
        if(['object','list','enumlist'].includes(f.kind)&&typeof payload[f.name]==='string')payload[f.name]=payload[f.name].trim()?JSON.parse(payload[f.name]):(f.kind==='object'?{}:[]);
        if(f.kind==='stringlist'&&!refFields.has(f.name))payload[f.name]=payload[f.name].map(v=>v.trim()).filter(Boolean);
        if(['integer','number'].includes(f.kind))payload[f.name]=Number(payload[f.name]);
      }
      // Validación client-side contra el schema real: requeridos y enums.
      const missing=descriptor.fields.filter(f=>f.required&&(['stringlist','list','enumlist'].includes(f.kind)?!payload[f.name]?.length:(payload[f.name]===''||payload[f.name]==null))&&f.name!=='id');
      if(missing.length)return setError('Faltan campos obligatorios: '+missing.map(f=>labelFor(f.name)).join(', ')+'.');
      const badEnum=descriptor.fields.find(f=>f.enum&&payload[f.name]!==''&&payload[f.name]!=null&&!f.enum.includes(payload[f.name]));
      if(badEnum)return setError(labelFor(badEnum.name)+` debe ser uno de: ${badEnum.enum.join(', ')}.`);
      const doc={...(existing||{}),id:existing?.id||newId.current,model_name:model,payload};
      onApply(doc,selectedOption?.field||spec.field);
    } catch(e){setError('Revisa los campos JSON: '+e.message);}
  };
  return html`<dialog ref=${ref} className="document-dialog" aria-labelledby="dialog-title" onCancel=${onClose} onClick=${e=>{if(e.target===ref.current)onClose();}}><form onSubmit=${submit}>
    <header className="dialog-header"><span className="dialog-icon" style=${{'--class-color':classVar(style.slot)}}>${style.icon}</span><div><span className="eyebrow">${existing?'Editar documento':spec.parentId?'Nuevo hijo':'Nuevo documento'}</span><h2 id="dialog-title">${existing?titleOf(existing):'Añadir a la KB'}</h2></div><button type="button" className="icon-button" aria-label="Cerrar ficha" onClick=${onClose}>×</button></header>
    <div className="dialog-body">
      ${parent?html`<div className="parent-note">Dentro de <strong>${titleOf(parent)}</strong> · <code>${selectedOption?.field||spec.field}</code></div>`:''}
      <div className="form-field"><span>Clase de documento</span><div className="class-picker">${models.filter(m=>!spec.options||spec.options.some(o=>o.model===m.id)).map(m=>{const s=classStyle(m.id);return html`<button type="button" key=${m.id} className=${'class-choice'+(model===m.id?' selected':'')} style=${{'--class-color':classVar(s.slot)}} disabled=${!isNew} onClick=${()=>changeModel(m.id)}><span>${s.icon}</span>${s.name}</button>`})}</div></div>
      <div className="quick-create-note">${isNew?'Alta rápida: solo necesitas el título. Los demás campos parten vacíos y puedes completarlos después desde Editar.':'Los campos esenciales aparecen primero. El resto está en «Más campos».'}</div>
      ${primary.map(f=>refFields.has(f.name)?html`<${ReferenceField} key=${model+f.name} field=${f} value=${values[f.name]} documents=${documents} onChange=${v=>change(f.name,v)}/>`:html`<${Field} key=${model+f.name} field=${f} value=${values[f.name]} onChange=${v=>change(f.name,v)} isNew=${isNew}/>`) }
      ${secondary.length?html`<details><summary>Más campos (${secondary.length})</summary>${secondary.map(f=>refFields.has(f.name)?html`<${ReferenceField} key=${model+f.name} field=${f} value=${values[f.name]} documents=${documents} onChange=${v=>change(f.name,v)}/>`:html`<${Field} key=${model+f.name} field=${f} value=${values[f.name]} onChange=${v=>change(f.name,v)} isNew=${isNew}/>`)}</details>`:''}
      <div className="doc-meta"><span>ID</span><code>${existing?.id||newId.current}</code>${existing?.path?html`<span>Archivo</span><code>${existing.path}</code>`:''}</div>
      ${error?html`<p className="form-error" role="alert">${error}</p>`:''}
    </div><footer className="dialog-footer"><span>* Campos obligatorios del modelo</span><button type="button" onClick=${onClose}>Cancelar</button><button className="primary" type="submit">${existing?'Aplicar cambios':'Añadir documento'}</button></footer>
  </form></dialog>`;
}
