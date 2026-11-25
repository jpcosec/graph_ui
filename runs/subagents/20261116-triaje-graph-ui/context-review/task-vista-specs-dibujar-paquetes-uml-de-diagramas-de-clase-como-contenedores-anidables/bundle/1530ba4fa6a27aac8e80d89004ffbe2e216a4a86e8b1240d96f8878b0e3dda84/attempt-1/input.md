FILE:desk/tasks/task-vista-specs-dibujar-paquetes-uml-de-diagramas-de-clase-como-contenedores-anidables.md
---
sldb:
  by: agent
  at: '2026-11-16T03:54:13Z'
  authority: generated
  via: save_document_payload
id: task-vista-specs-dibujar-paquetes-uml-de-diagramas-de-clase-como-contenedores-anidables
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
- host:local
current_node: ritual-execution
history: []
references:
- desk/inbox/20261020-122513-suggestion-contrato-de-lectura-paquetes-uml-en-diagramas-de-clase-spec2viz-84686c3.md
- ../../sldb/src/sldb/notations/builtin/uml-class.yml
- ../../sldb/tests/fixtures/specs/class.packages.yml
depends_on:
- task-ir13-migrar-graph-ui-de-spec2viz-a-sldb-api-notations-resolve-view-sync-de-specs-viewdoc-pilotos-com
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
files:
- frontends/mindmap/views/specs/notation/notation-view.js
- frontends/mindmap/views/specs/notation/notation.mjs
- frontends/mindmap/views/specs/notation/notation-layout.mjs
- frontends/mindmap/views/specs/notation/notation-style.mjs
- frontends/mindmap/views/specs/notation/notation.css
- tests/e2e_notation_class.py
- tests/notation-packages.test.mjs
- tests/fixtures/notation-packages/class.packages.yml
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms:
- atom-la-vista-specs-dibuja-lo-que-resuelve-spec2viz
- atom-cómo-decide-el-layout-de-una-vista-su-estilo-de-arquitectura
from_drawer: desk/drawer/features/backlog-diagramas-pausa-2026-10-20.md
---

# Vista Specs: dibujar paquetes UML de diagramas de clase como contenedores anidables

## Rationale

_Explain why this task exists or the business driver behind it._

El contrato de paquetes UML (spec2viz 84686c3, notation-contract.md §15; hoy en sldb: notación builtin sldb/src/sldb/notations/builtin/uml-class.yml, glifo `package` con where collection = "packages" y link contains con draw nest) llegó el 2026-10-20 (nota del inbox 20261020-122513) y la vista Specs no lo dibuja: un spec type class con data.packages muestra los paquetes como cajas sueltas. Quedó registrado en el backlog de diagramas pausado (drawer backlog-diagramas-pausa-2026-10-20.md) como el único ítem sin empezar del lado de graph_ui.

## Goal

_Describe the concrete result this task must produce._

Un spec class con data.packages se ve en /specs/notation con cada paquete como contenedor con forma package (carpeta con pestaña UML y su título), con sus clases y subpaquetes adentro a cualquier profundidad, el relleno/trazo/ícono de node.style del paquete, y las mismas garantías de legibilidad que los otros diagramas (nada tapado, «Ver todo» entra en la ventana).

## Scope

_State what is in scope and what is out of scope._

ENTRA: la vista Specs de frontends/mindmap/views/specs/notation/. Lo que ya existe y se reutiliza: la contención genérica (notation.mjs: SUPPORTED_DRAWS incluye nest, buildScene arma parentOf desde los links draw nest, con detección de ciclos) y el contorno de carpeta del paquete (notation-style.mjs: OUTLINE_SHAPES, OUTLINES.package, SHAPE_INNER.package y el trazado de la línea 115; notation.css: .glyph.shape-package). Lo que falta, y es el trabajo: que un glifo package que además es contenedor (data.container) dibuje ese contorno alrededor de toda la caja del contenedor, con el título en la pestaña o en una cabecera bajo la pestaña que reserve su alto (containerHeader de notation-layout.mjs), y que las clases queden dentro. Si al correr el e2e nuevo alguna de estas cosas ya funciona, no se toca. Archivos que pueden cambiar: notation-view.js, notation.mjs, notation-layout.mjs, notation-style.mjs y notation.css. Fixture: tests/fixtures/notation-packages/class.packages.yml, copia literal byte a byte de ../../sldb/tests/fixtures/specs/class.packages.yml (core > billing > Invoice, Payment; core > identity > User; shared > AuditLog: dos niveles, style.kinds para billing e identity, sin estilo para core y shared). Va en su propia carpeta para no entrar en el glob de tests/fixtures/notation-class/ de los e2e existentes. El e2e nuevo vive en tests/e2e_notation_class.py con su propia constante PACKAGES = ROOT / 'tests' / 'fixtures' / 'notation-packages' y sincroniza con 'sldb notations sync --spec class.packages.yml --store .sldb' en un store temporal, igual que los demás e2e después de la tarea IR13 de la que depende. Prueba node nueva en tests/notation-packages.test.mjs, obligatoria si cambia notation.mjs, notation-layout.mjs o notation-style.mjs. Las clases no heredan el color del paquete. Sin data.packages nada cambia: los e2e de clase existentes (R9, R10, compartimentos) siguen en verde. NO ENTRA: notation-deployment.mjs, cambiar el contrato o la notación en sldb (si falta algo, nota por inbox a sldb y la tarea se detiene), el layout de otros tipos de diagrama, spec2viz.

## Implementation Path

_Outline the expected implementation route or affected surface._

1) Leer el contrato en ../../sldb/src/sldb/notations/builtin/uml-class.yml y la salida de sldb.api.notations.resolve_view sobre class.packages.yml: nodos de paquete con glyph package y container, links uml-class.contains con draw nest. 2) Escribir primero el e2e (paso 4) y correrlo contra el código actual para ver qué falla. 3) Corregir solo lo que falle: el contorno OUTLINES.package escalado a la caja del contenedor, el título del paquete en su cabecera con alto reservado (containerHeader), la contención de las clases por la ruta genérica de buildScene/parentOf; sin duplicar código de notation-deployment.mjs. 4) e2e en Chromium a 1800x1200 sobre class.packages.yml: (a) la caja de cada clase cae dentro de la de su paquete y billing e identity dentro de core (los dos niveles); (b) criterio G2: la cabecera del paquete reserva su alto y el primer hijo empieza debajo, su título no queda tapado; (c) criterio R13: tras «Ver todo» todo el diagrama queda dentro de window.innerWidth x window.innerHeight; (d) todo texto visible mide al menos 10 px; (e) el estilo computado del contorno de billing e identity tiene el fill de su kind y el de las clases de adentro no. 5) Guardar una captura PNG de /specs/notation sobre class.packages.yml en runs/subagents/<run_dir>/packages.png, con el run_dir que asigne el despacho, y commitear.

## Validation

_List the checks required before this task can close._

