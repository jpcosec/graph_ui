import {useState, useEffect, useMemo} from 'react';
import {ReactFlow, ReactFlowProvider, Controls, MiniMap, Handle, Position, useReactFlow, applyNodeChanges} from '@xyflow/react';
import dagre from 'dagre';
import {html} from '../../../shared/html.js';
import {request} from '../../../shell/api.js';
import {useSource} from '../../../source/source.js';
import {specCatalog, buildScene, byDepth, compartmentLine, POINT_SHAPES, TERMINALS} from './notation.mjs';

// Vista genérica de notación: dibuja un spec de spec2viz tal como lo resuelve
// GET /api/notation/view (resolve_view de spec2viz). Nada aquí distingue UML,
// statechart o secuencia: la forma viene del glifo y el trazo del link. El
// layout lo calcula dagre (compuesto, para el anidado), nunca coordenadas del
// store: posiciones y plegado son estado de la superficie (contrato §7).
const STORAGE_KEY = 'kb-notation-spec';
const PAD = 18, HEAD = 30;
const HANDLES = {TB: [Position.Top, Position.Bottom], BT: [Position.Bottom, Position.Top],
  LR: [Position.Left, Position.Right], RL: [Position.Right, Position.Left]};

function layout(scene) {
  const g = new dagre.graphlib.Graph({compound: true});
  // En horizontal los rótulos de las transiciones corren a lo largo del rango.
  const horizontal = scene.direction === 'LR' || scene.direction === 'RL';
  g.setGraph({rankdir: scene.direction, nodesep: horizontal ? 60 : 46, ranksep: horizontal ? 150 : 74, marginx: 24, marginy: 24});
  g.setDefaultEdgeLabel(() => ({}));
  const byId = new Map(scene.nodes.map(n => [n.id, n]));
  for (const n of scene.nodes) g.setNode(n.id, n.container ? {} : {width: n.width, height: n.height});
  for (const n of scene.nodes) if (n.parent) g.setParent(n.id, n.parent);
  // dagre no admite aristas hacia un clúster: se apoyan en una hoja del
  // contenedor para el layout; se dibujan igual hacia el contenedor.
  const leaf = id => { let n = byId.get(id); while (n?.container) n = scene.nodes.find(c => c.parent === n.id); return n?.id || id; };
  for (const e of scene.edges) { const s = leaf(e.source), t = leaf(e.target); if (s !== t) g.setEdge(s, t); }
  dagre.layout(g);
  const box = new Map();
  for (const n of scene.nodes) if (!n.container) { const p = g.node(n.id); box.set(n.id, {x: p.x - n.width / 2, y: p.y - n.height / 2, w: n.width, h: n.height}); }
  // Contenedores de adentro hacia afuera: su caja envuelve a sus hijos.
  for (const n of [...byDepth(scene.nodes)].reverse()) {
    if (!n.container) continue;
    const kids = scene.nodes.filter(c => c.parent === n.id && box.has(c.id)).map(c => box.get(c.id));
    if (!kids.length) { const p = g.node(n.id); box.set(n.id, {x: p.x - n.width / 2, y: p.y - n.height / 2, w: n.width, h: n.height}); continue; }
    const x = Math.min(...kids.map(k => k.x)) - PAD, y = Math.min(...kids.map(k => k.y)) - PAD - HEAD;
    const w = Math.max(Math.max(...kids.map(k => k.x + k.w)) + PAD - x, n.width);
    box.set(n.id, {x, y, w, h: Math.max(...kids.map(k => k.y + k.h)) + PAD - y});
  }
  return byDepth(scene.nodes).map(n => {
    const b = box.get(n.id), parent = n.parent && box.get(n.parent);
    return {id: n.id, type: 'glyph', parentId: n.parent || undefined, zIndex: n.container ? 0 : 1,
      position: parent ? {x: b.x - parent.x, y: b.y - parent.y} : {x: b.x, y: b.y},
      style: {width: b.w, height: b.h}, data: {glyph: n.glyph, container: n.container, direction: scene.direction}};
  });
}

