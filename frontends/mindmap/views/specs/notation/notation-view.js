import {useState, useEffect, useMemo, useRef} from 'react';
import {ReactFlow, ReactFlowProvider, Controls, MiniMap, Handle, Position, useReactFlow, applyNodeChanges, BaseEdge, EdgeLabelRenderer, getSmoothStepPath} from '@xyflow/react';
import {html} from '../../../shared/html.js';
import {request} from '../../../shell/api.js';
import {useSource} from '../../../source/source.js';
import {specCatalog, sceneFor, compartmentLine, cellKey, LANE, TERMINALS} from './notation.mjs';
import {bestLayout, pathOf, POINT_SHAPES} from './notation-layout.mjs';
import {glyphVars, paletteInk, themed, innerVars} from './notation-style.mjs';
import {GlyphIcon, ShapeOutline, NotationLegend, useIcons} from './notation-style.js';

// Vista genérica de notación: dibuja un spec de spec2viz tal como lo resuelve
// GET /api/notation/view (resolve_view de spec2viz). Nada aquí distingue UML,
// statechart o secuencia: la forma viene del glifo y el trazo del link. El
// layout lo calcula ELK (notation-layout.mjs, jerárquico), nunca coordenadas del
// store: posiciones y plegado son estado de la superficie (contrato §7).
const STORAGE_KEY = 'kb-notation-spec';
const MINIMAP_KEY = 'kb-notation-minimap';
// MiniMap de React Flow: 200x150 abajo a la derecha, a 15 px del borde.
const MINIMAP = {width: 200, height: 150, margin: 15};
const FIT_PADDING = 0.03;
const HANDLES = {TB: [Position.Top, Position.Bottom], BT: [Position.Bottom, Position.Top],
  LR: [Position.Left, Position.Right], RL: [Position.Right, Position.Left]};

let elkInstance = null;
const elkReady = () => (elkInstance ||= import('elkjs').then(m => new (m.default)()));

// Medida real del texto con la misma fuente que el lienzo: la caja crece con su rótulo (G4).
function canvasMeasure(element) {
  const ctx = document.createElement('canvas').getContext('2d');
  const family = getComputedStyle(element || document.body).fontFamily;
  const cache = new Map();
  return (text, size) => {
    const key = size + '\u0000' + text;
    if (!cache.has(key)) { ctx.font = `600 ${size}px ${family}`; cache.set(key, ctx.measureText(text || '').width); }
    return cache.get(key);
  };
}

// Layout ELK (notation-layout.mjs): el candidato que mejor cabe en el lienzo, en nodos y aristas de React Flow.
async function layoutGraph(scene, element) {
  const box = element.getBoundingClientRect();
  const best = await bestLayout(await elkReady(), scene, {measure: canvasMeasure(element), canvas: {width: box.width, height: box.height}});
  if (!best) return {nodes: [], edges: []};
  const nodes = [...best.nodes].sort((a, b) => a.depth - b.depth).map(n => ({
    id: n.id, type: 'glyph', parentId: n.parent || undefined, zIndex: n.container ? 0 : 1,
    position: {x: n.x, y: n.y}, style: {width: n.width, height: n.height},
    data: {glyph: n.glyph, container: n.container, lines: n.lines, header: n.header, outside: n.outside, direction: best.direction}}));
  return {nodes, edges: best.edges, zoom: best.zoom, width: best.width, height: best.height};
}

// Cuerpo del glifo, sin handles: lo usan los nodos de React Flow y las
// cabeceras de carril (que no viven dentro de React Flow).
const lineList = lines => lines.map((line, i) => html`<span key=${i} className="glyph-line">${line}</span>`);