- python -m pytest -q -rs tests/e2e_notation_class.py
- node --test tests/*.test.mjs

## Done When

_Name the observable condition that makes the task complete._

`python -m pytest -q -rs tests/e2e_notation_class.py` pasa con el e2e nuevo de paquetes y sin skips, y una captura de /specs/notation sobre class.packages.yml muestra cada clase dentro de su paquete con pestaña y título visibles.

FILE:desk/rituals/execution.md
---
# ritual-xxx
id: ritual-execution
# List of step-xxx paths
steps: []
# e.g., layer:workflow, system:sldb
tags:
- workspace:desk
- system:graph_ui
- layer:workflow
---

# Execution ritual

## Purpose

_Explain why this ritual exists._

Keep graph_ui delivery scoped to one active task at a time, grounded in the board and its bound pills, so implementation stays narrow and reviewable.

## Trigger

_State when this ritual should start._

When a graph_ui task is promoted to active and implementation begins.

## Preconditions

_List the conditions that must hold before running the ritual._

- The task is the active item on `desk/tasks/Board.md`.
- The relevant pills are bound to the task.

## Validation

_List the checks that prove the ritual was performed correctly._

- Only the active task's scope was changed.
- Bound pill guardrails were respected.

## Failure Modes

_List common mistakes this ritual prevents._

- Implementing more than the active task.
- Bypassing bound pills or the board.

## Completion

_Describe what completion looks like._

The active task is implemented within scope and ready for the testing ritual.

## Step Details

_Generated from the step references above._

FILE:desk/rituals/testing.md
---
# ritual-xxx
id: ritual-testing
# List of step-xxx paths
steps: []
# e.g., layer:workflow, system:sldb
tags:
- workspace:desk
- system:graph_ui
- layer:workflow
---

# Testing ritual

## Purpose

_Explain why this ritual exists._

Prove the intended contract of a graph_ui task with the smallest relevant validation first, then broaden coverage when the change touches shared behavior.

## Trigger

_State when this ritual should start._

When the execution ritual for a task completes and the change needs validation.

## Preconditions

_List the conditions that must hold before running the ritual._

- The task implementation is complete.
- The affected test surface is known.

## Validation

_List the checks that prove the ritual was performed correctly._

- `pytest` passes for backend changes.
- `npm test` passes for `apps/review-workbench` changes.

## Failure Modes

_List common mistakes this ritual prevents._

- Broadening coverage before the narrow contract is proven.
- Skipping the frontend suite when the UI changed.

## Completion

_Describe what completion looks like._

The task's contract is proven green and the change is ready for closeout.

## Step Details

_Generated from the step references above._

FILE:desk/rituals/closeout.md
---
# ritual-xxx
id: ritual-closeout
# List of step-xxx paths
steps: []
# e.g., layer:workflow, system:sldb
tags:
- workspace:desk
- system:graph_ui
- layer:workflow
---

# Closeout ritual

## Purpose

_Explain why this ritual exists._

Close a graph_ui task only after validation passes, the board reflects reality, and the final change is captured as its own atomic commit.

## Trigger

_State when this ritual should start._

When the testing ritual passes and the task is ready to be closed.

## Preconditions

_List the conditions that must hold before running the ritual._

- Validation is green.
- The board and task status match the implemented reality.

## Validation

_List the checks that prove the ritual was performed correctly._

- The task is marked resolved on `desk/tasks/Board.md`.
- The closing change is a single atomic commit.

## Failure Modes

_List common mistakes this ritual prevents._

- Closing without green validation.
- Leaving the board out of sync with the code.

## Completion

_Describe what completion looks like._

The task is resolved, the board is reconciled, and the closeout commit is recorded.

## Step Details

_Generated from the step references above._

FILE:desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
---
# pill-xxx
id: pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables
# e.g., language:python, library:pydantic
tags:
- system:graph_ui
- topic:workflow-guardrail
- layer:runtime
---

# Guardrail: no mocks, no stubs, no fake data in deliverables

## What

_Define the context or guardrail this pill carries._

A hard prohibition on mock/stub/fake/placeholder implementations in any code an executor delivers. This includes: returning hardcoded fake values instead of real computation, leaving TODO/FIXME stubs in place of logic, fabricated sample data standing in for real data flow, no-op functions pretending to work, commented-out real logic replaced by a shortcut, or tests that assert against invented data instead of the real contract.

## Why

_Explain why this context matters for safe execution._

This ecosystem treats deliverables as production truth. A mock silently breaks the nucleus tesis (real typed data flowing sldb -> sldb.api.graph -> overlay). Mocks pass shallow checks while leaving the contract unimplemented, causing false-green closeouts and drift that surfaces much later. Real wiring is the only acceptable evidence a task is done.

## When

_Describe when an agent should apply this pill._

Applied to every executor and tester dispatch, at all times, for every task. There is no exception where a mock is acceptable as a final deliverable. If real data or a real dependency is genuinely unavailable, the executor must STOP and report the blocker, not paper over it with a mock.

## Where

_Name the files, surfaces, or scope this pill applies to._

All implementation code under apps/, scripts/, src/, and any generated artifacts. Applies to graph_ui and every downstream instance.

## How

_Describe the correct way to apply this guidance._

Wire the real dependency. Derive values from the real source (real model descriptor, real store, real generator output). If a build artifact is needed, generate it with the real generator and commit the real output. Tests must validate the real contract against real generated output, not against inlined fixtures that duplicate the expected answer.

## How Not

_Describe the shortcut or failure mode to avoid._

Do not stub a function to return a constant. Do not inline fake node-type definitions to make a test pass. Do not write a test whose expected value is a copy-paste of a hardcoded literal that bypasses the generator. Do not leave TODO placeholders where logic belongs. Do not fabricate data to simulate a data source.

FILE:desk/atoms/atom-la-vista-specs-dibuja-lo-que-resuelve-spec2viz.md
---
id: atom-la-vista-specs-dibuja-lo-que-resuelve-spec2viz
title: La vista Specs dibuja lo que resuelve spec2viz
five_wh_one_plus: how
tags:
- system:graph_ui
- system:spec2viz
- topic:notation
provenance: frontends/mindmap/views/specs/notation/notation.mjs
---

# La vista Specs dibuja lo que resuelve spec2viz

## Answer

La vista Specs (/specs/notation) no interpreta notaciones: GET /api/notation/view devuelve tal cual spec2viz.notation_view.resolve_view, y la vista solo dibuja forma, compartimentos, marcas, terminales y rótulos. layout graph/tree va con dagre (draw nest como contención), lanes como carriles (un carril por nodo en orden, mensajes por order, fragmentos como marcos) y grid como una tabla por data.view, con filas components anidadas y celdas draw cell. Lo no soportado (axis, draw lane) se dibuja como grafo/línea con aviso. El contrato está en spec2viz/docs/notation-contract.md, §8c/§8d/§11.

FILE:desk/atoms/atom-cómo-decide-el-layout-de-una-vista-su-estilo-de-arquitectura.md
---
id: atom-cómo-decide-el-layout-de-una-vista-su-estilo-de-arquitectura
title: Cómo decide el layout de una vista su estilo de arquitectura
five_wh_one_plus: how
tags:
- system:graph_ui
- topic:projection-grammar
---

# Cómo decide el layout de una vista su estilo de arquitectura

## Answer

El layout de una vista es ViewDoc.layout o, si está vacío, el layout de su NotationDoc (spec2viz §12: kind graph, style layered|rings, direction, ring_field). En review-workbench strategyForLayout (L2-canvas/layout/layout-strategies.ts) lo traduce: style rings -> elk-rings con ringField y el orden layout.rings; cualquier otro -> elk-layered con la dirección de la notación. elk-rings pone cada nodo en el anillo que nombra ring_field de su payload (ringDepths: los anillos listados de adentro hacia afuera, el resto ordenado, los nodos sin anillo al final), así una arquitectura en anillos o hexagonal muestra sus capas concéntricas; sin ring_field reparte por distancia en el grafo. useApplyView fija la estrategia al cargar la vista y hace el layout cuando React Flow midió los nodos. Lo prueba tests/e2e_review_workbench_views.py midiendo radios y alturas en Chromium.

FILE:frontends/mindmap/views/specs/notation/notation-view.js
import {useState, useEffect, useMemo, useRef} from 'react';
import {ReactFlow, ReactFlowProvider, Controls, MiniMap, Handle, Position, useReactFlow, useNodesInitialized, applyNodeChanges, BaseEdge, EdgeLabelRenderer, getSmoothStepPath} from '@xyflow/react';
import {html} from '../../../shared/html.js';
import {request} from '../../../shell/api.js';
import {useSource} from '../../../source/source.js';
import {specCatalog, sceneFor, compartmentLine, cellKey, LANE, LANE_TEXT, TERMINALS, laneFitScale} from './notation.mjs';
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
const FIT_PADDING = 0.03, FIT_MARGIN = 16;
const HANDLES = {TB: [Position.Top, Position.Bottom], BT: [Position.Bottom, Position.Top],
  LR: [Position.Left, Position.Right], RL: [Position.Right, Position.Left]};

let elkInstance = null;
const elkReady = () => (elkInstance ||= import('elkjs').then(m => new (m.default)()));

// Medida real del texto con la misma fuente que el lienzo: la caja crece con su rótulo (G4).
function canvasMeasure(element, weight = 600) {
  const ctx = document.createElement('canvas').getContext('2d');
  const family = getComputedStyle(element || document.body).fontFamily;
  const cache = new Map();
  return (text, size) => {
    const key = size + '\u0000' + text;
    if (!cache.has(key)) { ctx.font = `${weight} ${size}px ${family}`; cache.set(key, ctx.measureText(text || '').width); }
    return cache.get(key);
  };
}

// Layout ELK (notation-layout.mjs): el candidato que mejor cabe en el lienzo, en nodos y aristas de React Flow.
async function layoutGraph(scene, element) {
  // Se mide con la fuente real: si la web font aún no cargó, measureText daría el ancho de la de reemplazo.
  if (document.fonts?.ready) await document.fonts.ready;
  const box = element.getBoundingClientRect();
  const best = await bestLayout(await elkReady(), scene, {measure: canvasMeasure(element), canvas: {width: box.width, height: box.height}});
  if (!best) return {nodes: [], edges: []};
  const nodes = [...best.nodes].sort((a, b) => a.depth - b.depth).map(n => ({
    id: n.id, type: 'glyph', parentId: n.parent || undefined, zIndex: n.container ? 0 : 1,
    position: {x: n.x, y: n.y}, style: {width: n.width, height: n.height},
    data: {glyph: n.glyph, container: n.container, lines: n.lines, header: n.header, outside: n.outside, direction: best.direction}}));
  return {nodes, edges: best.edges, zoom: best.zoom, width: best.width, height: best.height, engine: best.engine || 'elk'};
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
// La pestaña de un fragmento: su ancho sale del operador o del rótulo (12,5 px).
const tabWidth = text => Math.max(34, String(text || '').length * 7.6 + 14);

function LanesDiagram({scene, scale = 1}) {
  const {lanes, messages, head, lifelineTop, width, height} = scene;
  const icons = useIcons(lanes.map(l => l.glyph.style?.icon));
  const heads = lanes.map(l => html`<div key=${l.id} className="lane-head" data-lane=${l.id}
      style=${{left: (l.x - l.width / 2) + 'px', top: (LANE.top + head - l.height) + 'px', width: l.width + 'px', height: l.height + 'px'}}>
    <${Glyph} glyph=${l.glyph} lines=${l.lines} icons=${icons}/></div>`);
  const band = (LANE.top + head + 6) * scale;
  // R11: «Ver todo» escala el diagrama al lienzo; la caja exterior ocupa lo que se ve escalado. Los
  // participantes van en una banda fija arriba: si los mensajes siguen con scroll, siguen a la vista.
  return html`<div className="notation-lanes-fit" data-scale=${scale} style=${{width: width * scale + 'px', height: height * scale + 'px'}}>
  <div className="lane-heads-band" style=${{height: band + 'px', marginBottom: -band + 'px', width: width * scale + 'px'}}>
    <div className="notation-lanes" style=${{width: width + 'px', height: (LANE.top + head + 6) + 'px', transform: `scale(${scale})`, transformOrigin: '0 0'}}>${heads}</div>
  </div>
  <div className="notation-lanes" style=${{width: width + 'px', height: height + 'px', transform: `scale(${scale})`, transformOrigin: '0 0'}}>
    <svg className="lanes-svg" width=${width} height=${height} aria-label="Mensajes">
      ${lanes.map(l => html`<line key=${l.id} className="lifeline" data-lifeline=${l.id} x1=${l.x} x2=${l.x} y1=${lifelineTop} y2=${height - LANE.top}/>`)}
      ${(scene.frames || []).map(f => html`<g key=${f.id} className="lane-frame" data-fragment=${f.id} data-orders=${f.orders.join(',')}>
        <rect x=${f.x} y=${f.y} width=${f.width} height=${f.height} className="frame-box"/>
        <path d=${`M${f.x},${f.y + 18} h${tabWidth(f.operator || f.label)} l6,-6 v-12`} className="frame-tab"/>
        <text x=${f.x + 6} y=${f.y + 14} className="frame-label" data-operator=${f.operator}>${f.operator || f.label}</text>
        ${f.operator && f.label ? html`<text x=${f.x + tabWidth(f.operator) + 14} y=${f.y + 14} className="frame-guard">[${f.label}]</text>` : ''}
      </g>`)}
      ${messages.map(m => {
        const ends = {markerEnd: m.targetEnd ? `url(#nv-${m.targetEnd})` : undefined, markerStart: m.sourceEnd ? `url(#nv-${m.sourceEnd})` : undefined};
        const path = m.self
          ? `M${m.x1},${m.y - LANE.row / 3} h${LANE.loop} v${LANE.row / 3 * 2} h${-LANE.loop}`
          : `M${m.x1},${m.y} L${m.x2},${m.y}`;
        // Rótulo en líneas: encima de la flecha (la última pegada a ella) o, en una autollamada, a la derecha del bucle.
        const lines = m.lines || [`${m.order}. ${m.label}`];
        const tx = m.labelX ?? (m.self ? m.x1 + LANE.loop + 6 : (m.x1 + m.x2) / 2);
        const lineY = i => (m.self ? m.y + 4 + i * LANE_TEXT.line : m.y - 6 - (lines.length - 1 - i) * LANE_TEXT.line);
        return html`<g key=${m.id} className="lane-message" data-link=${m.link || ''} data-message=${m.id} data-order=${m.order} data-from=${m.from} data-to=${m.to} data-y=${m.y}>
          <path d=${path} className="message-line" strokeDasharray=${m.dash} markerEnd=${ends.markerEnd} markerStart=${ends.markerStart}/>
          <text textAnchor=${m.self ? 'start' : 'middle'} className="message-label">${lines.map((t, i) => html`<tspan key=${i} x=${tx} y=${lineY(i)}>${t}</tspan>`)}</text>
        </g>`;
      })}
    </svg>
  </div></div>`;
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
function endLabel(text, x, y, position, end, box, edge) {
  if (!text) return '';
  // R9: con la caja que le dio el layout (junto al extremo real, fuera del nodo); sin ella, el desvío de antes.
  if (box) return html`<div className="notation-end-label nodrag nopan" data-end=${end} data-edge=${edge}
    style=${{transform: `translate(${box.x}px, ${box.y}px)`, width: box.width + 'px', height: box.height + 'px'}}>${text}</div>`;
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
  return html`<g className="notation-edge-ends" data-source=${source} data-target=${target} data-link=${data?.link || ''}></g>
    <${BaseEdge} id=${id} path=${routed ? pathOf(data.points) : fallback} style=${style} markerEnd=${markerEnd} markerStart=${markerStart}/>
    <${EdgeLabelRenderer}>
      ${data?.labelBox ? html`<div className=${'notation-edge-label nodrag nopan' + (data.hovered ? ' is-hovered' : '')} data-edge=${id}
          onMouseEnter=${() => data.onHover?.(id)} onMouseLeave=${() => data.onHover?.(null)}
          style=${{transform: `translate(${data.labelBox.x}px, ${data.labelBox.y}px)`, width: data.labelBox.width + 'px'}}>${lineList(data.labelBox.lines)}</div>` : ''}
      ${endLabel(data?.sourceLabel, ends[0].x, ends[0].y, sourcePosition, 'source', data?.sourceLabelBox, id)}
      ${endLabel(data?.targetLabel, ends[1].x, ends[1].y, targetPosition, 'target', data?.targetLabelBox, id)}
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
      data: {relation: e.relation, link: e.link, sourceLabelBox: e.sourceLabelBox, targetLabelBox: e.targetLabelBox, sourceLabel: e.sourceLabel, targetLabel: e.targetLabel, points: e.points, labelBox: e.labelBox,
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
  const {fitView, setViewport, getNodes, getNodesBounds} = useReactFlow();
  const nodesMeasured = useNodesInitialized();
  const [extent, setExtent] = useState(null);
  // R4: el minimapa es plegable (recordado; arranca plegado) y, si se muestra, «Ver todo» encuadra
  // el diagrama fuera de su esquina para que no tape nodos.
  const [minimap, setMinimap] = useState(() => { try { return localStorage.getItem(MINIMAP_KEY) === '1'; } catch { return false; } });
  const toggleMinimap = () => setMinimap(on => { try { localStorage.setItem(MINIMAP_KEY, on ? '0' : '1'); } catch {} return !on; });
  // «Ver todo» encuadra la caja entera del layout de ELK, rutas de aristas incluidas (fitView solo
  // mira los nodos y dejaba aristas fuera del lienzo).
  // Encuadra la caja del layout unida a las cajas YA medidas de los nodos (lo que React Flow dibujó,
  // si algo creció al renderizarse), con un margen que nunca baja de FIT_MARGIN px en pantalla.
  const fitAll = (duration = 200) => {
    const el = canvasRef.current;
    if (!extent || !el) return fitView({padding: FIT_PADDING, maxZoom: 1.1, duration});
    const {width, height} = el.getBoundingClientRect();
    const drawn = getNodes().length ? getNodesBounds(getNodes()) : {x: 0, y: 0, width: 0, height: 0};
    const x0 = Math.min(0, drawn.x), y0 = Math.min(0, drawn.y);
    const box = {x: x0, y: y0, width: Math.max(extent.width, drawn.x + drawn.width) - x0, height: Math.max(extent.height, drawn.y + drawn.height) - y0};
    // El margen es el mayor entre el relativo (FIT_PADDING) y el absoluto (FIT_MARGIN px por lado), no la suma.
    const usable = n => Math.min(n / (1 + FIT_PADDING), n - FIT_MARGIN * 2);
    const fit = (w, h) => Math.min(1.1, usable(w) / box.width, usable(h) / box.height);
    const place = (w, h, zoom) => setViewport({x: (w - box.width * zoom) / 2 - box.x * zoom, y: (h - box.height * zoom) / 2 - box.y * zoom, zoom}, {duration});
    if (!minimap) return place(width, height, fit(width, height));
    const beside = width - MINIMAP.width - MINIMAP.margin * 2, above = height - MINIMAP.height - MINIMAP.margin * 2;
    const [zoomBeside, zoomAbove] = [fit(beside, height), fit(width, above)];
    return zoomBeside >= zoomAbove ? place(beside, height, zoomBeside) : place(width, above, zoomAbove);
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

  // R11: las secuencias se encuadran por escala (no viven en React Flow): «Ver todo» al abrir y a pedido.
  // Se miden con la fuente real (rótulos en peso normal) y su ancho de corte depende del lienzo.
  const [canvasSize, setCanvasSize] = useState(null);
  const [fontsReady, setFontsReady] = useState(() => !document.fonts || document.fonts.status === 'loaded');
  useEffect(() => { if (!fontsReady && document.fonts?.ready) document.fonts.ready.then(() => setFontsReady(true)); }, [fontsReady]);
  const isLanes = state.view?.layout?.kind === 'lanes';
  const laneCanvas = isLanes ? canvasSize : null;
  const scene = useMemo(() => (state.view ? sceneFor(state.view, {measure: canvasMeasure(document.body, 400), headMeasure: canvasMeasure(document.body), canvas: laneCanvas}) : null),
    [state.view, laneCanvas?.width, laneCanvas?.height, isLanes && fontsReady]);
  const [flowNodes, setFlowNodes] = useState([]);
  const [flowEdges, setFlowEdges] = useState([]);
  const canvasRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    setFlowNodes([]); setFlowEdges([]); setExtent(null);
    if (!scene || scene.kind !== 'graph' || !canvasRef.current) return;
    layoutGraph(scene, canvasRef.current).then(result => {
      if (!cancelled) { setFlowNodes(result.nodes); setFlowEdges(result.edges); setExtent({width: result.width, height: result.height, engine: result.engine}); }
    });
    return () => { cancelled = true; };
  }, [scene]);
  // Se vuelve a encuadrar cuando React Flow termina de medir los nodos (las cajas reales, no las del layout).
  useEffect(() => { const t = setTimeout(() => fitAll(), 60); return () => clearTimeout(t); }, [extent, minimap, nodesMeasured]);
  // Plegar o desplegar el panel de workers cambia el lienzo: se vuelve a encuadrar.
  useEffect(() => {
    const el = canvasRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    let timer = null;
    const observer = new ResizeObserver(() => { clearTimeout(timer); timer = setTimeout(() => fitAll(0), 80); });
    observer.observe(el);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [extent]);
  const [laneFit, setLaneFit] = useState(true);
  useEffect(() => { setLaneFit(true); }, [state.view]);
  useEffect(() => {
    const el = canvasRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => { const r = el.getBoundingClientRect(); setCanvasSize({width: r.width, height: r.height}); });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  // El diagrama de carriles ya trae su margen (LANE.gap, LANE.top): encuadrado, ocupa el lienzo entero.
  const laneScale = scene?.kind === 'lanes' && laneFit && canvasSize ? laneFitScale(scene, canvasSize) : 1;
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
        ${scene?.kind === 'lanes' ? html`<button type="button" aria-pressed=${laneFit ? 'true' : 'false'} onClick=${() => setLaneFit(true)}>⛶ Ver todo</button>
          <button type="button" className="notation-actual-size" aria-pressed=${laneFit ? 'false' : 'true'} onClick=${() => setLaneFit(false)}>100 %</button>` : ''}
        ${!scene || scene.kind === 'graph' ? html`<button type="button" onClick=${() => fitAll()}>⛶ Ver todo</button>
          <button type="button" className="notation-minimap-toggle" aria-pressed=${minimap ? 'true' : 'false'} onClick=${toggleMinimap}>${minimap ? 'Ocultar minimapa' : 'Minimapa'}</button>` : ''}
      </div>
      ${scene && scene.notices.length ? html`<div className="notation-notices" role="status">${scene.notices.map(n => html`<p key=${n}>${n}</p>`)}</div>` : ''}
      <div className="notation-canvas" ref=${canvasRef} data-layout=${extent?.engine || ''}>
        <${TerminalDefs}/>
        ${!current && kb.documents.status === 'error' ? html`<div className="state" role="alert"><h2>No se pudo leer el store</h2><p>${kb.documents.error}</p></div>`
          : !current ? html`<div className="state"><h2>Este store no tiene specs de spec2viz</h2><p>Sincroniza uno con <code>spec2viz diagram sync spec.yml --store .sldb</code>.</p></div>`
          : state.phase === 'error' ? html`<div className="state" role="alert"><h2>No se pudo dibujar ${current}</h2><p>${state.error}</p></div>`
          : state.phase === 'loading' || !scene ? html`<div className="state"><p>Resolviendo la notación…</p></div>`
          : scene.kind === 'lanes' ? html`<div className=${'notation-scroll' + (laneFit ? ' is-fit' : '')}><${LanesDiagram} scene=${scene} scale=${laneScale}/></div>`
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

FILE:frontends/mindmap/views/specs/notation/notation.mjs
// Lógica pura de la vista de notación: catálogo de specs y escena a dibujar.
// La notación NO se interpreta aquí: el JSON de GET /api/notation/view ya trae
// el glifo, la forma, los compartimentos y el `draw` de cada link, resueltos
// por spec2viz (resolve_view, spec2viz/docs/notation-contract.md). Este módulo
// solo traduce ese resultado a cajas y aristas, y avisa de lo que la vista
// todavía no sabe dibujar en vez de inventarlo.

// Layouts: grafo (y árbol, que dagre resuelve igual), carriles (secuencias)
// y grilla (matrices). Lo demás se dibuja como grafo/línea con aviso (§9).
export const SUPPORTED_LAYOUTS = ['graph', 'tree', 'lanes', 'grid'];
export const SUPPORTED_DRAWS = ['line', 'nest'];
export const TERMINALS = ['open-arrow', 'filled-arrow', 'hollow-triangle', 'filled-triangle',
  'hollow-diamond', 'filled-diamond', 'filled-circle', 'hollow-circle', 'bar', 'crowfoot'];
const UNCATEGORIZED = 'Sin categoría';

// Catálogo = los SpecDoc del store agrupados por `category` (contrato §2b): no
// hay otro documento de catálogo. Dentro de un grupo, por `nav` y luego título.
export function specCatalog(documents) {
  const specs = (documents || []).filter(d => d && d.model_name === 'SpecDoc').map(d => {
    const p = d.payload || {};
    return {id: d.id, title: p.title || d.id, nav: p.nav || p.title || d.id, summary: p.summary || '',
      category: p.category || UNCATEGORIZED, diagramType: p.diagram_type || '', notation: p.notation || ''};
  });
  const groups = new Map();
  for (const spec of specs) {
    if (!groups.has(spec.category)) groups.set(spec.category, []);
    groups.get(spec.category).push(spec);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a === UNCATEGORIZED) - (b === UNCATEGORIZED) || a.localeCompare(b))
    .map(([category, items]) => ({category, specs: items.sort((x, y) => x.nav.localeCompare(y.nav))}));
}

// Una línea de compartimento por item: los attributes/methods de un spec de
// clases son dicts con name y type/returns; lo demás se muestra tal cual.
export function compartmentLine(item) {
  if (item == null) return '';
  if (typeof item !== 'object') return String(item);
  if (!('name' in item)) return JSON.stringify(item);
  const params = Array.isArray(item.params) ? item.params.map(compartmentLine).join(', ') : null;
  const call = params != null || 'returns' in item ? `(${params || ''})` : '';
  const type = item.type || item.returns;
  return `${item.visibility || ''}${item.name}${call}${type ? ': ' + type : ''}`;
}

const SIZES = {
  'filled-circle': [22, 22], 'bullseye': [26, 26], 'diamond': [46, 46],
  'stick-figure': [90, 86], 'rounded-box': [170, 48], 'box': [170, 48],
  'lifeline': [150, 52], 'boundary-lifeline': [150, 52], 'boundary-box': [170, 56],
};
// Pseudoestados y conectores: la forma ES el glifo, el rótulo va aparte.
export const POINT_SHAPES = ['filled-circle', 'bullseye', 'diamond'];

export function glyphSize(node) {
  if (node.shape === 'class-box') {
    const rows = (node.compartments || []).filter(c => c.items && c.items.length);
    const head = 30 + (node.keyword ? 14 : 0);
    const body = rows.reduce((h, c) => h + 10 + c.items.length * 17, 0);
    const longest = Math.max(node.label.length, ...rows.flatMap(c => c.items.map(i => compartmentLine(i).length)));
    return [Math.min(Math.max(170, longest * 7 + 28), 340), head + body + 6];
  }
  const [w, h] = SIZES[node.shape] || [170, 48];
  if (POINT_SHAPES.includes(node.shape)) return [w, h];
  return [Math.min(Math.max(w, (node.label || '').length * 7.2 + 32), 320), h + (node.keyword ? 14 : 0)];
}

// Glifo de un nodo derivado (carril o nota): sin documento ni notación propia; su forma la fija §14.
const derivedGlyph = (doc, label, fn) => ({doc, element: '', label, glyph: '', shape: fn, function: fn,
  label_style: '', keyword: '', compartments: [], markers: [], refs: [], data: {}, style: {}, derived: true});

const terminal = end => (TERMINALS.includes(end) ? end : null);
// Trazo de un link (LinkDoc.line); el mismo en el diagrama y en la muestra de la leyenda.
export const dash = line => (line === 'dashed' ? '6 4' : line === 'dotted' ? '2 3' : undefined);

// Escena: nodos con su contenedor (draw: nest → el destino vive dentro del
// origen), aristas dibujables y avisos. Un link cuyo `draw` no está soportado
// se dibuja como línea y se avisa; nunca se descarta en silencio.
export function buildScene(view) {
  const notices = [];
  const layout = view.layout || {kind: 'graph'};
  if (!['graph', 'tree'].includes(layout.kind)) {
    notices.push(`El layout «${layout.kind}» de la notación todavía no está soportado: se dibuja como grafo.`);
  }
  const ids = new Set((view.nodes || []).map(n => n.doc));
  const parentOf = new Map();
  const edges = [];
  const fallbackDraws = new Set();
  for (const [index, link] of (view.links || []).entries()) {
    if (!ids.has(link.source) || !ids.has(link.target)) continue;
    if (link.draw === 'nest' && link.source !== link.target && !parentOf.has(link.target)) {
      parentOf.set(link.target, link.source);
      continue;
    }
    if (!SUPPORTED_DRAWS.includes(link.draw)) fallbackDraws.add(link.draw);
    edges.push({
      id: link.doc || `${link.source}->${link.target}#${index}`, source: link.source, target: link.target,
      relation: link.relation, link: link.link || '', label: link.label || '',
      // Rótulos de extremo (§8d): plantillas del LinkDoc ya resueltas por spec2viz
      // (p. ej. multiplicidades de una asociación UML).
      sourceLabel: link.source_label || '', targetLabel: link.target_label || '',
      dash: dash(link.line), sourceEnd: terminal(link.source_end), targetEnd: terminal(link.target_end), order: link.order || 0,
      color: link.color || null,
    });
  }
  for (const draw of fallbackDraws) notices.push(`El dibujo «${draw}» todavía no está soportado: esas relaciones se dibujan como líneas.`);
  if ((view.skipped || []).length) notices.push(`spec2viz omitió ${view.skipped.length} elemento(s) sin glifo ni link en la notación.`);
  // Un ciclo de anidado (A dentro de B dentro de A) no es dibujable: se corta.
  for (const [child] of parentOf) {
    const seen = new Set([child]);
    for (let p = parentOf.get(child); p; p = parentOf.get(p)) {
      if (seen.has(p)) { parentOf.delete(child); notices.push('Hay un ciclo de anidado: se ignora un nivel.'); break; }
      seen.add(p);
    }
  }
  // Activity (contrato §14): un carril por `data.partition`, en orden de aparición (el layout los
  // dibuja como columnas, notation-swimlanes.mjs), y una nota UML por `data.notes`, unida a su paso por
  // una línea punteada. Carriles y notas son nodos derivados del spec, no documentos: viven solo en la
  // escena; la nota va justo después de su paso (el orden del spec es el que ELK respeta).
  const ordered = [], lanes = [], laneOf = new Map();
  const specId = String(view.spec || '').replace(/^SpecDoc:/, '');
  for (const n of view.nodes || []) {
    const name = n.data?.partition;
    if (name && !laneOf.has(name)) {
      const id = `${specId}#partition:${lanes.length}`;
      laneOf.set(name, id);
      lanes.push({id, name: String(name), glyph: derivedGlyph(id, String(name), 'partition')});
    }
    ordered.push(n);
    const text = n.data?.notes;
    if (!text) continue;
    const id = `${n.doc}#note`;
    ordered.push(derivedGlyph(id, String(text), 'note'));
    if (parentOf.has(n.doc)) parentOf.set(id, parentOf.get(n.doc));
    if (name) laneOf.set(id, laneOf.get(name));
    edges.push({id: `${n.doc}#note-link`, source: n.doc, target: id, relation: 'note', label: '', sourceLabel: '', targetLabel: '',
      dash: dash('dotted'), sourceEnd: null, targetEnd: null, order: 0, color: null, note: true});
  }
  const containers = new Set(parentOf.values());
  const nodes = ordered.map(n => {
    const [width, height] = glyphSize(n);
    const lane = laneOf.get(n.doc) || laneOf.get(n.data?.partition) || null;
    return {id: n.doc, parent: parentOf.get(n.doc) || null, container: containers.has(n.doc), width, height, glyph: n, lane};
  });
  return {nodes, edges, notices, lanes, direction: layout.direction || 'TB', diagramType: view.diagram_type || ''};
}

// Profundidad de anidado: React Flow exige que un padre aparezca antes que sus hijos.
export function byDepth(nodes) {
  const byId = new Map(nodes.map(n => [n.id, n]));
  const depth = n => { let d = 0; for (let p = n.parent; p; p = byId.get(p)?.parent) d++; return d; };
  return [...nodes].sort((a, b) => depth(a) - depth(b));
}

// ---- Carriles (layout lanes, contrato §8c) ----
// Un carril por nodo, en el orden de `nodes`; el tiempo baja por `order`.
// Cada mensaje ocupa su fila, también una autollamada (bucle sobre su carril).
// R11: el hueco entre dos carriles vecinos sale de sus cabeceras y de los rótulos que lo cruzan (no
// un ancho fijo por carril), los rótulos largos se parten en líneas y cada fila crece con su rótulo;
// antes de un fragmento queda aire para su pestaña. La vista encuadra el diagrama entero («Ver todo»).
export const LANE = {width: 200, gap: 24, row: 34, top: 24, loop: 34};
// selfWrap: el rótulo de una autollamada va a la derecha de su bucle y no condiciona ningún hueco: más ancho, menos líneas.
// margin: holgura de un rótulo en su tramo (4 px por lado y los 14 de la punta, que el rótulo esquiva).
export const LANE_TEXT = {size: 12.5, line: 15, frameGap: 8, margin: 22, head: 14, framePad: 30, wraps: [120, 150, 170, 190, 240], selfWrap: 280, aspect: 1.42};
const approximate = (text, size) => (text || '').length * size * 0.56;
// Cabecera de participante: chrome = 10 + 10 de padding, 1,5 + 1,5 de borde y holgura; ícono de 15 + 5 de hueco;
// pad = 6 + 6 de padding, el borde y holgura; un renglón de 12,5 px × 1,3.
const LANE_HEAD = {chrome: 28, icon: 20, pad: 20, line: 17};

// Corte en palabras a un ancho; una palabra más ancha que el ancho va sola en su línea.
export function wrapLabel(text, width, measure = approximate, size = LANE_TEXT.size) {
  const lines = [];
  let line = '';
  for (const word of String(text || '').split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, size) > width) { lines.push(line); line = word; } else line = next;
  }
  if (line || !lines.length) lines.push(line);
  return lines;
}

// Escala de «Ver todo» de una secuencia en un lienzo: todos los participantes a lo ancho y, si el
// diagrama entero cabe legible (texto >= 10 px), también a lo alto; si no, queda en la escala legible
// y los mensajes se recorren con scroll vertical (los participantes quedan fijos arriba).
export const LANE_LEGIBLE = 10 / LANE_TEXT.size;
export function laneFitScale(scene, canvas) {
  const whole = Math.min(canvas.width / scene.width, canvas.height / scene.height) * 0.995;
  if (whole >= LANE_LEGIBLE) return Math.min(1.1, whole);
  // Con scroll vertical, la barra le quita ancho al lienzo.
  return Math.min(1.1, (canvas.width - 16) / scene.width, LANE_LEGIBLE);
}

// El ancho de corte de los rótulos: con un lienzo, el que da la escala más alta (a igualdad, el que
// muestra más sin scroll); sin lienzo, el que más se acerca a su proporción típica.
export function laneScene(view, {measure = approximate, headMeasure = measure, canvas = null} = {}) {
  let best = null;
  for (const wrap of LANE_TEXT.wraps) {
    const scene = laneSceneAt(view, wrap, measure, headMeasure);
    const score = canvas
      ? [laneFitScale(scene, canvas), Math.min(canvas.width / scene.width, canvas.height / scene.height)]
      : [-Math.max(scene.width / LANE_TEXT.aspect, scene.height), 0];
    if (!best || score[0] > best.score[0] + 1e-6 || (Math.abs(score[0] - best.score[0]) <= 1e-6 && score[1] > best.score[1])) best = {scene, score};
  }
  return best.scene;
}

function laneSceneAt(view, wrap, measure, headMeasure = measure) {
  const notices = [];
  const nodes = view.nodes || [];
  // La cabecera de un participante tiene el ancho de su nombre (no el mínimo de un lifeline); un actor, el de su figura.
  // R14: el nombre se mide en el peso del rótulo y cuenta el ícono; si no cabe en LANE.width se parte en
  // líneas, y una palabra más ancha hace crecer la cabecera en vez de cortarse.
  const heads = nodes.map(n => { const [width, height] = glyphSize(n);
    if (n.shape === 'stick-figure') return {width: Math.min(width, LANE.width - 16), height};
    const icon = n.style?.icon ? LANE_HEAD.icon : 0;
    const lines = wrapLabel(n.label || '', LANE.width - 16 - LANE_HEAD.chrome - icon, headMeasure);
    const text = Math.max(...lines.map(t => headMeasure(t, LANE_TEXT.size)));
    return {lines, width: Math.ceil(Math.max(72, text + icon + LANE_HEAD.chrome)),
      height: Math.max(height, LANE_HEAD.pad + (n.keyword ? LANE_HEAD.line : 0) + lines.length * LANE_HEAD.line)}; });
  const index = new Map(nodes.map((n, i) => [n.doc, i]));
  const head = Math.max(0, ...heads.map(h => h.height));
  const offDraws = new Set();
  const links = (view.links || []).map((link, i) => ({link, index: i}))
    .filter(({link}) => index.has(link.source) && index.has(link.target) && link.draw !== 'nest')
    .sort((a, b) => (a.link.order || 0) - (b.link.order || 0) || a.index - b.index);
  const textOf = ({link}, row) => `${link.order || row + 1}. ${link.label || ''}`;
  // Huecos entre carriles vecinos: las dos medias cabeceras y lo que pida cada rótulo que los cruza.
  const gaps = nodes.slice(1).map((_, i) => heads[i].width / 2 + heads[i + 1].width / 2 + LANE.gap);
  const spans = links.map((l, row) => ({a: Math.min(index.get(l.link.source), index.get(l.link.target)), b: Math.max(index.get(l.link.source), index.get(l.link.target)),
    need: Math.min(measure(textOf(l, row), LANE_TEXT.size), wrap) + LANE_TEXT.margin})).filter(s => s.b > s.a).sort((x, y) => (x.b - x.a) - (y.b - y.a));
  for (const {a, b, need} of spans) {
    const have = gaps.slice(a, b).reduce((sum, g) => sum + g, 0);
    if (have < need) for (let i = a; i < b; i++) gaps[i] += (need - have) / (b - a);
  }
  const xs = [];
  nodes.forEach((_, i) => xs.push(i ? xs[i - 1] + gaps[i - 1] : LANE.gap + heads[0].width / 2));
  const lanes = nodes.map((n, i) => ({id: n.doc, index: i, x: xs[i], width: heads[i].width, height: heads[i].height, lines: heads[i].lines, glyph: n}));
  const fragmentStart = new Set((view.fragments || []).map(f => Math.min(...(f.orders || [Infinity]))));
  let y = LANE.top + head, prevBottom = LANE.top + head;
  const messages = links.map((l, row) => {
    const {link, index: i} = l;
    if (link.draw !== 'line') offDraws.add(link.draw);
    const from = lanes[index.get(link.source)], to = lanes[index.get(link.target)];
    const self = from.id === to.id, order = link.order || row + 1;
    const lines = wrapLabel(textOf(l, row), self ? Math.max(wrap, LANE_TEXT.selfWrap) : Math.max(60, Math.abs(to.x - from.x) - LANE_TEXT.margin), measure);
    const above = self ? LANE.row / 3 : lines.length * LANE_TEXT.line + 6;
    // Un fragmento que empieza deja aire bajo todo lo anterior (otro marco incluido) para su pestaña.
    y = fragmentStart.has(order)
      ? Math.max(y + LANE.row, prevBottom + LANE_TEXT.frameGap + Math.max(LANE.row * .85, above + 22))
      : Math.max(y + LANE.row, prevBottom + above + 10);
    prevBottom = y + (self ? Math.max(LANE.row / 3, 4 + lines.length * LANE_TEXT.line) : 6);
    const textW = Math.max(...lines.map(t => measure(t, LANE_TEXT.size)));
    // El rótulo va centrado en el tramo libre de punta: se corre hacia el origen la mitad de la punta.
    const mid = (from.x + to.x) / 2 - Math.sign(to.x - from.x) * (link.target_end ? LANE_TEXT.head / 2 : 0);
    return {id: link.doc || `${link.source}->${link.target}#${i}`, order, row,
      from: from.id, to: to.id, x1: from.x, x2: to.x, y, self, lines, labelTop: self ? y - LANE.row / 3 : y - above,
      labelBottom: self ? prevBottom : y, labelLeft: self ? from.x : mid - textW / 2, labelRight: self ? from.x + LANE.loop + 6 + textW : mid + textW / 2,
      labelX: self ? from.x + LANE.loop + 6 : mid,
      relation: link.relation, link: link.link || '', label: link.label || '', dash: dash(link.line),
      sourceEnd: terminal(link.source_end), targetEnd: terminal(link.target_end)};
  });
  for (const draw of offDraws) notices.push(`El dibujo «${draw}» no es un mensaje de secuencia: esas relaciones se dibujan como mensajes.`);
  if ((view.skipped || []).length) notices.push(`spec2viz omitió ${view.skipped.length} elemento(s) sin glifo ni link en la notación.`);
  const frames = laneFrames(view.fragments, messages);
  const right = Math.max(...lanes.map(l => l.x + l.width / 2),
    ...messages.filter(m => m.self).map(m => m.x1 + LANE.loop + 6 + Math.max(...m.lines.map(t => measure(t, LANE_TEXT.size)))),
    ...frames.map(f => f.x + f.width));
  const bottom = Math.max(prevBottom, ...frames.map(f => f.y + f.height)) + LANE.row / 2;
  return {kind: 'lanes', lanes, messages, frames, notices, head, wrap,
    lifelineTop: LANE.top + head, height: bottom + LANE.top, width: right + LANE.gap};
}

// Marcos de fragmento (§11 `fragments`: rachas de mensajes con el mismo
// `group`): de la primera a la última fila de sus `orders`, y de la línea de
// vida más a la izquierda a la más a la derecha que tocan sus mensajes. Un
// fragmento sin mensajes en la vista no se dibuja.
export function laneFrames(fragments, messages) {
  return (fragments || []).flatMap((fragment, index) => {
    const orders = new Set(fragment.orders || []);
    const inside = messages.filter(m => orders.has(m.order));
    if (!inside.length) return [];
    // Lo que ocupa cada mensaje: su flecha y, si se conoce, la caja de su rótulo (varias líneas encima,
    // o el bucle y el rótulo de una autollamada a la derecha y hacia abajo).
    const xs = inside.flatMap(m => [...(m.self ? [m.x1, m.x1 + LANE.loop] : [m.x1, m.x2]), ...(m.labelLeft != null ? [m.labelLeft, m.labelRight] : [])]);
    const ys = inside.map(m => m.y);
    const top = Math.min(...inside.map(m => Math.min(m.y - LANE.row * .85, m.labelTop != null ? m.labelTop - 22 : Infinity)));
    const bottom = Math.max(...inside.map(m => Math.max(m.y + LANE.row * .12, m.labelBottom != null ? m.labelBottom + 6 : -Infinity)));
    const pad = LANE_TEXT.framePad;
    // `kind` es el operador UML (alt, loop, opt…) o `group` si no lo hay;
    // la pestaña lleva el operador y el `label` va como condición al lado.
    const kind = fragment.kind || 'group';
    return [{id: `${kind}-${index}`, kind, operator: kind === 'group' ? '' : kind, label: fragment.label || '',
      // Arriba deja sitio para la pestaña sin pisar el rótulo del primer mensaje;
      // abajo cierra justo bajo el último, para que dos marcos seguidos no se monten.
      orders: inside.map(m => m.order), x: Math.min(...xs) - pad, y: Math.min(top, Math.min(...ys) - LANE.row * .85),
      width: Math.max(...xs) - Math.min(...xs) + pad * 2, height: bottom - Math.min(top, Math.min(...ys) - LANE.row * .85)}];
  });
}

// ---- Grilla (layout grid + draw cell, contrato §8c) ----
// Columnas: stages por `data.order`, una grilla por `data.view`. Filas:
// components en el orden de `nodes`, con la jerarquía de `draw: nest`
// (preorden, el hijo indentado). Celda: link `cell` fila → columna.
export function gridScene(view) {
  const notices = [];
  const nodes = view.nodes || [];
  const stages = nodes.filter(n => n.collection === 'stages');
  const rowsIn = nodes.filter(n => n.collection === 'components');
  const isRow = new Set(rowsIn.map(n => n.doc)), isCol = new Set(stages.map(n => n.doc));
  const outside = nodes.filter(n => !isRow.has(n.doc) && !isCol.has(n.doc));
  if (outside.length) notices.push(`${outside.length} elemento(s) no son filas ni columnas de la grilla y no se dibujan.`);
  const views = new Map();
  for (const st of stages) {
    const key = st.data?.view ?? '';
    if (!views.has(key)) views.set(key, {view: key, label: st.data?.view_label || key || 'Vista', stages: []});
    views.get(key).stages.push(st);
  }
  const parent = new Map(), cells = new Map(), offDraws = new Set();
  let stray = 0;
  for (const link of view.links || []) {
    if (link.draw === 'nest' && isRow.has(link.source) && isRow.has(link.target) && link.source !== link.target) {
      if (!parent.has(link.target)) parent.set(link.target, link.source);
    } else if (link.draw === 'cell' && isRow.has(link.source) && isCol.has(link.target)) {
      const key = cellKey(link.source, link.target);
      cells.set(key, [...(cells.get(key) || []), link.label || '']);
    } else if (link.draw === 'cell') stray++;
    else offDraws.add(link.draw);
  }
  if (stray) notices.push(`${stray} celda(s) no unen una fila con una columna y no se dibujan.`);
  for (const draw of offDraws) notices.push(`El dibujo «${draw}» no tiene lugar en una grilla: esas relaciones no se dibujan.`);
  // Preorden por anidado; un ciclo deja a sus miembros como raíces.
  const children = new Map(), rows = [], placed = new Set();
  for (const n of rowsIn) { const p = parent.get(n.doc); if (p) children.set(p, [...(children.get(p) || []), n]); }
  const visit = (n, depth) => {
    if (placed.has(n.doc)) return;
    placed.add(n.doc); rows.push({id: n.doc, label: n.label || n.title || n.doc, depth, glyph: n});
    for (const c of children.get(n.doc) || []) visit(c, depth + 1);
  };
  for (const n of rowsIn) if (!parent.has(n.doc)) visit(n, 0);
  for (const n of rowsIn) visit(n, 0);
  const grids = [...views.values()].map(v => ({view: v.view, label: v.label,
    columns: v.stages.map((st, i) => ({id: st.doc, label: st.label || st.title || st.doc, order: st.data?.order ?? i, index: i}))
      .sort((a, b) => a.order - b.order || a.index - b.index)}));
  if ((view.skipped || []).length) notices.push(`spec2viz omitió ${view.skipped.length} elemento(s) sin glifo ni link en la notación.`);
  return {kind: 'grid', grids, rows, cells: Object.fromEntries(cells), notices};
}

export const cellKey = (row, col) => `${row}\u0000${col}`;

// Qué escena toca según el layout de la vista. Una grilla sin columnas no es
// dibujable como grilla: cae a grafo con aviso.
export function sceneFor(view, {measure, headMeasure, canvas} = {}) {
  const kind = view.layout?.kind;
  if (kind === 'lanes') return laneScene(view, {...(measure ? {measure} : {}), ...(headMeasure ? {headMeasure} : {}), canvas: canvas || null});
  if (kind === 'grid') {
    if ((view.nodes || []).some(n => n.collection === 'stages')) return gridScene(view);
    const scene = buildScene({...view, layout: {...view.layout, kind: 'graph'}});
    scene.notices.unshift('La grilla no tiene columnas (nodos con collection «stages»): se dibuja como grafo.');
    return {kind: 'graph', ...scene};
  }
  return {kind: 'graph', ...buildScene(view)};
}

FILE:frontends/mindmap/views/specs/notation/notation-layout.mjs
// Layout del grafo de notación con ELK (layered, jerárquico): tamaños desde el texto, contenedores
// con su cabecera reservada, hijos sueltos en una grilla 2D, aristas ortogonales ruteadas por ELK con
// sus rótulos colocados por ELK. Lógica pura: el texto se mide con una función inyectada (canvas en
// el navegador, una aproximación en los tests) y ELK se pasa como argumento.
//
// Issues que resuelve (desk/drawer/issues): G2 cabecera de contenedor tapada, G3 hijos en una fila,
// G4 cajas que no crecen con el texto, G5 aristas en un carril con rótulos encimados, G6 rótulo de
// la decisión fuera del rombo y bucles sobre el flujo.

import {compartmentLine} from './notation.mjs';
import {shapeBox, clipToContour} from './notation-style.mjs';
import {swimlaneLayout} from './notation-swimlanes.mjs';
import {deploymentLayout} from './notation-deployment.mjs';

// Todo el texto del diagrama a 12.5 px: con el zoom de «Ver todo» por encima de 0.8 se lee a ≥10 px.
export const FONT = {label: 12.5, small: 12.5, edge: 12.5, line: 1.3};
export const MIN_TEXT_PX = 10;
export const POINT_SHAPES = ['filled-circle', 'bullseye'];
const POINT_SIZES = {'filled-circle': [22, 22], bullseye: [26, 26]};
const FIXED = {'stick-figure': [90, 86]};
const MIN = {box: [120, 40], 'rounded-box': [120, 40], 'class-box': [150, 40], 'lifeline': [150, 52], 'boundary-lifeline': [150, 52]};
const PAD_X = 14, PAD_Y = 10, CONTAINER_SIDE = 8, ICON_SPACE = 20;
export const DIAMOND_RATIO = 2;

// Ancho aproximado para los tests y para cuando no hay canvas: ~0.55 em por carácter.
export const approximateMeasure = (text, size) => (text || '').length * size * 0.56;

const lineHeight = size => Math.ceil(size * FONT.line);
const KEYWORD = lineHeight(FONT.small), COMPARTMENT_ROW = lineHeight(FONT.small), COMPARTMENT_CHROME = 9;

// Corte en palabras para que una línea no pase de maxWidth; una palabra más larga se parte.
export function wrapText(text, maxWidth, size, measure = approximateMeasure) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  const push = word => {
    let rest = word;
    while (measure(rest, size) > maxWidth && rest.length > 1) {
      let cut = rest.length - 1;
      while (cut > 1 && measure(rest.slice(0, cut), size) > maxWidth) cut--;
      lines.push(rest.slice(0, cut));
      rest = rest.slice(cut);
    }
    return rest;
  };
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (measure(candidate, size) <= maxWidth) { current = candidate; continue; }
    if (current) lines.push(current);
    current = push(word);
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

function block(text, maxWidth, size, measure) {
  const lines = wrapText(text, maxWidth, size, measure);
  return {lines, width: Math.max(...lines.map(l => measure(l, size))), height: lines.length * lineHeight(size)};
}

// Tamaño de un glifo desde su texto (G4). Un rombo (decisión) contiene su rótulo (G6): para un
// rectángulo w×h dentro de un rombo de proporción r, el ancho es w + r·h.
export function sizeGlyph(glyph, {measure = approximateMeasure, wrapWidth = 200} = {}) {
  const shape = glyph.shape;
  if (POINT_SIZES[shape]) {
    const [w, h] = POINT_SIZES[shape];
    const label = glyph.label ? block(glyph.label, 160, FONT.small, measure) : null;
    return {width: w, height: h, lines: [], outside: label};
  }
  if (FIXED[shape]) {
    const label = block(glyph.label, 140, FONT.small, measure);
    return {width: Math.max(FIXED[shape][0], label.width + 8), height: FIXED[shape][1], lines: label.lines};
  }
  if (shape === 'diamond') {
    const label = block(glyph.label, Math.min(wrapWidth, 150), FONT.small, measure);
    const width = Math.max(46, Math.ceil(label.width + DIAMOND_RATIO * label.height + 18));
    return {width, height: Math.max(46, Math.ceil(width / DIAMOND_RATIO)), lines: label.lines};
  }
  const label = block(glyph.label, wrapWidth, FONT.label, measure);
  const keyword = glyph.keyword ? KEYWORD : 0;
  const rows = (glyph.compartments || []).filter(c => c.items && c.items.length);
  const itemWidth = Math.max(0, ...rows.flatMap(c => c.items.map(i => measure(compartmentLine(i), FONT.small))));
  // Un compartimento mide lo que dibuja el CSS: 4 px arriba y abajo, 1 de borde y un renglón por item.
  const body = rows.reduce((h, c) => h + COMPARTMENT_CHROME + c.items.length * COMPARTMENT_ROW, 0);
  const [minW, minH] = MIN[shape] || [120, 40];
  // Un ícono va antes del rótulo; en las formas de contorno, el texto va en su área interior y la caja
  // crece hasta que quepa (shapeBox).
  const icon = glyph.style?.icon ? ICON_SPACE : 0;
  const contentW = Math.max(label.width + icon, itemWidth, glyph.keyword ? measure(glyph.keyword, FONT.small) : 0) + PAD_X * 2;
  const contentH = keyword + label.height + PAD_Y * 2 + body;
  const [boxW, boxH] = shapeBox(shape, contentW, contentH);
  const width = Math.ceil(Math.max(minW, boxW));
  const height = Math.ceil(Math.max(minH, boxH));
  return {width, height, lines: label.lines};
}

// Cabecera de un contenedor: su rótulo (con keyword) envuelto; los hijos empiezan debajo (G2).
// El ícono del estilo (§13) va antes del rótulo también en un contenedor: su sitio cuenta en el ancho.
export function containerHeader(glyph, {measure = approximateMeasure, wrapWidth = 260} = {}) {
  const label = block(glyph.label, wrapWidth, FONT.label, measure);
  const icon = glyph.style?.icon ? ICON_SPACE : 0;
  const keyword = glyph.keyword ? measure(glyph.keyword, FONT.small) : 0;
  return {lines: label.lines, width: Math.ceil(Math.max(label.width + icon, keyword) + PAD_X * 2), height: Math.ceil((glyph.keyword ? KEYWORD : 0) + label.height + 12)};
}

// Rótulo de arista envuelto en un ancho fijo: ELK le reserva su caja (G5).
export function edgeLabelBox(text, {measure = approximateMeasure, wrapWidth = 130} = {}) {
  if (!text) return null;
  const label = block(text, wrapWidth, FONT.edge, measure);
  return {lines: label.lines, width: Math.ceil(label.width + 8), height: Math.ceil(label.height + 2)};
}

// Candidatos de layout: en la dirección de la notación, varía el ancho de corte de los rótulos y
// cómo ELK reparte capas y rótulos. La vista se queda con el que mejor cabe en su lienzo.
const BASE = {'elk.spacing.nodeNode': '22', 'elk.layered.spacing.nodeNodeBetweenLayers': '34', 'elk.spacing.edgeLabel': '4',
  'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX'};
// Con el orden del spec, el flujo principal baja en ese orden y solo las aristas que vuelven a un paso
// anterior son bucles, ruteados al costado (G6). Se prefiere mientras el texto se lea.
const MODEL_ORDER = {'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES', 'elk.layered.cycleBreaking.strategy': 'MODEL_ORDER'};
const TIGHT = {'elk.spacing.nodeNode': '16', 'elk.layered.spacing.nodeNodeBetweenLayers': '28'};
const VARIANTS = [{}, TIGHT, {...TIGHT, 'elk.layered.layering.strategy': 'LONGEST_PATH'},
  {...TIGHT, 'elk.layered.wrapping.strategy': 'MULTI_EDGE', 'elk.aspectRatio': '1.6'}];
export const LAYOUT_CANDIDATES = [130, 170, 240].flatMap(wrapWidth => VARIANTS.flatMap(options => [
  {wrapWidth, ordered: true, options: {...options, ...MODEL_ORDER}},
  {wrapWidth, ordered: false, options},
]));

const ELK_DIRECTION = {TB: 'DOWN', BT: 'UP', LR: 'RIGHT', RL: 'LEFT'};
export const GRID_MIN = 4;

// Grilla para los hijos de un contenedor que no se conectan entre sí (G3): aristas invisibles que
// apilan filas de `cols` hijos. Solo cuentan para el layout; no se dibujan.
export function gridEdges(scene, aspect = 1) {
  const byId = new Map(scene.nodes.map(n => [n.id, n]));
  const kids = new Map();
  for (const n of scene.nodes) if (n.parent) kids.set(n.parent, [...(kids.get(n.parent) || []), n]);
  const edges = [];
  for (const [parent, children] of kids) {
    const linked = id => scene.edges.some(e => (e.source === id && byId.get(e.target)?.parent === parent)
      || (e.target === id && byId.get(e.source)?.parent === parent));
    const free = children.filter(c => !linked(c.id));
    if (free.length < GRID_MIN) continue;
    const cols = Math.max(2, Math.ceil(Math.sqrt(free.length * aspect)));
    for (let i = 0; i + cols < free.length; i++) edges.push({id: `grid:${free[i].id}>${free[i + cols].id}`, sources: [free[i].id], targets: [free[i + cols].id]});
  }
  return edges;
}

const VERTICES = ['N', 'E', 'S', 'W'];
const VERTICAL = new Set(['TB', 'BT']);
const vertex = (side, {width, height}) => ({N: {x: width / 2, y: 0}, S: {x: width / 2, y: height}, E: {x: width, y: height / 2}, W: {x: 0, y: height / 2}})[side];
export const headerId = id => `${id}#title`;
// Vértice de entrada y de salida de cada arista de un rombo según la dirección: se entra por el
// vértice que mira al flujo y las ramas salen por los otros tres, en orden.
const FLOW_SIDES = {TB: ['N', ['S', 'E', 'W']], BT: ['S', ['N', 'E', 'W']], LR: ['W', ['E', 'S', 'N']], RL: ['E', ['W', 'S', 'N']]};
export function diamondPorts(scene, direction = 'TB') {
  const [inSide, outSides] = FLOW_SIDES[direction] || FLOW_SIDES.TB;
  const diamond = new Set(scene.nodes.filter(n => n.glyph.shape === 'diamond').map(n => n.id));
  const ports = new Map(), used = new Map();
  for (const e of scene.edges) {
    if (diamond.has(e.target)) ports.set(`${e.id}>target`, `${e.target}#${inSide}`);
    if (diamond.has(e.source)) {
      const k = used.get(e.source) || 0;
      used.set(e.source, k + 1);
      ports.set(`${e.id}>source`, `${e.source}#${outSides[Math.min(k, outSides.length - 1)]}`);
    }
  }
  return ports;
}

// Grafo ELK de una escena (buildScene) con los tamaños medidos de un candidato.
export function elkGraph(scene, {measure = approximateMeasure, wrapWidth = 200, labelWrap = 130, reserveLabels = true, options = {}} = {}) {
  const kids = new Map();
  for (const n of scene.nodes) kids.set(n.parent || '', [...(kids.get(n.parent || '') || []), n]);
  const sizes = new Map();
  const direction = scene.direction || 'TB';
  const ports = diamondPorts(scene, direction);
  const titleEdges = [];
  const make = n => {
    const children = kids.get(n.id) || [];
    if (n.container && children.length) {
      // R5: el título es un nodo hijo en la primera capa del contenedor: ELK rutea las aristas
      // alrededor de él como de cualquier nodo, así que ninguna cruza el encabezado.
      const head = containerHeader(n.glyph, {measure, wrapWidth: wrapWidth + 60});
      const inner = {'elk.layered.spacing.nodeNodeBetweenLayers': '10', 'elk.spacing.nodeNode': '10'};
      if (!VERTICAL.has(direction)) {
        // En horizontal las aristas entran por los costados: el título va en el padding de arriba.
        sizes.set(n.id, {header: {...head, x: CONTAINER_SIDE, y: 0}});
        return {id: n.id, children: children.map(make), layoutOptions: {...inner,
          'elk.padding': `[top=${head.height + 6},left=${CONTAINER_SIDE},bottom=${CONTAINER_SIDE},right=${CONTAINER_SIDE}]`,
          'elk.nodeSize.minimum': `(${head.width + CONTAINER_SIDE * 2},${head.height + 20})`, 'elk.nodeSize.constraints': 'MINIMUM_SIZE'}};
      }
      sizes.set(n.id, {header: head});
      const title = {id: headerId(n.id), width: head.width, height: head.height,
        layoutOptions: {'elk.layered.layering.layerConstraint': 'FIRST'}};
      // El título va solo en su fila: aristas invisibles del título a cada hijo los bajan a las siguientes.
      for (const child of children) titleEdges.push({id: `title:${n.id}>${child.id}`, sources: [title.id], targets: [child.id]});
      return {id: n.id, children: [title, ...children.map(make)], layoutOptions: {...inner,
        'elk.padding': `[top=${CONTAINER_SIDE},left=${CONTAINER_SIDE},bottom=${CONTAINER_SIDE},right=${CONTAINER_SIDE}]`}};
    }
    const size = sizeGlyph(n.glyph, {measure, wrapWidth});
    sizes.set(n.id, size);
    const node = {id: n.id, width: size.width, height: size.height, layoutOptions: {}};
    // R1: el inicial abre el flujo (primera capa) y el final lo cierra (última).
    if (n.glyph.shape === 'filled-circle') node.layoutOptions['elk.layered.layering.layerConstraint'] = 'FIRST';
    if (n.glyph.shape === 'bullseye') node.layoutOptions['elk.layered.layering.layerConstraint'] = 'LAST';
    if (size.outside) {
      node.labels = [{id: `${n.id}#label`, text: n.glyph.label, width: Math.ceil(size.outside.width + 4), height: size.outside.height}];
      node.layoutOptions['elk.nodeLabels.placement'] = 'OUTSIDE V_BOTTOM H_CENTER';
    }
    if (n.glyph.shape === 'diamond') {
      // R2: las aristas de una decisión llegan y salen por los vértices del rombo, no por su caja.
      node.ports = VERTICES.map(side => ({id: `${n.id}#${side}`, width: 0, height: 0, ...vertex(side, size)}));
      node.layoutOptions['elk.portConstraints'] = 'FIXED_POS';
    }
    return node;
  };
  const labels = new Map();
  const edges = scene.edges.map(e => {
    const box = edgeLabelBox(e.label, {measure, wrapWidth: labelWrap});
    if (box) labels.set(e.id, box);
    // Los rótulos los coloca placeLabels junto a su tramo (R3); ELK solo les reserva espacio (si el
    // candidato lo pide: sin reserva, el diagrama es más compacto y placeLabels busca hueco igual).
    return {id: e.id, sources: [ports.get(`${e.id}>source`) || e.source], targets: [ports.get(`${e.id}>target`) || e.target],
      labels: box && (reserveLabels === true || reserveLabels?.has?.(e.id)) ? [{id: `${e.id}#label`, text: e.label, width: box.width, height: box.height}] : []};
  });
  return {
    graph: {id: 'root', layoutOptions: {'elk.algorithm': 'layered', 'elk.direction': ELK_DIRECTION[scene.direction] || 'DOWN',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN', 'elk.edgeRouting': 'ORTHOGONAL', 'elk.json.edgeCoords': 'ROOT', 'elk.json.shapeCoords': 'PARENT',
      ...BASE, ...options}, children: (kids.get('') || []).map(make), edges: [...edges, ...gridEdges(scene), ...titleEdges]},
    sizes, labels,
  };
}

// Resultado de ELK -> nodos de React Flow (posición relativa a su padre), aristas con su
// recorrido y su rótulo en coordenadas del lienzo, y el tamaño total.
export function fromElk(result, scene, {sizes, labels}) {
  const byId = new Map(scene.nodes.map(n => [n.id, n]));
  const nodes = [];
  const walk = (elkNode, depth) => {
    for (const child of elkNode.children || []) {
      const n = byId.get(child.id);
      if (!n) continue;
      const size = sizes.get(child.id) || {};
      const title = (child.children || []).find(c => c.id === headerId(child.id));
      if (title && size.header) size.header = {...size.header, x: title.x, y: title.y, width: title.width};
      const outside = child.labels?.[0];
      nodes.push({id: child.id, parent: n.parent, depth, x: child.x, y: child.y, width: child.width, height: child.height,
        container: Boolean(n.container && child.children?.length), glyph: n.glyph, lines: size.lines || size.header?.lines || [],
        header: size.header || null, outside: outside && size.outside ? {x: outside.x, y: outside.y, width: outside.width, height: outside.height, lines: size.outside.lines} : null});
      walk(child, depth + 1);
    }
  };
  walk(result, 0);
  const sceneEdges = new Map(scene.edges.map(e => [e.id, e]));
  const edges = (result.edges || []).filter(e => sceneEdges.has(e.id)).map(e => ({...sceneEdges.get(e.id), points: routeOf(e.sections || []),
    labelSize: labels.get(e.id) || null, labelBox: null}));
  const layout = {nodes, edges, width: result.width, height: result.height};
  placeLabels(layout);
  return layout;
}

// Secciones de una arista en el orden en que se conectan (incoming/outgoingSections), no en el del array.
export function routeOf(sections) {
  if (sections.length <= 1) return sections.flatMap(s => [s.startPoint, ...(s.bendPoints || []), s.endPoint]);
  const byId = new Map(sections.map(s => [s.id, s]));
  let current = sections.find(s => !(s.incomingSections || []).length) || sections[0];
  const points = [], seen = new Set();
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    points.push(...(points.length ? [] : [current.startPoint]), ...(current.bendPoints || []), current.endPoint);
    current = byId.get((current.outgoingSections || [])[0]);
  }
  return points;
}

// ---- geometría en coordenadas del lienzo ----
export function absoluteBoxes(layout) {
  const byId = new Map(layout.nodes.map(n => [n.id, n]));
  const abs = new Map();
  const place = n => {
    if (abs.has(n.id)) return abs.get(n.id);
    const parent = n.parent && byId.get(n.parent) ? place(byId.get(n.parent)) : {x: 0, y: 0};
    const box = {x: parent.x + n.x, y: parent.y + n.y, width: n.width, height: n.height};
    abs.set(n.id, box);
    return box;
  };
  layout.nodes.forEach(place);
  return abs;
}
const intersects = (a, b, m = 0) => a.x < b.x + b.width + m && b.x < a.x + a.width + m && a.y < b.y + b.height + m && b.y < a.y + a.height + m;
const segBox = (a, b) => ({x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(a.x - b.x), height: Math.abs(a.y - b.y)});
function boxToSegment(box, a, b) {
  const cx = Math.max(box.x, Math.min((a.x + b.x) / 2, box.x + box.width)), cy = Math.max(box.y, Math.min((a.y + b.y) / 2, box.y + box.height));
  const dx = b.x - a.x, dy = b.y - a.y, l = dx * dx + dy * dy;
  const t = l ? Math.max(0, Math.min(1, ((cx - a.x) * dx + (cy - a.y) * dy) / l)) : 0;
  const px = a.x + t * dx, py = a.y + t * dy;
  const qx = Math.max(box.x, Math.min(px, box.x + box.width)), qy = Math.max(box.y, Math.min(py, box.y + box.height));
  return Math.hypot(px - qx, py - qy);
}
export const LABEL_GAP = 4, LABEL_MAX_DISTANCE = 20;

// R3: cada rótulo va pegado a un tramo de su arista (al costado de un tramo vertical, encima o debajo de
// uno horizontal) sin pisar nodos, encabezados ni otros rótulos. R6: además tiene que estar al menos
// LABEL_MARGIN px más cerca de su arista que de cualquier otra, para que no se lea como de la vecina; y
// una guarda (rama que sale de un rombo) va en el primer tramo, justo a la salida del vértice.
export const LABEL_MARGIN = 8;
const segmentsOf = points => points.slice(1).map((b, i) => [points[i], b]);
const distanceTo = (box, segments) => Math.min(Infinity, ...segments.map(([a, b]) => boxToSegment(box, a, b)));

function labelCandidates(segment, {width, height}, offsets) {
  const [a, b] = segment;
  const vertical = Math.abs(a.x - b.x) < 0.5, length = Math.hypot(b.x - a.x, b.y - a.y);
  return offsets(length).flatMap(t => {
    const px = a.x + (b.x - a.x) * t, py = a.y + (b.y - a.y) * t;
    return vertical ? [{x: px + LABEL_GAP, y: py - height / 2}, {x: px - LABEL_GAP - width, y: py - height / 2}]
      : [{x: px - width / 2, y: py - LABEL_GAP - height}, {x: px - width / 2, y: py + LABEL_GAP}];
  }).map(c => ({...c, width, height}));
}

export function placeLabels(layout) {
  const abs = absoluteBoxes(layout);
  const obstacles = layout.nodes.filter(n => !n.container).map(n => abs.get(n.id));
  for (const n of layout.nodes) if (n.container && n.header) { const c = abs.get(n.id); obstacles.push({x: c.x + n.header.x, y: c.y + n.header.y, width: n.header.width, height: n.header.height}); }
  const diamonds = new Set(layout.nodes.filter(n => n.glyph?.shape === 'diamond').map(n => n.id));
  const segs = new Map(layout.edges.map(e => [e.id, segmentsOf(e.points)]));
  const placed = [];
  const free = box => !obstacles.some(o => intersects(box, o, 1)) && !placed.some(o => intersects(box, o, 2));
  // Guardas primero: son las que más se confunden con la rama vecina.
  const ordered = [...layout.edges].sort((a, b) => diamonds.has(b.source) - diamonds.has(a.source));
  for (const e of ordered) {
    if (!e.labelSize || e.points.length < 2) continue;
    const own = segs.get(e.id);
    const others = layout.edges.filter(o => o.id !== e.id).flatMap(o => segs.get(o.id));
    const clear = box => distanceTo(box, others) >= distanceTo(box, own) + LABEL_MARGIN;
    const guard = diamonds.has(e.source);
    const byLength = [...own].sort(([a1, b1], [a2, b2]) => Math.hypot(b2.x - a2.x, b2.y - a2.y) - Math.hypot(b1.x - a1.x, b1.y - a1.y));
    const near = length => [8, 16, 28].filter(d => d < length).map(d => d / length).concat(length > 0 ? [0.5] : []);
    const spread = () => [0.5, 0.3, 0.7, 0.15, 0.85, 0.05, 0.95, 0.4, 0.6, 0.22, 0.78];
    const tries = [
      ...(guard ? labelCandidates(own[0], e.labelSize, near) : []),
      ...byLength.flatMap(seg => labelCandidates(seg, e.labelSize, spread)),
    ];
    let chosen = tries.find(c => free(c) && clear(c)) || tries.find(free);
    // Sin hueco libre: en el centro del tramo más largo (pegado igual a su arista).
    if (!chosen) { const [a, b] = byLength[0]; chosen = {x: (a.x + b.x) / 2 + LABEL_GAP, y: (a.y + b.y) / 2 - e.labelSize.height / 2, ...e.labelSize}; }
    placed.push(chosen);
    e.labelBox = {x: chosen.x, y: chosen.y, width: chosen.width, height: chosen.height, lines: e.labelSize.lines};
  }
}

// R9: rótulo de extremo (multiplicidad de una asociación UML): pegado al extremo real de su arista, a un
// costado de su primer tramo y por fuera de la caja del nodo; esquiva nodos, títulos de contenedor,
// rótulos de arista y otros rótulos de extremo. Se coloca sobre el recorrido final (tras clipEnds).
export const END_LABEL = {height: 16, pad: 6, side: 3, steps: [5, 12, 22, 34]};
export function placeEndLabels(layout, {measure = approximateMeasure} = {}) {
  const abs = absoluteBoxes(layout);
  const obstacles = layout.nodes.flatMap(n => { const b = abs.get(n.id);
    return n.container ? (n.header ? [{x: b.x + n.header.x, y: b.y + n.header.y, width: n.header.width, height: n.header.height}] : []) : [b]; });
  const placed = layout.edges.filter(e => e.labelBox).map(e => e.labelBox);
  for (const e of layout.edges) {
    for (const [end, key] of [['source', 'sourceLabel'], ['target', 'targetLabel']]) {
      const text = e[key];
      if (!text || !e.points || e.points.length < 2) continue;
      const pts = end === 'source' ? e.points : [...e.points].reverse();
      const p = pts[0], q = pts[1];
      const len = Math.hypot(q.x - p.x, q.y - p.y) || 1;
      const d = {x: (q.x - p.x) / len, y: (q.y - p.y) / len}, n = {x: -d.y, y: d.x};
      const width = Math.ceil(measure(text, FONT.edge) + END_LABEL.pad), height = END_LABEL.height;
      const along = Math.abs(d.x) > Math.abs(d.y) ? width / 2 : height / 2, across = Math.abs(n.x) > Math.abs(n.y) ? width / 2 : height / 2;
      const candidates = END_LABEL.steps.flatMap(t => [1, -1].map(side => {
        const cx = p.x + d.x * (t + along) + n.x * side * (across + END_LABEL.side), cy = p.y + d.y * (t + along) + n.y * side * (across + END_LABEL.side);
        return {x: cx - width / 2, y: cy - height / 2, width, height};
      }));
      const free = box => !obstacles.some(o => intersects(box, o, 1)) && !placed.some(o => intersects(box, o, 1));
      const box = candidates.find(free) || candidates[0];
      placed.push(box);
      e[key + 'Box'] = {...box, text};
    }
  }
  return layout;
}

// Aristas cuyo rótulo quedó encima de un nodo (o del encabezado de un contenedor): tapa texto.
export function labelsOnNodes(layout) {
  const abs = absoluteBoxes(layout);
  const covers = layout.nodes.flatMap(n => { const b = abs.get(n.id);
    return n.container ? (n.header ? [{x: b.x + n.header.x, y: b.y + n.header.y, width: n.header.width, height: n.header.height}] : []) : [b]; });
  return layout.edges.filter(e => e.labelBox && covers.some(b => intersects(e.labelBox, b, -1))).map(e => e.id);
}

// Problemas que hacen descartar un candidato: aristas sin ruta ortogonal o con un extremo al aire
// (R2), rótulos lejos de su arista (R3) y aristas que cruzan el encabezado de un contenedor (R5).
export function layoutIssues(layout) {
  const abs = absoluteBoxes(layout);
  const heads = layout.nodes.filter(n => n.container && n.header).map(n => { const c = abs.get(n.id);
    return {id: n.id, box: {x: c.x + n.header.x, y: c.y + n.header.y, width: n.header.width, height: n.header.height}}; });
  const issues = {broken: 0, farLabels: 0, headerCrossings: 0, ambiguousGuards: 0, labelsOnNodes: 0};
  const covering = new Set(labelsOnNodes(layout));
  const diamonds = new Set(layout.nodes.filter(n => n.glyph?.shape === 'diamond').map(n => n.id));
  const segs = new Map(layout.edges.map(e => [e.id, segmentsOf(e.points)]));
  const touches = (p, box) => box && p.x >= box.x - 1.5 && p.x <= box.x + box.width + 1.5 && p.y >= box.y - 1.5 && p.y <= box.y + box.height + 1.5
    && Math.min(Math.abs(p.x - box.x), Math.abs(p.x - box.x - box.width), Math.abs(p.y - box.y), Math.abs(p.y - box.y - box.height)) <= 1.5;
  for (const e of layout.edges) {
    const pts = e.points;
    const diagonal = pts.some((p, i) => i && Math.abs(p.x - pts[i - 1].x) > 0.5 && Math.abs(p.y - pts[i - 1].y) > 0.5);
    if (pts.length < 2 || diagonal || !touches(pts[0], abs.get(e.source)) || !touches(pts[pts.length - 1], abs.get(e.target))) issues.broken++;
    if (e.labelBox && Math.min(...pts.slice(1).map((p, i) => boxToSegment(e.labelBox, pts[i], p))) > LABEL_MAX_DISTANCE) issues.farLabels++;
    if (covering.has(e.id)) issues.labelsOnNodes++;
    if (e.labelBox && diamonds.has(e.source)) {
      const others = layout.edges.filter(o => o.id !== e.id).flatMap(o => segs.get(o.id));
      if (distanceTo(e.labelBox, others) < distanceTo(e.labelBox, segs.get(e.id)) + LABEL_MARGIN) issues.ambiguousGuards++;
    }
    for (let i = 1; i < pts.length; i++) {
      const seg = segBox(pts[i - 1], pts[i]);
      if (heads.some(h => intersects(seg, {x: h.box.x + 1, y: h.box.y + 1, width: h.box.width - 2, height: h.box.height - 2}))) { issues.headerCrossings++; break; }
    }
  }
  issues.total = issues.broken + issues.farLabels + issues.headerCrossings + issues.ambiguousGuards + issues.labelsOnNodes;
  return issues;
}

// Zoom con el que el diagrama entero cabe en el lienzo (con un margen relativo).
export const FIT_PADDING = 0.03;
export const fitZoom = (layout, canvas, padding = FIT_PADDING) => Math.min(canvas.width / layout.width, canvas.height / layout.height) / (1 + padding);

// Corre los candidatos con ELK y devuelve el layout que mejor cabe en el lienzo.
// Se prueba primero la dirección de la notación; si así el texto no llega a MIN_TEXT_PX, también la
// perpendicular, y gana la que mejor cabe.
const PERPENDICULAR = {TB: 'LR', BT: 'RL', LR: 'TB', RL: 'BT'};
export const legibleZoom = MIN_TEXT_PX / FONT.label;
// R10: nodos sueltos (sin aristas, sin contenedor ni hijos). ELK los pone en una fila; aparte, se
// acomodan en una grilla al costado o debajo de lo conectado, la que más zoom da en el lienzo.
export const ISOLATED = {min: 4, gap: 40};
export function isolatedNodes(scene) {
  const linked = new Set(scene.edges.flatMap(e => [e.source, e.target]));
  const parents = new Set(scene.nodes.map(n => n.parent).filter(Boolean));
  return scene.nodes.filter(n => !n.parent && !n.container && !parents.has(n.id) && !linked.has(n.id));
}

export function packIsolated(layout, isolated, {measure = approximateMeasure, wrapWidth = 170, canvas}) {
  const items = isolated.map(n => ({n, size: sizeGlyph(n.glyph, {measure, wrapWidth})}));
  const W = layout.nodes.length ? layout.width : 0, H = layout.nodes.length ? layout.height : 0, gap = ISOLATED.gap;
  let best = null;
  for (let k = 1; k <= items.length; k++) {
    const rows = Math.ceil(items.length / k);
    const colW = Array.from({length: k}, (_, c) => Math.max(0, ...items.filter((_, i) => i % k === c).map(it => it.size.width)));
    const rowH = Array.from({length: rows}, (_, r) => Math.max(0, ...items.slice(r * k, r * k + k).map(it => it.size.height)));
    const gw = colW.reduce((a, b) => a + b, 0) + gap * (k - 1), gh = rowH.reduce((a, b) => a + b, 0) + gap * (rows - 1);
    for (const side of W ? ['right', 'below'] : ['alone']) {
      const [width, height, ox, oy] = side === 'right' ? [W + gap + gw, Math.max(H, gh), W + gap, 0]
        : side === 'below' ? [Math.max(W, gw), H + gap + gh, 0, H + gap] : [gw, gh, 0, 0];
      const zoom = fitZoom({width, height}, canvas);
      if (!best || zoom > best.zoom + 1e-6) best = {zoom, width, height, ox, oy, k, colW, rowH};
    }
  }
  const {k, colW, rowH, ox, oy} = best;
  items.forEach(({n, size}, i) => {
    const c = i % k, r = Math.floor(i / k);
    const x = ox + colW.slice(0, c).reduce((a, b) => a + b, 0) + gap * c + (colW[c] - size.width) / 2;
    const y = oy + rowH.slice(0, r).reduce((a, b) => a + b, 0) + gap * r;
    layout.nodes.push({id: n.id, parent: null, depth: 0, x, y, width: size.width, height: size.height, container: false,
      glyph: n.glyph, lines: size.lines || [], header: null, outside: null});
  });
  Object.assign(layout, {width: best.width, height: best.height, isolated: {count: items.length, columns: k}});
  return layout;
}

export async function bestLayout(elk, scene, {measure = approximateMeasure, canvas = {width: 1200, height: 900}, candidates = LAYOUT_CANDIDATES} = {}) {
  // Activity con particiones (§14) y sin anidado: carriles UML propios, no ELK.
  if (usesSwimlanes(scene)) return placeEndLabels(clipEnds(Object.assign(bestSwimlanes(scene, {measure, canvas}), {engine: 'swimlanes'})), {measure});
  // R10: lo conectado va por ELK; los sueltos, en su grilla (un despliegue tiene su propio empaque).
  const loose = scene.diagramType === 'deployment' ? [] : isolatedNodes(scene);
  if (loose.length >= ISOLATED.min) {
    const ids = new Set(loose.map(n => n.id));
    const core = {...scene, nodes: scene.nodes.filter(n => !ids.has(n.id))};
    // Lo conectado se elige contra un lienzo más angosto también: la grilla le va a sacar ancho.
    let best = null;
    for (const share of core.nodes.length ? [1, 0.75, 0.6] : [1]) {
      const layout = core.nodes.length ? await bestLayout(elk, core, {measure, canvas: {width: canvas.width * share, height: canvas.height}, candidates})
        : {nodes: [], edges: [], width: 0, height: 0, direction: scene.direction, candidate: {wrapWidth: 170}, issues: {total: 0}};
      packIsolated(layout, loose, {measure, wrapWidth: layout.candidate?.wrapWidth || 170, canvas});
      layout.zoom = fitZoom(layout, canvas);
      layout.issues = layoutIssues(layout);
      if (!best || layout.issues.total < best.issues.total || (layout.issues.total === best.issues.total && layout.zoom > best.zoom + 1e-6)) best = layout;
    }
    return best;
  }
  let best = await bestIn(elk, scene, {measure, canvas, candidates});
  const better = (a, b) => a && (!b || a.issues.total < b.issues.total || (a.issues.total === b.issues.total && a.zoom > b.zoom));
  if (best && (best.zoom < legibleZoom || best.issues.total)) {
    const turned = await bestIn(elk, {...scene, direction: PERPENDICULAR[scene.direction] || 'LR'}, {measure, canvas, candidates});
    if (better(turned, best)) best = turned;
  }
  // Si aún no se lee (un despliegue grande y anidado): ELK sin reservar sitio a los rótulos de arista,
  // que en horizontal ensanchan cada capa; placeLabels los coloca igual junto a su tramo.
  if (best && (best.zoom < legibleZoom || best.issues.total)) {
    const loose = candidates.map(c => ({...c, reserveLabels: false}));
    for (const direction of [scene.direction, PERPENDICULAR[scene.direction] || 'LR']) {
      const tried = await allIn(elk, {...scene, direction}, {measure, canvas, candidates: loose});
      // Los rótulos que no cupieron (encima de un nodo) piden su sitio a ELK en una segunda pasada,
      // solo ellos: los tres candidatos que mejor caben.
      const retry = tried.filter(l => l.issues.labelsOnNodes).sort((a, b) => b.zoom - a.zoom).slice(0, 3);
      for (const layout of retry) {
        const reserve = new Set(labelsOnNodes(layout));
        const again = await allIn(elk, {...scene, direction}, {measure, canvas, candidates: [{...layout.candidate, reserveLabels: reserve}]});
        tried.push(...again);
      }
      for (const free of tried) if (better(free, best)) best = free;
    }
  }
  // R8: un despliegue grande y anidado que ELK no deja legible usa su layout propio (empaque por flujo
  // y ruteo ortogonal); los que ELK ya resuelve no cambian.
  if (best && scene.diagramType === 'deployment' && (best.zoom < legibleZoom || best.issues.total)) {
    for (const wrapWidth of [130, 150, 170]) {
      const own = deploymentLayout(scene, {measure, wrapWidth, canvas, issues: layoutIssues});
      Object.assign(own, {zoom: fitZoom(own, canvas), direction: scene.direction, candidate: {wrapWidth, deployment: true}});
      if (better(own, best)) best = own;
    }
  }
  return best && placeEndLabels(clipEnds(best), {measure});
}

export const usesSwimlanes = scene => Boolean(scene.lanes?.length) && scene.nodes.every(n => !n.parent && !n.container);

// El ancho de corte de los rótulos que mejor cabe, como con ELK: menos problemas gana; a igualdad, más zoom.
export function bestSwimlanes(scene, {measure = approximateMeasure, canvas}) {
  let best = null;
  for (const wrapWidth of [130, 170, 240]) {
    const layout = swimlaneLayout(scene, {measure, wrapWidth});
    layout.zoom = fitZoom(layout, canvas);
    layout.issues = layoutIssues(layout);
    layout.candidate = {wrapWidth, swimlanes: true};
    layout.direction = 'TB';
    if (!best || layout.issues.total < best.issues.total || (layout.issues.total === best.issues.total && layout.zoom > best.zoom + 1e-6)) best = layout;
  }
  return best;
}

// Un extremo que llega a (o sale de) una forma que no es una caja toca su contorno real, no su caja.
// Va después de elegir el layout: los candidatos se juzgan con los extremos que ELK dejó en la caja.
export function clipEnds(layout) {
  const abs = absoluteBoxes(layout), shapeOf = new Map(layout.nodes.map(n => [n.id, n.glyph?.shape]));
  for (const e of layout.edges) {
    e.points = clipToContour(e.points, abs.get(e.target), shapeOf.get(e.target));
    e.points = clipToContour(e.points, abs.get(e.source), shapeOf.get(e.source), true);
  }
  return layout;
}

// Todos los candidatos con ELK, cada uno con su zoom y sus problemas.
async function allIn(elk, scene, {measure, canvas, candidates}) {
  const out = [];
  for (const candidate of usable(scene, candidates)) {
    const built = elkGraph(scene, {measure, ...candidate});
    let result;
    try { result = await elk.layout(built.graph); } catch { continue; }
    const layout = fromElk(result, scene, built);
    Object.assign(layout, {zoom: fitZoom(layout, canvas), candidate, direction: scene.direction});
    layout.issues = layoutIssues(layout);
    out.push(layout);
  }
  return out;
}

// El orden del spec es el del flujo en una activity o un statechart; en un despliegue, la lista de nodos
// no dice hacia dónde van las flechas (los clientes y artefactos que la cierran apuntan a la
// infraestructura de arriba) y seguirlo invierte esas aristas: ahí no se usa. Tampoco el plegado en
// filas (wrapping): parte el despliegue y deja a los clientes del otro lado, con las aristas de vuelta.
const usable = (scene, candidates) => (scene.diagramType === 'deployment'
  ? candidates.filter(c => !c.ordered && !c.options?.['elk.layered.wrapping.strategy']) : candidates);

async function bestIn(elk, scene, {measure, canvas, candidates}) {
  let best = null, bestOrdered = null;
  for (const candidate of usable(scene, candidates)) {
    const built = elkGraph(scene, {measure, ...candidate});
    let result;
    try { result = await elk.layout(built.graph); } catch { continue; }
    const layout = fromElk(result, scene, built);
    layout.zoom = fitZoom(layout, canvas);
    layout.candidate = candidate;
    layout.direction = scene.direction;
    layout.issues = layoutIssues(layout);
    // Menos problemas gana; a igualdad, el que mejor cabe.
    const better = (a, b) => !b || a.issues.total < b.issues.total || (a.issues.total === b.issues.total && a.zoom > b.zoom + 1e-6);
    if (better(layout, best)) best = layout;
    if (candidate.ordered && better(layout, bestOrdered)) bestOrdered = layout;
  }
  return bestOrdered && bestOrdered.zoom >= legibleZoom && bestOrdered.issues.total <= best.issues.total ? bestOrdered : best;
}

// Recorrido ortogonal como path SVG.
export const pathOf = points => points.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');

FILE:frontends/mindmap/views/specs/notation/notation-style.mjs
// Estilo resuelto por spec2viz (contrato §13), en lógica pura: qué color toca en cada tema, de dónde
// sale el color del texto sobre un relleno y el contorno de las formas que no son una caja. graph_ui
// no recalcula precedencias: node.style y link.color ya vienen resueltos.

// Formas dibujadas como contorno SVG detrás del contenido (viewBox 0 0 100 100, estiradas a la caja).
export const OUTLINE_SHAPES = ['cylinder', 'queue', 'cloud', 'package', 'note'];
export const OUTLINES = {
  cylinder: 'M0,10 A50,10 0 0 1 100,10 L100,90 A50,10 0 0 1 0,90 Z M0,10 A50,10 0 0 0 100,10',
  queue: 'M10,0 L90,0 A10,50 0 0 1 90,100 L10,100 A10,50 0 0 1 10,0 Z M90,0 A10,50 0 0 0 90,100',
  cloud: 'M25,90 C8,90 2,72 14,62 C4,48 18,30 34,36 C38,16 64,12 72,30 C88,26 100,42 92,56 C102,68 94,90 78,90 Z',
  package: 'M0,14 L0,100 L100,100 L100,14 Z M0,14 L0,0 L38,0 L42,14',
  note: 'M0,0 L86,0 L100,14 L100,100 L0,100 Z M86,0 L86,14 L100,14',
};
// Área interior de cada contorno, en fracciones de la caja (top, right, bottom, left): lo que queda
// libre entre las tapas del cilindro y de la cola, los lóbulos de la nube, la pestaña del paquete y
// la esquina doblada de la nota. El texto (keyword, ícono y rótulo) va ahí dentro; como el contorno
// se estira con la caja, el área interior escala igual.
export const SHAPE_INNER = {
  cylinder: [0.22, 0.03, 0.12, 0.03],
  queue: [0.04, 0.22, 0.04, 0.11],
  cloud: [0.36, 0.14, 0.13, 0.18],
  package: [0.17, 0.03, 0.04, 0.03],
  note: [0.17, 0.03, 0.04, 0.03],
};

// Caja que necesita una forma para que su área interior mida (width, height).
export function shapeBox(shape, width, height) {
  const inner = SHAPE_INNER[shape];
  if (!inner) return [width, height];
  const [t, r, b, l] = inner;
  return [width / (1 - l - r), height / (1 - t - b)];
}

// Variables CSS del área interior (porcentajes de la caja) para colocar la cabecera dentro.
export function innerVars(shape) {
  const inner = SHAPE_INNER[shape];
  if (!inner) return {};
  const pct = f => `${+(f * 100).toFixed(2)}%`;
  const [t, r, b, l] = inner;
  return {'--inner-top': pct(t), '--inner-right': pct(r), '--inner-bottom': pct(b), '--inner-left': pct(l)};
}

// Un valor resuelto por tema ({light, dark}) en el tema activo; un string vale para los dos.
export function themed(value, skin = 'light') {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value[skin] || value.light || null;
}

// Los dos inks (texto sobre un relleno, {light, dark}) de la paleta de la vista; la paleta es un
// PaletteDoc del store (lo nombra view.palette).
export function paletteInk(documents, paletteRef) {
  if (!paletteRef) return null;
  const name = String(paletteRef).split(':').pop();
  const doc = (documents || []).find(d => d && d.model_name === 'PaletteDoc' && (d.id === name || d.payload?.name === name));
  const ink = doc?.payload?.ink;
  return ink ? (typeof ink === 'string' ? {light: ink, dark: ink} : ink) : null;
}

// Luminancia relativa (WCAG) de un color #rgb/#rrggbb; null si no es hex.
export function luminance(colour) {
  let hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(colour || '').trim())?.[1];
  if (!hex) return null;
  if (hex.length === 3) hex = [...hex].map(c => c + c).join('');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

// El texto sobre un relleno: el ink de la paleta que más contrasta con ESE relleno, no el del tema.
// Un color literal (#fff1c2) vale igual en los dos temas, y en oscuro su texto debe seguir oscuro.
export function readableInk(fill, inks) {
  const lf = luminance(fill);
  if (lf == null) return null;
  const light = inks?.light || '#1f2328', dark = inks?.dark || '#e6edf3';
  const ll = luminance(light), ld = luminance(dark);
  if (ll == null || ld == null) return lf > 0.4 ? light : dark;
  return contrast(lf, ll) >= contrast(lf, ld) ? light : dark;
}

// Variables CSS de un glifo: relleno, trazo y texto. Sin estilo declarado no hay variables y el glifo
// se ve como siempre (los colores del tema). `inks` son los dos inks de la paleta ({light, dark}).
export function glyphVars(style, skin = 'light', inks = null) {
  const vars = {};
  const fill = themed(style?.fill, skin), stroke = themed(style?.stroke, skin);
  if (fill) vars['--glyph-fill'] = fill;
  if (stroke) vars['--glyph-stroke'] = stroke;
  const ink = fill && readableInk(fill, inks);
  if (ink) vars['--glyph-ink'] = ink;
  return vars;
}

// Nombre de ícono de lucide (kebab-case, como lo declara la paleta) -> clave del objeto `icons`.
export const iconKey = name => String(name || '').split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');

// ---- Contorno real, para que las aristas lleguen a la forma y no a su caja ----
// El borde exterior de cada forma como polígono en las mismas unidades que su path (0..100, estirado a
// la caja): las tapas del cilindro y de la cola, los lóbulos de la nube, la pestaña del paquete, la
// esquina doblada de la nota y el rombo.
const arc = (cx, cy, rx, ry, from, to, steps = 24) => Array.from({length: steps + 1}, (_, i) => {
  const t = from + (to - from) * i / steps;
  return [cx + rx * Math.cos(t), cy + ry * Math.sin(t)];
});
const bezier = ([x0, y0], [x1, y1], [x2, y2], [x3, y3], steps = 16) => Array.from({length: steps}, (_, i) => {
  const t = (i + 1) / steps, u = 1 - t;
  return [u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3];
});
const CLOUD = [[25, 90], [8, 90], [2, 72], [14, 62], [4, 48], [18, 30], [34, 36], [38, 16], [64, 12], [72, 30],
  [88, 26], [100, 42], [92, 56], [102, 68], [94, 90], [78, 90]];
export const CONTOURS = {
  cylinder: [...arc(50, 10, 50, 10, Math.PI, 2 * Math.PI), ...arc(50, 90, 50, 10, 0, Math.PI)],
  queue: [...arc(90, 50, 10, 50, -Math.PI / 2, Math.PI / 2), ...arc(10, 50, 10, 50, Math.PI / 2, 1.5 * Math.PI)],
  cloud: [CLOUD[0], ...[1, 4, 7, 10, 13].flatMap(i => bezier(CLOUD[i - 1], CLOUD[i], CLOUD[i + 1], CLOUD[i + 2]))],
  package: [[0, 0], [38, 0], [42, 14], [100, 14], [100, 100], [0, 100]],
  note: [[0, 0], [86, 0], [100, 14], [100, 100], [0, 100]],
  diamond: [[50, 0], [100, 50], [50, 100], [0, 50]],
};

// Primer punto del contorno (en la caja `box`) que toca el rayo que sale de `from` en la dirección
// (dx, dy); null si no lo toca.
function rayHit(polygon, box, from, dx, dy) {
  const pts = polygon.map(([x, y]) => ({x: box.x + x / 100 * box.width, y: box.y + y / 100 * box.height}));
  let best = null;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const ex = b.x - a.x, ey = b.y - a.y, den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-9) continue;
    const t = ((a.x - from.x) * ey - (a.y - from.y) * ex) / den;
    const u = ((a.x - from.x) * dy - (a.y - from.y) * dx) / den;
    if (t >= -1e-6 && u >= -1e-6 && u <= 1 + 1e-6 && (!best || t < best.t)) best = {t, x: from.x + t * dx, y: from.y + t * dy};
  }
  return best;
}

// Recorta (alarga) el extremo de un recorrido para que toque el contorno real de la forma: sigue la
// dirección del último tramo, así un recorrido ortogonal sigue siéndolo. Los recorridos que salen de
// una forma se tratan igual, desde su primer tramo.
export function clipToContour(points, box, shape, atStart = false) {
  const polygon = CONTOURS[shape];
  if (!polygon || !box || !points || points.length < 2) return points;
  const pts = atStart ? [...points].reverse() : [...points];
  const end = pts[pts.length - 1], prev = pts[pts.length - 2];
  const len = Math.hypot(end.x - prev.x, end.y - prev.y);
  if (!len) return points;
  const hit = rayHit(polygon, box, prev, (end.x - prev.x) / len, (end.y - prev.y) / len);
  if (!hit) return points;
  pts[pts.length - 1] = {x: hit.x, y: hit.y};
  return atStart ? pts.reverse() : pts;
}

FILE:frontends/mindmap/views/specs/notation/notation.css
/* ---- Vista Specs: un spec de spec2viz dibujado según su notación ---- */
/* R13: acotada al alto de la ventana (min-height:0 en la columna de la vista); la leyenda hace scroll en el catálogo, no estira el lienzo. */
.notation{flex:1;min-width:0;min-height:0;display:flex;background:var(--surface-app)}