function GlyphNode({data, selected}) {
  const {glyph: g, container, direction} = data;
  const [inPos, outPos] = HANDLES[direction] || HANDLES.TB;
  const point = POINT_SHAPES.includes(g.shape);
  const label = html`<span className=${'glyph-label' + (g.label_style ? ' is-' + g.label_style : '')}>${g.label}</span>`;
  const compartments = (g.compartments || []).filter(c => c.items && c.items.length);
  return html`<div className=${'glyph shape-' + g.shape + (container ? ' is-container' : '') + (selected ? ' selected' : '')}
      data-doc=${g.doc} data-glyph=${g.glyph} data-function=${g.function || ''} title=${g.doc}>
    <${Handle} type="target" position=${inPos}/><${Handle} type="source" position=${outPos}/>
    ${(g.markers || []).map(m => html`<span key=${m.id} className=${'glyph-marker marker-' + m.shape} title=${m.id} data-marker=${m.id}></span>`)}
    ${point ? html`<span className="glyph-point-label">${g.label}</span>`
      : html`<header className="glyph-head">${g.keyword ? html`<small className="glyph-keyword">${g.keyword}</small>` : ''}${label}</header>
        ${compartments.map(c => html`<ul key=${c.path} className="glyph-compartment" data-path=${c.path}>${c.items.map((item, i) => html`<li key=${i}>${compartmentLine(item)}</li>`)}</ul>`)}`}
  </div>`;
}
const nodeTypes = {glyph: GlyphNode};

// Terminales como <marker> SVG propios: React Flow solo trae flechas.
// orient=auto-start-reverse sirve el mismo marker para el origen.
const MARKER_PATHS = {
  'open-arrow': html`<path d="M1,1 L11,6 L1,11" fill="none"/>`,
  'filled-arrow': html`<path d="M1,1 L11,6 L1,11 Z" className="solid"/>`,
  'hollow-triangle': html`<path d="M1,1 L11,6 L1,11 Z" className="hollow"/>`,
  'filled-triangle': html`<path d="M1,1 L11,6 L1,11 Z" className="solid"/>`,
  'hollow-diamond': html`<path d="M1,6 L6,2 L11,6 L6,10 Z" className="hollow"/>`,
  'filled-diamond': html`<path d="M1,6 L6,2 L11,6 L6,10 Z" className="solid"/>`,
  'filled-circle': html`<circle cx="6" cy="6" r="4" className="solid"/>`,
  'hollow-circle': html`<circle cx="6" cy="6" r="4" className="hollow"/>`,
  'bar': html`<path d="M10,1 L10,11" fill="none"/>`,
  'crowfoot': html`<path d="M11,1 L1,6 L11,11 M1,6 L11,6" fill="none"/>`,
};
function TerminalDefs() {
  return html`<svg className="notation-defs" aria-hidden="true" width="0" height="0"><defs>
    ${TERMINALS.map(t => html`<marker key=${t} id=${'nv-' + t} className="notation-terminal" viewBox="0 0 12 12" refX="11" refY="6"
      markerWidth="14" markerHeight="14" markerUnits="userSpaceOnUse" orient="auto-start-reverse">${MARKER_PATHS[t]}</marker>`)}
  </defs></svg>`;
}

function edgesOf(scene, selected) {
  return scene.edges.map(e => {
    const active = selected && (e.source === selected || e.target === selected);
    return {id: e.id, source: e.source, target: e.target, type: 'smoothstep', label: e.label || undefined,
      data: {relation: e.relation}, className: 'notation-edge',
      markerEnd: e.targetEnd ? 'nv-' + e.targetEnd : undefined, markerStart: e.sourceEnd ? 'nv-' + e.sourceEnd : undefined,
      style: {stroke: 'var(--edge)', strokeWidth: active ? 2.2 : 1.4, strokeDasharray: e.dash, opacity: selected && !active ? .25 : 1},
      labelStyle: {fontSize: 10, fill: 'var(--text-secondary)'}, labelBgStyle: {fill: 'var(--surface-app)'}, labelBgPadding: [4, 2]};
  });
}

