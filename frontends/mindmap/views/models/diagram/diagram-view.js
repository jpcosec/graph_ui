import {useState, useEffect, useMemo} from 'react';
import {ReactFlow, ReactFlowProvider, Controls, MiniMap, Handle, Position, useReactFlow, applyNodeChanges} from '@xyflow/react';
import dagre from 'dagre';
import {html} from '../../../shared/html.js';
import {schemaGraph, schemaMatches} from './projection.mjs';
import {ProjectionEditor} from './projection-editor.js';
import {classStyle, classVar} from '../../../shared/classes.mjs';
import {resolveToken} from '../../../shell/skin.js';
import {useSource} from '../../../source/source.js';
import {useShellDialogs} from '../../../shell/dialogs.js';

// Diagrama de CLASES: una card por modelo registrado con TODOS sus campos;
// cada arista de contención sale del puerto de su propio campo (handle con
// id = nombre del campo) y entra por la cabecera de la clase destino. Mismo
// React Flow y misma paleta que el mapa KB; el layout lo calcula dagre a
// partir del schema real, nunca coordenadas fijas.
const WIDTH=280,HEAD=50,ROW=20,PAD=12,FOOT=30;
const cardHeight=node=>HEAD+Math.max(node.fields.length,1)*ROW+PAD+FOOT;
function layout(graph){
  const g=new dagre.graphlib.Graph();
  g.setGraph({rankdir:'LR',nodesep:34,ranksep:110,marginx:24,marginy:24});
  g.setDefaultEdgeLabel(()=>({}));
  graph.nodes.forEach(n=>g.setNode(n.id,{width:WIDTH,height:cardHeight(n)}));
  // dagre no admite bucles: una arista de referencia puede ser self (p. ej.
  // TaskDoc.blocks -> TaskDoc), React Flow la dibuja pero dagre no la layoutea.
  graph.edges.forEach(e=>{if(e.source!==e.target)g.setEdge(e.source,e.target);});
  dagre.layout(g);
  return graph.nodes.map(n=>{const p=g.node(n.id);return {id:n.id,type:'class',position:{x:p.x-p.width/2,y:p.y-p.height/2},style:{width:p.width},data:{node:n}};});
}

function ClassNode({data,selected}) {
  const {node,dim,onEdit}=data,style=classStyle(node.id);
  return html`<div className=${'class-node'+(selected?' selected':'')+(dim?' dim':'')} style=${{'--class-color':classVar(style.slot)}} data-class=${node.id}>
    <header className="class-node-head"><${Handle} type="target" position=${Position.Left}/>
      <${Handle} type="source" position=${Position.Right} id="__class__" title="relaciones de la clase"/>
      <span className="class-node-icon">${style.icon}</span>
      <div><strong>${style.name}</strong><small title=${node.model.model_ref||node.id}>${node.id}</small>${node.displayTemplate?html`<small className="class-node-display" title="plantilla de la proyección activa">${node.displayTemplate}</small>`:''}</div>
      <span className="class-node-count" title=${node.docCount+' documento(s) de esta clase'}>${node.docCount}</span></header>
    <ul className="class-node-fields">
      ${node.fields.map(f=>html`<li key=${f.name} className=${f.contains?'contains':f.reference?'reference':''} title=${f.description||f.name}>
        <span className="field-name">${f.contains?'◆ ':f.reference?'⇢ ':''}${f.name}${f.required?html`<b aria-label="obligatorio">*</b>`:''}</span>
        <span className="field-type" title=${!f.contains&&f.inferred?.length?'inferido':undefined}>${f.contains?(f.contains.join(' | ')||'clase no registrada'):f.inferred?.length?f.inferred.join(' | ')+'?':(f.annotation||f.kind||'')}</span>
        ${f.contains?.length?html`<${Handle} type="source" position=${Position.Right} id=${f.name} title=${f.name+' → '+f.contains.join(', ')}/>`
          :f.inferred?.length?html`<${Handle} type="source" position=${Position.Right} id=${f.name} title=${f.name+' → '+f.inferred.join(', ')+' (inferido)'}/>`:''}
      </li>`)}
      ${!node.fields.length?html`<li className="more">sin campos</li>`:''}
    </ul>
    <footer className="class-node-foot"><span title=${node.model.model_ref||''}>${node.model.model_ref||''}</span>
      <button type="button" className="nodrag" onClick=${e=>{e.stopPropagation();onEdit(node.id);}}>✎ Editar</button></footer>
  </div>`;
}
const nodeTypes={class:ClassNode};