.notation-catalog{width:230px;flex:none;overflow:auto;background:var(--surface-panel);border-right:1px solid var(--border);padding:10px 0;font-size:12px}
.notation-catalog h3{margin:10px 14px 4px;font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:var(--text-muted)}
.notation-catalog ul{list-style:none;margin:0;padding:0}
.notation-catalog button{display:flex;flex-direction:column;align-items:flex-start;gap:1px;width:100%;padding:6px 14px;border:0;border-left:3px solid transparent;background:none;color:var(--text);text-align:left;cursor:pointer}
.notation-catalog button:hover{background:var(--surface-muted)}
.notation-catalog button.active{border-left-color:var(--accent);background:var(--primary-soft)}
.notation-catalog small{font-size:10px;color:var(--text-muted)}

.notation-main{flex:1;min-width:0;display:flex;flex-direction:column}
.notation-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 18px;background:var(--surface-panel);border-bottom:1px solid var(--border);font-size:12px}
.notation-bar strong{font-size:13px}
.notation-bar button{margin-left:auto}
.notation-meta{color:var(--text-muted)}
.notation-notices{padding:6px 18px;background:var(--warning-soft);border-bottom:1px solid var(--warning-border);color:var(--text);font-size:11.5px}
.notation-notices p{margin:2px 0}
.notation-canvas{position:relative;flex:1;min-height:0}
.notation-defs{position:absolute;width:0;height:0;overflow:hidden}
/* La punta toma el color de su línea (link.color o el del tema). */
.notation-terminal path,.notation-terminal circle{stroke:context-stroke;stroke-width:1.3}
.notation-terminal .solid{fill:context-stroke}
.notation-terminal .hollow{fill:var(--surface-app)}