function NotationCanvas({skin}) {
  const kb = useSource();
  const catalog = useMemo(() => specCatalog(kb.documents.working.documents), [kb.documents.working.documents]);
  const specIds = catalog.flatMap(g => g.specs.map(s => s.id));
  const [specId, setSpecId] = useState(() => { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } });
  const current = specIds.includes(specId) ? specId : specIds[0] || null;
  const [state, setState] = useState({phase: 'idle', view: null, error: null});
  const {fitView} = useReactFlow();

  useEffect(() => {
    if (!current) return;
    let cancelled = false;
    setState({phase: 'loading', view: null, error: null});
    request('/api/notation/view?spec=' + encodeURIComponent(current))
      .then(view => { if (!cancelled) setState({phase: 'ok', view, error: null}); })
      .catch(error => { if (!cancelled) setState({phase: 'error', view: null, error: error?.body?.error || error?.message || 'No se pudo resolver el spec'}); });
    return () => { cancelled = true; };
  }, [current]);

  const scene = useMemo(() => (state.view ? buildScene(state.view) : null), [state.view]);
  const [flowNodes, setFlowNodes] = useState([]);
  useEffect(() => { setFlowNodes(scene ? layout(scene) : []); }, [scene]);
  useEffect(() => { const t = setTimeout(() => fitView({padding: .12, maxZoom: 1.1, duration: 200}), 60); return () => clearTimeout(t); }, [flowNodes.length, scene, fitView]);
  const selected = flowNodes.find(n => n.selected)?.id || null;

  const choose = id => { setSpecId(id); try { localStorage.setItem(STORAGE_KEY, id); } catch {} };
  const view = state.view;
  return html`<div className="notation" aria-label="Vista de notación">
    <nav className="notation-catalog" aria-label="Specs del store">
      ${catalog.map(group => html`<section key=${group.category}><h3>${group.category}</h3><ul>
        ${group.specs.map(s => html`<li key=${s.id}><button type="button" className=${s.id === current ? 'active' : ''} aria-current=${s.id === current ? 'true' : undefined}
          title=${s.summary || s.title} data-spec=${s.id} onClick=${() => choose(s.id)}><strong>${s.nav}</strong><small>${s.diagramType}${s.notation ? '' : ' · sin notación'}</small></button></li>`)}
      </ul></section>`)}
    </nav>
    <div className="notation-main">
      <div className="notation-bar" role="toolbar" aria-label="Herramientas de la vista">
        <strong>${view ? view.title : current || 'Specs'}</strong>
        ${view ? html`<span className="notation-meta">${view.notation.replace(/^NotationDoc:/, '')} · ${view.nodes.length} elementos · ${view.links.length} relaciones</span>` : ''}
        <button type="button" onClick=${() => fitView({padding: .12, duration: 200})}>⛶ Ver todo</button>
      </div>
      ${scene && scene.notices.length ? html`<div className="notation-notices" role="status">${scene.notices.map(n => html`<p key=${n}>${n}</p>`)}</div>` : ''}
      <div className="notation-canvas">
        <${TerminalDefs}/>
        ${!current ? html`<div className="state"><h2>Este store no tiene specs de spec2viz</h2><p>Sincroniza uno con <code>spec2viz diagram sync spec.yml --store .sldb</code>.</p></div>`
          : state.phase === 'error' ? html`<div className="state" role="alert"><h2>No se pudo dibujar ${current}</h2><p>${state.error}</p></div>`
          : state.phase === 'loading' ? html`<div className="state"><p>Resolviendo la notación…</p></div>`
          : html`<${ReactFlow} nodes=${flowNodes} edges=${scene ? edgesOf(scene, selected) : []} nodeTypes=${nodeTypes}
              onNodesChange=${changes => setFlowNodes(ns => applyNodeChanges(changes, ns))}
              minZoom=${.08} maxZoom=${2} nodesConnectable=${false} deleteKeyCode=${null} colorMode=${skin || 'light'}>
              <${Controls} showInteractive=${false}/>
              <${MiniMap} pannable zoomable ariaLabel="Vista general del spec"/>
            </${ReactFlow}>`}
      </div>
    </div>
  </div>`;
}

function NotationView(props) {
  return html`<${ReactFlowProvider}><${NotationCanvas} ...${props}/></${ReactFlowProvider}>`;
}

export const notationView = {id: 'notation', facet: 'specs', label: '🧩 Specs', component: NotationView, shell: {primary: false}, styles: ['/views/specs/notation/notation.css']};
