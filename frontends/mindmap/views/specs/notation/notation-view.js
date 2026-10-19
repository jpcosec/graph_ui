import {useState, useEffect, useMemo} from 'react';
import {ReactFlow, ReactFlowProvider, Controls, MiniMap, Handle, Position, useReactFlow, applyNodeChanges, BaseEdge, EdgeLabelRenderer, getSmoothStepPath} from '@xyflow/react';
import dagre from 'dagre';
import {html} from '../../../shared/html.js';
import {request} from '../../../shell/api.js';
import {useSource} from '../../../source/source.js';
import {specCatalog, sceneFor, byDepth, compartmentLine, cellKey, LANE, POINT_SHAPES, TERMINALS} from './notation.mjs';

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

// Cuerpo del glifo, sin handles: lo usan los nodos de React Flow y las
// cabeceras de carril (que no viven dentro de React Flow).
function Glyph({glyph: g, container, selected, children, style}) {
  const point = POINT_SHAPES.includes(g.shape);
  const label = html`<span className=${'glyph-label' + (g.label_style ? ' is-' + g.label_style : '')}>${g.label}</span>`;
  const compartments = (g.compartments || []).filter(c => c.items && c.items.length);
  return html`<div className=${'glyph shape-' + g.shape + (container ? ' is-container' : '') + (selected ? ' selected' : '')} style=${style}
      data-doc=${g.doc} data-glyph=${g.glyph} data-function=${g.function || ''} title=${g.doc}>
    ${children}
    ${(g.markers || []).map(m => html`<span key=${m.id} className=${'glyph-marker marker-' + m.shape} title=${m.id} data-marker=${m.id}></span>`)}
    ${point ? html`<span className="glyph-point-label">${g.label}</span>`
      : html`<header className="glyph-head">${g.keyword ? html`<small className="glyph-keyword">${g.keyword}</small>` : ''}${label}</header>
        ${compartments.map(c => html`<ul key=${c.path} className="glyph-compartment" data-path=${c.path}>${c.items.map((item, i) => html`<li key=${i}>${compartmentLine(item)}</li>`)}</ul>`)}`}
  </div>`;
}

function GlyphNode({data, selected}) {
  const [inPos, outPos] = HANDLES[data.direction] || HANDLES.TB;
  return html`<${Glyph} glyph=${data.glyph} container=${data.container} selected=${selected}>
    <${Handle} type="target" position=${inPos}/><${Handle} type="source" position=${outPos}/>
  </${Glyph}>`;
}
const nodeTypes = {glyph: GlyphNode};