/* Glifos: la clase sale de `shape` del GlyphDoc, nunca del `kind` del elemento. */
.glyph{position:relative;box-sizing:border-box;width:100%;height:100%;display:flex;flex-direction:column;border:1.5px solid var(--glyph-stroke,var(--ink));background:var(--glyph-fill,var(--surface-panel));color:var(--glyph-ink,var(--text));font-size:12.5px;box-shadow:var(--shadow-card)}
.glyph.selected{box-shadow:0 0 0 3px var(--focus-ring)}
.glyph-head,.glyph-compartment{flex:none}
.glyph-head{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:6px 10px;min-height:28px;text-align:center}
.glyph-keyword{font-size:12.5px;line-height:1.3;color:var(--text-muted)}
.glyph-label{font-weight:600;line-height:1.3}
.glyph-line{display:block;white-space:nowrap}
.glyph-label.is-italic{font-style:italic}
.glyph-label.is-bold{font-weight:700}
.glyph-compartment{list-style:none;margin:0;padding:4px 10px;border-top:1px solid var(--ink);font-size:12.5px;line-height:17px;white-space:nowrap}
.glyph-compartment li{display:block;height:17px;overflow:hidden;text-overflow:ellipsis}

.glyph.shape-class-box{border-radius:2px}
.glyph.shape-class-box .glyph-head{border-radius:0}
.glyph.shape-rounded-box,.glyph.shape-boundary-box{border-radius:14px;justify-content:center}
.glyph.shape-box,.glyph.shape-lifeline{border-radius:3px;justify-content:center}
.glyph.shape-boundary-lifeline{border-radius:3px;border-style:dashed;justify-content:center}
.glyph.shape-rounded-container,.glyph.is-container{border-radius:16px;background:var(--surface-panel-veil);box-shadow:none}
/* G2: la cabecera de un contenedor va arriba, en la franja que ELK le reservó; los hijos empiezan debajo. */
.glyph.is-container{justify-content:flex-start}
.glyph.is-container > .glyph-head{border-bottom:0;padding:6px 4px;box-sizing:border-box}
.glyph.is-container .glyph-head{align-items:flex-start;border-bottom:1px solid var(--border);padding:6px 14px}
.glyph.shape-stick-figure{border:0;background:none;box-shadow:none;justify-content:flex-end}
.glyph.shape-stick-figure::before{content:'🧍';font-size:36px;line-height:1;text-align:center}