function Glyph({glyph: g, container, selected, children, style, lines, outside, header, skin, ink, icons}) {
  const point = POINT_SHAPES.includes(g.shape);
  const text = lines && lines.length ? lineList(lines) : g.label;
  const label = html`<span className=${'glyph-label' + (g.label_style ? ' is-' + g.label_style : '')}>${text}</span>`;
  const compartments = (g.compartments || []).filter(c => c.items && c.items.length);
  // Estilo resuelto por spec2viz (§13): relleno, trazo, texto e ícono; sin estilo, el de siempre.
  const vars = {...glyphVars(g.style, skin, ink), ...innerVars(g.shape)};
  return html`<div className=${'glyph shape-' + g.shape + (container ? ' is-container' : '') + (selected ? ' selected' : '') + (g.style?.fill || g.style?.stroke ? ' is-styled' : '')}
      style=${{...style, ...vars}} data-doc=${g.doc} data-glyph=${g.glyph} data-function=${g.function || ''} title=${g.doc}
      data-fill=${themed(g.style?.fill, skin) || ''} data-stroke=${themed(g.style?.stroke, skin) || ''} data-icon=${g.style?.icon || ''}>
    <${ShapeOutline} shape=${g.shape}/>
    ${children}
    ${(g.markers || []).map(m => html`<span key=${m.id} className=${'glyph-marker marker-' + m.shape} title=${m.id} data-marker=${m.id}></span>`)}
    ${point ? (outside ? html`<span className="glyph-point-label" style=${{left: outside.x + 'px', top: outside.y + 'px', width: outside.width + 'px'}}>${lineList(outside.lines)}</span>` : '')
      : g.shape === 'diamond' ? html`<span className="glyph-diamond-label">${text}</span>`
      : html`<header className="glyph-head" style=${container && header && header.x != null ? {position: 'absolute', left: header.x + 'px', top: header.y + 'px', width: header.width + 'px', height: header.height + 'px'} : undefined}>${g.keyword ? html`<small className="glyph-keyword">${g.keyword}</small>` : ''}<span className="glyph-title-row">${g.style?.icon ? html`<${GlyphIcon} icons=${icons} name=${g.style.icon}/>` : ''}${label}</span></header>
        ${compartments.map(c => html`<ul key=${c.path} className="glyph-compartment" data-path=${c.path}>${c.items.map((item, i) => html`<li key=${i}>${compartmentLine(item)}</li>`)}</ul>`)}`}
  </div>`;
}

