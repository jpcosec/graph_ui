import React,{useState,useEffect,useMemo,useRef,useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {ReactFlow,ReactFlowProvider,Controls,MiniMap,Handle,Position,NodeToolbar,useReactFlow,applyNodeChanges} from '@xyflow/react';
import htm from 'htm';
import {classStyle,readingViewport,titleOf,project,childOptions,appendChild,removeDocument,changesBetween,hierarchy,REFERENCE_FIELDS} from './model.mjs';
const html=htm.bind(React.createElement);

function DocumentNode({data,selected}) {
  const style=classStyle(data.doc.model_name);
  return html`<div className=${'document-node'+(data.group?' container-node':'')+(selected?' selected':'')} style=${{'--class-color':style.color}}>
    <${NodeToolbar} isVisible=${selected} position=${Position.Top} offset=${12}>
      <div className="node-toolbar" role="toolbar" aria-label="Acciones del nodo">
        <button onClick=${()=>data.actions.addChild(data.doc.id)} disabled=${!data.canChild} title=${data.canChild?'Añadir hijo (Tab)':'Esta clase no tiene campos de contención'}>＋ Hijo</button>
        <button onClick=${()=>data.actions.addSibling(data.doc.id)} title="Añadir hermano (Enter)">＋ Hermano</button>
        ${data.group?html`<button onClick=${()=>data.actions.focus(data.doc.id)} title="Entrar al contenedor">↳ Entrar</button>`:''}
        <button onClick=${()=>data.actions.connect(data.doc.id)} className=${data.connecting?'connect-active':''} title="Conectar con otro documento">⌁ Conectar</button>
        <span></span><button onClick=${()=>data.actions.edit(data.doc.id)}>✎ Editar</button>
        <button aria-label="Quitar documento" title="Quitar de la KB al guardar; conserva el archivo" onClick=${()=>data.actions.remove(data.doc.id)}>⌫</button>
      </div>
    </${NodeToolbar}>
    <${Handle} type="target" position=${Position.Left}/>
    <div className="node-heading"><span className="node-icon" title=${data.doc.model_name}>${style.icon}</span><span className="node-title" title=${titleOf(data.doc)}>${titleOf(data.doc)}</span>
      ${data.count?html`<button className="collapse nodrag" aria-label=${data.collapsed?'Expandir contenido':'Plegar contenido'} onClick=${e=>{e.stopPropagation();data.actions.toggle(data.doc.id);}}>${data.collapsed?'▸':'▾'} <small>${data.count}</small></button>`:''}
    </div>
    <${Handle} type="source" position=${Position.Right}/>
  </div>`;
}
const nodeTypes={document:DocumentNode};
const labelFor=field=>({title:'Título',name:'Nombre',body:'Contenido',status:'Estado',goal:'Objetivo',scope:'Alcance',purpose:'Propósito',implementation_path:'Ruta de implementación',done_when:'Criterio de término',entrypoint:'Nodo de entrada',source:'Origen',target:'Destino',subject:'Sujeto',predicate:'Condición',answer:'Respuesta',summary:'Resumen'}[field]||field.replaceAll('_',' '));
const isList=field=>['stringlist','enumlist','list'].includes(field.kind);
const slugify=value=>String(value||'nuevo-documento').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,100)||'nuevo-documento';
const defaultsFor=model=>Object.fromEntries((model?.fields||[]).map(f=>[f.name,f.name==='id'?`nuevo-${crypto.randomUUID().slice(0,8)}`:f.name==='status'?'active':f.kind==='stringlist'||f.kind==='list'||f.kind==='enumlist'?[]:f.kind==='boolean'?false:f.kind==='object'?{}:'']));
function Field({field,value,onChange,isNew}) {
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
function DocumentDialog({spec,models,documents,onClose,onApply}) {
  const existing=spec.id?documents.find(d=>d.id===spec.id):null;
  const [model,setModel]=useState(existing?.model_name||spec.model||models[0]?.id);
  const [values,setValues]=useState(existing?.payload||defaultsFor(models.find(m=>m.id===existing?.model_name||m.id===spec.model)||models[0])),[error,setError]=useState('');
  const ref=useRef(null),newId=useRef('mm-'+crypto.randomUUID()),isNew=!existing;
  const descriptor=models.find(m=>m.id===model),style=classStyle(model);
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
        if(f.kind==='stringlist')payload[f.name]=payload[f.name].map(v=>v.trim()).filter(Boolean);
        if(['integer','number'].includes(f.kind))payload[f.name]=Number(payload[f.name]);
      }
      const doc={...(existing||{}),id:existing?.id||newId.current,model_name:model,payload};
      onApply(doc,selectedOption?.field||spec.field);
    } catch(e){setError('Revisa los campos JSON: '+e.message);}
  };
  return html`<dialog ref=${ref} className="document-dialog" aria-labelledby="dialog-title" onCancel=${onClose} onClick=${e=>{if(e.target===ref.current)onClose();}}><form onSubmit=${submit}>
    <header className="dialog-header"><span className="dialog-icon" style=${{'--class-color':style.color}}>${style.icon}</span><div><span className="eyebrow">${existing?'Editar documento':spec.parentId?'Nuevo hijo':'Nuevo documento'}</span><h2 id="dialog-title">${existing?titleOf(existing):'Añadir a la KB'}</h2></div><button type="button" className="icon-button" aria-label="Cerrar ficha" onClick=${onClose}>×</button></header>
    <div className="dialog-body">
      ${parent?html`<div className="parent-note">Dentro de <strong>${titleOf(parent)}</strong> · <code>${selectedOption?.field||spec.field}</code></div>`:''}
      <div className="form-field"><span>Clase de documento</span><div className="class-picker">${models.filter(m=>!spec.options||spec.options.some(o=>o.model===m.id)).map(m=>{const s=classStyle(m.id);return html`<button type="button" key=${m.id} className=${'class-choice'+(model===m.id?' selected':'')} style=${{'--class-color':s.color}} disabled=${!isNew} onClick=${()=>changeModel(m.id)}><span>${s.icon}</span>${s.name}</button>`})}</div></div>
      <div className="quick-create-note">${isNew?'Alta rápida: solo necesitas el título. Los demás campos parten vacíos y puedes completarlos después desde Editar.':'Los campos esenciales aparecen primero. El resto está en «Más campos».'}</div>
      ${primary.map(f=>html`<${Field} key=${model+f.name} field=${f} value=${values[f.name]} onChange=${v=>change(f.name,v)} isNew=${isNew}/>`)}
      ${secondary.length?html`<details><summary>Más campos (${secondary.length})</summary>${secondary.map(f=>html`<${Field} key=${model+f.name} field=${f} value=${values[f.name]} onChange=${v=>change(f.name,v)} isNew=${isNew}/>` )}</details>`:''}
      <div className="doc-meta"><span>ID</span><code>${existing?.id||newId.current}</code>${existing?.path?html`<span>Archivo</span><code>${existing.path}</code>`:''}</div>
      ${error?html`<p className="form-error" role="alert">${error}</p>`:''}
    </div><footer className="dialog-footer"><span>* Campos obligatorios del modelo</span><button type="button" onClick=${onClose}>Cancelar</button><button className="primary" type="submit">${existing?'Aplicar cambios':'Añadir documento'}</button></footer>
  </form></dialog>`;
}

