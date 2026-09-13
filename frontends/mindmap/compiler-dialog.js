import {useState,useEffect,useRef} from 'react';
import {html} from './shared/html.js';
import {useBeforeUnload} from './shell/use-before-unload.js';

export function CompilerDialog({request,onClose,onRefresh}) {
  const ref=useRef(null);
  const [source,setSource]=useState(''),[report,setReport]=useState(null),[plan,setPlan]=useState(null);
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[failed,setFailed]=useState(false);
  useEffect(()=>{const dialog=ref.current;dialog.showModal();return()=>dialog.close();},[]);
  useBeforeUnload(busy);
  const change=value=>{setSource(value);setPlan(null);setReport(null);setMessage('');setFailed(false);};
  const readFile=async e=>{
    const file=e.target.files[0];if(!file)return;
    setBusy(true);
    try {
      if(file.size>5_000_000)throw new Error('El archivo supera el límite de 5 MB.');
      change(await file.text());
    } catch(error){setFailed(true);setMessage(error.message);}
    finally{setBusy(false);e.target.value='';}
  };
  const run=async action=>{
    setBusy(true);setFailed(false);setMessage('');setReport(null);
    if(action!=='compile')setPlan(null);
    try {
      const parsed=JSON.parse(source);
      const result=await request('/api/'+action,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({source:parsed,...(action==='compile'?{planToken:plan?.planToken}:{})})});
      setReport(result);
      if(action==='plan'){
        setPlan(result.applicable?result:null);
        setMessage(result.applicable?'Plan listo. Revisa el reporte antes de aplicar.':'El plan tiene problemas que debes resolver antes de aplicar.');
        setFailed(!result.applicable);
      } else if(action==='validate')setMessage('Formato válido. Calcula el plan para validar contra SLDB y revisar cambios.');
      else {
        setPlan(null);setMessage('Compilación completada. La KB se ha actualizado.');
        await onRefresh();
      }
    } catch(error){
      setFailed(true);setPlan(null);setReport(error.body||{ok:false,error:error.message});
      setMessage(action==='compile'?'No se confirmó la compilación completa. Revisa el reporte y calcula otro plan antes de reintentar.':error.message);
      // Also reload after an ambiguous network failure: writes may have completed.
      if(action==='compile')await onRefresh();
    } finally{setBusy(false);}
  };
  return html`<dialog ref=${ref} className="document-dialog compiler-dialog" aria-labelledby="compiler-title" onCancel=${e=>{e.preventDefault();if(!busy)onClose();}}>
    <header className="dialog-header"><div><span className="eyebrow">Intercambio de mapas</span><h2 id="compiler-title">Importar JSON</h2></div><button type="button" className="icon-button" aria-label="Cerrar importación" disabled=${busy} onClick=${onClose}>×</button></header>
    <div className="dialog-body">
      <p>Validar y calcular el plan no guardan cambios. Aplicar crea o actualiza documentos y, si el JSON incluye una vista, reemplaza su disposición y plegado. Los documentos ausentes del JSON se conservan.</p>
      <label className="form-field"><span>Archivo JSON</span><input type="file" accept=".json,application/json" disabled=${busy} onChange=${readFile}/></label>
      <label className="form-field"><span>JSON del mapa</span><textarea aria-label="JSON del mapa" rows="10" spellCheck="false" value=${source} disabled=${busy} placeholder="Pega un mapa exportado o selecciona un archivo…" onInput=${e=>change(e.target.value)}/></label>
      ${message?html`<p className=${failed?'form-error':'compiler-message'} role=${failed?'alert':'status'}>${message}</p>`:''}
      ${report?html`<pre className="compiler-report" aria-label="Reporte de compilación">${JSON.stringify(report,null,2)}</pre>`:''}
    </div>
    <footer className="dialog-footer"><span>${busy?'Procesando…':'Revisa el plan antes de aplicar'}</span><button type="button" disabled=${busy||!source.trim()} onClick=${()=>run('validate')}>Validar</button><button type="button" disabled=${busy||!source.trim()} onClick=${()=>run('plan')}>Calcular plan</button><button type="button" className="primary" disabled=${busy||!plan} onClick=${()=>run('compile')}>Aplicar en SLDB</button></footer>
  </dialog>`;
}