function GlyphNode({data, selected}) {
  const [inPos, outPos] = HANDLES[data.direction] || HANDLES.TB;
  const icons = useIcons([data.glyph.style?.icon]);
  return html`<${Glyph} glyph=${data.glyph} container=${data.container} selected=${selected} skin=${data.skin} ink=${data.ink} icons=${icons}
      lines=${data.container ? data.header?.lines : data.lines} outside=${data.outside} header=${data.container ? data.header : null}>
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

// La arista sigue el recorrido ortogonal de ELK y su rótulo va en la caja que ELK le reservó (G5);
// sin recorrido (no debería pasar) cae a un escalón entre los puertos.
function NotationEdge({id, source, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, markerStart, data}) {
  const routed = data?.points && data.points.length > 1;
  const [fallback] = routed ? [null] : getSmoothStepPath({sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition});
  const ends = routed ? [data.points[0], data.points[data.points.length - 1]] : [{x: sourceX, y: sourceY}, {x: targetX, y: targetY}];
  return html`<g className="notation-edge-ends" data-source=${source} data-target=${target}></g>
    <${BaseEdge} id=${id} path=${routed ? pathOf(data.points) : fallback} style=${style} markerEnd=${markerEnd} markerStart=${markerStart}/>
    <${EdgeLabelRenderer}>
      ${data?.labelBox ? html`<div className=${'notation-edge-label nodrag nopan' + (data.hovered ? ' is-hovered' : '')} data-edge=${id}
          onMouseEnter=${() => data.onHover?.(id)} onMouseLeave=${() => data.onHover?.(null)}
          style=${{transform: `translate(${data.labelBox.x}px, ${data.labelBox.y}px)`, width: data.labelBox.width + 'px'}}>${lineList(data.labelBox.lines)}</div>` : ''}
      ${endLabel(data?.sourceLabel, ends[0].x, ends[0].y, sourcePosition, 'source')}
      ${endLabel(data?.targetLabel, ends[1].x, ends[1].y, targetPosition, 'target')}
    </${EdgeLabelRenderer}>`;
}
const edgeTypes = {notation: NotationEdge};

// R7: pasar el mouse por una arista o por su rótulo la resalta y atenúa las demás, para seguir una
// línea dentro de un haz de paralelas (p. ej. varias «Service Connect»). Sin hover, manda la selección.
function edgesOf(edges, selected, hovered, setHovered, skin = 'light') {
  return edges.map(e => {
    const focus = hovered || null;
    const active = focus ? e.id === focus : selected && (e.source === selected || e.target === selected);
    const dimmed = focus ? e.id !== focus : selected && !active;
    return {id: e.id, source: e.source, target: e.target, type: 'notation',
      data: {relation: e.relation, sourceLabel: e.sourceLabel, targetLabel: e.targetLabel, points: e.points, labelBox: e.labelBox,
        hovered: focus === e.id, onHover: setHovered}, className: 'notation-edge' + (focus === e.id ? ' is-hovered' : ''),
      markerEnd: e.targetEnd ? 'nv-' + e.targetEnd : undefined, markerStart: e.sourceEnd ? 'nv-' + e.sourceEnd : undefined,
      style: {stroke: focus === e.id ? 'var(--accent)' : themed(e.color, skin) || 'var(--edge)', strokeWidth: focus === e.id ? 2.8 : active ? 2.2 : 1.4, strokeDasharray: e.dash, opacity: dimmed ? .2 : 1}};
  });
}

function NotationCanvas({skin}) {
  const kb = useSource();
  const catalog = useMemo(() => specCatalog(kb.documents.working.documents), [kb.documents.working.documents]);
  const specIds = catalog.flatMap(g => g.specs.map(s => s.id));
  const [specId, setSpecId] = useState(() => { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } });
  const current = specIds.includes(specId) ? specId : specIds[0] || null;
  const [state, setState] = useState({phase: 'idle', view: null, error: null});
  const {fitView, setViewport} = useReactFlow();
  const [extent, setExtent] = useState(null);
  // R4: el minimapa es plegable (recordado; arranca plegado) y, si se muestra, «Ver todo» encuadra
  // el diagrama fuera de su esquina para que no tape nodos.
  const [minimap, setMinimap] = useState(() => { try { return localStorage.getItem(MINIMAP_KEY) === '1'; } catch { return false; } });
  const toggleMinimap = () => setMinimap(on => { try { localStorage.setItem(MINIMAP_KEY, on ? '0' : '1'); } catch {} return !on; });
  // «Ver todo» encuadra la caja entera del layout de ELK, rutas de aristas incluidas (fitView solo
  // mira los nodos y dejaba aristas fuera del lienzo).
  const fitAll = (duration = 200) => {
    const el = canvasRef.current;
    if (!extent || !el) return fitView({padding: FIT_PADDING, maxZoom: 1.1, duration});
    const {width, height} = el.getBoundingClientRect();
    const fit = (w, h) => Math.min(1.1, Math.min(w / extent.width, h / extent.height) / (1 + FIT_PADDING));
    if (!minimap) {
      const zoom = fit(width, height);
      return setViewport({x: (width - extent.width * zoom) / 2, y: (height - extent.height * zoom) / 2, zoom}, {duration});
    }
    const beside = width - MINIMAP.width - MINIMAP.margin * 2, above = height - MINIMAP.height - MINIMAP.margin * 2;
    const [zoomBeside, zoomAbove] = [fit(beside, height), fit(width, above)];
    const zoom = Math.max(zoomBeside, zoomAbove);
    const [w, h] = zoomBeside >= zoomAbove ? [beside, height] : [width, above];
    setViewport({x: (w - extent.width * zoom) / 2, y: (h - extent.height * zoom) / 2, zoom}, {duration});
  };

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
  const [flowEdges, setFlowEdges] = useState([]);
  const canvasRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    setFlowNodes([]); setFlowEdges([]); setExtent(null);
    if (!scene || scene.kind !== 'graph' || !canvasRef.current) return;
    layoutGraph(scene, canvasRef.current).then(result => {
      if (!cancelled) { setFlowNodes(result.nodes); setFlowEdges(result.edges); setExtent({width: result.width, height: result.height}); }
    });
    return () => { cancelled = true; };
  }, [scene]);
  useEffect(() => { const t = setTimeout(() => fitAll(), 60); return () => clearTimeout(t); }, [extent, minimap]);
  // Plegar o desplegar el panel de workers cambia el lienzo: se vuelve a encuadrar.
  useEffect(() => {
    const el = canvasRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    let timer = null;
    const observer = new ResizeObserver(() => { clearTimeout(timer); timer = setTimeout(() => fitAll(0), 80); });
    observer.observe(el);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [extent]);
  const selected = flowNodes.find(n => n.selected)?.id || null;
  const ink = paletteInk(kb.documents.working.documents, state.view?.palette);
  const styledNodes = useMemo(() => flowNodes.map(n => ({...n, data: {...n.data, skin: skin || 'light', ink}})), [flowNodes, skin, ink]);
  const [hoveredEdge, setHoveredEdge] = useState(null);

  const choose = id => { setSpecId(id); try { localStorage.setItem(STORAGE_KEY, id); } catch {} };
  const view = state.view;
  return html`<div className="notation" aria-label="Vista de notación">
    <nav className="notation-catalog" aria-label="Specs del store">
      ${catalog.map(group => html`<section key=${group.category}><h3>${group.category}</h3><ul>
        ${group.specs.map(s => html`<li key=${s.id}><button type="button" className=${s.id === current ? 'active' : ''} aria-current=${s.id === current ? 'true' : undefined}
          title=${s.summary || s.title} data-spec=${s.id} onClick=${() => choose(s.id)}><strong>${s.nav}</strong><small>${s.diagramType}${s.notation ? '' : ' · sin notación'}</small></button></li>`)}
      </ul></section>`)}
      ${state.view?.legend ? html`<${NotationLegend} legend=${state.view.legend} skin=${skin || 'light'} ink=${ink} notation=${state.view.notation}/>` : ''}
    </nav>
    <div className="notation-main">
      <div className="notation-bar" role="toolbar" aria-label="Herramientas de la vista">
        <strong>${view ? view.title : current || 'Specs'}</strong>
        ${view ? html`<span className="notation-meta">${view.notation.replace(/^NotationDoc:/, '')} · ${view.nodes.length} elementos · ${view.links.length} relaciones</span>` : ''}
        ${!scene || scene.kind === 'graph' ? html`<button type="button" onClick=${() => fitAll()}>⛶ Ver todo</button>
          <button type="button" className="notation-minimap-toggle" aria-pressed=${minimap ? 'true' : 'false'} onClick=${toggleMinimap}>${minimap ? 'Ocultar minimapa' : 'Minimapa'}</button>` : ''}
      </div>
      ${scene && scene.notices.length ? html`<div className="notation-notices" role="status">${scene.notices.map(n => html`<p key=${n}>${n}</p>`)}</div>` : ''}
      <div className="notation-canvas" ref=${canvasRef}>
        <${TerminalDefs}/>
        ${!current && kb.documents.status === 'error' ? html`<div className="state" role="alert"><h2>No se pudo leer el store</h2><p>${kb.documents.error}</p></div>`
          : !current ? html`<div className="state"><h2>Este store no tiene specs de spec2viz</h2><p>Sincroniza uno con <code>spec2viz diagram sync spec.yml --store .sldb</code>.</p></div>`
          : state.phase === 'error' ? html`<div className="state" role="alert"><h2>No se pudo dibujar ${current}</h2><p>${state.error}</p></div>`
          : state.phase === 'loading' || !scene ? html`<div className="state"><p>Resolviendo la notación…</p></div>`
          : scene.kind === 'lanes' ? html`<div className="notation-scroll"><${LanesDiagram} scene=${scene}/></div>`
          : scene.kind === 'grid' ? html`<div className="notation-scroll"><${GridDiagram} scene=${scene}/></div>`
          : html`<${ReactFlow} nodes=${styledNodes} edges=${edgesOf(flowEdges, selected, hoveredEdge, setHoveredEdge, skin || 'light')}
              onEdgeMouseEnter=${(_, edge) => setHoveredEdge(edge.id)} onEdgeMouseLeave=${() => setHoveredEdge(null)} nodeTypes=${nodeTypes} edgeTypes=${edgeTypes}
              onNodesChange=${changes => setFlowNodes(ns => applyNodeChanges(changes, ns))}
              minZoom=${.08} maxZoom=${2} nodesConnectable=${false} deleteKeyCode=${null} colorMode=${skin || 'light'}>
              <${Controls} showInteractive=${false}/>
              ${minimap ? html`<${MiniMap} pannable zoomable ariaLabel="Vista general del spec"/>` : ''}
            </${ReactFlow}>`}
      </div>
    </div>
  </div>`;
}

function NotationView(props) {
  return html`<${ReactFlowProvider}><${NotationCanvas} ...${props}/></${ReactFlowProvider}>`;
}

export const notationView = {id: 'notation', facet: 'specs', label: '🧩 Specs', component: NotationView, shell: {primary: false, workers: 'collapsed'}, styles: ['/views/specs/notation/notation.css']};