function ConnectDialog({spec,models,documents,onClose,onApply}) {
  const source=documents.find(d=>d.id===spec.sourceId),target=documents.find(d=>d.id===spec.targetId);
  const descriptor=models.find(m=>m.id===source?.model_name);
  const relationFields=(descriptor?.fields||[]).filter(f=>REFERENCE_FIELDS.has(f.name)&&['string','stringlist','list','enumlist'].includes(f.kind));
  const [field,setField]=useState(spec.field||relationFields[0]?.name||'references');
  const ref=useRef(null);
  useEffect(()=>{const d=ref.current;d.showModal();return()=>d.close();},[]);
  return html`<dialog ref=${ref} className="document-dialog connect-dialog" aria-labelledby="connect-title" onCancel=${onClose} onClick=${e=>{if(e.target===ref.current)onClose();}}><form onSubmit=${e=>{e.preventDefault();onApply(source,target,field);}}>
    <header className="dialog-header"><span className="dialog-icon" style=${{'--class-color':classStyle(source?.model_name).color}}>⌁</span><div><span className="eyebrow">Nueva relación</span><h2 id="connect-title">Conectar documentos</h2></div><button type="button" className="icon-button" aria-label="Cerrar conexión" onClick=${onClose}>×</button></header>
    <div className="dialog-body"><div className="connection-card"><strong>${titleOf(source)}</strong><span>→</span><strong>${titleOf(target)}</strong></div>
      ${relationFields.length?html`<label className="form-field"><span>Campo de relación en ${source.model_name}</span><select value=${field} onChange=${e=>setField(e.target.value)}>${relationFields.map(f=>html`<option key=${f.name} value=${f.name}>${labelFor(f.name)} (${f.kind})</option>`)}</select><small>Se guardará el ID de destino en este campo. Las listas conservan las relaciones existentes.</small></label>`:html`<p className="form-error">${source.model_name} no declara un campo donde guardar referencias.</p>`}
    </div><footer className="dialog-footer"><span>La conexión quedará pendiente hasta guardar.</span><button type="button" onClick=${onClose}>Cancelar</button><button className="primary" type="submit" disabled=${!relationFields.length}>Conectar</button></footer>
  </form></dialog>`;
}