.glyph.shape-filled-circle,.glyph.shape-bullseye{border-radius:50%;background:var(--ink);box-shadow:none;align-items:center;justify-content:center}
.glyph.shape-bullseye{background:var(--surface-panel);border:2px solid var(--ink);box-shadow:inset 0 0 0 4px var(--surface-panel),inset 0 0 0 12px var(--ink)}
/* Decisión (G6): el rombo contiene su rótulo; su tamaño sale del texto (notation-layout.mjs). */
.glyph.shape-diamond{border:0;background:none;box-shadow:none;align-items:center;justify-content:center}
.glyph.shape-diamond::before,.glyph.shape-diamond::after{content:'';position:absolute;clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%)}
.glyph.shape-diamond::before{inset:0;background:var(--ink)}
.glyph.shape-diamond::after{inset:1.5px;background:var(--surface-panel)}
.glyph-diamond-label{position:relative;z-index:1;font-weight:600;line-height:1.3;text-align:center}
/* Rótulo de un pseudoestado: donde ELK le reservó sitio, fuera del círculo. */
.glyph-point-label{position:absolute;font-size:12.5px;line-height:1.3;color:var(--text-secondary);text-align:center;pointer-events:none}

/* Marcas (contrato §6): símbolo junto al glifo, con una línea corta hacia él. */
.glyph-marker{position:absolute;top:-26px;left:-26px;width:14px;height:14px;border-radius:50%;background:var(--ink)}
.glyph-marker::after{content:'';position:absolute;top:12px;left:11px;width:14px;height:1.5px;background:var(--ink);transform:rotate(45deg);transform-origin:left}
.glyph-marker.marker-bullseye{background:var(--surface-panel);border:2px solid var(--ink);box-shadow:inset 0 0 0 2px var(--surface-panel),inset 0 0 0 6px var(--ink)}

