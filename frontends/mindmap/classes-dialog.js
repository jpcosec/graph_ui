import React,{useState,useEffect,useRef} from 'react';
import htm from 'htm';
import {classStyle,titleOf} from './model.mjs';
const html=htm.bind(React.createElement);

export function ClassDialog({models,request,onClose,onRefresh}) {
  const [model,setModel]=useState(null);
  const [detail,setDetail]=useState(null);
  const [templateText,setTemplate]=useState('');
  const [message,setMessage]=useState('');const [failed,setFailed]=useState(false);const [busy,setBusy]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{const d=ref.current;d.showModal();return()=>d.close();},[]);
  const describe=async id=>{
    setModel(id);setTemplate('');setMessage('');setFailed(false);
    try{
      const d=await request('/api/models/detail',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:id})});
      setDetail(d);
    }catch(e){setDetail(null);setFailed(true);setMessage(e.message);}
  };
  const run=async(action)=>{
    setBusy(true);setFailed(false);setMessage('');setDetail(null);
    try{
      let result;
      if(action==='template-edit')
        result=await request('/api/models/template-edit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,content:templateText})});
      else if(action==='validate')
        result=await request('/api/models/validate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model})});
      else if(action==='promote')
        result=await request('/api/models/promote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model})});
      else if(action==='fields-add'||action==='fields-remove')
        result=await request('/api/models/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,field_name:'',field_type:'',description:'',default:''})});
      setDetail(result);
      if(result.ok!==false&&action==='promote'){setMessage('Modelo promovido. Recargando…');await onRefresh();}
      else if(result.ok!==false)setMessage((result.valid?'Válido. ':'')+(result.promoted?'Promovido.':'')+(result.saved?'Guardado.':''));
      else setFailed(true);
    }catch(e){setFailed(true);setDetail(e.body||{ok:false,error:e.message});setMessage(e.message);}
    finally{setBusy(false);}
  };
  const sel=models.find(m=>m.id===model),style=sel?classStyle(sel.id):{icon:'📐',color:'#475569',name:'Clases'};
  return html`<dialog ref=${ref} className="document-dialog class-dialog" aria-labelledby="class-title" onCancel=${onClose} onClick=${e=>{if(e.target===ref.current)onClose();}}><form onSubmit=${e=>{e.preventDefault();onClose();}}>
    <header className="dialog-header"><span className="dialog-icon" style=${{'--class-color':style.color}}>${style.icon}</span><div><span className="eyebrow">SLDB</span><h2 id="class-title">Editar clases</h2></div><button type="button" className="icon-button" aria-label="Cerrar" onClick=${onClose}>×</button></header>
    <div className="dialog-body" style=${{display:'flex',gap:'16px',maxHeight:'calc(100vh-180px)'}}>
      <div className="class-sidebar-mini" style=${{width:'200px',overflow:'auto',flexShrink:0}}>
        <span className="eyebrow">Clases registradas</span>
        ${models.map(m=>html`<button key=${m.id} type="button" className=${'class-item'+(model===m.id?' active':'')}
          style=${{'--class-color':classStyle(m.id).color}} onClick=${()=>describe(m.id)}>
          <span className="class-icon">${classStyle(m.id).icon}</span>
          <span className="class-name">${classStyle(m.id).name}</span>
        </button>`)}
      </div>
      <div style=${{flex:1,overflow:'auto'}}>
        ${!model?html`<p className="quick-create-note">Selecciona una clase para ver sus campos, editar template y gestionar fields.</p>`:
          html`<h3 style=${{margin:'0 0 10px'}}>${classStyle(model).icon} ${classStyle(model).name}</h3>
          ${sel?html`<table className="class-fields" style=${{width:'100%',fontSize:'12px',borderCollapse:'collapse'}}>
            <thead><tr><th>Campo</th><th>Tipo</th><th>Req.</th><th>Default</th><th>Descripción</th></tr></thead>
            <tbody>${(sel.fields||[]).map(f=>html`<tr key=${f.name}>
              <td><code>${f.name}</code></td><td>${f.kind}</td><td>${f.required?'✓':''}</td>
              <td><small>${f.default!==undefined?JSON.stringify(f.default):'-'}</small></td>
              <td><small>${f.name}</small></td>
            </tr>`)}</tbody>
          </table>`:''}
          <div style=${{marginTop:'14px',display:'flex',gap:'7px',flexWrap:'wrap'}}>
            <label style=${{fontSize:'12px',flex:1,minWidth:'200px'}}>
              <span>Template (preview)</span>
              <textarea rows="4" style=${{width:'100%'}} value=${templateText} placeholder="Markdown del template…" onInput=${e=>setTemplate(e.target.value)}/>
            </label>
            <button type="button" disabled=${busy||!templateText} onClick=${()=>run('template-edit')}>Editar template</button>
          </div>
          <div style=${{marginTop:'10px',display:'flex',gap:'7px'}}>
            <button type="button" disabled=${busy} onClick=${()=>run('validate')}>Validar draft</button>
            <button type="button" className="primary" disabled=${busy} onClick=${()=>run('promote')}>Validar y promover</button>
          </div>
          ${message?html`<p role="alert" className=${failed?'form-error':'compiler-message'}>${message}</p>`:''}
          ${detail&&!failed?html`<pre className="compiler-report">${JSON.stringify(detail,null,2)}</pre>`:''}
          ${detail?.documents?html`<div><strong>Documentos afectados:</strong><ul>${
            detail.documents.map(d=>html`<li key=${d.name}>${d.name} — ${d.valid?'✅':'❌'}</li>`)
          }</ul></div>`:''}
        `}
      </div>
    </div>
    <footer className="dialog-footer"><span>Los cambios usan drafts; promover valida y activa el nuevo contrato.</span><button type="submit">Cerrar</button></footer>
  </form></dialog>`;
}