async function request(path,init) {
  const response=await fetch(path,{...init,signal:AbortSignal.timeout(60000)});
  const body=await response.json();
  if(!response.ok||body.ok===false){const error=new Error(body.error||'No se pudo completar la operación');error.body=body;throw error;}
  return body;
}
function App() {
  const pendingFocus=useRef(null);
  const [documents,setDocuments]=useState([]),[baseline,setBaseline]=useState([]),[models,setModels]=useState([]);
  const [view,setView]=useState({}),[baselineView,setBaselineView]=useState({}),[revision,setRevision]=useState('');
  const [selected,setSelected]=useState(null),[modal,setModal]=useState(null),[status,setStatus]=useState('loading'),[connecting,setConnecting]=useState(null);
  const [notice,setNotice]=useState(''),[error,setError]=useState(''),[query,setQuery]=useState(''),[activeClass,setActiveClass]=useState(null);
  const [showRelations,setShowRelations]=useState(false),[sidebarOpen,setSidebarOpen]=useState(false),[focusId,setFocusId]=useState(null);
  const [history,setHistory]=useState([]),[future,setFuture]=useState([]),[zoom,setZoom]=useState(1),[flowNodes,setFlowNodes]=useState([]);
  const {fitView,setCenter,setViewport,getNodes}=useReactFlow();
  const dirty=JSON.stringify(documents)!==JSON.stringify(baseline)||JSON.stringify(view)!==JSON.stringify(baselineView);
  const saving=status==='saving',ready=status==='ready'||saving;
  const projection=useMemo(()=>project(documents,view),[documents,view]);
  const focusIds=useMemo(()=>{
    if(!focusId)return null;
    const ids=new Set([focusId]),walk=id=>(projection.children[id]||[]).forEach(child=>{ids.add(child);walk(child);});
    walk(focusId);return ids;
  },[focusId,projection]);
  const focusDocuments=useMemo(()=>focusIds?documents.filter(d=>focusIds.has(d.id)):documents,[documents,focusIds]);
  const fit=useCallback(()=>requestAnimationFrame(()=>{
    const canvas=document.querySelector('.canvas');if(!canvas)return;
    setViewport(readingViewport(getNodes(),canvas.clientWidth,canvas.clientHeight),{duration:250});
  }),[getNodes,setViewport]);
  const overview=()=>fitView({padding:.12,maxZoom:1,duration:250});
  const visibleProjection=useMemo(()=>activeClass?project(focusDocuments.filter(d=>d.model_name===activeClass),{...view,positions:{}}):focusId?project(focusDocuments,view):projection,[activeClass,focusDocuments,focusId,documents,view,projection]);
  useEffect(()=>{if(ready)setTimeout(fit,80);},[activeClass,focusId,fit,ready]);
  useEffect(()=>{setFlowNodes(visibleProjection.nodes);},[visibleProjection]);
  const load=useCallback(async()=>{
    setStatus('loading');setError('');
    try {
      const [graph,schema]=await Promise.all([request('/api/graph'),request('/api/schema')]);
      setDocuments(graph.documents);setBaseline(graph.documents);setModels(schema.models);setView(graph.view);setBaselineView(graph.view);setRevision(graph.revision);
      setHistory([]);setFuture([]);setSelected(null);setActiveClass(null);setFocusId(null);setStatus('ready');setNotice('');setTimeout(fit,200);
    } catch(e){setStatus('error');setError(e.message);}
  },[fit]);
  useEffect(()=>{load();},[load]);
  useEffect(()=>{if(!ready)return;let timer;const observer=new ResizeObserver(()=>{clearTimeout(timer);timer=setTimeout(fit,150);});observer.observe(document.querySelector('.canvas'));return()=>{observer.disconnect();clearTimeout(timer);};},[ready,fit]);
  useEffect(()=>{if(!dirty)return;const callback=e=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',callback);return()=>window.removeEventListener('beforeunload',callback);},[dirty]);
  const checkpoint=()=>{setHistory(h=>[...h.slice(-39),{documents,view}]);setFuture([]);setNotice('');};
  const restore=(from,setFrom,setTo)=>{if(!from.length)return;setTo(h=>[...h,{documents,view}]);const prev=from.at(-1);setDocuments(prev.documents);setView(prev.view);setFrom(h=>h.slice(0,-1));setSelected(null);};
  const undo=()=>restore(history,setHistory,setFuture),redo=()=>restore(future,setFuture,setHistory);
  const save=async()=>{
    if(saving||!dirty)return;
    setStatus('saving');setError('');setNotice('Guardando documentos en SLDB…');
    try {
      const changes=changesBetween(baseline,documents);
      const result=await request('/api/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({changes,view,viewRevision:revision})});
      setDocuments(result.documents);setBaseline(result.documents);setView(result.view);setBaselineView(result.view);setRevision(result.revision);setHistory([]);setFuture([]);
      setNotice(`${result.saved.length} documento${result.saved.length===1?'':'s'} guardado${result.saved.length===1?'':'s'} en SLDB · Vista guardada`);
    } catch(e){setError(e.message);setNotice('No se completó el guardado. Tus cambios siguen aquí.');
      if(e.body?.completed?.length){setBaseline(e.body.documents);setRevision(e.body.revision);}
    } finally{setStatus('ready');}
  };
  const addChild=id=>{const parent=documents.find(d=>d.id===id),options=childOptions(parent,models);if(!options.length)return;setModal({parentId:id,options,model:options[0].model});};
  const addSibling=id=>{const doc=documents.find(d=>d.id===id),parent=projection.parents[id];
    if(parent){const owner=documents.find(d=>d.id===parent.source),options=childOptions(owner,models).filter(o=>o.field===parent.field);setModal({parentId:parent.source,field:parent.field,options,model:doc.model_name});}
    else setModal({model:doc.model_name});
  };
  const remove=id=>{checkpoint();setDocuments(removeDocument(documents,id));setSelected(null);setNotice('Se quitará de SLDB al guardar; el archivo Markdown se conserva.');};
  const toggle=id=>{checkpoint();setView(v=>({...v,collapsed:(v.collapsed||[]).includes(id)?v.collapsed.filter(x=>x!==id):[...(v.collapsed||[]),id]}));setTimeout(fit,80);};
  const enterFocus=id=>{if(!projection.children[id]?.length)return;setActiveClass(null);setFocusId(id);setSelected(id);setNotice('Modo foco: mostrando este contenedor y su contenido.');};
  const exitFocus=()=>{setFocusId(null);setSelected(null);setNotice('Mapa completo restaurado.');};
  const connect=id=>{if(!selected||selected===id){setConnecting(id);setSelected(id);setNotice('Selecciona el documento destino para conectar.');return;}setModal({connection:true,sourceId:connecting||selected,targetId:id});setConnecting(null);};
  const connectFrom=id=>{setConnecting(id);setSelected(id);setNotice('Selecciona el documento destino para conectar.');};
  const applyConnection=(source,target,field)=>{checkpoint();setDocuments(ds=>ds.map(d=>{if(d.id!==source.id)return d;const current=d.payload[field];const value=Array.isArray(current)?[...new Set([...current,target.id])]:target.id;return {...d,payload:{...d.payload,[field]:value}};}));setShowRelations(true);setModal(null);setNotice(`Relación preparada: ${titleOf(source)} → ${titleOf(target)}`);};
  const actions={addChild,addSibling,remove,toggle,edit:id=>setModal({id}),connect:connectFrom,connecting:Boolean(connecting),focus:enterFocus};
  useEffect(()=>{const key=e=>{
    if(saving||modal)return;
    const typing=e.target.closest('input,textarea,select,button,dialog');
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();save();return;}
      if(typing)return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();return;}
    if(e.key==='Escape'){setSelected(null);setConnecting(null);return;}
    if(!selected)return;
    if(e.key==='Tab'&&childOptions(documents.find(d=>d.id===selected),models).length){e.preventDefault();addChild(selected);}
    if(e.key==='Enter'){e.preventDefault();addSibling(selected);}
    if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();remove(selected);}
  };window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);});
  const applyDocument=(doc,field)=>{
    checkpoint();
    if(modal.id)setDocuments(ds=>ds.map(d=>d.id===doc.id?doc:d));
    else if(modal.parentId){setDocuments(ds=>appendChild(ds,modal.parentId,doc,field));setView(v=>({...v,collapsed:(v.collapsed||[]).filter(id=>id!==modal.parentId)}));}
    else setDocuments(ds=>[...ds,doc]);
    setSelected(doc.id);setModal(null);setTimeout(fit,100);
  };
  const focusDocument=id=>{
    if(activeClass&&documents.find(d=>d.id===id)?.model_name!==activeClass){setActiveClass(null);setSelected(id);pendingFocus.current=id;return;}
    if(focusId&&!focusIds?.has(id)){setFocusId(null);pendingFocus.current=id;return;}
    let current=id,ancestors=[];while(projection.parents[current]){current=projection.parents[current].source;ancestors.push(current);}
    if(ancestors.some(a=>(view.collapsed||[]).includes(a))){setView(v=>({...v,collapsed:(v.collapsed||[]).filter(x=>!ancestors.includes(x))}));setTimeout(fit,100);}
    else {const node=flowNodes.find(n=>n.id===id);if(node){let x=node.position.x,y=node.position.y,p=node.parentId;while(p){const parent=flowNodes.find(n=>n.id===p);x+=parent.position.x;y+=parent.position.y;p=parent.parentId;}setCenter(x+node.style.width/2,y+node.style.height/2,{zoom:.95,duration:250});}}
    setSelected(id);
  };
  useEffect(()=>{if(pendingFocus.current&&!activeClass){const id=pendingFocus.current;pendingFocus.current=null;const t=setTimeout(()=>focusDocument(id),180);return()=>clearTimeout(t);}},[activeClass,flowNodes]);
  const counts=Object.fromEntries(models.map(m=>[m.id,documents.filter(d=>d.model_name===m.id).length]));
  const displayed=flowNodes.map(n=>({...n,selected:n.id===selected,style:n.style,data:{...n.data,actions,canChild:childOptions(n.data.doc,models).length>0}}));
  const exportMap=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({documents,view},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='kb-mindmap.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  return html`<main className="editor" data-saving=${saving}>
    <header className="topbar"><button className="mobile-menu icon-button" aria-label="Mostrar clases" onClick=${()=>setSidebarOpen(!sidebarOpen)}>☰</button><a href="/" className="brand"><span>◈</span> KB <strong>Mindmap</strong></a><span className="document-name">Explorar · organizar · editar</span>${focusId?html`<div className="focus-breadcrumb"><button onClick=${exitFocus}>Mapa completo</button><span>›</span><strong>${titleOf(documents.find(d=>d.id===focusId))}</strong><button className="focus-exit" onClick=${exitFocus}>Salir del foco</button></div>`:''}<span className=${'save-state'+(dirty?' unsaved':'')}>${saving?'Guardando…':dirty?'● Cambios sin guardar':'✓ Sin cambios pendientes'}</span><button className="primary" onClick=${save} disabled=${!dirty||saving||!ready}>${saving?'Guardando…':'Guardar en SLDB'}</button></header>
    <div className="toolbar" role="toolbar" aria-label="Herramientas del mapa"><button className="add-button" disabled=${!ready||saving} onClick=${()=>setModal({})}>＋ Documento</button><span className="separator"></span><button onClick=${undo} disabled=${!history.length||saving} aria-label="Deshacer" title="Deshacer (Ctrl+Z)">↶</button><button onClick=${redo} disabled=${!future.length||saving} aria-label="Rehacer">↷</button><span className="separator"></span><button onClick=${fit} disabled=${!ready}>⛶ Lectura</button><button onClick=${overview} disabled=${!ready}>Ver todo</button><button onClick=${()=>{checkpoint();setView(v=>({...v,positions:{}}));setTimeout(fit,80);}} disabled=${!ready||saving}>Ordenar</button><label className="relations-toggle"><input type="checkbox" checked=${showRelations} onChange=${e=>setShowRelations(e.target.checked)}/> Referencias</label><button onClick=${exportMap} disabled=${!ready}>Exportar</button><form className="search" onSubmit=${e=>{e.preventDefault();const found=documents.find(d=>titleOf(d).toLowerCase().includes(query.toLowerCase()));if(found&&query)focusDocument(found.id);else setNotice('No hay coincidencias');}}><input aria-label="Buscar documento" placeholder="Buscar documento…" value=${query} onInput=${e=>setQuery(e.target.value)}/><button aria-label="Buscar" type="submit">⌕</button></form></div>
    ${error?html`<div className="error-banner" role="alert"><span>${error}</span><button onClick=${()=>{if(!dirty||confirm('Descartar los cambios sin guardar y recargar SLDB?'))load();}}>Recargar SLDB</button><button aria-label="Cerrar error" onClick=${()=>setError('')}>×</button></div>`:''}
    <div className="workspace"><aside className=${'class-sidebar'+(sidebarOpen?' open':'')} aria-label="Leyenda de clases SLDB"><div className="sidebar-heading"><div><span className="eyebrow">SLDB</span><h2>Clases de documento</h2></div><span className="total-count">${models.length}</span></div><p className="sidebar-help">Elige una clase para explorar sus documentos.</p><button className=${'legend-all'+(!activeClass?' active':'')} onClick=${()=>setActiveClass(null)}>Todas las clases <span>${documents.length}</span></button>
      <div className="class-list">${models.map(m=>{const style=classStyle(m.id);return html`<button key=${m.id} className=${'class-item'+(activeClass===m.id?' active':'')} style=${{'--class-color':style.color}} onClick=${()=>setActiveClass(activeClass===m.id?null:m.id)} aria-pressed=${activeClass===m.id}><span className="class-icon">${style.icon}</span><span className="class-name">${style.name}</span><span className="class-count">${counts[m.id]}</span></button>`;})}</div>
      <div className="hierarchy-legend"><strong>Contención</strong><div className="containment-example"><span>🗂️ Contenedor</span><div>🎯 Documento hijo</div></div><p>Las cajas agrupan sus documentos. Usa ▾ para plegar y ▸ para expandir.</p></div><div className="sidebar-shortcuts"><span><kbd>Tab</kbd> Añadir hijo</span><span><kbd>Enter</kbd> Añadir hermano</span><span><kbd>Ctrl S</kbd> Guardar en SLDB</span></div>
    </aside><section className="canvas" aria-label="Mapa de documentos">
      ${ready?html`<${ReactFlow} nodes=${displayed} edges=${showRelations?visibleProjection.edges:[]} nodeTypes=${nodeTypes} onNodesChange=${changes=>setFlowNodes(ns=>applyNodeChanges(changes,ns))} onNodeClick=${(_,n)=>{if(connecting&&connecting!==n.id)connect(n.id);else setSelected(n.id)}} onNodeDoubleClick=${(_,n)=>n.data.group?enterFocus(n.id):setModal({id:n.id})} onPaneClick=${()=>{setSelected(null);setConnecting(null);setSidebarOpen(false);}} onNodeDragStart=${checkpoint} onNodeDragStop=${(_,n)=>setView(v=>({...v,positions:{...v.positions,[n.id]:{...n.position,parentId:n.parentId||null}}}))}
      nodesDraggable=${!saving&&!activeClass} nodesConnectable=${false} onMove=${(_,v)=>setZoom(v.zoom)} minZoom=${.01} maxZoom=${2} deleteKeyCode=${null} colorMode="light"><${Controls} showInteractive=${false}/><${MiniMap} pannable zoomable nodeColor=${n=>classStyle(n.data.doc.model_name).color} ariaLabel="Vista general del mapa"/></${ReactFlow}>`:html`<div className="state"><h2>${status==='loading'?'Cargando tu KB…':'No se pudo abrir SLDB'}</h2>${status==='error'?html`<button onClick=${load}>Reintentar</button>`:''}</div>`}
      ${ready&&!documents.length?html`<div className="state"><h2>Tu KB está vacía</h2><button onClick=${()=>setModal({})}>＋ Crear documento</button></div>`:''}
      <div className="canvas-hint">${activeClass?classStyle(activeClass).name+' · '+visibleProjection.nodes.length+' visibles':focusId?'Doble clic en un contenedor para entrar más profundo':'Doble clic en un contenedor para entrar · Ver todo muestra la KB completa'}</div>
    </section></div><footer className="statusbar"><span>${documents.length} documentos · ${Object.keys(projection.parents).length} contenidos</span><span role="status">${notice||'Doble clic para editar · Arrastra para mover'}</span><span>${Math.round(zoom*100)}%</span></footer>
    ${modal?.connection?html`<${ConnectDialog} key=${modal.sourceId+'-'+modal.targetId} spec=${modal} documents=${documents} models=${models} onClose=${()=>setModal(null)} onApply=${applyConnection}/>`:modal?html`<${DocumentDialog} key=${modal.id||modal.parentId||'new'} spec=${modal} documents=${documents} models=${models} onClose=${()=>setModal(null)} onApply=${applyDocument}/>`:''}
  </main>`;
}
createRoot(document.getElementById('root')).render(html`<${ReactFlowProvider}><${App}/></${ReactFlowProvider}>`);