/* Carriles (layout lanes) y grilla (layout grid): fuera de React Flow, con scroll. */
.notation-scroll{position:absolute;inset:0;overflow:auto;padding:12px}
.notation-scroll.is-fit{padding:0;overflow-x:hidden;overflow-y:auto}
/* R11: los participantes de una secuencia quedan fijos arriba mientras los mensajes se recorren. */
.lane-heads-band{position:sticky;top:0;z-index:2;background:var(--surface-app);overflow:hidden}
.notation-lanes{position:relative}
.notation-lanes-fit{position:relative;margin:0 auto}
.notation-bar .notation-actual-size{margin-left:6px}
.lane-head{position:absolute;display:flex;align-items:flex-end;justify-content:center}
.lanes-svg{position:absolute;inset:0;overflow:visible}
.lifeline{stroke:var(--border-control);stroke-width:1.2;stroke-dasharray:5 4}
.message-line{fill:none;stroke:var(--edge);stroke-width:1.4}
.message-label{font-size:12.5px;fill:var(--text-secondary)}
/* Un halo del color del fondo: las líneas de vida que cruzan por detrás no tachan el texto. */
.message-label,.lane-frame .frame-label,.lane-frame .frame-guard{paint-order:stroke;stroke:var(--surface-app);stroke-width:4px;stroke-linejoin:round}
.lane-message:hover .message-line{stroke-width:2.2}
.lane-message:hover .message-label{fill:var(--ink)}

