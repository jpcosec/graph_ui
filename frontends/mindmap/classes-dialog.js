import React,{useState,useEffect,useRef} from 'react';
import htm from 'htm';
import {classStyle} from './model.mjs';
const html=htm.bind(React.createElement);

export function ClassDialog({models,request,onClose,onRefresh}) {
  const [model,setModel]=useState(null);
  const [detail,setDetail]=useState(null);
  const [draftActive,setDraft]=useState(false);
  const [templateText,setTemplate]=useState('');
  const [message,setMessage]=useState('');const [failed,setFailed]=useState(false);const [busy,setBusy]=useState(false);
  const [validated,setValidated]=useState(false);
  // State for add/remove field UI
  const [newFieldName,setNewField]=useState('');const [newFieldType,setNewFieldType]=useState('string');const [newFieldDesc,setNewFieldDesc]=useState('');
  const ref=useRef(null);
  useEffect(()=>{const d=ref.current;d.showModal();return()=>d.close();},[]);
  const describe=async id=>{
    setModel(id);setTemplate('');setMessage('');setFailed(false);setValidated(false);setDraft(false);setNewField('');
    try{
      const d=await request('/api/models/detail',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:id})});
      setDetail(d);setFailed(!d.ok);
    }catch(e){setDetail({ok:false,error:e.message});setFailed(true);setMessage(e.message);}
  };
  const run=async(action,...args)=>{
    setBusy(true);setFailed(false);setMessage('');
    if(action==='promote'&&!validated){setFailed(true);return setMessage('Primero debes validar el draft antes de promover.');}
    if(action==='promote'&&!confirm(`¿Promover el draft de ${classStyle(model).name}? Esta operación actualizará el modelo activo y los hashes de documentos.`)){setBusy(false);return;}
    try{
      let body;
      if(action==='template-edit')body={model,content:templateText};
      else if(action==='fields-add')body={model,field_name:newFieldName,field_type:newFieldType,description:newFieldDesc};
      else if(action==='fields-remove')body={model,field_name:args[0]};
      else body={model};
      const result=await request('/api/models/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(action==='validate'){
        setValidated(result.ok!==false);
        setDraft(result.draft||false);
      }
      if(action!=='validate'&&action!=='promote')setValidated(false); // el draft cambió: hay que revalidar
      if(result.ok===false||result.error){setFailed(true);setMessage(result.error||'Operación fallida.');setDetail(result);}
      else{setMessage('Operación completada.');setDetail(result);setNewField('');setNewFieldDesc('');if(action==='promote')await onRefresh();}
    }catch(e){setFailed(true);setDetail(e.body||{ok:false,error:e.message});setMessage(e.message);}
    finally{setBusy(false);}
  };
  const sel=models.find(m=>m.id===model),style=sel?classStyle(sel.id):{icon:'📐',color:'#475569',name:'Clases'};
  return html`<dialog ref=${ref} className="document-dialog class-dialog" aria-labelledby="class-title" onCancel=${onClose} onClick=${e=>{if(e.target===ref.current)onClose();}}><form onSubmit=${e=>{e.preventDefault();onClose();}}>
    <header className="dialog-header"><span className="dialog-icon" style=${{'--class-color':style.color}}>${style.icon}</span><div><span className="eyebrow">SLDB</span><h2 id="class-title">Editar clases</h2></div><button type="button" className="icon-button" aria-label="Cerrar" onClick=${onClose}>×</button></header>
    <div className="dialog-body" style=${{display:'flex',gap:'16px',maxHeight:'calc(100vh-180px)'}}>
      <div style=${{width:'200px',overflow:'auto',flexShrink:0}}>
        <span className="eyebrow">Clases registradas</span>
        ${models.map(m=>html`<button key=${m.id} type="button" className=${'class-item'+(model===m.id?' active':'')}
          style=${{'--class-color':classStyle(m.id).color}} onClick=${()=>describe(m.id)}>
          <span className="class-icon">${classStyle(m.id).icon}</span>
          <span className="class-name">${classStyle(m.id).name}</span>
        </button>`)}
      </div>
      <div style=${{flex:1,overflow:'auto'}}>
        ${!model?html`<p className="quick-create-note">Selecciona una clase para ver sus campos y gestionar drafts.</p>`:
          html`<h3 style=${{margin:'0 0 10px'}}>${classStyle(model).icon} ${classStyle(model).name}</h3>
          ${sel?html`<table style=${{width:'100%',fontSize:'12px',borderCollapse:'collapse',border:'1px solid #e2e8f0'}}>
            <thead><tr style=${{background:'#f8fafc'}}><th style=${{padding:'6px 8px',textAlign:'left'}}>Campo</th><th style=${{padding:'6px 8px'}}>Tipo</th><th style=${{padding:'6px 8px'}}>Req.</th><th style=${{padding:'6px 8px'}}>Default</th><th style=${{padding:'6px 8px',textAlign:'left'}}>Descripción</th><th style=${{padding:'6px 8px'}}></th></tr></thead>
            <tbody>${(sel.fields||[]).map(f=>html`<tr key=${f.name} style=${{borderTop:'1px solid #e2e8f0'}}>
              <td style=${{padding:'6px 8px'}}><code>${f.name}</code></td><td style=${{padding:'6px 8px'}}>${f.kind}</td><td style=${{padding:'6px 8px'}}>${f.required?'✓':''}</td>
              <td style=${{padding:'6px 8px'}}><small>${f.default!==undefined?JSON.stringify(f.default):'-'}</small></td>
              <td style=${{padding:'6px 8px'}}><small>${f.description||f.name}</small></td>
              <td style=${{padding:'6px 8px'}}><button type="button" className=${'icon-button'+(draftActive?'':' hidden')} disabled=${busy} onClick=${()=>run('fields-remove',f.name)} title="Quitar campo del draft">×</button></td>
            </tr>`)}
            <tr style=${{borderTop:'1px solid #e2e8f0',background:'#fffbeb'}}><td style=${{padding:'6px 8px'}}><input value=${newFieldName} placeholder="name" style=${{width:'80px'}} onInput=${e=>{setNewField(e.target.value);setValidated(false);}}/></td>
            <td style=${{padding:'6px 8px'}}><select value=${newFieldType} onChange=${e=>setNewFieldType(e.target.value)}>
              ${['string','integer','number','boolean','json','list','enum'].map(t=>html`<option key=${t} value=${t}>${t}</option>`)}
            </select></td><td style=${{padding:'6px 8px'}}></td><td style=${{padding:'6px 8px'}}></td>
            <td style=${{padding:'6px 8px'}}><input value=${newFieldDesc} placeholder="description" style=${{width:'100px'}} onInput=${e=>{setNewFieldDesc(e.target.value);setValidated(false);}}/></td>
            <td style=${{padding:'6px 8px'}}><button type="button" disabled=${busy||!newFieldName} onClick=${()=>run('fields-add')}>+</button></td></tr>
          </table><p style=${{fontSize:'10px',color:'#8490a3',margin:'6px 0 10px'}}>El draft debe tener contenido; usar Validar draft para revisarlo. — Los campos sin draft no se pueden quitar.</p>`:''}
          <details style=${{marginTop:'10px'}}><summary style=${{fontSize:'12px',cursor:'pointer'}}>Template</summary>
            <textarea rows="4" style=${{width:'100%',marginTop:'8px'}} value=${templateText} placeholder="Markdown del template…" onInput=${e=>{setTemplate(e.target.value);setValidated(false);}}/>
            <button type="button" disabled=${busy||!templateText} onClick=${()=>run('template-edit')}>Editar template</button>
          </details>
          <div style=${{marginTop:'12px',display:'flex',gap:'7px',flexWrap:'wrap'}}>
            <button type="button" disabled=${busy} onClick=${()=>run('validate')}>Validar draft</button>
            <button type="button" className="primary" disabled=${busy||!validated} onClick=${()=>run('promote')}>${validated?'Promover draft':'Primero valida'}</button>
          </div>
          ${message?html`<p role="alert" className=${failed?'form-error':'compiler-message'}>${message}</p>`:''}
          ${detail&&!failed?html`<pre className="compiler-report">${JSON.stringify(detail,null,2)}</pre>`:''}
          ${detail?.documents?html`<div style=${{marginTop:'8px'}}><strong>Documentos afectados:</strong><ul>${
            detail.documents.map(d=>html`<li key=${d.name} style=${{fontSize:'12px'}}>${d.name} — ${d.valid?'✅':'❌'}</li>`)
          }</ul></div>`:''}
        `}
      </div>
    </div>
    <footer className="dialog-footer"><span>Los cambios usan drafts; promover valida y activa el nuevo contrato.</span><button type="submit">Cerrar</button></footer>
  </form></dialog>`;
}