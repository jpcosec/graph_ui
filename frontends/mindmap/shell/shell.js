import {useState, useEffect} from 'react';
import {html} from '../shared/html.js';
import {useSource} from '../source/source.js';
import {SKINS, getSkin, setSkin} from './skin.js';
import {request} from './api.js';
import {useBeforeUnload} from './use-before-unload.js';
import {VIEWS} from './registry.js';
import {useRoute, routeFor} from './router.js';
import {useShellDialogs} from './dialogs.js';
import {ConflictDialog} from '../dialogs/conflict-dialog.js';
import {ClassDialog} from '../dialogs/class-dialog.js';
import {CompilerDialog} from '../dialogs/compiler-dialog.js';

// Shell chrome: topbar (brand, view tabs, skin toggle, save state — the last
// two only for the active view's "primary" chrome), the error banner, the
// active view's outlet, and the dialog host (conflicts > shell dialog).
// Everything else (map/schema/brainstorm behaviour) lives in the views
// themselves, registered in ./registry.js. Which view is active is driven by
// the URL, owned by ./router.js: /{facet}/{view.id}.
export function Shell() {
  const kb=useSource();
  const documents=kb.documents;
  const dialogs=useShellDialogs();
  const {view:activeView,navigate}=useRoute();
  const viewId=activeView.id;
  const [skin,setSkinState]=useState(()=>getSkin());
  const cycleSkin=()=>setSkinState(setSkin(SKINS[(SKINS.indexOf(skin)+1)%SKINS.length]));
  // A view reports whether one of its own (non-shell) modals is open, so the
  // Ctrl+S handler below can stay off exactly like the old App's did.
  const [viewModalOpen,setViewModalOpen]=useState(false);
  useEffect(()=>{setViewModalOpen(false);},[viewId]);

  const saving=documents.status==='saving',ready=documents.status==='ready'||saving;
  const dialogBlocked=Boolean(dialogs.current||documents.conflicts||viewModalOpen);

  useBeforeUnload(kb.dirtyAny);

  useEffect(()=>{
    if(!activeView.shell.primary||saving||dialogBlocked)return;
    const key=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();documents.save();}};
    window.addEventListener('keydown',key);
    return ()=>window.removeEventListener('keydown',key);
  },[activeView,saving,dialogBlocked,documents.save]);

  const View=activeView.component;
  return html`<main className="editor" data-saving=${saving} data-view=${viewId}>
    <header className="topbar"><a href="/" className="brand"><span>◈</span> KB <strong>Mindmap</strong></a><span className="document-name">Explorar · organizar · editar</span><div className="mode-switch" role="tablist" aria-label="Vistas">${VIEWS.map(v=>html`<a key=${v.id} role="tab" href=${routeFor(v)} aria-selected=${viewId===v.id} className=${viewId===v.id?'active':''} onClick=${e=>{e.preventDefault();navigate(v);}}>${v.label}</a>`)}</div>${kb.projections.available.length?html`<select className="projection-select" aria-label="Proyección" title="Proyección activa" value=${kb.projections.activeName} onChange=${e=>kb.projections.setActiveName(e.target.value)}><option value="">Todo</option>${kb.projections.available.map(d=>html`<option key=${d.id} value=${d.payload.name}>${d.payload.name}</option>`)}</select>`:''}<button type="button" className="skin-toggle icon-button" title="Cambiar tema" aria-label="Cambiar tema" onClick=${cycleSkin}>◐</button>${activeView.shell.primary?html`<span className=${'save-state'+(documents.dirty?' unsaved':'')}>${saving?'Guardando…':documents.dirty?'● Cambios sin guardar':'✓ Sin cambios pendientes'}</span><button className="primary" onClick=${documents.save} disabled=${!documents.dirty||saving||!ready}>${saving?'Guardando…':'Guardar en SLDB'}</button>`:''}</header>
    ${documents.error?html`<div className="error-banner" role="alert"><span>${documents.error}</span><button onClick=${()=>{if(!documents.dirty||confirm('Descartar los cambios sin guardar y recargar SLDB?'))kb.reload();}}>Recargar SLDB</button><button aria-label="Cerrar error" onClick=${()=>documents.setError('')}>×</button></div>`:''}
    <div className="view-outlet"><${View} key=${viewId} skin=${skin} onModalChange=${setViewModalOpen} navigate=${navigate}/></div>
    ${documents.conflicts?html`<${ConflictDialog} conflicts=${documents.conflicts} documents=${documents.working.documents} onClose=${()=>documents.resolveConflicts('keep')} onReload=${()=>documents.resolveConflicts('reload')}/>`:
      dialogs.current?.kind==='compiler'?html`<${CompilerDialog} request=${request} onClose=${dialogs.close} onRefresh=${kb.reload}/>`:
      dialogs.current?.kind==='classes'?html`<${ClassDialog} models=${kb.models.models} request=${request} initialModel=${dialogs.current.model} onClose=${dialogs.close} onRefresh=${kb.reload}/>`:''}
  </main>`;
}
