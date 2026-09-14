import {useState, useEffect, useMemo} from 'react';
import {ReactFlow, ReactFlowProvider, Controls, MiniMap, Handle, Position, useReactFlow, applyNodeChanges} from '@xyflow/react';
import dagre from 'dagre';
import {html} from '../../../shared/html.js';
import {flowGraph, flowMatches, flowClasses} from './projection.mjs';
import {classStyle, classVar} from '../../../shared/classes.mjs';
import {referenceFieldsOf} from '../../../shared/documents.mjs';
import {resolveToken} from '../../../shell/skin.js';
import {useSource} from '../../../source/source.js';

// Vista FLUJO: los documentos del store real como un grafo dirigido — un
// nodo compacto por documento, una arista por relación (contención Y
// referencia, a diferencia del mapa KB que anida la contención). Recupera la
// lectura que tenía el editor `flow_editor` retirado (dagre LR, inspector),
// pero sobre documentos SLDB reales en vez de pasos de flujo hardcodeados.
// Solo lectura: no muta el store, no tiene shell.primary.
const WIDTH=190,HEIGHT=46;
// Solo los documentos con alguna relación pasan por dagre; en un store donde
// la mayoría está suelta (p. ej. pron: 68 documentos, 37 relaciones entre
// pocos) dagre apilaba todo en una columna ilegible. Los sueltos van en una
// cuadrícula compacta debajo del grafo.
function layout(graph){
  const linked=new Set();graph.edges.forEach(e=>{linked.add(e.source);linked.add(e.target);});
  const connected=graph.nodes.filter(n=>linked.has(n.id)),loose=graph.nodes.filter(n=>!linked.has(n.id));
  const flowNode=(n,x,y)=>({id:n.id,type:'flow',position:{x,y},style:{width:WIDTH},data:{node:n}});
  const out=[];let bottom=0;
  if(connected.length){
    const g=new dagre.graphlib.Graph();
    g.setGraph({rankdir:'LR',nodesep:24,ranksep:90,marginx:24,marginy:24});
    g.setDefaultEdgeLabel(()=>({}));
    connected.forEach(n=>g.setNode(n.id,{width:WIDTH,height:HEIGHT}));
    graph.edges.forEach(e=>g.setEdge(e.source,e.target));
    dagre.layout(g);
    connected.forEach(n=>{const p=g.node(n.id);out.push(flowNode(n,p.x-p.width/2,p.y-p.height/2));bottom=Math.max(bottom,p.y+p.height/2);});
  }
  const cols=Math.max(1,Math.min(8,Math.ceil(Math.sqrt(loose.length))));
  const top=bottom?bottom+72:24;
  loose.forEach((n,i)=>out.push(flowNode(n,24+(i%cols)*(WIDTH+20),top+Math.floor(i/cols)*(HEIGHT+14))));
  return out;
}

function FlowNode({data,selected}) {
  const {node,dim}=data,style=classStyle(node.doc.model_name);
  const title=useSource().projections.titleFor(node.doc);
  return html`<div className=${'flow-node'+(selected?' selected':'')+(dim?' dim':'')} style=${{'--class-color':classVar(style.slot)}} data-doc=${node.id} title=${title+' · '+node.id}>
    <${Handle} type="target" position=${Position.Left}/>
    <span className="flow-node-icon">${style.icon}</span>
    <span className="flow-node-title">${title}</span>
    <${Handle} type="source" position=${Position.Right}/>
  </div>`;
}
const nodeTypes={flow:FlowNode};