// Carriles: cabecera = glifo del participante, línea de vida vertical, un
// mensaje por fila en orden de `order`. Una autollamada es un bucle.
function LanesDiagram({scene}) {
  const {lanes, messages, head, lifelineTop, width, height} = scene;
  return html`<div className="notation-lanes" style=${{width: width + 'px', height: height + 'px'}}>
    ${lanes.map(l => html`<div key=${l.id} className="lane-head" data-lane=${l.id}
        style=${{left: (l.x - l.width / 2) + 'px', top: (LANE.top + head - l.height) + 'px', width: l.width + 'px', height: l.height + 'px'}}>
      <${Glyph} glyph=${l.glyph}/></div>`)}
    <svg className="lanes-svg" width=${width} height=${height} aria-label="Mensajes">
      ${(scene.frames || []).map(f => html`<g key=${f.id} className="lane-frame" data-fragment=${f.id} data-orders=${f.orders.join(',')}>
        <rect x=${f.x} y=${f.y} width=${f.width} height=${f.height} className="frame-box"/>
        <path d=${`M${f.x},${f.y + 16} h${Math.max(30, (f.operator || f.label).length * 6.5 + 12)} l6,-6 v-10`} className="frame-tab"/>
        <text x=${f.x + 6} y=${f.y + 12} className="frame-label" data-operator=${f.operator}>${f.operator || f.label}</text>
        ${f.operator && f.label ? html`<text x=${f.x + Math.max(30, f.operator.length * 6.5 + 12) + 14} y=${f.y + 12} className="frame-guard">[${f.label}]</text>` : ''}
      </g>`)}
      ${lanes.map(l => html`<line key=${l.id} className="lifeline" data-lifeline=${l.id} x1=${l.x} x2=${l.x} y1=${lifelineTop} y2=${height - LANE.top}/>`)}
      ${messages.map(m => {
        const ends = {markerEnd: m.targetEnd ? `url(#nv-${m.targetEnd})` : undefined, markerStart: m.sourceEnd ? `url(#nv-${m.sourceEnd})` : undefined};
        const path = m.self
          ? `M${m.x1},${m.y - LANE.row / 3} h${LANE.loop} v${LANE.row / 3 * 2} h${-LANE.loop}`
          : `M${m.x1},${m.y} L${m.x2},${m.y}`;
        const tx = m.self ? m.x1 + LANE.loop + 6 : (m.x1 + m.x2) / 2, ty = m.self ? m.y + 4 : m.y - 6;
        return html`<g key=${m.id} className="lane-message" data-message=${m.id} data-order=${m.order} data-from=${m.from} data-to=${m.to} data-y=${m.y}>
          <path d=${path} className="message-line" strokeDasharray=${m.dash} markerEnd=${ends.markerEnd} markerStart=${ends.markerStart}/>
          <text x=${tx} y=${ty} textAnchor=${m.self ? 'start' : 'middle'} className="message-label">${m.order}. ${m.label}</text>
        </g>`;
      })}
    </svg>
  </div>`;
}

// Grilla: una tabla por vista; columnas = stages, filas = components
// (indentadas por anidado), celda marcada con su label. Una fila sin
// celdas en una vista se dibuja vacía, no se omite.
function GridDiagram({scene}) {
  return html`<div className="notation-grids">${scene.grids.map(grid => html`<table key=${grid.view} className="notation-grid" data-view=${grid.view}>
    <caption>${grid.label}</caption>
    <thead><tr><th scope="col"></th>${grid.columns.map(c => html`<th key=${c.id} scope="col" data-col=${c.id}>${c.label}</th>`)}</tr></thead>
    <tbody>${scene.rows.map(r => html`<tr key=${r.id} data-row=${r.id}>
      <th scope="row" style=${{paddingLeft: (10 + r.depth * 16) + 'px'}} data-depth=${r.depth}>${r.label}</th>
      ${grid.columns.map(c => {
        const labels = scene.cells[cellKey(r.id, c.id)];
        // G7: una celda marcada es una marca; lo que diga el link queda en el title (la
        // columna ya nombra la vista), para que la grilla se lea de un vistazo.
        const detail = labels ? labels.filter(Boolean).join(', ') : '';
        return html`<td key=${c.id} data-cell=${r.id + '|' + c.id} className=${labels ? 'is-filled' : ''} title=${labels ? detail || c.label : undefined}>${labels ? html`<span className="cell-mark" aria-label=${detail || c.label}>●</span>` : ''}</td>`;
      })}
    </tr>`)}</tbody>
  </table>`)}</div>`;
}

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

// Rótulo de extremo: junto al puerto, desplazado hacia fuera del nodo según
// el lado por el que sale la arista, para que no tape la punta.
const END_OFFSET = {[Position.Bottom]: [12, 14], [Position.Top]: [12, -14], [Position.Right]: [16, -10], [Position.Left]: [-16, -10]};
function endLabel(text, x, y, position, end) {
  if (!text) return '';
  const [dx, dy] = END_OFFSET[position] || [12, 14];
  return html`<div className="notation-end-label nodrag nopan" data-end=${end}
    style=${{transform: `translate(-50%, -50%) translate(${x + dx}px, ${y + dy}px)`}}>${text}</div>`;
}

function NotationEdge({id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, markerStart, label, labelStyle, labelBgStyle, labelBgPadding, data}) {
  const [path, labelX, labelY] = getSmoothStepPath({sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition});
  return html`<${BaseEdge} id=${id} path=${path} style=${style} markerEnd=${markerEnd} markerStart=${markerStart}
      label=${label} labelX=${labelX} labelY=${labelY} labelStyle=${labelStyle} labelBgStyle=${labelBgStyle} labelBgPadding=${labelBgPadding}/>
    ${data?.sourceLabel || data?.targetLabel ? html`<${EdgeLabelRenderer}>
      ${endLabel(data.sourceLabel, sourceX, sourceY, sourcePosition, 'source')}
      ${endLabel(data.targetLabel, targetX, targetY, targetPosition, 'target')}
    </${EdgeLabelRenderer}>` : ''}`;
}
const edgeTypes = {notation: NotationEdge};

function edgesOf(scene, selected) {
  return scene.edges.map(e => {
    const active = selected && (e.source === selected || e.target === selected);
    return {id: e.id, source: e.source, target: e.target, type: 'notation', label: e.label || undefined,
      data: {relation: e.relation, sourceLabel: e.sourceLabel, targetLabel: e.targetLabel}, className: 'notation-edge',
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

  const scene = useMemo(() => (state.view ? sceneFor(state.view) : null), [state.view]);
  const [flowNodes, setFlowNodes] = useState([]);
  useEffect(() => { setFlowNodes(scene && scene.kind === 'graph' ? layout(scene) : []); }, [scene]);
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
        ${!scene || scene.kind === 'graph' ? html`<button type="button" onClick=${() => fitView({padding: .12, duration: 200})}>⛶ Ver todo</button>` : ''}
      </div>
      ${scene && scene.notices.length ? html`<div className="notation-notices" role="status">${scene.notices.map(n => html`<p key=${n}>${n}</p>`)}</div>` : ''}
      <div className="notation-canvas">
        <${TerminalDefs}/>
        ${!current && kb.documents.status === 'error' ? html`<div className="state" role="alert"><h2>No se pudo leer el store</h2><p>${kb.documents.error}</p></div>`
          : !current ? html`<div className="state"><h2>Este store no tiene specs de spec2viz</h2><p>Sincroniza uno con <code>spec2viz diagram sync spec.yml --store .sldb</code>.</p></div>`
          : state.phase === 'error' ? html`<div className="state" role="alert"><h2>No se pudo dibujar ${current}</h2><p>${state.error}</p></div>`
          : state.phase === 'loading' || !scene ? html`<div className="state"><p>Resolviendo la notación…</p></div>`
          : scene.kind === 'lanes' ? html`<div className="notation-scroll"><${LanesDiagram} scene=${scene}/></div>`
          : scene.kind === 'grid' ? html`<div className="notation-scroll"><${GridDiagram} scene=${scene}/></div>`
          : html`<${ReactFlow} nodes=${flowNodes} edges=${scene ? edgesOf(scene, selected) : []} nodeTypes=${nodeTypes} edgeTypes=${edgeTypes}
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
