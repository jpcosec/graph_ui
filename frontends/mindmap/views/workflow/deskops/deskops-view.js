import {useEffect,useState,useRef} from 'react';
import {html} from '../../../shared/html.js';
import {request} from '../../../shell/api.js';
import {filterTasks,counts,statusLabel,canAdvance} from './deskops.mjs';

function Content({title,value}) {
  const values=Array.isArray(value)?value:null;
  return html`<section className="desk-section"><h3>${title}</h3>${values ? (values.length ? html`<ul>${values.map((v,i)=>html`<li key=${i}>${typeof v==='string'?v:JSON.stringify(v)}</li>`)}</ul>` : html`<p className="desk-muted">No declarado.</p>`) : html`<p className="desk-prose">${value || 'No declarado.'}</p>`}</section>`;
}
function DeskopsView() {
  const [board,setBoard]=useState(null),[detail,setDetail]=useState(null),[selected,setSelected]=useState('');
  const [query,setQuery]=useState(''),[status,setStatus]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[detailError,setDetailError]=useState(''),[notice,setNotice]=useState('');
  const generation=useRef(0), boardGeneration=useRef(0);
  async function refresh() {
    const token=++boardGeneration.current;
    ++generation.current; setDetail(null);setDetailError('');setLoading(true);setError('');setNotice('');
    try {const data=await request('/api/desk/board');if(token!==boardGeneration.current)return;setBoard(data);setSelected(old=>data.tasks.some(t=>t.id===old)?old:(data.tasks[0]?.id||''));}
    catch(e){if(token===boardGeneration.current){setBoard(null);setSelected('');setError(e.message);}}
    finally{if(token===boardGeneration.current)setLoading(false);}
  }
  useEffect(()=>{refresh();return()=>{++generation.current;++boardGeneration.current;};},[]);
  useEffect(()=>{
    const token=++generation.current;setDetail(null);setDetailError('');setNotice('');
    if(!selected || loading)return;
    request('/api/desk/task?id='+encodeURIComponent(selected)).then(data=>{if(token===generation.current)setDetail(data);}).catch(e=>{if(token===generation.current)setDetailError(e.message);});
  },[selected,loading]);
  async function advance() {
    setBusy(true);setDetailError('');setNotice('');
    const token=generation.current;
    try {const data=await request('/api/desk/advance',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:selected,revision:detail.revision})});
      if(token!==generation.current)return;
      setDetail(data);setNotice(data.transition.message);setBoard(old=>({...old,tasks:old.tasks.map(t=>t.id===data.task.id?data.task:t)}));
    } catch(e){if(token===generation.current){setDetailError(e.message);if(e.body?.revision)setDetail(e.body);}}
    finally{setBusy(false);}
  }
  const tasks=board?.tasks||[], visible=filterTasks(tasks,query,status), totals=counts(tasks);
  return html`<div className="desk-workspace">
    <header className="desk-heading"><div><div className="desk-eyebrow">WORKFLOW / DESKOPS</div><h1>El trabajo, en contexto.</h1><p>Tu tablero real. Sus próximos pasos y las condiciones para avanzar.</p></div><button onClick=${refresh} disabled=${loading||busy}>${loading?'Actualizando…':'Actualizar'}</button></header>
    ${error?html`<div role="alert" className="desk-alert">${error}</div>`:''}
    ${loading?html`<p role="status" className="desk-empty">Leyendo el Board…</p>`:''}
    ${board&&!loading?html`<div className="desk-overview"><div><strong>${tasks.length}</strong><span>Tareas enrutadas</span></div>${Object.entries(totals).map(([key,n])=>html`<div key=${key}><strong>${n}</strong><span>${statusLabel(key)}</span></div>`)}<p title=${board.root}>${board.root}<br/><span>desk/tasks/Board.md</span></p></div>
      ${board.errors.length?html`<div className="desk-alert" role="alert"><strong>Referencias que necesitan atención</strong><ul>${board.errors.map((e,i)=>html`<li key=${i}><code>${e.reference}</code>: ${e.error}</li>`)}</ul></div>`:''}
      <div className="desk-columns"><aside className="desk-board" aria-label="Tareas del Board"><div className="desk-filters"><label>Buscar tareas<input aria-label="Buscar tareas" type="search" placeholder="Título, objetivo o identificador" value=${query} onChange=${e=>setQuery(e.target.value)}/></label><label>Estado<select aria-label="Estado" value=${status} onChange=${e=>setStatus(e.target.value)}><option value="">Todos los estados</option>${Object.keys(totals).map(s=>html`<option key=${s} value=${s}>${statusLabel(s)}</option>`)}</select></label></div>
      <div className="desk-list">${visible.length?visible.map(t=>html`<button key=${t.id} className=${'desk-task'+(selected===t.id?' selected':'')} aria-pressed=${selected===t.id} disabled=${busy} onClick=${()=>setSelected(t.id)}><span className="desk-task-top"><span className="desk-status">${statusLabel(t.status)}</span><span>↗</span></span><strong>${t.title||t.id}</strong><span className="desk-task-goal">${t.goal||'Sin objetivo declarado'}</span><code>${t.current_node||'Sin nodo'}</code></button>`):html`<p className="desk-empty">${tasks.length?'No hay tareas que coincidan con los filtros.':board.errors.length?'No hay referencias válidas. Revisa los errores del Board.':'Este Board todavía no tiene tareas enrutadas.'}</p>`}</div></aside>
      <article className="desk-detail" aria-label="Detalle de tarea" aria-busy=${!!selected&&!detail&&!detailError}>
        ${detailError?html`<div className="desk-alert" role="alert">${detailError}</div>`:''}
        ${notice?html`<div className="desk-notice" role="status">${notice}</div>`:''}
        ${!selected?html`<p className="desk-empty">Selecciona una tarea para ver su contexto y sus gates.</p>`:!detail&&!detailError?html`<p role="status" className="desk-empty">Leyendo contexto y gates…</p>`:''}
        ${detail?html`<header className="desk-detail-heading"><span className="desk-eyebrow">${detail.task.id}</span><h2>${detail.task.title||detail.task.id}</h2><div className="desk-meta"><span className="desk-status">${statusLabel(detail.task.status)}</span><code>${detail.task.current_node}</code></div></header>
          <${Content} title="Objetivo" value=${detail.payload.goal}/>
          <section className="desk-gates"><div className="desk-gates-heading"><h3>Condiciones de avance</h3><button className="primary" onClick=${advance} disabled=${busy||!canAdvance(detail)}>${busy?'Avanzando…':'Avanzar'}</button></div>
          ${detail.gates.length?html`<ul>${detail.gates.map((g,i)=>html`<li key=${i}><span className=${g.holds?'desk-pass':'desk-hold'}>${g.holds?'✓ Cumplida':'○ Pendiente'}</span><strong>→ ${g.target}</strong><code>${g.condition||'Sin condición'}</code></li>`)}</ul>`:html`<p>No hay transiciones salientes.</p>`}
          ${detail.task.current_node==='ritual-closeout'||detail.task.current_node==='complete'?html`<p>El cierre se gestiona desde el CLI con <code>deskops closeout commit</code> y su evidencia. Esta vista no cierra tareas.</p>`:html`<p className="desk-muted">Deskops vuelve a evaluar las condiciones al avanzar.</p>`}</section>
          <${Content} title="Próximos pasos" value=${detail.next.next_actions}/><${Content} title="Avanzar cuando" value=${detail.next.advance_when}/><${Content} title="Alcance" value=${detail.payload.scope}/><${Content} title="Validación" value=${detail.payload.validation}/><${Content} title="Criterio de término" value=${detail.payload.done_when}/><${Content} title="Evidencia declarada" value=${detail.payload.closeout_evidence}/><${Content} title="Pills de contexto" value=${detail.next.pills}/><${Content} title="Dependencias" value=${detail.payload.depends_on}/><${Content} title="Archivos vinculados" value=${detail.payload.files}/>
        `:''}</article></div>`:''}
  </div>`;
}
export const deskopsView={id:'deskops',facet:'workflow',label:'Deskops',component:DeskopsView,shell:{primary:false,workers:'collapsed'},styles:['/views/workflow/deskops/deskops.css']};