function SchemaCanvas({skin,onModalChange}) {
  const kb=useSource();
  const dialogs=useShellDialogs();
  // Schema always graphs the FULL store — never the active projection's
  // subset (unlike KB/Flow, see source/projections.js) — and only asks
  // schemaGraph to mark what the projection includes, for dimming.
  const models=kb.models.models,documents=kb.documents.working.documents;
  const activeProjection=kb.projections.active;
  const onEditClass=id=>dialogs.open({kind:'classes',model:id||null});
  const {fitView}=useReactFlow();
  const [query,setQuery]=useState('');
  const [editingProjection,setEditingProjection]=useState(false);
  useEffect(()=>{onModalChange?.(editingProjection);},[editingProjection,onModalChange]);
  const applyProjectionEdit=nextPayload=>{
    // Staged like any other document edit (map-view.js's applyConnection is
    // the same pattern): Schema has no shell.primary chrome of its own, so
    // the actual save happens from KB, same as every other Schema→documents
    // mutation would.
    kb.documents.edit(w=>({...w,documents:w.documents.map(d=>d.id===activeProjection.id?{...d,payload:nextPayload}:d)}));
    kb.documents.setNotice('Proyección actualizada — confirma con «Guardar en SLDB» desde KB.');
    setEditingProjection(false);
  };
  const graph=useMemo(()=>schemaGraph(models,documents,activeProjection),[models,documents,activeProjection]);
  const byId=useMemo(()=>Object.fromEntries(graph.nodes.map(n=>[n.id,n])),[graph]);
  // Mismo patrón que el mapa KB: los nodos viven en estado y React Flow aplica
  // selección/arrastre vía onNodesChange; el layout de dagre solo los siembra.
  const [flowNodes,setFlowNodes]=useState([]);
  useEffect(()=>{setFlowNodes(layout(graph));},[graph]);
  useEffect(()=>{const t=setTimeout(()=>fitView({padding:.1,maxZoom:1,duration:200}),60);return()=>clearTimeout(t);},[graph,fitView]);
  const selected=flowNodes.find(n=>n.selected)?.id||null;
  const matches=id=>schemaMatches(byId[id],query)&&byId[id]?.included!==false;
  const displayed=flowNodes.map(n=>({...n,data:{...n.data,dim:!matches(n.id),onEdit:onEditClass}}));
  const edges=graph.edges.map(e=>{
    const active=selected&&(e.source===selected||e.target===selected);
    // Not gated behind `query`: with no text filter and no projection active
    // matches() is always true (schemaMatches('') + included!==false), so
    // this keeps the old no-op behaviour and adds projection dimming.
    const dim=!(matches(e.source)&&matches(e.target))||(e.kind==='relation'&&e.included===false)||(selected&&!active);
    const labelStyle={fontSize:10,fill:active?'var(--ink)':'var(--text-secondary)',fontWeight:active?600:400};
    const labelBgStyle={fill:'var(--surface-app)'},labelBgPadding=[4,2];
    if(e.kind==='relation') {
      const declaredUnseen=e.declared&&!e.count;
      return {id:e.id,source:e.source,sourceHandle:'__class__',target:e.target,type:'smoothstep',
        label:`${e.type}${e.count?' ×'+e.count:''}`,
        style:{stroke:'var(--accent)',strokeWidth:active?2:1.4,opacity:dim?.18:1,strokeDasharray:declaredUnseen?'2 3':undefined},
        markerEnd:{type:'arrowclosed',width:12,height:12,color:'var(--accent)'},labelStyle,labelBgStyle,labelBgPadding};
    }
    if(e.kind==='reference') {
      return {id:e.id,source:e.source,sourceHandle:e.field,target:e.target,type:'smoothstep',
        label:`${e.field} ×${e.count}`,
        style:{stroke:'var(--edge)',strokeWidth:active?2.2:1.4,opacity:dim?.18:1,strokeDasharray:'5 4'},
        markerEnd:{type:'arrowclosed',width:12,height:12,color:'var(--edge)'},labelStyle,labelBgStyle,labelBgPadding};
    }
    const colorVar=classVar(classStyle(e.source).slot);
    return {id:e.id,source:e.source,sourceHandle:e.field,target:e.target,type:'smoothstep',label:e.field,
      style:{stroke:colorVar,strokeWidth:active?2.6:1.6,opacity:dim?.18:1},
      markerEnd:{type:'arrowclosed',width:14,height:14,color:colorVar},labelStyle,labelBgStyle,labelBgPadding};});
  const totalFields=graph.nodes.reduce((s,n)=>s+n.fields.length,0);
  const byKind=kind=>graph.edges.filter(e=>e.kind===kind).length;
  const countParts=[`${graph.nodes.length} clases`,`${totalFields} campos`];
  if(byKind('containment'))countParts.push(`${byKind('containment')} contenciones`);
  if(byKind('relation'))countParts.push(`${byKind('relation')} relaciones`);
  if(byKind('reference'))countParts.push(`${byKind('reference')} referencias`);
  return html`<div className="schema" aria-label="Diagrama de clases">
    <div className="schema-bar" role="toolbar" aria-label="Herramientas del diagrama">
      <strong>📐 Diagrama de clases</strong>
      <span className="schema-count">${countParts.join(' · ')}</span>
      <input className="schema-filter" aria-label="Filtrar clases" placeholder="Filtrar clase, campo o tipo…" value=${query} onInput=${e=>setQuery(e.target.value)}/>
      <button type="button" onClick=${()=>fitView({padding:.1,duration:200})}>⛶ Ver todo</button>
      <button type="button" className="schema-edit" onClick=${()=>onEditClass(selected)}>📐 Editar clases</button>
      <button type="button" className="schema-projection-edit" disabled=${!activeProjection}
        title=${activeProjection?'Editar qué clases, relaciones y plantillas entran en esta proyección':'Selecciona una proyección en la barra superior para editarla'}
        onClick=${()=>setEditingProjection(true)}>🎛 Editar proyección</button>
    </div>
    <div className="schema-canvas">
      <${ReactFlow} nodes=${displayed} edges=${edges} nodeTypes=${nodeTypes} onNodesChange=${changes=>setFlowNodes(ns=>applyNodeChanges(changes,ns))}
        minZoom=${.08} maxZoom=${2} nodesConnectable=${false} deleteKeyCode=${null} colorMode=${skin||'light'}
        onNodeDoubleClick=${(_,n)=>onEditClass(n.id)}>
        <${Controls} showInteractive=${false}/>
        <${MiniMap} pannable zoomable nodeColor=${n=>resolveToken('--class-color-'+classStyle(n.id).slot)} ariaLabel="Vista general del diagrama"/>
      </${ReactFlow}>
      <div className="schema-legend"><span><i className="legend-contain"></i>◆ Contención: la flecha sale del campo que guarda los IDs de la clase destino</span>
        <span><i className="legend-relation"></i>Relación: tipo declarado por un RelationTypeDoc y/u observado en documentos de relación (kgdb), cabecera a cabecera; punteada = declarada pero sin instancias</span>
        <span><i className="legend-ref"></i>⇢ Referencia: campo con IDs; el destino se infiere de los documentos reales cuando no hay clase declarada</span>
        <span><b>*</b> obligatorio · <b>?</b> destino inferido, no declarado · doble clic o ✎ abre el editor de la clase</span></div>
      ${!graph.nodes.length?html`<div className="state"><h2>Este store no tiene clases registradas</h2></div>`:''}
    </div>
    ${editingProjection&&activeProjection?html`<${ProjectionEditor} projection=${activeProjection} models=${models} documents=${documents} onClose=${()=>setEditingProjection(false)} onApply=${applyProjectionEdit}/>`:''}
  </div>`;
}

function DiagramView(props) {
  return html`<${ReactFlowProvider}><${SchemaCanvas} ...${props}/></${ReactFlowProvider}>`;
}

export const diagramView={id:'diagram', facet:'models', label:'📐 Schema', component:DiagramView, shell:{primary:false}, styles:['/views/models/diagram/diagram.css']};