.notation-grids{display:flex;flex-direction:column;gap:22px;align-items:flex-start}
.notation-grid{border-collapse:collapse;background:var(--surface-panel);font-size:12px;box-shadow:var(--shadow-card)}
.notation-grid caption{text-align:left;font-weight:600;font-size:13px;padding:0 0 6px}
.notation-grid th,.notation-grid td{border:1px solid var(--border);padding:6px 10px}
.notation-grid thead th{background:var(--surface-muted);font-weight:600;white-space:nowrap}
.notation-grid tbody th{text-align:left;font-weight:500;white-space:nowrap}
.notation-grid tbody th[data-depth="0"]{font-weight:600}
.notation-grid td{min-width:64px;text-align:center}
.notation-grid td.is-filled{background:var(--primary-soft)}
.cell-mark{display:inline-block;color:var(--accent);font-size:14px;line-height:1}
.notation-end-label{position:absolute;top:0;left:0;box-sizing:border-box;text-align:center;padding:0 3px;border-radius:3px;background:var(--surface-app);color:var(--text-secondary);font-size:12.5px;line-height:15px;pointer-events:none;white-space:nowrap}
/* Rótulo de arista en la caja que ELK le reservó (G5): no se encima con otros rótulos ni nodos. */
.notation-edge-label{position:absolute;top:0;left:0;box-sizing:border-box;padding:0 4px;border-radius:3px;background:var(--surface-app);color:var(--text-secondary);font-size:12.5px;line-height:1.3;text-align:center;pointer-events:auto;cursor:default}
.notation-edge-label.is-hovered{color:var(--accent);font-weight:600;box-shadow:0 0 0 1.5px var(--accent)}
.lane-frame .frame-box{fill:none;stroke:var(--text-muted);stroke-width:1.2}
.lane-frame .frame-tab{fill:var(--surface-panel);stroke:var(--text-muted);stroke-width:1.2}
.lane-frame .frame-label{font-size:12.5px;font-weight:600;fill:var(--text)}
.lane-frame .frame-guard{font-size:12.5px;fill:var(--text-secondary)}
.notation-bar .notation-minimap-toggle{margin-left:6px}
/* Los rótulos de arista se dibujan sobre los nodos (no los tapa el velo de un contenedor); ya evitan los nodos hoja. */
.notation-canvas .react-flow__edgelabel-renderer{z-index:5}