function FlowCanvas({skin}) {
  const kb=useSource();
  // Same projected subset as the KB map (source/projections.js): identity
  // pass-through when no projection is active.
  const documents=kb.projections.documents,models=kb.models.models;
  const {fitView}=useReactFlow();
  const [query,setQuery]=useState('');
  const [activeClass,setActiveClass]=useState('');
  const [selected,setSelected]=useState(null);
  const [relationsAsNodes,setRelationsAsNodes]=useState(false);
  const graph=useMemo(()=>flowGraph(documents,models,{relationsAsNodes}),[documents,models,relationsAsNodes]);
  const byId=useMemo(()=>Object.fromEntries(graph.nodes.map(n=>[n.id,n])),[graph]);
  const classOptions=useMemo(()=>flowClasses(graph.nodes),[graph]);
  const visibleGraph=useMemo(()=>{
    if(!activeClass)return graph;
    const ids=new Set(graph.nodes.filter(n=>n.doc.model_name===activeClass).map(n=>n.id));
    return {nodes:graph.nodes.filter(n=>ids.has(n.id)), edges:graph.edges.filter(e=>ids.has(e.source)&&ids.has(e.target))};
  },[graph,activeClass]);
  const [flowNodes,setFlowNodes]=useState([]);
  // Mismo patrón que el mapa KB y Schema: dagre solo siembra el layout
  // cuando cambia el grafo visible; React Flow aplica selección/arrastre.
  useEffect(()=>{setFlowNodes(layout(visibleGraph));},[visibleGraph]);
  useEffect(()=>{const t=setTimeout(()=>fitView({padding:.12,maxZoom:1,duration:200}),60);return()=>clearTimeout(t);},[visibleGraph,fitView]);
  useEffect(()=>{if(selected&&!byId[selected])setSelected(null);},[byId,selected]);
  const matches=id=>flowMatches(byId[id],query);
  const displayed=flowNodes.map(n=>({...n,selected:n.id===selected,data:{...n.data,dim:!matches(n.id)}}));
  const edges=visibleGraph.edges.map(e=>{
    const colorVar=e.contains?classVar(classStyle(byId[e.source].doc.model_name).slot):'var(--edge)';
    const active=selected&&(e.source===selected||e.target===selected);
    const dim=(query&&!(matches(e.source)&&matches(e.target)))||(selected&&!active);
    return {id:e.id,source:e.source,target:e.target,type:'smoothstep',label:e.field,
      style:{stroke:colorVar,strokeWidth:active?2.6:1.6,opacity:dim?.15:1,strokeDasharray:e.contains?undefined:'5 4'},
      markerEnd:{type:'arrowclosed',width:14,height:14,color:colorVar},
      labelStyle:{fontSize:10,fill:active?'var(--ink)':'var(--text-secondary)',fontWeight:active?600:400},
      labelBgStyle:{fill:'var(--surface-app)'},labelBgPadding:[4,2]};
  });
  const selectedDoc=selected?byId[selected]?.doc:null;
  const inspectorFields=useMemo(()=>{
    if(!selectedDoc)return [];
    const descriptor=(models||[]).find(m=>m.id===selectedDoc.model_name);
    return [...referenceFieldsOf(descriptor)].sort().map(field=>({field,value:selectedDoc.payload[field]}));
  },[selectedDoc,models]);
  return html`<div className="flow" aria-label="Vista de flujo">
    <div className="flow-bar" role="toolbar" aria-label="Herramientas de flujo">
      <strong>⇢ Flujo</strong>
      <span className="flow-count">${graph.nodes.length} documentos · ${graph.edges.length} relaciones</span>
      <input className="flow-filter" aria-label="Filtrar documentos" placeholder="Filtrar título, id o clase…" value=${query} onInput=${e=>setQuery(e.target.value)}/>
      <select className="flow-class" aria-label="Filtrar por clase" value=${activeClass} onChange=${e=>{setActiveClass(e.target.value);setSelected(null);}}>
        <option value="">Todas las clases</option>
        ${classOptions.map(id=>html`<option key=${id} value=${id}>${classStyle(id).name}</option>`)}
      </select>
      <label className="flow-relations-toggle"><input type="checkbox" className="flow-relations-as-nodes" checked=${relationsAsNodes} onChange=${e=>{setRelationsAsNodes(e.target.checked);setSelected(null);}}/> Relaciones como nodos</label>
      <button type="button" onClick=${()=>fitView({padding:.12,duration:200})}>⛶ Ver todo</button>
    </div>
    <div className="flow-body">
      <div className="flow-canvas">
        ${graph.nodes.length?html`<${ReactFlow} nodes=${displayed} edges=${edges} nodeTypes=${nodeTypes}
          onNodesChange=${changes=>setFlowNodes(ns=>applyNodeChanges(changes,ns))}
          onNodeClick=${(_,n)=>setSelected(n.id===selected?null:n.id)} onPaneClick=${()=>setSelected(null)}
          minZoom=${.08} maxZoom=${2} nodesConnectable=${false} deleteKeyCode=${null} colorMode=${skin||'light'}>
          <${Controls} showInteractive=${false}/>
          <${MiniMap} pannable zoomable nodeColor=${n=>resolveToken('--class-color-'+classStyle(n.data.node.doc.model_name).slot)} ariaLabel="Vista general del flujo"/>
        </${ReactFlow}>`:html`<div className="state"><h2>Este store no tiene documentos</h2></div>`}
      </div>
      ${selectedDoc?html`<aside className="flow-inspector" aria-label="Inspector de documento">
        <header><span className="flow-inspector-icon">${classStyle(selectedDoc.model_name).icon}</span><strong>${kb.projections.titleFor(selectedDoc)}</strong>
          <button type="button" aria-label="Cerrar inspector" onClick=${()=>setSelected(null)}>×</button></header>
        <dl className="flow-inspector-identity">
          <div><dt>Clase</dt><dd>${classStyle(selectedDoc.model_name).name}</dd></div>
          <div><dt>ID</dt><dd>${selectedDoc.id}</dd></div>
          ${selectedDoc.path?html`<div><dt>Ruta</dt><dd>${selectedDoc.path}</dd></div>`:''}
        </dl>
        ${inspectorFields.length?html`<h4>Contención / referencias</h4><dl className="flow-inspector-fields">${inspectorFields.map(f=>html`<div key=${f.field}><dt>${f.field}</dt><dd>${Array.isArray(f.value)?(f.value.join(', ')||'—'):(f.value||'—')}</dd></div>`)}</dl>`:''}
      </aside>`:''}
    </div>
  </div>`;
}

function FlowView(props) {
  return html`<${ReactFlowProvider}><${FlowCanvas} ...${props}/></${ReactFlowProvider}>`;
}

export const flowView={id:'flow', facet:'documents', label:'⇢ Flujo', component:FlowView, shell:{primary:false}, styles:['/views/documents/flow/flow.css']};
