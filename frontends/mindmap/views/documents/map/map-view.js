import {useState, useEffect, useMemo, useRef, useCallback, Fragment} from 'react';
import {ReactFlow, ReactFlowProvider, Controls, MiniMap, useReactFlow, applyNodeChanges} from '@xyflow/react';
import {html} from '../../../shared/html.js';
import {useSource} from '../../../source/source.js';
import {useShellDialogs} from '../../../shell/dialogs.js';
import {resolveToken} from '../../../shell/skin.js';
import {readingViewport, project} from './projection.mjs';
import {childOptions, appendChild, removeDocument, graphMaps} from '../../../source/graph.mjs';
import {titleOf} from '../../../shared/documents.mjs';
import {classStyle} from '../../../shared/classes.mjs';
import {nodeTypes} from './document-node.js';
import {Sidebar} from './sidebar.js';
import {Toolbar} from './toolbar.js';
import {Statusbar} from './statusbar.js';
import {DocumentDialog} from './document-dialog.js';
import {QuickCreateDialog} from './quick-create-dialog.js';
import {ConnectDialog} from './connect-dialog.js';

// All the KB map's interaction state and behaviour, moved verbatim out of
// the shell's former root component. Needs to live under a
// <ReactFlowProvider> (see MapView below) for useReactFlow().
function MapCanvas({skin,onModalChange}) {
  const kb=useSource();
  const dialogs=useShellDialogs();
  const documentsSource=kb.documents;
  const documents=documentsSource.working.documents,view=documentsSource.working.view;
  const models=kb.models.models,counts=kb.models.counts;
  const status=documentsSource.status,dirty=documentsSource.dirty,notice=documentsSource.notice;
  const {checkpoint,edit,apply,undo,redo,canUndo,canRedo,save,exportMap}=documentsSource;
  const reload=kb.reload;
  const pendingFocus=useRef(null);
  const canvasRef=useRef(null);
  const [selected,setSelected]=useState(null),[modal,setModal]=useState(null),[connecting,setConnecting]=useState(null);
  const [query,setQuery]=useState(''),[activeClass,setActiveClass]=useState(null);
  // null = automático: un store sin contención (p. ej. pron/kgdb, donde las
  // relaciones son documentos aparte) mostraría un mapa mudo con las
  // referencias ocultas; el usuario puede fijarlo con la casilla.
  const [showRelations,setShowRelations]=useState(null),[sidebarOpen,setSidebarOpen]=useState(false),[focusId,setFocusId]=useState(null);
  const [zoom,setZoom]=useState(1),[flowNodes,setFlowNodes]=useState([]);
  const {fitView,setCenter,setViewport,getNodes}=useReactFlow();
  const saving=status==='saving',ready=status==='ready'||saving;
  // The shell needs to know when our own modal is open so it can gate the
  // window-level Ctrl+S handler exactly like the old App did (see shell.js).
  useEffect(()=>{onModalChange?.(Boolean(modal));},[modal,onModalChange]);
  const projection=useMemo(()=>project(documents,view,graphMaps(models)),[documents,view,models]);
  const relationsShown=showRelations??Object.keys(projection.parents).length===0;
  const focusIds=useMemo(()=>{
    if(!focusId)return null;
    const ids=new Set([focusId]),walk=id=>(projection.children[id]||[]).forEach(child=>{ids.add(child);walk(child);});
    walk(focusId);return ids;
  },[focusId,projection]);
  const focusDocuments=useMemo(()=>focusIds?documents.filter(d=>focusIds.has(d.id)):documents,[documents,focusIds]);
  const fit=useCallback(()=>requestAnimationFrame(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    setViewport(readingViewport(getNodes(),canvas.clientWidth,canvas.clientHeight),{duration:250});
  }),[getNodes,setViewport]);
  const overview=()=>fitView({padding:.12,maxZoom:1,duration:250});
  const visibleProjection=useMemo(()=>activeClass?project(focusDocuments.filter(d=>d.model_name===activeClass),{...view,positions:{}},graphMaps(models)):focusId?project(focusDocuments,view,graphMaps(models)):projection,[activeClass,focusDocuments,focusId,documents,view,projection,models]);
  useEffect(()=>{if(ready)setTimeout(fit,80);},[activeClass,focusId,fit,ready]);
  useEffect(()=>{setFlowNodes(visibleProjection.nodes);},[visibleProjection]);
  // Cada baseline nueva (carga inicial, recarga manual o guardado exitoso)
  // limpia el estado de interacción de la KB y reencuadra la vista. Solo tras
  // una recarga (no tras guardar): un guardado exitoso conserva la selección.
  useEffect(()=>{setSelected(null);setActiveClass(null);setFocusId(null);setTimeout(fit,200);},[documentsSource.loadCount,fit]);
  useEffect(()=>{if(!ready)return;let timer;const canvas=canvasRef.current;if(!canvas)return;const observer=new ResizeObserver(()=>{clearTimeout(timer);timer=setTimeout(fit,150);});observer.observe(canvas);return()=>{observer.disconnect();clearTimeout(timer);};},[ready,fit]);
  const addChild=id=>{const parent=documents.find(d=>d.id===id),options=childOptions(parent,models);if(!options.length)return;setModal({quick:true,parentId:id,options,model:options[0].model});};
  const addSibling=id=>{const doc=documents.find(d=>d.id===id),parent=projection.parents[id];
    if(parent){const owner=documents.find(d=>d.id===parent.source),options=childOptions(owner,models).filter(o=>o.field===parent.field);setModal({quick:true,parentId:parent.source,field:parent.field,options,model:doc.model_name});}
    else setModal({quick:true,sibling:true,model:doc.model_name});
  };
  const remove=id=>{edit(w=>({...w,documents:removeDocument(w.documents,id)}));setSelected(null);documentsSource.setNotice('Se quitará de SLDB al guardar; el archivo Markdown se conserva.');};
  const toggle=id=>{edit(w=>({...w,view:{...w.view,collapsed:(w.view.collapsed||[]).includes(id)?w.view.collapsed.filter(x=>x!==id):[...(w.view.collapsed||[]),id]}}));setTimeout(fit,80);};
  const enterFocus=id=>{if(!projection.children[id]?.length)return;setActiveClass(null);setFocusId(id);setSelected(id);documentsSource.setNotice('Modo foco: mostrando este contenedor y su contenido.');};
  const exitFocus=()=>{setFocusId(null);setSelected(null);documentsSource.setNotice('Mapa completo restaurado.');};
  const connect=id=>{if(!selected||selected===id){setConnecting(id);setSelected(id);documentsSource.setNotice('Selecciona el documento destino para conectar.');return;}setModal({connection:true,sourceId:connecting||selected,targetId:id});setConnecting(null);};
  const connectFrom=id=>{setConnecting(id);setSelected(id);documentsSource.setNotice('Selecciona el documento destino para conectar.');};
  const applyConnection=(source,target,field)=>{
    edit(w=>({...w,documents:w.documents.map(d=>{if(d.id!==source.id)return d;const current=d.payload[field];const value=Array.isArray(current)?[...new Set([...current,target.id])]:target.id;return {...d,payload:{...d.payload,[field]:value}};})}));
    setShowRelations(true);setModal(null);documentsSource.setNotice(`Relación preparada: ${titleOf(source)} → ${titleOf(target)}`);
  };
  const actions={addChild,addSibling,remove,toggle,edit:id=>setModal({id}),connect:connectFrom,connecting:Boolean(connecting),focus:enterFocus};
  // Ctrl/Cmd+S vive en el Shell (necesita saber si el modo activo es
  // "primary"); este handler cubre el resto de atajos del mapa, con las
  // mismas guardas que el App original: nada si se está guardando o hay un
  // modal (propio, o de un diálogo del shell como Editar clases/conflictos).
  useEffect(()=>{const key=e=>{
    if(saving||modal||dialogs.current||documentsSource.conflicts)return;
    const typing=e.target.closest('input,textarea,select,button,dialog');
    if(typing)return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();return;}
    if(e.key==='Escape'){setSelected(null);setConnecting(null);return;}
    if(!selected)return;
    if(e.key==='Tab'&&childOptions(documents.find(d=>d.id===selected),models).length){e.preventDefault();addChild(selected);}
    if(e.key==='Enter'){e.preventDefault();addSibling(selected);}
    if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();remove(selected);}
  };window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);});
  const applyDocument=(doc,field)=>{
    edit(w=>{
      if(modal.id)return {...w,documents:w.documents.map(d=>d.id===doc.id?doc:d)};
      if(modal.parentId)return {documents:appendChild(w.documents,modal.parentId,doc,field),view:{...w.view,collapsed:(w.view.collapsed||[]).filter(id=>id!==modal.parentId)}};
      return {...w,documents:[...w.documents,doc]};
    });
    setSelected(doc.id);setModal(null);setTimeout(fit,100);
  };
  const focusDocument=id=>{
    if(activeClass&&documents.find(d=>d.id===id)?.model_name!==activeClass){setActiveClass(null);setSelected(id);pendingFocus.current=id;return;}
    if(focusId&&!focusIds?.has(id)){setFocusId(null);pendingFocus.current=id;return;}
    let current=id,ancestors=[];while(projection.parents[current]){current=projection.parents[current].source;ancestors.push(current);}
    if(ancestors.some(a=>(view.collapsed||[]).includes(a))){apply(w=>({...w,view:{...w.view,collapsed:(w.view.collapsed||[]).filter(x=>!ancestors.includes(x))}}));setTimeout(fit,100);}
    else {const node=flowNodes.find(n=>n.id===id);if(node){let x=node.position.x,y=node.position.y,p=node.parentId;while(p){const parent=flowNodes.find(n=>n.id===p);x+=parent.position.x;y+=parent.position.y;p=parent.parentId;}setCenter(x+node.style.width/2,y+node.style.height/2,{zoom:.95,duration:250});}}
    setSelected(id);
  };
  useEffect(()=>{if(pendingFocus.current&&!activeClass){const id=pendingFocus.current;pendingFocus.current=null;const t=setTimeout(()=>focusDocument(id),180);return()=>clearTimeout(t);}},[activeClass,flowNodes]);
  const displayed=flowNodes.map(n=>({...n,selected:n.id===selected,style:n.style,data:{...n.data,actions,canChild:childOptions(n.data.doc,models).length>0}}));
  // MapView renders its own view-level dialogs (Document/QuickCreate/Connect),
  // but must never do so while a shell dialog (classes/compiler) or a save
  // conflict is showing — only one dialog is ever visible at a time.
  const showModal=modal&&!dialogs.current&&!documentsSource.conflicts;
  return html`<${Fragment}>
    <${Toolbar} ready=${ready} saving=${saving} dirty=${dirty}
      onAdd=${()=>setModal({})} onUndo=${undo} onRedo=${redo} canUndo=${canUndo} canRedo=${canRedo}
      onFit=${fit} onOverview=${overview}
      onSort=${()=>{edit(w=>({...w,view:{...w.view,positions:{}}}));setTimeout(fit,80);}}
      showRelations=${relationsShown} setShowRelations=${setShowRelations}
      onExport=${exportMap} onImport=${()=>dialogs.open({kind:'compiler'})}
      query=${query} setQuery=${setQuery}
      onSearch=${()=>{const found=documents.find(d=>titleOf(d).toLowerCase().includes(query.toLowerCase()));if(found&&query)focusDocument(found.id);else documentsSource.setNotice('No hay coincidencias');}}
      focusId=${focusId} focusTitle=${focusId?titleOf(documents.find(d=>d.id===focusId)):''} onExitFocus=${exitFocus}
      sidebarOpen=${sidebarOpen} setSidebarOpen=${setSidebarOpen}/>
    <div className="workspace">
      <${Sidebar} models=${models} counts=${counts} totalCount=${documents.length} activeClass=${activeClass} setActiveClass=${setActiveClass} sidebarOpen=${sidebarOpen}/>
      <section className="canvas" aria-label="Mapa de documentos" ref=${canvasRef}>
        ${ready?html`<${ReactFlow} nodes=${displayed} edges=${relationsShown?visibleProjection.edges:[]} nodeTypes=${nodeTypes} onNodesChange=${changes=>setFlowNodes(ns=>applyNodeChanges(changes,ns))} onNodeClick=${(_,n)=>{if(connecting&&connecting!==n.id)connect(n.id);else setSelected(n.id)}} onNodeDoubleClick=${(_,n)=>n.data.group?enterFocus(n.id):setModal({id:n.id})} onPaneClick=${()=>{setSelected(null);setConnecting(null);setSidebarOpen(false);}} onNodeDragStart=${checkpoint} onNodeDragStop=${(_,n)=>apply(w=>({...w,view:{...w.view,positions:{...w.view.positions,[n.id]:{...n.position,parentId:n.parentId||null}}}}))}
        nodesDraggable=${!saving&&!activeClass} nodesConnectable=${false} onMove=${(_,v)=>setZoom(v.zoom)} minZoom=${.01} maxZoom=${2} deleteKeyCode=${null} colorMode=${skin}><${Controls} showInteractive=${false}/><${MiniMap} pannable zoomable nodeColor=${n=>resolveToken('--class-color-'+classStyle(n.data.doc.model_name).slot)} ariaLabel="Vista general del mapa"/></${ReactFlow}>`:html`<div className="state"><h2>${status==='loading'?'Cargando tu KB…':'No se pudo abrir SLDB'}</h2>${status==='error'?html`<button onClick=${reload}>Reintentar</button>`:''}</div>`}
        ${ready&&!documents.length?html`<div className="state"><h2>Tu KB está vacía</h2><button onClick=${()=>setModal({})}>＋ Crear documento</button></div>`:''}
        <div className="canvas-hint">${activeClass?classStyle(activeClass).name+' · '+visibleProjection.nodes.length+' visibles':focusId?'Doble clic en un contenedor para entrar más profundo':'Doble clic en un contenedor para entrar · Ver todo muestra la KB completa'}</div>
      </section>
    </div>
    <${Statusbar} count=${documents.length} contained=${Object.keys(projection.parents).length} notice=${notice} zoom=${zoom}/>
    ${showModal?(modal.connection?html`<${ConnectDialog} key=${modal.sourceId+'-'+modal.targetId} spec=${modal} documents=${documents} models=${models} onClose=${()=>setModal(null)} onApply=${applyConnection}/>`:
      modal.quick?html`<${QuickCreateDialog} key=${'quick-'+(modal.parentId||'root')} spec=${modal} documents=${documents} models=${models} onClose=${()=>setModal(null)} onApply=${applyDocument}/>`:
      html`<${DocumentDialog} key=${modal.id||modal.parentId||'new'} spec=${modal} documents=${documents} models=${models} onClose=${()=>setModal(null)} onApply=${applyDocument}/>`):''}
  </${Fragment}>`;
}

function MapView(props) {
  return html`<${ReactFlowProvider}><${MapCanvas} ...${props}/></${ReactFlowProvider}>`;
}

export const mapView={id:'map', facet:'documents', label:'🗺 KB', component:MapView, shell:{primary:true}, styles:['/views/documents/map/map.css']};