/* Estilo de notación (spec2viz §13): ícono antes del rótulo y formas dibujadas como contorno. */
.glyph-title-row{display:inline-flex;align-items:center;justify-content:center;gap:5px}
.glyph-icon{flex:none;color:var(--glyph-stroke,currentColor)}
/* Sobre un relleno declarado, el texto secundario usa el ink del relleno (legible en ambos temas). */
.glyph[style*="--glyph-ink"] .glyph-keyword{color:var(--glyph-ink);opacity:.75}
.glyph-icon.is-pending{display:inline-block;width:15px;height:15px}
.glyph.shape-cylinder,.glyph.shape-queue,.glyph.shape-cloud,.glyph.shape-package,.glyph.shape-note{border:0;background:none;box-shadow:none;justify-content:center}
.glyph-outline{position:absolute;inset:0;width:100%;height:100%;overflow:visible;z-index:0;pointer-events:none}
.glyph-outline path{fill:var(--glyph-fill,var(--surface-panel));stroke:var(--glyph-stroke,var(--ink));stroke-width:1.5}
/* El texto de una forma de contorno va en su área interior (SHAPE_INNER en notation-style.mjs). */
.glyph-outline ~ .glyph-head{position:absolute;top:var(--inner-top);right:var(--inner-right);bottom:var(--inner-bottom);left:var(--inner-left);min-height:0;padding:0 4px;box-sizing:border-box}

/* Leyenda de la notación, al pie del catálogo: nunca tapa el diagrama. */
.notation-legend{margin:14px 10px 6px;padding-top:8px;border-top:1px solid var(--border)}
.notation-legend h3{margin:0 4px 6px}
.notation-legend ul{list-style:none;margin:0;padding:0}
.notation-legend li{display:flex;align-items:center;gap:6px;padding:3px 4px;font-size:11.5px}
.notation-legend .legend-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.notation-legend small{color:var(--text-muted);font-size:10px}
.legend-swatch{position:relative;flex:none;width:28px;height:18px;box-shadow:none;overflow:hidden}
/* R12: una muestra cabe en su renglón; la figura de actor se escala al alto de la muestra. */
.legend-swatch.shape-stick-figure{justify-content:center;align-items:center}
.legend-swatch.shape-stick-figure::before{font-size:14px;line-height:18px}
.legend-swatch.glyph{min-height:0}
.legend-line{flex:none}
.legend-line line{stroke-width:2}
.notation-canvas .react-flow__handle{opacity:0;pointer-events:none}

/* Activity (spec2viz §14): nota UML con la esquina doblada, unida a su paso por una línea punteada. */
.glyph[data-function="note"]:not(.is-styled) .glyph-outline path{fill:var(--warning-soft);stroke:var(--warning-border)}
.glyph[data-function="note"] .glyph-label{font-weight:400}
/* Carril UML (§14, data.partition): una columna por partición, recta, con su nombre arriba. */
.glyph.shape-partition{border-radius:0;border-width:1px;border-color:var(--border-control-hover);background:var(--surface-panel-veil)}
.glyph.shape-partition > .glyph-head{align-items:center;justify-content:center;border-bottom:1px solid var(--border-control-hover);background:var(--surface-muted)}

FILE:tests/e2e_notation_class.py
"""E2E: class specs in the Specs view, in Chromium.

- R9: tests/fixtures/notation-class/class-records.yml has associations with multiplicities at both ends,
  several converging on one class. Every multiplicity sits next to its own edge's end (within 24 px of
  it), outside every class box, and clear of edge labels and other multiplicities.
- R10: tests/fixtures/notation-class/class-large.yml has 26 records, only 8 of them related (15
  associations). With «Ver todo» it reads at >= 10 px: the 18 unrelated ones go in a grid (more than one
  row and one column) beside or below the related ones, and every class is inside the canvas.
- Framing: opening a spec straight away (as a reload with it chosen does), the automatic framing and
  «Ver todo» keep every class box, with all its compartments, inside the canvas with >= 8 px of margin.
"""
import shutil
import subprocess
from pathlib import Path

import pytest

from e2e_notation_legibility import FRAMED, _measure, _round_two, _serve, assert_nodes_framed, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "tests" / "fixtures" / "notation-class"
RECORDS, LARGE = "class.records-multiplicities", "class.large-schema"
UNRELATED = 18

ENDS = r"""() => {
  const r = (e) => e.getBoundingClientRect();
  const overlap = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
  const boxes = [...document.querySelectorAll('.notation-canvas .glyph:not(.is-container)')].map(r);
  const labels = [...document.querySelectorAll('.notation-canvas .notation-edge-label')].map(r);
  const ends = [...document.querySelectorAll('.notation-canvas .notation-end-label')];
  const toRect = (p, b) => Math.hypot(Math.max(b.left - p.x, 0, p.x - b.right), Math.max(b.top - p.y, 0, p.y - b.bottom));
  return ends.map((l, i) => {
    const b = r(l), path = l.dataset.edge ? document.getElementById(l.dataset.edge) : null;
    let distance = Infinity;  // sin su arista no se puede ubicar: cuenta como lejos
    if (path) {
      const ctm = path.getScreenCTM(), total = path.getTotalLength();
      const at = (s) => { const p = path.getPointAtLength(s); return {x: p.x * ctm.a + ctm.e, y: p.y * ctm.d + ctm.f}; };
      distance = +toRect(l.dataset.end === 'source' ? at(0) : at(total), b).toFixed(1);
    }
    return {text: l.textContent, end: l.dataset.end, distance,
            onBox: boxes.some((x) => overlap(x, b)), onLabel: labels.some((x) => overlap(x, b)),
            onEnd: ends.some((o, j) => j !== i && overlap(r(o), b))};
  });
}"""


@pytest.fixture(scope="module")
def store(tmp_path_factory):
    if sync_playwright is None:
        pytest.skip("playwright no está instalado")
    if not shutil.which("spec2viz"):
        pytest.skip("sin el CLI de spec2viz")
    root = tmp_path_factory.mktemp("class")
    specs = sorted(FIXTURES.glob("*.yml"))
    for spec in specs:
        shutil.copy(spec, root / spec.name)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["spec2viz", "diagram", "sync", *[s.name for s in specs], "--store", ".sldb"], cwd=root, check=True, capture_output=True)
    return root / ".sldb"


def test_r9_multiplicities_sit_at_their_edge_end_outside_the_boxes(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            result = _measure(page, RECORDS)
            assert result["minTextPx"] >= 10 and result["labelOverlaps"] == 0 and result["spills"] == 0, result
            _round_two(result)
            ends = page.evaluate(ENDS)
            assert len(ends) == 18, ends
            bad = [e for e in ends if e["onBox"] or e["onLabel"] or e["onEnd"] or e["distance"] > 24]
            assert not bad, bad
            assert not errors, errors
            browser.close()
    finally:
        process.terminate()
        process.wait()


def test_r10_unrelated_classes_go_in_a_grid_and_the_whole_reads(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            result = _measure(page, LARGE)
            assert result["minTextPx"] >= 10, result
            assert result["labelOverlaps"] == 0 and result["spills"] == 0 and result["crossings"] == 0, result
            _round_two(result)
            grid = page.evaluate("""() => {
              const c = document.querySelector('.notation-canvas').getBoundingClientRect();
              const linked = new Set([...document.querySelectorAll('.notation-canvas .notation-edge-ends')].flatMap(g => [g.dataset.source, g.dataset.target]));
              const nodes = [...document.querySelectorAll('.notation-canvas .react-flow__node')].map(n => ({id: n.dataset.id, r: n.getBoundingClientRect()}));
              const loose = nodes.filter(n => !linked.has(n.id));
              return {loose: loose.length, rows: new Set(loose.map(n => Math.round(n.r.top))).size, cols: new Set(loose.map(n => Math.round(n.r.left + n.r.width / 2))).size,
                      outside: nodes.filter(n => n.r.left < c.left || n.r.right > c.right || n.r.top < c.top || n.r.bottom > c.bottom).length};
            }""")
            assert grid["loose"] == UNRELATED and grid["rows"] > 1 and grid["cols"] > 1 and grid["outside"] == 0, grid
            assert not errors, errors
            browser.close()
    finally:
        process.terminate()
        process.wait()


def test_opening_a_spec_frames_every_box_with_its_compartments(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            for spec in (RECORDS, LARGE):
                page.goto(f"{base}/specs/notation")
                page.wait_for_selector(".notation-catalog button", timeout=30000)
                page.evaluate("id => localStorage.setItem('kb-notation-spec', id)", spec)
                page.goto(f"{base}/specs/notation")
                page.wait_for_function("s => [...document.querySelectorAll('.notation-canvas .react-flow__node')].some(n => n.dataset.id.includes(s + '.'))",
                                       arg=spec, timeout=60000)
                page.wait_for_timeout(2500)
                assert page.evaluate(FRAMED) >= 8, spec
                assert_nodes_framed(page)
            browser.close()
    finally:
        process.terminate()
        process.wait()

FILE:instruccion
Cold-bundle de la tarea task-vista-specs-dibujar-paquetes-uml-de-diagramas-de-clase-como-contenedores-anidables: con el TaskDoc, los rituales enrutados por el Board, las pills ligadas, los átomos ligados y los archivos que el TaskDoc nombra, reformula el encargo, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

Sección de validación del TaskDoc:
- python -m pytest -q -rs tests/e2e_notation_class.py
- node --test tests/*.test.mjs

