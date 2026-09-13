import {useState,useEffect,useMemo} from 'react';
import {html} from './shared/html.js';
import {newIdea,IDEA_EMOJIS} from './source/draft.mjs';
import {classStyle,classVar} from './shared/classes.mjs';

export function BrainstormView({draft,models,documents,onExit,onImported}) {
  const {ideas,update,pending,issues,convert,discard:discardDraft}=draft;
  const modelsList=models.models;
  const [selected,setSelected]=useState(null),[editingId,setEditingId]=useState(null),[busy,setBusy]=useState(false);
  const [message,setMessage]=useState(''),[failed,setFailed]=useState(false),[report,setReport]=useState(null);
  const childrenOf=useMemo(()=>{
    const children={};ideas.forEach(i=>children[i.parentId||'root']=[]);
    ideas.forEach(i=>children[i.parentId||'root'].push(i.id));
    return children;},[ideas]);
  const byId=useMemo(()=>new Map(ideas.map(i=>[i.id,i])),[ideas]);
  const addIdea=(parentId,className)=>{
    const idea=newIdea(ideas,parentId,className);
    update(list=>[...list,idea]);setSelected(idea.id);setEditingId(idea.id);setMessage('');setReport(null);
    return idea.id;};
  useEffect(()=>{const key=e=>{
    if(busy||e.target.closest('input,select,textarea,button'))return;
    if(e.key==='Escape'){setSelected(null);setEditingId(null);}
    if(e.key==='Enter'&&selected&&!editingId){e.preventDefault();addIdea(byId.get(selected)?.parentId||null,byId.get(selected)?.className);}
    if(e.key==='Tab'&&selected){e.preventDefault();addIdea(selected,byId.get(selected)?.className);}
  };window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);});
  const change=(id,patch)=>update(list=>list.map(i=>i.id===id?{...i,...patch}:i));
  const del=id=>{const doomed=new Set([id]);
    for(let previous=0;doomed.size>previous;){previous=doomed.size;
      ideas.forEach(i=>{if(doomed.has(i.parentId))doomed.add(i.id);});}
    update(list=>list.filter(i=>!doomed.has(i.id)));
    if(doomed.has(selected)){setSelected(null);setEditingId(null);}};
  const runConvert=async()=>{
    setBusy(true);setFailed(false);setMessage('');setReport(null);
    const result=await convert();
    setBusy(false);
    if(!result.ok&&!result.report){setFailed(true);setMessage('No hay ideas convertibles: falta título o clase.');return;}
    if(!result.ok&&result.report.applicable===false){setReport(result.report);setFailed(true);setMessage('SLDB rechazó el plan: revisa el reporte. Nada se escribió.');return;}
    if(!result.ok){setFailed(true);setReport(result.report);setMessage(result.error||'No se completó la conversión.');return;}
    setReport(result.report);setMessage(`Conversión completa: ${Object.keys(result.docIds).length} documento(s) creados en SLDB. Recargando la KB…`);
    onImported();
  };
  const discard=()=>{if(confirm('¿Descartar el borrador de Brainstorm? Se perderán las ideas sin convertir.')){discardDraft();setSelected(null);setEditingId(null);setMessage('Borrador descartado.');setReport(null);}};
  const renderTree=(parentId,depth)=>childrenOf[parentId||'root'].map(id=>{
    const idea=byId.get(id);
    return html`<div key=${id} className="idea-branch" style=${{'--depth':depth}}>
      <div className=${'idea-node'+(selected===id?' selected':'')+(idea.convertedDocId?' converted':'')}
        style=${idea.slot?{'--idea-color':classVar(idea.slot)}:{}} data-idea=${id}
        onClick=${e=>{e.stopPropagation();setSelected(id);}}
        onDoubleClick=${()=>{setEditingId(id);setSelected(id);}}>
        <button className="idea-cycle nodrag" title="Cambiar emoji" onClick=${e=>{e.stopPropagation();
          change(id,{emoji:IDEA_EMOJIS[(IDEA_EMOJIS.indexOf(idea.emoji)+1)%IDEA_EMOJIS.length]});}}>${idea.emoji||'💡'}</button>
        ${editingId===id?html`<input ...${{className:'idea-input',autoFocus:true,value:idea.title,
            placeholder:'Título de la idea…',
            onInput:e=>change(id,{title:e.target.value}),
            onKeyDown:e=>{if(e.key==='Enter'||e.key==='Escape'){e.preventDefault();setEditingId(null);}},
            onBlur:()=>setEditingId(null)}}/>`
          :html`<span className="idea-title">${idea.title||'(sin título)'}</span>`}
        <select className="idea-class nodrag" value=${idea.className||''}
          onClick=${e=>e.stopPropagation()}
          onChange=${e=>change(id,{className:e.target.value||null})} aria-label="Clase de la idea">
          <option value="">Clase…</option>
          ${modelsList.map(m=>html`<option key=${m.id} value=${m.id}>${classStyle(m.id).icon} ${classStyle(m.id).name}</option>`)}
        </select>
        ${idea.convertedDocId?html`<span className="idea-badge" title=${'Convertido: '+idea.convertedDocId}>✓</span>`:''}
        <button className="idea-delete nodrag" aria-label=${'Descartar '+(idea.title||'idea')} title="Descartar idea"
          onClick=${e=>{e.stopPropagation();del(id);}}>×</button>
      </div>
      ${childrenOf[id]?.length?html`<div className="idea-children">${renderTree(id,depth+1)}</div>`:''}
    </div>`;});
  return html`<div className="brainstorm" aria-label="Captura rápida Brainstorm" onClick=${()=>{setSelected(null);setEditingId(null);}}>
    <div className="brainstorm-bar">
      <span className="brainstorm-hint"><kbd>Enter</kbd> hermano · <kbd>Tab</kbd> hijo · doble clic renombra · la jerarquía es contención</span>
      <span className=${'brainstorm-count'+(pending?' pending':'')}>${ideas.length} ideas · ${pending} sin convertir</span>
      <button onClick=${discard} disabled=${busy||!ideas.length}>Descartar borrador</button>
      <button className="primary" onClick=${runConvert} disabled=${busy||!pending} title=${issues.length?issues.length+' ideas necesitan título y clase':''}>
        ${busy?'Convirtiendo…':'Convertir a SLDB'}</button>
    </div>
    ${issues.length?html`<p className="form-error" role="alert">${issues.length} idea(s) sin convertir necesitan título y clase: no se convertirán.</p>`:''}
    ${message?html`<p className=${failed?'form-error':'compiler-message'} role=${failed?'alert':'status'}>${message}</p>`:''}
    ${report?html`<pre className="compiler-report" aria-label="Reporte de conversión">${JSON.stringify(report,null,2)}</pre>`:''}
    <div className="brainstorm-canvas">
      ${ideas.length?renderTree(null,0):html`<div className="state"><h2>Captura tus primeras ideas</h2>
        <button className="primary" onClick=${e=>{e.stopPropagation();addIdea(null);}}>＋ Primera idea</button></div>`}
      ${ideas.length?html`<button className="add-idea" onClick=${e=>{e.stopPropagation();addIdea(null);}}>＋ Idea raíz</button>`:''}
    </div>
  </div>`;
}
