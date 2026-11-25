FILE:desk/tasks/task-lector-del-workspace-render-markdown-legible-citas-énfasis-código-inline-enlaces-estándar-con-un-mot.md
---
sldb:
  by: agent
  at: '2026-11-16T12:43:52Z'
  authority: generated
  via: save_document_payload
id: task-lector-del-workspace-render-markdown-legible-citas-énfasis-código-inline-enlaces-estándar-con-un-mot
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
- host:robocop2
current_node: ritual-execution
history: []
references:
- runs/subagents/20261102-ws13-1-correccion/review-source.md
- docs/workspace-ui.md
depends_on: []
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
files:
- frontends/mindmap/views/workspace/node/reader.mjs
- frontends/mindmap/views/workspace/node/workspace-view.js
- frontends/mindmap/views/workspace/node/workspace.css
- frontends/mindmap/index.html
- tests/mindmap-workspace-reader.test.mjs
- tests/e2e_mindmap_workspace.py
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms:
- atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node
from_drawer: desk/drawer/tasks/task-render-markdown-legible-del-lector.md
---

# Lector del workspace: render Markdown legible (citas, énfasis, código inline, enlaces estándar) con un motor real

## Rationale

_Explain why this task exists or the business driver behind it._

La revisión root de WS13.1 (runs/subagents/20261102-ws13-1-correccion/review-source.md, línea 14) registró que el render del lector deja literales las citas, el énfasis, el código inline y los enlaces Markdown estándar; solo encabezados, listas y bloques de código se dibujan. Es deuda visible de lectura (JP llamó al lector "un vertedero de información": legibilidad antes que más vistas) y bloquea la aceptación humana de lectura.

## Goal

_Describe the concrete result this task must produce._

En la pestaña de lectura del workspace (/workspace, componente RenderedDocument de frontends/mindmap/views/workspace/node/workspace-view.js) un documento Markdown se ve con citas, énfasis, negrita, código inline y enlaces estándar renderizados, conservando lo que ya funciona: los enlaces SLDB [[…]] y [pred:: [[…]]] con su resolución y estados, el foco por sección con data-line-start, y la fuente cruda (RawSource) literal e íntegra.

## Scope

_State what is in scope and what is out of scope._

ENTRA: frontends/mindmap/views/workspace/node/reader.mjs (renderBlocks, splitInline) y workspace-view.js (RenderedDocument, InlineText); el import map de frontends/mindmap/index.html, donde se agrega el motor (obligatorio); workspace.css para cita y código inline; pruebas en tests/mindmap-workspace-reader.test.mjs (lógica pura) y un e2e en tests/e2e_mindmap_workspace.py que abre README.md y docs/workspace-ui.md reales del repo. Enlaces: el backend (workspace_routes.py, _document_links) solo clasifica enlaces SLDB [[…]] y [pred:: [[…]]] (sldb.links.parse_links) y entrega por cada uno {raw, target, kind, predicate, line, anchor, status: ok|externo|roto|no_markdown, cause, open, origin}; esos se siguen dibujando como hoy (InlineText, por raw). Los enlaces Markdown estándar [texto](destino) no los clasifica nadie: se dibujan con su texto como <span className='workspace-link-unresolved' data-testid='doc-link' data-status='no_clasificado' title={destino}>, nunca como <a> navegable, y no se abren. NO ENTRA: clasificar o abrir enlaces estándar (cambio del backend, otra tarea), HTML crudo del documento (se muestra como texto, nunca se inyecta), tablas y extensiones GFM, un parser propio de documentos SLDB, cambios en workspace_routes.py o sus guardias, migración a Kimun, y los cambios sin commitear de JP en frontends/desk/.

## Implementation Path

_Outline the expected implementation route or affected surface._

1) Motor: markdown-it 14.1.0 en el import map como "markdown-it": "https://esm.sh/markdown-it@14.1.0" (mismo mecanismo que react, htm y dagre), instanciado con {html: false, linkify: false}. 2) renderBlocks usa md.parse(text): cada token de bloque trae map = [inicio, fin) en base 0; el bloque guarda line_start = map[0] + 1 y line_end = map[1] (base 1, inclusivo, la misma convención que hoy tienen data-line-start y el foco por sección). El frontmatter inicial (--- … ---) se separa antes de parsear, como hoy. 3) El render recorre los tokens con htm, nunca con innerHTML ni dangerouslySetInnerHTML: blockquote -> <blockquote className='workspace-render-quote'>, em -> <em>, strong -> <strong>, code_inline -> <code className='workspace-render-code-inline'>, link estándar -> el span no_clasificado del alcance. 4) Los [[…]] siguen resueltos por splitInline sobre el contenido de los tokens de texto, así un enlace SLDB dentro de énfasis o de una cita conserva su estado. 5) CSS: .workspace-render-quote con borde izquierdo de 3px y sangría, .workspace-render-code-inline con fuente monoespaciada y fondo tenue, con las variables de color del skin existentes. 6) Pruebas node de renderBlocks (citas, énfasis, código inline, enlace estándar, [[…]] dentro de énfasis, line_start/line_end) y un e2e en Chromium: en README.md hay <blockquote>, <code> inline y <em> o <strong> donde el Markdown los tiene; un <script> escrito en un documento de prueba se muestra como texto y no se ejecuta; la fuente cruda es idéntica byte a byte. 7) Captura PNG de /workspace con README.md abierto en runs/subagents/<run_dir>/reader.png, con el run_dir que asigne el despacho.

## Validation

_List the checks required before this task can close._

- node --test tests/mindmap-workspace-reader.test.mjs tests/mindmap-workspace.test.mjs
- python -m pytest -q -rs tests/test_mindmap_workspace_reader.py tests/e2e_mindmap_workspace.py

## Done When

_Name the observable condition that makes the task complete._

`node --test tests/mindmap-workspace-reader.test.mjs` y `python -m pytest -q -rs tests/test_mindmap_workspace_reader.py tests/e2e_mindmap_workspace.py` pasan; en /workspace, README.md muestra cita, código inline y énfasis renderizados, los [[…]] conservan su estado, ningún HTML del documento se ejecuta, y la fuente cruda es igual a los bytes del archivo. Captura en runs/subagents/<run>/.

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

FILE:desk/atoms/atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node.md
---
id: atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node
title: Workspace presents document, graph, code, and changes as projections of the
  same node
five_wh_one_plus: what
tags:
- system:graph_ui
- topic:workspace
---

# Workspace presents document, graph, code, and changes as projections of the same node

## Answer

El Knowledge Workspace en Mindmap presenta documento, subgrafo local (1-2 hops), proyección de código e impacto de mutaciones (Changes/staleness) como vistas navegables del mismo objeto lógico del store, acompañadas de un panel lateral de contexto con su identidad, hash, relaciones y alertas de integridad.

FILE:frontends/mindmap/views/workspace/node/reader.mjs
/**
 * WS13.1: funciones puras del lector de documento (sin DOM).
 *
 * El texto, la revision y las secciones llegan de GET /api/workspace/source, de los mismos
 * bytes. Este modulo solo reparte ese texto en bloques para mostrarlo y decide que elementos
 * de cada representacion corresponden al foco, usando unicamente procedencia ya presente en
 * los datos (span de seccion, field_path, objeto de referencia, procedencia de arista).
 */

const INLINE_PREDICATE = /\[([a-zA-Z0-9_-]+)::\s*(!)?\[\[([^\]]+)\]\]\]/;
const STANDARD_LINK = /(!)?\[\[([^\]]+)\]\]/;
const LINK_SCAN = new RegExp(`${INLINE_PREDICATE.source}|${STANDARD_LINK.source}`, 'g');
const HEADING = /^(#{1,6})[ \t]+(.*?)[ \t]*#*[ \t]*$/;
const FENCE = /^[ \t]*(```|~~~)/;
const LIST_ITEM = /^[ \t]*(?:[-*+]|\d+[.)])[ \t]+/;

/** Parte una linea en segmentos de texto y de enlace; el enlace lleva su resolucion si existe. */
export function splitInline(line, linksByRaw = {}) {
  const out = [];
  let last = 0;
  const re = new RegExp(LINK_SCAN.source, 'g');
  let m;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) out.push({type: 'text', text: line.slice(last, m.index)});
    const raw = m[0];
    const label = (m[3] ?? m[5] ?? raw).trim();
    out.push({type: 'link', raw, label, link: linksByRaw[raw] || null});
    last = m.index + raw.length;
  }
  if (last < line.length) out.push({type: 'text', text: line.slice(last)});
  return out;
}

/** Texto -> bloques con line_start/line_end (1-based, mismas lineas que la fuente). */
export function renderBlocks(text) {
  const lines = String(text ?? '').split('\n').map(l => l.replace(/\r$/, ''));
  if (lines.length && lines[lines.length - 1] === '') lines.pop();
  const blocks = [];
  let i = 0;
  if (lines[0] === '---') {
    const close = lines.findIndex((l, idx) => idx > 0 && l.trim() === '---');
    if (close > 0) {
      blocks.push({kind: 'frontmatter', line_start: 1, line_end: close + 1, lines: lines.slice(1, close)});
      i = close + 1;
    }
  }
  let para = null;
  const flush = () => { if (para) { blocks.push(para); para = null; } };
  while (i < lines.length) {
    const line = lines[i];
    const n = i + 1;
    if (FENCE.test(line)) {
      flush();
      let j = i + 1;
      while (j < lines.length && !FENCE.test(lines[j])) j++;
      const end = Math.min(j, lines.length - 1);
      blocks.push({kind: 'code', line_start: n, line_end: end + 1, lines: lines.slice(i + 1, j)});
      i = end + 1;
      continue;
    }
    const h = HEADING.exec(line);
    if (h) {
      flush();
      blocks.push({kind: 'heading', level: h[1].length, text: h[2].trim(), line_start: n, line_end: n});
    } else if (LIST_ITEM.test(line)) {
      if (!para || para.kind !== 'list') { flush(); para = {kind: 'list', line_start: n, line_end: n, items: []}; }
      para.items.push({line: n, text: line.replace(LIST_ITEM, '')});
      para.line_end = n;
    } else if (line.trim() === '') {
      flush();
    } else {
      if (!para || para.kind !== 'paragraph') { flush(); para = {kind: 'paragraph', line_start: n, line_end: n, lines: []}; }
      para.lines.push(line);
      para.line_end = n;
    }
    i++;
  }
  flush();
  return blocks;
}

export const linksByRaw = links => Object.fromEntries((links || []).map(l => [l.raw, l]));

/** Seccion cuyo titulo o slug coincide con el ancla (sin distinguir mayusculas). */
export function sectionForAnchor(sections, anchor) {
  const a = String(anchor ?? '').trim().toLowerCase();
  if (!a) return null;
  return (sections || []).find(s => (s.title || '').trim().toLowerCase() === a || (s.slug || '').toLowerCase() === a) || null;
}

/** Seccion mas especifica (la de menor span) que contiene la linea. */
export function sectionAtLine(sections, line) {
  let best = null;
  for (const s of sections || []) {
    if (s.line_start == null || s.line_end == null) continue;
    if (line >= s.line_start && line <= s.line_end) {
      if (!best || (s.line_end - s.line_start) <= (best.line_end - best.line_start)) best = s;
    }
  }
  return best;
}

// ---------------------------------------------------------------- foco (navegacion §6.1)

export const sectionFocus = s => ({kind: 'section', path: s.path ?? s.name ?? '', title: s.title ?? '', line_start: s.line_start ?? null, line_end: s.line_end ?? null});
export const fieldFocus = fieldPath => ({kind: 'field', field_path: fieldPath});
export const referenceFocus = f => ({kind: 'reference', doc: f.doc ?? '', field: f.field, position: f.position, value: f.value});
export const edgeFocus = e => ({kind: 'edge', source: e.source, target: e.target, type: e.type, relationDoc: e.relationDoc ?? null});

export const edgeKey = e => [e.source, e.target, e.type, e.relationDoc ?? ''].join('|');
export const referenceKey = f => `${f.doc ?? ''}|${f.field}|${f.position}`;

/**
 * Procedencias de una arista que el documento abierto declara con un campo propio.
 * Cada procedencia lleva `owner`: el documento cuyo campo la declara (lo fija el servidor desde
 * el source del registro de arista). Sin propietario (relation_doc, structural) no hay campo
 * que resaltar. Una arista de otro documento nunca resalta campos del documento abierto.
 */
export function ownedProvenance(edge, docId) {
  if (!docId) return [];
  return (edge?.provenance || []).filter(p => p && p.owner === docId && (p.field || p.source_field));
}

/** Campos (field_path) del documento abierto que declaran la arista: solo los que le pertenecen. */
export function edgeFields(edge, docId) {
  const out = new Set();
  for (const p of ownedProvenance(edge, docId)) {
    if (p.field) out.add(p.field);
    if (p.source_field) out.add(p.source_field);
  }
  return Array.from(out);
}

/** Declaraciones de una arista, de cualquier dueño, para mostrarlas: {owner, field, declared}. */
export function edgeDeclarations(edge) {
  const out = [];
  for (const p of edge?.provenance || []) {
    if (!p || !p.field) continue;
    const d = {owner: p.owner ?? null, field: p.field, declared: p.declared ?? null};
    if (!out.some(x => x.owner === d.owner && x.field === d.field && x.declared === d.declared)) out.push(d);
  }
  return out;
}

export function sectionHighlighted(section, focus) {
  return !!focus && focus.kind === 'section' && !!section && (section.path ?? section.name) === focus.path;
}

/** Campo del documento abierto: por field_path; la referencia de Code fija foco en su campo. */
export function fieldHighlighted(fieldPath, focus, edges = [], docId = '') {
  if (!focus) return false;
  if (focus.kind === 'field') return focus.field_path === fieldPath;
  if (focus.kind === 'reference') return !!docId && focus.doc === docId && focus.field === fieldPath;
  if (focus.kind === 'edge') {
    const edge = edges.find(e => edgeKey(e) === edgeKey(focus));
    return edge ? edgeFields(edge, docId).includes(fieldPath) : false;
  }
  return false;
}

/**
 * Arista resaltada por el foco. Por campo o referencia solo cuentan las procedencias del
 * documento abierto; una referencia exige ademas que la procedencia declare ese mismo valor,
 * de modo que un campo propio que apunta a otro destino no cuenta.
 */
export function edgeHighlighted(edge, focus, docId = '') {
  if (!focus) return false;
  if (focus.kind === 'edge') return edgeKey(edge) === edgeKey(focus);
  if (focus.kind === 'field') return edgeFields(edge, docId).includes(focus.field_path);
  if (focus.kind === 'reference') {
    if (!docId || focus.doc !== docId) return false;
    return ownedProvenance(edge, docId).some(p => p.field === focus.field && p.declared === focus.value);
  }
  return false;
}

export function referenceHighlighted(file, focus, docId = '') {
  if (!focus) return false;
  if (focus.kind === 'reference') return referenceKey(file) === referenceKey(focus);
  if (focus.kind === 'field') return !!docId && file.doc === docId && file.field === focus.field_path;
  return false;
}

export function lineInFocus(line, focus, fields = []) {
  if (!focus) return false;
  if (focus.kind === 'section') return focus.line_start != null && line >= focus.line_start && line <= focus.line_end;
  if (focus.kind === 'field') {
    const f = fields.find(x => x.field_path === focus.field_path);
    return !!f?.span && line >= f.span.line_start && line <= f.span.line_end;
  }
  return false;
}

/** Cuantos elementos de cada representacion corresponden al foco (solo procedencia real). */
export function correspondence(focus, {sections = [], fields = [], edges = [], files = [], docId = ''} = {}) {
  if (!focus) return null;
  return {
    document: focus.kind === 'section'
      ? sections.filter(s => sectionHighlighted(s, focus)).length
      : fields.filter(f => fieldHighlighted(f.field_path, focus, edges, docId)).length,
    graph: edges.filter(e => edgeHighlighted(e, focus, docId)).length,
    code: files.filter(f => referenceHighlighted(f, focus, docId)).length,
  };
}

export function describeFocus(focus) {
  if (!focus) return '';
  if (focus.kind === 'section') return `sección ${focus.title || focus.path} (L${focus.line_start}-L${focus.line_end})`;
  if (focus.kind === 'field') return `campo ${focus.field_path}`;
  if (focus.kind === 'reference') return `referencia ${focus.field}[${focus.position}] ${focus.value}`;
  if (focus.kind === 'edge') return `arista ${focus.source} ─[${focus.type}]→ ${focus.target}`;
  return '';
}

// ---------------------------------------------------------------- rango local de Code

/** Clic fija el rango en una linea; mayusculas + clic lo extiende desde el ancla. */
export function nextRange(range, line, shift) {
  if (shift && range && range.anchor != null) return {anchor: range.anchor, start: Math.min(range.anchor, line), end: Math.max(range.anchor, line)};
  return {anchor: line, start: line, end: line};
}

export const inRange = (range, line) => !!range && line >= range.start && line <= range.end;
export const rangeLabel = range => range ? (range.start === range.end ? `L${range.start}` : `L${range.start}-L${range.end}`) : '';

// ---------------------------------------------------------------- URL

/** Seleccion de la URL: id o path, excluyentes; ambos o ninguno => null. */
export function targetFromSearch(search) {
  const p = new URLSearchParams(search || '');
  const id = p.get('id');
  const path = p.get('path');
  if (id && !path) return {id};
  if (path && !id) return {path};
  return null;
}

export const targetKey = t => t ? (t.id ? `id:${t.id}` : `path:${t.path}`) : '';

FILE:frontends/mindmap/views/workspace/node/workspace-view.js
import {useEffect, useState, useRef} from 'react';
import {html} from '../../../shared/html.js';
import {request} from '../../../shell/api.js';
import {irSectionsWithCleanMeta, irFields} from '../../../shared/document-ir.mjs';
import {
  TABS,
  filterCatalog,
  formatHash,
  parseCodeSnippet,
  formatProblems,
  filterGraphEdges,
  distinctEdgeTypes
} from './workspace.mjs';
import {
  renderBlocks,
  splitInline,
  linksByRaw,
  sectionForAnchor,
  sectionAtLine,
  sectionFocus,
  fieldFocus,
  referenceFocus,
  edgeFocus,
  edgeKey,
  edgeFields,
  edgeDeclarations,
  referenceKey,
  sectionHighlighted,
  fieldHighlighted,
  edgeHighlighted,
  referenceHighlighted,
  lineInFocus,
  correspondence,
  describeFocus,
  nextRange,
  inRange,
  rangeLabel,
  targetFromSearch,
  targetKey
} from './reader.mjs';
import {ExplorerPanel} from '../explorer/explorer-view.js';

// Aviso fijo de las relaciones: salen del indice preparado, no certifican cambios externos.
// No afirma frescura ni se calcula a partir de stale vacio.
function RelationsNotice({where}) {
  return html`
    <div className="workspace-degraded-banner workspace-relations-notice" role="note" data-testid="relations-notice" data-where=${where}>
      <strong>Relaciones del índice preparado.</strong>
      Salen del índice de relaciones preparado antes de esta lectura y no certifican cambios externos.
      Si sabes que un documento o un contrato cambió después de prepararlo, hay que preparar las relaciones de nuevo
      fuera de la UI, con la operación pública (rebuild_edges), antes de considerarlas vigentes.
    </div>
  `;
}

function CodeFileView({file, focus, docId, onFocus, range, onRange, onOpenPath}) {
  const [showFull, setShowFull] = useState(false);
  const lineNum = file.fragment_line || file.line;
  const snippet = parseCodeSnippet(file.content, lineNum, 5);
  const key = referenceKey(file);
  const highlighted = referenceHighlighted(file, focus, docId);
  const fullLines = showFull && file.status === 'ok' && typeof file.content === 'string' ? file.content.split('\n') : [];
  if (fullLines.length && fullLines[fullLines.length - 1] === '') fullLines.pop();
  return html`
    <div
      className=${'workspace-code-file-card' + (highlighted ? ' is-focused' : '')}
      data-testid="code-card"
      data-ref-key=${key}
      data-field=${file.field || ''}
      data-position=${file.position ?? ''}
      data-focused=${highlighted ? 'true' : 'false'}
    >
      <div className="workspace-code-file-header">
        <button
          type="button"
          className="workspace-code-ref-btn"
          data-testid="code-ref-focus"
          title="Fijar foco en el campo de esta referencia"
          onClick=${() => onFocus(referenceFocus(file))}
        >
          <span className="workspace-code-filename">${file.path || file.reference}${lineNum ? `:${lineNum}` : ''}</span>
        </button>
        ${file.field ? html`<span className="workspace-badge" data-testid="code-ref-field">${file.field}[${file.position}]</span>` : ''}
        ${lineNum ? html`<span className="workspace-badge">Línea ${lineNum}</span>` : ''}
        ${file.status === 'ok' && String(file.path || '').toLowerCase().endsWith('.md') ? html`
          <button type="button" className="workspace-link-btn" data-testid="code-open-doc" onClick=${() => onOpenPath(file.path)}>Abrir como documento</button>
        ` : ''}
        ${file.status === 'ok' ? html`
          <button type="button" className="workspace-link-btn" data-testid="code-toggle-full" aria-pressed=${showFull} onClick=${() => setShowFull(v => !v)}>
            ${showFull ? 'Ocultar archivo completo' : 'Ver archivo completo'}
          </button>
        ` : ''}
      </div>
      ${file.error || (file.message && file.status !== 'ok') ? html`<div className="workspace-alert" role="alert">${file.error || file.message}</div>` : ''}
      ${snippet.lines.length ? html`
        <table className="workspace-code-table">
          <tbody>
            ${snippet.lines.map(line => html`
              <tr key=${line.number} className=${'workspace-code-line' + (line.isTarget ? ' target-line' : '')}>
                <td className="workspace-code-line-num">${line.number}</td>
                <td className="workspace-code-line-text">${line.text}</td>
              </tr>
            `)}
          </tbody>
        </table>
      ` : html`<p className="workspace-empty">Archivo vacío o no disponible.</p>`}
      ${showFull ? html`
        <div className="workspace-code-full" data-testid="code-full">
          <div className="workspace-code-range-bar">
            <span>Rango local (sin persistir):</span>
            <strong data-testid="code-range-label">${range ? rangeLabel(range) : 'ninguno'}</strong>
            ${range ? html`<button type="button" className="workspace-link-btn" data-testid="code-range-clear" onClick=${() => onRange(key, null)}>Limpiar</button>` : ''}
          </div>
          <table className="workspace-code-table workspace-code-table-full">
            <tbody>
              ${fullLines.map((text, idx) => {
                const n = idx + 1;
                return html`
                  <tr
                    key=${n}
                    className=${'workspace-code-line selectable' + (inRange(range, n) ? ' in-range' : '')}
                    data-line=${n}
                    onClick=${e => onRange(key, nextRange(range, n, e.shiftKey))}
                  >
                    <td className="workspace-code-line-num">${n}</td>
                    <td className="workspace-code-line-text">${text}</td>
                  </tr>
                `;
              })}
            </tbody>
          </table>
        </div>
      ` : ''}
    </div>
  `;
}

function IrSectionView({section, focus, onFocus}) {
  const spanText = section.span ? `L${section.span.line_start ?? ''}-${section.span.line_end ?? ''}` : '';
  const focused = sectionHighlighted(section, focus);
  return html`
    <div className=${'workspace-ir-section' + (focused ? ' is-focused' : '')} data-section-path=${section.name || ''}>
      <h4 className="workspace-ir-title">
        <button
          type="button"
          className="workspace-ir-focus-btn"
          data-testid="section-focus"
          disabled=${!section.span}
          onClick=${() => section.span && onFocus(sectionFocus({path: section.name, title: section.title, line_start: section.span.line_start, line_end: section.span.line_end}))}
        >${section.title || section.name || 'Sección'}</button>
        ${spanText ? html`<small className="workspace-badge">${spanText}</small>` : ''}
      </h4>
      ${section.value ? html`<p>${typeof section.value === 'object' ? JSON.stringify(section.value) : String(section.value)}</p>` : ''}
      ${Array.isArray(section.children) && section.children.length ? html`
        <div>${section.children.map((c, i) => html`<${IrSectionView} key=${i} section=${{...c, span: c.span && (c.span.line_start != null || c.span.line_end != null) ? c.span : null}} focus=${focus} onFocus=${onFocus} />`)}</div>
      ` : ''}
    </div>
  `;
}

function InlineText({text, links, onOpenLink}) {
  const segs = splitInline(text, links);
  return html`${segs.map((seg, i) => {
    if (seg.type === 'text') return html`<span key=${i}>${seg.text}</span>`;
    const l = seg.link;
    if (!l) return html`<span key=${i} className="workspace-link-unresolved">${seg.raw}</span>`;
    if (l.status === 'ok' && l.open) {
      return html`<a
        key=${i}
        href="#"
        className="workspace-doc-link"
        data-testid="doc-link"
        data-status="ok"
        data-open=${l.open.id ? `id:${l.open.id}` : `path:${l.open.path}`}
        onClick=${e => { e.preventDefault(); onOpenLink(l); }}
      >${seg.label}</a>`;
    }
    if (l.status === 'externo') {
      return html`<span key=${i} className="workspace-link-external" data-testid="doc-link" data-status="externo" title=${l.cause}>${seg.label} ↗ (externo, no se abre)</span>`;
    }
    return html`<span key=${i} className="workspace-link-broken" data-testid="doc-link" data-status=${l.status} title=${l.cause}>${seg.label} (${l.status === 'no_markdown' ? 'no es Markdown' : 'roto'})</span>`;
  })}`;
}

function RenderedDocument({text, links, sections, focus, onFocus, onOpenLink}) {
  const blocks = renderBlocks(text);
  const byRaw = linksByRaw(links);
  const blockFocused = b => focus?.kind === 'section' && focus.line_start != null && b.line_start >= focus.line_start && b.line_end <= focus.line_end;
  return html`
    <div className="workspace-render" data-testid="doc-render">
      ${blocks.map((b, i) => {
        const cls = 'workspace-render-block' + (blockFocused(b) ? ' is-focused' : '');
        if (b.kind === 'frontmatter') {
          return html`<pre key=${i} className=${cls + ' workspace-render-frontmatter'} data-line-start=${b.line_start}><code>${b.lines.join('\n')}</code></pre>`;
        }
        if (b.kind === 'code') {
          return html`<pre key=${i} className=${cls + ' workspace-render-code'} data-line-start=${b.line_start}><code>${b.lines.join('\n')}</code></pre>`;
        }
        if (b.kind === 'heading') {
          const sec = (sections || []).find(s => s.line_start === b.line_start);
          const Tag = 'h' + Math.min(6, b.level + 1);
          return html`<${Tag} key=${i} className=${cls + ' workspace-render-heading'} data-line-start=${b.line_start} data-section-path=${sec?.path || ''}>
            ${sec ? html`<button type="button" className="workspace-ir-focus-btn" data-testid="render-heading" onClick=${() => onFocus(sectionFocus(sec))}>${b.text}</button>` : b.text}
          <//>`;
        }
        if (b.kind === 'list') {
          return html`<ul key=${i} className=${cls} data-line-start=${b.line_start}>${b.items.map(it => html`<li key=${it.line}><${InlineText} text=${it.text} links=${byRaw} onOpenLink=${onOpenLink} /></li>`)}</ul>`;
        }
        return html`<p key=${i} className=${cls} data-line-start=${b.line_start}>${b.lines.map((ln, j) => html`<span key=${j}><${InlineText} text=${ln} links=${byRaw} onOpenLink=${onOpenLink} />${j < b.lines.length - 1 ? ' ' : ''}</span>`)}</p>`;
      })}
    </div>
  `;
}

function RawSource({text, focus, fields}) {
  const lines = String(text ?? '').split('\n');
  if (lines.length && lines[lines.length - 1] === '') lines.pop();
  return html`
    <div className="workspace-source" data-testid="doc-source" role="region" aria-label="Fuente cruda">
      <table className="workspace-code-table">
        <tbody>
          ${lines.map((ln, idx) => html`
            <tr key=${idx} className=${'workspace-code-line workspace-src-line' + (lineInFocus(idx + 1, focus, fields) ? ' in-range is-focused' : '')} data-line=${idx + 1}>
              <td className="workspace-code-line-num">${idx + 1}</td>
              <td className="workspace-code-line-text">${ln}</td>
            </tr>
          `)}
        </tbody>
      </table>
    </div>
  `;
}

function describeSourceError(err) {
  if (!err) return '';
  const estado = err.body?.estado;
  return estado ? `${err.message} [${estado}]` : (err.message || 'Error al cargar el documento');
}

function WorkspaceView() {
  const [catalog, setCatalog] = useState([]);
  const [catalogError, setCatalogError] = useState('');
  // Estado de GET /nodes para el explorador: 'pending' | 'error' | 'ok'. Solo 'ok' confirma la carga de modelos.
  const [catalogStatus, setCatalogStatus] = useState('pending');
  const [target, setTarget] = useState(() => targetFromSearch(window.location.search));
  const [depth, setDepth] = useState(1);
  const [activeTab, setActiveTab] = useState('document');
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [edgeTypeFilter, setEdgeTypeFilter] = useState('');
  const [sourceRaw, setSource] = useState(null);
  const [sourceError, setSourceError] = useState('');
  const [nodeRaw, setNodeData] = useState(null);
  const [nodeError, setNodeError] = useState('');
  const [loading, setLoading] = useState(true);
  const [focus, setFocus] = useState(null);
  const [ranges, setRanges] = useState({});
  const [anchorNote, setAnchorNote] = useState('');
  const [reloadCount, setReloadCount] = useState(0);
  const [explorer, setExplorer] = useState(null);
  const [explorerError, setExplorerError] = useState('');
  const [explorerLoading, setExplorerLoading] = useState(false);

  const sourceGen = useRef(0);
  const nodeGen = useRef(0);
  const catalogGen = useRef(0);
  const explorerGen = useRef(0);
  // Contador local del lector: se incrementa al navegar a OTRO documento. Cada estado cargado
  // (fuente, nodo, codigo, relaciones) queda ligado a la identidad que lo pidio y a este
  // contador; la respuesta de una generacion anterior se descarta en todos los paneles.
  const navGen = useRef(0);
  const tKeyRef = useRef(targetKey(targetFromSearch(window.location.search)));
  const pendingAnchor = useRef(new URLSearchParams(window.location.search).get('anchor'));

  const tKey = targetKey(target);
  // Solo se usa el estado ligado a la identidad vigente y a la generacion vigente.
  const source = sourceRaw && sourceRaw._gen === navGen.current && sourceRaw._key === tKey ? sourceRaw : null;
  const selectedId = source?.identity?.id || target?.id || '';
  const modeledId = source?.identity?.kind === 'modeled' ? source.identity.id : '';
  const nodeData = nodeRaw && nodeRaw._gen === navGen.current && nodeRaw._id === modeledId ? nodeRaw : null;

  // La URL lleva id o path (excluyentes), depth, tab y, al seguir un enlace con ancla, anchor.
  const updateUrl = (nextTarget, newDepth, tab, {replace = false, anchor = null} = {}) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      url.searchParams.delete('path');
      url.searchParams.delete('anchor');
      if (nextTarget?.id) url.searchParams.set('id', nextTarget.id);
      else if (nextTarget?.path) url.searchParams.set('path', nextTarget.path);
      if (anchor) url.searchParams.set('anchor', anchor);
      url.searchParams.set('depth', String(newDepth || 1));
      url.searchParams.set('tab', tab || 'document');
      const newPath = url.pathname + url.search;
      if (replace) window.history.replaceState(null, '', newPath);
      else window.history.pushState(null, '', newPath);
    } catch {}
  };

  const navigateTo = next => {
    const key = targetKey(next);
    if (key === tKeyRef.current) return false;
    tKeyRef.current = key;
    navGen.current += 1;
    // Nada del documento anterior sobrevive: cada panel pasa a carga.
    setSource(null);
    setSourceError('');
    setNodeData(null);
    setNodeError('');
    setAnchorNote('');
    setFocus(null);
    setTarget(next);
    return true;
  };

  const syncFromUrl = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlDepth = parseInt(params.get('depth') || '1', 10);
      const urlTab = params.get('tab') || 'document';
      if (urlDepth === 1 || urlDepth === 2) setDepth(urlDepth);
      if (TABS.some(t => t.id === urlTab)) setActiveTab(urlTab);
      pendingAnchor.current = params.get('anchor');
      const next = targetFromSearch(window.location.search);
      if (next) navigateTo(next);
    } catch {}
  };

  const loadCatalog = async () => {
    const token = ++catalogGen.current;
    setCatalogError('');
    setCatalogStatus('pending');
    const params = new URLSearchParams(window.location.search);
    const urlDepth = parseInt(params.get('depth') || '1', 10);
    const urlTab = params.get('tab') || 'document';
    if (urlDepth === 1 || urlDepth === 2) setDepth(urlDepth);
    if (TABS.some(t => t.id === urlTab)) setActiveTab(urlTab);
    try {
      const res = await request('/api/workspace/nodes');
      if (token !== catalogGen.current) return;
      const nodes = res.nodes || [];
      setCatalog(nodes);
      setCatalogStatus('ok');
      if (!targetFromSearch(window.location.search)) {
        if (nodes.length > 0) navigateTo({id: nodes[0].id});
        else setLoading(false);
      }
    } catch (err) {
      if (token === catalogGen.current) {
        setCatalogError(err.message || 'Error al cargar catálogo de nodos');
        setCatalogStatus('error');
        if (!targetFromSearch(window.location.search)) setLoading(false);
      }
    }
  };

  // Explorador (WS13.2): solo GET /api/workspace/explorer, sin parametros de ruta del cliente.
  const loadExplorer = async () => {
    const token = ++explorerGen.current;
    setExplorerLoading(true);
    setExplorerError('');
    try {
      const res = await request('/api/workspace/explorer');
      if (token !== explorerGen.current) return;
      setExplorer(res);
    } catch (err) {
      if (token === explorerGen.current) {
        setExplorer(null);
        setExplorerError(err.message || 'Error al cargar el explorador');
      }
    } finally {
      if (token === explorerGen.current) setExplorerLoading(false);
    }
  };

  // Refresco explicito: recarga /nodes y /explorer. No relee el documento abierto ("Actualizar" ya lo hace).
  const refreshCatalogs = () => {
    loadCatalog();
    loadExplorer();
  };

  // Un solo lector: la fuente, el render y el contexto salen de una unica respuesta de /source.
  const loadSource = async currentTarget => {
    if (!currentTarget) {
      setSource(null);
      setLoading(false);
      return;
    }
    const token = ++sourceGen.current;
    const gen = navGen.current;
    const askedKey = targetKey(currentTarget);
    const stale = () => token !== sourceGen.current || gen !== navGen.current;
    setLoading(true);
    setSourceError('');
    try {
      const qs = currentTarget.id ? `id=${encodeURIComponent(currentTarget.id)}` : `path=${encodeURIComponent(currentTarget.path)}`;
      const res = await request(`/api/workspace/source?${qs}`);
      if (stale()) return;
      setSource({...res, _gen: gen, _key: askedKey});
      if (pendingAnchor.current) {
        const sec = sectionForAnchor(res.sections, pendingAnchor.current);
        if (sec) {
          setFocus(sectionFocus(sec));
          setAnchorNote('');
        } else {
          setAnchorNote(`Ancla no encontrada: ${pendingAnchor.current}`);
        }
        pendingAnchor.current = null;
      } else {
        setAnchorNote('');
      }
    } catch (err) {
      if (!stale()) {
        setSource(null);
        setSourceError(describeSourceError(err));
      }
    } finally {
      if (!stale()) setLoading(false);
    }
  };

  const loadNode = async (id, currentDepth) => {
    if (!id) {
      setNodeData(null);
      setNodeError('');
      return;
    }
    const token = ++nodeGen.current;
    const gen = navGen.current;
    const stale = () => token !== nodeGen.current || gen !== navGen.current;
    setNodeError('');
    try {
      const res = await request(`/api/workspace/node?id=${encodeURIComponent(id)}&depth=${currentDepth}`);
      if (stale()) return;
      const node = res.node || {};
      const projections = res.projections || {};
      const context = res.context || {};
      setNodeData({
        _gen: gen,
        _id: id,
        relations: context.relations_state || null,
        identity: {
          status: context.status || node.status || '',
          current_node: context.current_node || '',
          content_hash: context.content_hash || node.content_hash || '',
          content_hash_error: context.content_hash_error || null,
          file_revision: context.file_revision || node.file_revision || '',
        },
        document: {
          is_degraded: node.is_degraded || !projections.document?.ok,
          error: projections.document?.error,
          title: projections.document?.payload?.title || projections.document?.payload?.name || node.name || id,
          payload: projections.document?.payload || {},
        },
        graph: projections.graph || {ok: false, nodes: [], edges: [], error: 'Sin datos de grafo'},
        code: projections.code || {ok: false, files: []},
        problems: context.problems_report || {ok: true, problems: []}
      });
    } catch (err) {
      if (!stale()) {
        setNodeData(null);
        setNodeError(err.message || 'Error al cargar datos del nodo');
      }
    }
  };

  useEffect(() => {
    loadCatalog();
    loadExplorer();
    const onPopState = () => syncFromUrl();
    window.addEventListener('popstate', onPopState);
    return () => {
      ++catalogGen.current;
      ++explorerGen.current;
      ++sourceGen.current;
      ++nodeGen.current;
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  useEffect(() => {
    loadSource(target);
  }, [tKey, reloadCount]);

  useEffect(() => {
    if (modeledId) loadNode(modeledId, depth);
    else {
      ++nodeGen.current;
      setNodeData(null);
      setNodeError('');
    }
  }, [modeledId, depth, reloadCount]);

  const openTarget = (nextTarget, {anchor = null, replace = false} = {}) => {
    if (!nextTarget) return;
    pendingAnchor.current = anchor;
    const same = targetKey(nextTarget) === tKey;
    updateUrl(nextTarget, depth, activeTab, {replace, anchor});
    if (same) {
      // mismo documento: se relee (refresco), no se abre otra copia
      setReloadCount(c => c + 1);
      return;
    }
    navigateTo(nextTarget);
  };

  const handleOpenLink = link => {
    if (!link?.open) return;
    openTarget(link.open, {anchor: link.anchor || null});
  };

  const handleTabChange = tabId => {
    setActiveTab(tabId);
    updateUrl(target, depth, tabId, {});
  };

  const handleDepthChange = newDepth => {
    setDepth(newDepth);
    updateUrl(target, newDepth, activeTab, {});
  };

  const handleSelectNode = id => {
    if (!id || id === '__path__' || id === selectedId) return;
    openTarget({id});
  };

  const handleRange = (key, range) => setRanges(prev => ({...prev, [key]: range}));

  const availableModels = Array.from(new Set(catalog.map(n => n.model_name).filter(Boolean))).sort();
  const filteredNodes = filterCatalog(catalog, searchQuery, modelFilter);
  const problemsInfo = formatProblems(nodeData?.problems);

  const modeled = source?.identity?.kind === 'modeled';
  const unmodeled = source?.identity?.kind === 'unmodeled';
  const openDocId = modeled ? source.identity.id : '';
  // Carga real por panel: nada de valores ausentes ni datos del documento anterior.
  const sourceLoading = !!target && !source && !sourceError;
  const nodeLoading = sourceLoading || (modeled && !nodeData && !nodeError);
  const relationsState = source?.context?.relations_state || null;
  const notReady = relationsState && relationsState.ok === false ? relationsState : (nodeData?.relations?.ok === false ? nodeData.relations : null);
  // Un solo documento, dos lecturas (/source y /node): si la revision difiere, se avisa sin unificar.
  const revisionMismatch = !!(modeled && nodeData && source.revision && nodeData.identity.file_revision && nodeData.identity.file_revision !== source.revision);
  const graphEdges = nodeData?.graph?.edges || [];
  const edgeTypes = distinctEdgeTypes(graphEdges);
  const visibleGraphEdges = filterGraphEdges(graphEdges, edgeTypeFilter);
  const codeFiles = nodeData?.code?.files || [];
  const sections = source?.sections || [];
  const fields = source?.fields || [];
  const corr = correspondence(focus, {sections, fields, edges: graphEdges, files: codeFiles, docId: openDocId});
  const outgoing = source?.context?.outgoing_relations || [];
  const incoming = source?.context?.incoming_relations || [];
  const docTitle = source
    ? (source.descriptor?.payload?.title || nodeData?.document?.title || sections.find(s => s.level === 1)?.title || source.identity.path)
    : '';
  const headerTitle = source?.identity?.id || source?.identity?.path || selectedId || target?.path || 'Workspace';
  const selectValue = target?.id || '';

  return html`
    <div className="workspace-view">
      <header className="workspace-header">
        <div className="workspace-header-title">
          <div className="workspace-eyebrow">WORKSPACE / MULTI-PROYECCIÓN</div>
          <h1>${headerTitle}</h1>
        </div>
        <div className="workspace-controls">
          <div className="workspace-node-select">
            <input
              type="search"
              placeholder="Buscar nodo..."
              value=${searchQuery}
              onChange=${e => setSearchQuery(e.target.value)}
              aria-label="Buscar nodo"
            />
            <select
              value=${modelFilter}
              onChange=${e => setModelFilter(e.target.value)}
              aria-label="Filtrar catálogo por modelo"
            >
              <option value="">Todos los modelos</option>
              ${availableModels.map(m => html`<option key=${m} value=${m}>${m}</option>`)}
            </select>
            <select
              value=${selectValue || (target?.path ? '__path__' : '')}
              onChange=${e => handleSelectNode(e.target.value)}
              aria-label="Seleccionar nodo activo"
            >
              ${target?.path ? html`<option value="__path__">[sin modelo] ${target.path}</option>` : ''}
              ${selectValue && !filteredNodes.some(n => n.id === selectValue) ? html`
                <option value=${selectValue}>${selectValue}</option>
              ` : ''}
              ${filteredNodes.map(n => html`
                <option key=${n.id} value=${n.id}>
                  [${n.model_name}] ${n.title || n.id}
                </option>
              `)}
            </select>
          </div>

          <div className="workspace-depth-control" role="group" aria-label="Profundidad de grafo">
            <button
              className=${'workspace-depth-btn' + (depth === 1 ? ' active' : '')}
              aria-pressed=${depth === 1}
              onClick=${() => handleDepthChange(1)}
            >
              1 hop
            </button>
            <button
              className=${'workspace-depth-btn' + (depth === 2 ? ' active' : '')}
              aria-pressed=${depth === 2}
              onClick=${() => handleDepthChange(2)}
            >
              2 hops
            </button>
          </div>

          <button
            className="workspace-refresh-btn"
            disabled=${loading}
            onClick=${() => setReloadCount(c => c + 1)}
          >
            ${loading ? 'Cargando…' : 'Actualizar'}
          </button>
        </div>
      </header>

      <nav className="workspace-tabs-bar" aria-label="Proyecciones del nodo">
        ${TABS.map(tab => html`
          <button
            key=${tab.id}
            className=${'workspace-tab-btn' + (activeTab === tab.id ? ' active' : '')}
            aria-selected=${activeTab === tab.id}
            onClick=${() => handleTabChange(tab.id)}
          >
            ${tab.label}
          </button>
        `)}
      </nav>

      ${catalogError ? html`<div className="workspace-alert" role="alert">Error de catálogo: ${catalogError}</div>` : ''}
      ${sourceError ? html`<div className="workspace-alert" role="alert" data-testid="source-error">Error: ${sourceError}</div>` : ''}
      ${nodeError ? html`<div className="workspace-alert" role="alert">Error: ${nodeError}</div>` : ''}
      ${anchorNote ? html`<div className="workspace-alert" role="status" data-testid="anchor-note">${anchorNote}</div>` : ''}

      ${focus ? html`
        <div className="workspace-focus-bar" role="status" data-testid="focus-bar" data-focus-kind=${focus.kind}>
          <strong>Foco:</strong> <span data-testid="focus-desc">${describeFocus(focus)}</span>
          <span className="workspace-focus-corr" data-testid="focus-corr">
            Documento: ${corr.document} · Grafo: ${source && unmodeled ? 'sin grafo' : corr.graph} · Código: ${source && unmodeled ? 'sin referencias' : corr.code}
          </span>
          <button type="button" className="workspace-link-btn" data-testid="focus-clear" onClick=${() => setFocus(null)}>Limpiar foco</button>
        </div>
      ` : ''}

      <div className="workspace-body">
        <${ExplorerPanel}
          explorer=${explorer}
          catalog=${catalog}
          catalogStatus=${catalogStatus}
          error=${explorerError}
          loading=${explorerLoading}
          selectedId=${openDocId}
          selectedPath=${source?.identity?.path || target?.path || ''}
          onOpenId=${id => handleSelectNode(id)}
          onOpenPath=${path => openTarget({path})}
          onRefresh=${refreshCatalogs}
        />
        <main className="workspace-main" aria-label="Proyección activa">
          ${sourceLoading && activeTab === 'document' ? html`<p role="status" className="workspace-empty" data-testid="panel-loading" data-panel="document">Cargando documento…</p>` : ''}
          ${!loading && !target && !sourceError ? html`<p className="workspace-empty">Selecciona un nodo del catálogo para visualizar sus proyecciones.</p>` : ''}

          ${source ? html`
            <section
              className="workspace-doc-pane"
              aria-label="Proyección Documental"
              data-testid="document-reader"
              data-revision=${source.revision}
              data-identity=${source.identity.id || source.identity.path}
              hidden=${activeTab !== 'document'}
            >
              ${(modeled && (nodeData?.document?.is_degraded || source.ir_error)) ? html`
                <div className="workspace-degraded-banner" role="status">
                  <strong>Documento Degradado</strong>
                  <p>${source.ir_error || nodeData?.document?.error || 'El documento no pudo ser procesado con IR completo, pero su representación básica sigue disponible.'}</p>
                </div>
              ` : ''}

              ${revisionMismatch ? html`<div className="workspace-alert" role="status" data-testid="revision-mismatch">Aviso: la revisión de /node (${formatHash(nodeData.identity.file_revision, 12)}) difiere de la de /source (${formatHash(source.revision, 12)}) para este documento; no se unifican.</div>` : ''}
              <header className="workspace-doc-header">
                <h2>${docTitle}</h2>
                <div className="workspace-doc-meta">
                  <span className="workspace-badge">${source.identity.model_name || 'sin modelo'}</span>
                  <code>${source.identity.path}</code>
                  <span className="workspace-badge" data-testid="doc-revision" title=${source.revision}>sha256 ${formatHash(source.revision, 12)}</span>
                  ${source.encoding === 'utf-8-replaced' ? html`<span className="workspace-badge workspace-badge-warn" data-testid="doc-encoding">utf-8-replaced</span>` : ''}
                </div>
              </header>

              <div className="workspace-reader-columns">
                <section className="workspace-reader-col" aria-label="Render">
                  <h3>Render</h3>
                  <${RenderedDocument}
                    text=${source.text}
                    links=${source.links}
                    sections=${sections}
                    focus=${focus}
                    onFocus=${setFocus}
                    onOpenLink=${handleOpenLink}
                  />
                </section>
                <section className="workspace-reader-col" aria-label="Fuente">
                  <h3>Fuente <small className="workspace-badge">${source.line_count} líneas</small></h3>
                  <${RawSource} text=${source.text} focus=${focus} fields=${fields} />
                </section>
              </div>

              ${(() => {
                const irSections = modeled && source.ir ? irSectionsWithCleanMeta(source.ir) : [];
                const irFieldList = modeled && source.ir ? irFields(source.ir, source.descriptor?.payload) : [];
                return html`
                  ${irSections.length ? html`
                    <div className="workspace-doc-content">
                      <h3>Estructura Documental (IR)</h3>
                      ${irSections.map((sec, i) => html`<${IrSectionView} key=${i} section=${sec} focus=${focus} onFocus=${setFocus} />`)}
                    </div>
                  ` : ''}
                  ${unmodeled && sections.length ? html`
                    <div className="workspace-doc-content" data-testid="outline">
                      <h3>Secciones (sin modelo)</h3>
                      <ul className="workspace-outline">
                        ${sections.map((sec, i) => html`
                          <li key=${i} className=${sectionHighlighted(sec, focus) ? 'is-focused' : ''} style=${{marginLeft: `${Math.max(0, (sec.level || 1) - 1) * 14}px`}}>
                            <button type="button" className="workspace-ir-focus-btn" data-testid="section-focus" onClick=${() => setFocus(sectionFocus(sec))}>${sec.title}</button>
                            <small className="workspace-badge">L${sec.line_start}-${sec.line_end}</small>
                          </li>
                        `)}
                      </ul>
                    </div>
                  ` : ''}
                  ${irFieldList.length ? html`
                    <div className="workspace-doc-content">
                      <h3>Campos del Documento (IR)</h3>
                      ${irFieldList.map((f, i) => html`
                        <div
                          key=${i}
                          className=${'workspace-payload-field' + (fieldHighlighted(f.field_path, focus, graphEdges, openDocId) ? ' is-focused' : '')}
                          data-field-path=${f.field_path}
                        >
                          <h3>
                            <button type="button" className="workspace-ir-focus-btn" data-testid="field-focus" onClick=${() => setFocus(fieldFocus(f.field_path))}>${f.field_path}</button>
                            ${f.span ? html`<small className="workspace-badge">L${f.span.line_start}-${f.span.line_end}</small>` : ''}
                          </h3>
                          ${typeof f.value === 'object' && f.value !== null ? html`
                            <pre><code>${JSON.stringify(f.value, null, 2)}</code></pre>
                          ` : html`
                            <p>${f.value !== null ? String(f.value) : '—'}</p>
                          `}
                        </div>
                      `)}
                    </div>
                  ` : modeled && source.descriptor?.payload && Object.keys(source.descriptor.payload).length ? html`
                    <div className="workspace-doc-content">
                      <h3>Payload del Documento (descriptor)</h3>
                      ${Object.entries(source.descriptor.payload).map(([k, v]) => html`
                        <div key=${k} className="workspace-payload-field" data-field-path=${k}>
                          <h3>${k}</h3>
                          ${typeof v === 'object' ? html`
                            <pre><code>${JSON.stringify(v, null, 2)}</code></pre>
                          ` : html`
                            <p>${String(v)}</p>
                          `}
                        </div>
                      `)}
                    </div>
                  ` : ''}
                `;
              })()}
            </section>
          ` : ''}

          ${sourceLoading && activeTab === 'graph' ? html`<p role="status" className="workspace-empty" data-testid="panel-loading" data-panel="graph">Cargando grafo…</p>` : ''}
          ${sourceLoading && activeTab === 'code' ? html`<p role="status" className="workspace-empty" data-testid="panel-loading" data-panel="code">Cargando código…</p>` : ''}

          ${source && activeTab === 'graph' ? html`
            <section className="workspace-graph-pane" aria-label="Proyección de Grafo">
              ${modeled ? html`<${RelationsNotice} where="graph" />` : ''}
              ${nodeData?.graph?.ok && (nodeData.graph.stale || []).length ? html`<div className="workspace-alert" role="status" data-testid="stale-outside">Aviso: ${nodeData.graph.stale.length} documento(s) fuera de esta vecindad tienen el índice de aristas atrasado (${nodeData.graph.stale.join(', ')}); las aristas que declaran pueden faltar aquí. Se prepara fuera de la petición con rebuild_edges.</div>` : ''}
              ${revisionMismatch ? html`<div className="workspace-alert" role="status" data-testid="revision-mismatch">Aviso: la revisión de /node (${formatHash(nodeData.identity.file_revision, 12)}) difiere de la de /source (${formatHash(source.revision, 12)}) para este documento; no se unifican.</div>` : ''}
              ${unmodeled ? html`
                <div className="workspace-alert" role="status" data-testid="no-graph">
                  Sin grafo ni referencias: el documento no está en el store, no se inventan vínculos.
                </div>
              ` : (nodeData?.graph?.ok === false || (!nodeData && nodeError)) ? html`
                <div className="workspace-alert" role="alert" data-testid=${nodeData?.graph?.estado === 'store_no_preparado' ? 'store-no-preparado' : 'graph-error'}>
                  ${nodeData?.graph?.estado === 'store_no_preparado'
                    ? `Store no preparado: ${(nodeData.graph.stale || []).length} documento(s) con el índice de aristas atrasado (${(nodeData.graph.stale || []).join(', ')}). Se prepara fuera de la petición con rebuild_edges.`
                    : `Error en grafo local: ${nodeData?.graph?.error || nodeError || 'No se pudo calcular la vecindad del grafo.'}`}
                </div>
              ` : !nodeData ? html`<p role="status" className="workspace-empty">Cargando grafo…</p>` : html`
                <div className="workspace-graph-filter-bar">
                  <label htmlFor="edge-type-select">Filtrar relación:</label>
                  <select
                    id="edge-type-select"
                    value=${edgeTypeFilter}
                    onChange=${e => setEdgeTypeFilter(e.target.value)}
                    aria-label="Filtrar por tipo de relación"
                  >
                    <option value="">Todas las relaciones (${graphEdges.length})</option>
                    ${edgeTypes.map(t => html`<option key=${t} value=${t}>${t}</option>`)}
                  </select>
                </div>

                <h3>Vecindario Local (${nodeData.graph?.nodes?.length || 0} nodos, ${visibleGraphEdges.length} aristas visibles${edgeTypeFilter ? ` filtradas por "${edgeTypeFilter}"` : ''})</h3>
                <div className="workspace-graph-nodes-grid">
                  ${(() => {
                    const connected = new Set([selectedId]);
                    for (const e of visibleGraphEdges) {
                      if (e.source) connected.add(e.source);
                      if (e.target) connected.add(e.target);
                    }
                    return (nodeData.graph?.nodes || []).map(node => {
                      const isDimmed = !!edgeTypeFilter && !connected.has(node.id);
                      return html`
                        <div
                          key=${node.id}
                          className=${'workspace-graph-node-card' + (node.id === selectedId ? ' is-center' : '') + (isDimmed ? ' dimmed' : '')}
                          onClick=${() => handleSelectNode(node.id)}
                        >
                          <div className="workspace-badge">${node.model_name || 'Doc'}</div>
                          <div className="workspace-graph-node-title">${node.title || node.id}</div>
                          <code>${node.id}</code>
                        </div>
                      `;
                    });
                  })()}
                </div>

                ${visibleGraphEdges.length ? html`
                  <div className="workspace-graph-edges-list">
                    <h4>Aristas del vecindario</h4>
                    ${visibleGraphEdges.map((e, idx) => {
                      const on = edgeHighlighted(e, focus, openDocId);
                      const fieldsOfEdge = edgeFields(e, openDocId);
                      return html`
                        <div
                          key=${idx}
                          className=${'workspace-edge-item' + (on ? ' is-focused' : '')}
                          data-testid="edge-item"
                          data-edge-key=${edgeKey(e)}
                          data-focused=${on ? 'true' : 'false'}
                          data-fields=${fieldsOfEdge.join(',')}
                          role="button"
                          tabIndex="0"
                          onClick=${() => setFocus(edgeFocus(e))}
                          onKeyDown=${ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); setFocus(edgeFocus(e)); } }}
                        >
                          <code>${e.source}</code>
                          <span className="workspace-edge-rel">──[${e.type || e.rel || 'rel'}]──▶</span>
                          <code>${e.target}</code>
                          ${fieldsOfEdge.length ? html`<span className="workspace-edge-prov" data-testid="edge-prov">campo: ${fieldsOfEdge.join(', ')}</span>` : ''}
                        </div>
                      `;
                    })}
                  </div>
                ` : html`<p className="workspace-empty">No hay aristas que coincidan con el filtro.</p>`}
              `}
            </section>
          ` : ''}

          ${source && activeTab === 'code' ? html`
            <section className="workspace-code-pane" aria-label="Proyección de Código">
              ${revisionMismatch ? html`<div className="workspace-alert" role="status" data-testid="revision-mismatch">Aviso: la revisión de /node (${formatHash(nodeData.identity.file_revision, 12)}) difiere de la de /source (${formatHash(source.revision, 12)}) para este documento; no se unifican.</div>` : ''}
              ${unmodeled ? html`
                <div className="workspace-alert" role="status" data-testid="no-code">
                  Sin grafo ni referencias: el documento no está en el store, no se inventan vínculos.
                </div>
              ` : !nodeData ? html`
                <p role="status" className="workspace-empty">${nodeError ? 'Código no disponible.' : 'Cargando código…'}</p>
              ` : !nodeData.code?.ok ? html`
                <div className="workspace-alert" role="status">
                  ${nodeData.code?.error || 'No se pudo generar la proyección de código para este documento.'}
                </div>
              ` : (codeFiles.length ? html`
                <div>
                  ${codeFiles.map(file => html`
                    <${CodeFileView}
                      key=${referenceKey(file)}
                      file=${file}
                      focus=${focus}
                      docId=${openDocId}
                      onFocus=${setFocus}
                      range=${ranges[referenceKey(file)] || null}
                      onRange=${handleRange}
                      onOpenPath=${p => openTarget({path: p})}
                    />
                  `)}
                </div>
              ` : html`
                <p className="workspace-empty">Este nodo no tiene archivos de código declarados o vinculados.</p>
              `)}
            </section>
          ` : ''}
        </main>

        <aside className="workspace-sidebar" aria-label="Contexto y Relaciones">
          <section className="workspace-sidebar-section">
            <h3>Identidad Canónica</h3>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">ID</span>
              <strong className="workspace-identity-val">${source?.identity?.id || (unmodeled ? 'Sin modelo (ausente)' : (sourceLoading ? 'Cargando…' : '—'))}</strong>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Modelo</span>
              <span className="workspace-identity-val">${source?.identity?.model_name || (unmodeled ? 'Sin modelo (ausente)' : (sourceLoading ? 'Cargando…' : '—'))}</span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Estado</span>
              <span className="workspace-identity-val">${nodeData?.identity?.status || (unmodeled ? 'Ausente' : (nodeLoading ? 'Cargando…' : 'Sin estado'))}</span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Nodo Actual</span>
              <span className="workspace-identity-val"><code>${nodeData?.identity?.current_node || (unmodeled ? 'Ausente' : (nodeLoading ? 'Cargando…' : 'Sin nodo'))}</code></span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Path</span>
              <span className="workspace-identity-val" data-testid="ctx-path">${source?.identity?.path || (sourceLoading ? 'Cargando…' : '—')}</span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Repo</span>
              <span className="workspace-identity-val">${source?.identity?.repo || (sourceLoading ? 'Cargando…' : '—')}</span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Content Hash (SLDB)</span>
              ${nodeData?.identity?.content_hash_error ? html`
                <span className="workspace-alert">${nodeData.identity.content_hash_error}</span>
              ` : html`
                <span className="workspace-identity-val" title=${nodeData?.identity?.content_hash}>
                  ${nodeData?.identity?.content_hash ? formatHash(nodeData.identity.content_hash, 16) : (unmodeled ? 'Ausente' : (nodeLoading ? 'Cargando…' : '—'))}
                </span>
              `}
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">File Revision (Git/Disk)</span>
              <span className="workspace-identity-val" data-testid="ctx-revision" title=${source?.revision}>
                ${source?.revision ? formatHash(source.revision, 16) : (sourceLoading ? 'Cargando…' : '—')}
              </span>
            </div>
          </section>

          <section className="workspace-sidebar-section">
            ${modeled ? html`<${RelationsNotice} where="context" />` : ''}
            <h3>Relaciones Salientes (${unmodeled ? 'ausentes' : (sourceLoading ? 'cargando' : (notReady ? 'no preparado' : outgoing.length))})</h3>
            ${sourceLoading ? html`<p className="workspace-empty" data-testid="panel-loading" data-panel="relations">Cargando relaciones…</p>` : unmodeled ? html`<p className="workspace-empty" data-testid="rel-absent">${source.context.relations_absent}</p>` : notReady ? html`
              <div className="workspace-alert" role="alert" data-testid="store-no-preparado-rel">
                Store no preparado (${notReady.estado}): ${(notReady.stale || []).length} documento(s) atrasados${(notReady.stale || []).length ? ` (${notReady.stale.join(', ')})` : ''}. Sin relaciones ni procedencia hasta preparar el índice fuera de la petición.
              </div>
            ` : outgoing.length ? html`
              <ul className="workspace-rel-list">
                ${outgoing.map((rel, idx) => html`
                  <li key=${idx}>
                    <button
                      className="workspace-rel-item-btn"
                      onClick=${() => handleSelectNode(rel.target)}
                    >
                      <span className="workspace-edge-rel">${rel.type || rel.rel || 'rel'} →</span>
                      <span>${rel.target}</span>
                    </button>
                    ${edgeDeclarations(rel).length ? html`<small className="workspace-edge-prov" data-testid="rel-prov">declara: ${edgeDeclarations(rel).map(d => `${d.owner === openDocId ? 'este documento' : (d.owner || '?')}.${d.field}`).join(', ')}</small>` : ''}
                  </li>
                `)}
              </ul>
            ` : html`<p className="workspace-empty">Sin relaciones salientes.</p>`}
          </section>

          <section className="workspace-sidebar-section">
            <h3>Relaciones Incidentes (${unmodeled ? 'ausentes' : (sourceLoading ? 'cargando' : (notReady ? 'no preparado' : incoming.length))})</h3>
            ${sourceLoading ? html`<p className="workspace-empty" data-testid="panel-loading" data-panel="relations-in">Cargando relaciones…</p>` : unmodeled ? html`<p className="workspace-empty">Ausentes: documento no modelado.</p>` : notReady ? html`<p className="workspace-empty">Store no preparado: sin relaciones incidentes.</p>` : incoming.length ? html`
              <ul className="workspace-rel-list">
                ${incoming.map((rel, idx) => html`
                  <li key=${idx}>
                    <button
                      className="workspace-rel-item-btn"
                      onClick=${() => handleSelectNode(rel.source)}
                    >
                      <span className="workspace-edge-rel">← ${rel.type || rel.rel || 'rel'}</span>
                      <span>${rel.source}</span>
                    </button>
                    ${edgeDeclarations(rel).length ? html`<small className="workspace-edge-prov" data-testid="rel-prov-in">declara: ${edgeDeclarations(rel).map(d => `${d.owner === openDocId ? 'este documento' : (d.owner || '?')}.${d.field}`).join(', ')}</small>` : ''}
                  </li>
                `)}
              </ul>
            ` : html`<p className="workspace-empty">Sin relaciones incidentes.</p>`}
            ${source?.context?.relations_error ? html`<div className="workspace-alert" role="alert">${source.context.relations_error}</div>` : ''}
          </section>

          <section className="workspace-sidebar-section" data-testid="links-section">
            <h3>Enlaces del documento (${sourceLoading ? 'cargando' : (source?.links || []).length})</h3>
            ${sourceLoading ? html`<p className="workspace-empty" data-testid="panel-loading" data-panel="links">Cargando enlaces…</p>` : (source?.links || []).length ? html`
              <ul className="workspace-rel-list">
                ${source.links.map((l, idx) => html`
                  <li key=${idx} data-status=${l.status} data-testid="link-item">
                    ${l.status === 'ok' && l.open ? html`
                      <button className="workspace-rel-item-btn" onClick=${() => handleOpenLink(l)}>
                        <span className="workspace-edge-rel">→</span>
                        <span>${l.target}</span>
                      </button>
                    ` : html`
                      <span className=${l.status === 'externo' ? 'workspace-link-external' : 'workspace-link-broken'}>${l.target}</span>
                      <small className="workspace-edge-prov">${l.status}: ${l.cause} (origen ${l.origin?.path}:${l.origin?.line ?? '?'})</small>
                    `}
                  </li>
                `)}
              </ul>
            ` : html`<p className="workspace-empty">Sin enlaces.</p>`}
          </section>

          <section className="workspace-sidebar-section">
            <h3>Problemas de Integridad</h3>
            ${unmodeled ? html`
              <p className="workspace-empty">No aplica: el documento no está en el store.</p>
            ` : nodeLoading ? html`
              <p className="workspace-empty" data-testid="panel-loading" data-panel="problems">Cargando integridad…</p>
            ` : problemsInfo.state === 'error' ? html`
              <div className="workspace-problems-alert" role="alert">
                <strong>Error al consultar integridad del store:</strong>
                <p><code>${problemsInfo.error}</code></p>
              </div>
            ` : problemsInfo.state === 'node_problems' ? html`
              <div className="workspace-problems-alert" role="alert">
                <strong>Problemas detectados en este nodo (${problemsInfo.count}):</strong>
                <ul>
                  ${problemsInfo.list.map((p, idx) => html`
                    <li key=${idx}><code>${p}</code></li>
                  `)}
                </ul>
              </div>
            ` : problemsInfo.state === 'store_problems' ? html`
              <div className="workspace-problems-warning" role="alert">
                <strong>Inconsistencias en el store (${problemsInfo.storeTotal}):</strong>
                <p>El store tiene relaciones rechazadas globales que no nombran directamente a este nodo.</p>
              </div>
            ` : html`
              <div className="workspace-no-problems">
                ✓ Sin problemas detectados en el store.
              </div>
            `}
          </section>
        </aside>
      </div>
    </div>
  `;
}

export const workspaceView = {
  id: 'node',
  facet: 'workspace',
  label: 'Workspace',
  component: WorkspaceView,
  shell: {primary: false, workers: 'collapsed'},
  styles: ['/views/workspace/node/workspace.css']
};

FILE:frontends/mindmap/views/workspace/node/workspace.css
/* Multi-projection Workspace Styles using Skin Tokens */

.workspace-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: var(--surface-app);
  color: var(--text);
  font-family: inherit;
}

.workspace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--surface-panel);
  border-bottom: 1px solid var(--border);
  gap: 16px;
  flex-wrap: wrap;
}

.workspace-header-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.workspace-eyebrow {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--primary);
}

.workspace-header-title h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ink);
}

.workspace-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.workspace-node-select {
  display: flex;
  align-items: center;
  gap: 8px;
}

.workspace-node-select select,
.workspace-node-select input {
  padding: 6px 10px;
  font-size: 13px;
  border: 1px solid var(--border-input);
  border-radius: 4px;
  background: var(--surface-panel);
  color: var(--text);
}

.workspace-depth-control {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--surface-muted);
  padding: 2px;
  border-radius: 4px;
}

.workspace-depth-btn {
  border: none;
  background: transparent;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 3px;
  cursor: pointer;
  color: var(--text-muted);
}

.workspace-depth-btn.active {
  background: var(--surface-panel);
  color: var(--ink);
  box-shadow: var(--shadow-tab);
  font-weight: 600;
}

.workspace-refresh-btn {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid var(--border-control);
  border-radius: 4px;
  background: var(--surface-panel);
  color: var(--text);
  cursor: pointer;
}

.workspace-refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Tabs */
.workspace-tabs-bar {
  display: flex;
  background: var(--surface-panel);
  border-bottom: 1px solid var(--border);
  padding: 0 20px;
  gap: 8px;
}

.workspace-tab-btn {
  padding: 10px 16px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s ease;
}

.workspace-tab-btn:hover {
  color: var(--ink);
}

.workspace-tab-btn.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  font-weight: 600;
}

/* Body / Split View */
.workspace-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.workspace-main {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.workspace-sidebar {
  width: 340px;
  min-width: 280px;
  border-left: 1px solid var(--border);
  background: var(--surface-panel);
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Document Projection */
.workspace-doc-pane {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 860px;
}

.workspace-degraded-banner {
  background: var(--warning-soft);
  border: 1px solid var(--warning-border);
  color: var(--warning-strong);
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 13px;
}

.workspace-degraded-banner strong {
  display: block;
  margin-bottom: 4px;
}

.workspace-doc-header {
  border-bottom: 1px solid var(--border);
  padding-bottom: 12px;
}

.workspace-doc-header h2 {
  margin: 0 0 6px 0;
  font-size: 22px;
  color: var(--ink);
}

.workspace-doc-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 13px;
  color: var(--text-muted);
}

.workspace-badge {
  background: var(--surface-muted);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.workspace-doc-content {
  line-height: 1.6;
  font-size: 14px;
}

.workspace-payload-field {
  margin-bottom: 16px;
}

.workspace-payload-field h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: var(--text-secondary);
}

.workspace-payload-field pre {
  background: var(--surface-sunken);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 13px;
  border: 1px solid var(--border-subtle);
}

.workspace-ir-section {
  border-left: 2px solid var(--border-control);
  padding-left: 14px;
  margin-bottom: 16px;
}

.workspace-ir-section h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: var(--ink);
}

/* Graph Projection */
.workspace-graph-pane {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.workspace-graph-filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--surface-muted);
  border-radius: 6px;
  flex-wrap: wrap;
}

.workspace-graph-filter-bar label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.workspace-graph-filter-bar select,
.workspace-graph-filter-bar input {
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid var(--border-input);
  border-radius: 4px;
  background: var(--surface-panel);
  color: var(--text);
}

.workspace-graph-nodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.workspace-graph-node-card {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 14px;
  background: var(--surface-panel);
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.workspace-graph-node-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-card);
}

.workspace-graph-node-card.is-center {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.workspace-graph-node-card.dimmed {
  opacity: 0.45;
}

.workspace-graph-node-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  color: var(--ink);
}

.workspace-graph-edges-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.workspace-edge-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 8px 12px;
  background: var(--surface-muted);
  border-radius: 4px;
}

.workspace-edge-rel {
  font-weight: 600;
  color: var(--primary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'DejaVu Sans Mono', 'Noto Sans Mono', 'Liberation Mono', monospace;
}

/* Code Projection */
.workspace-code-pane {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.workspace-code-file-card {
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
  background: var(--surface-panel);
}

.workspace-code-file-header {
  background: var(--surface-muted);
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.workspace-code-filename {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'DejaVu Sans Mono', 'Noto Sans Mono', 'Liberation Mono', monospace;
  font-weight: 600;
  font-size: 13px;
  color: var(--ink);
}

.workspace-code-table {
  width: 100%;
  border-collapse: collapse;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'DejaVu Sans Mono', 'Noto Sans Mono', 'Liberation Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
}

.workspace-code-line-num {
  width: 45px;
  text-align: right;
  padding: 2px 10px;
  color: var(--text-muted);
  user-select: none;
  background: var(--surface-sunken);
  border-right: 1px solid var(--border-subtle);
}

.workspace-code-line-text {
  padding: 2px 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

.workspace-code-line.target-line {
  background: var(--warning-tint);
}

.workspace-code-line.target-line .workspace-code-line-num {
  background: var(--warning-soft);
  font-weight: bold;
  color: var(--warning-strong);
}

/* Sidebar Context */
.workspace-sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.workspace-sidebar-section h3 {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin: 0;
}

.workspace-identity-prop {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
}

.workspace-identity-label {
  color: var(--text-muted);
}

.workspace-identity-val {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'DejaVu Sans Mono', 'Noto Sans Mono', 'Liberation Mono', monospace;
  word-break: break-all;
}

.workspace-rel-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.workspace-rel-item-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 6px 10px;
  background: var(--surface-muted);
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  font-size: 12px;
  color: var(--text);
}

.workspace-rel-item-btn:hover {
  background: var(--surface-panel);
  border-color: var(--primary);
}

.workspace-problems-alert {
  background: var(--danger-soft);
  border: 1px solid var(--danger-border);
  border-radius: 6px;
  padding: 12px;
  color: var(--danger-text);
  font-size: 12px;
}

.workspace-problems-alert strong {
  display: block;
  margin-bottom: 6px;
}

.workspace-problems-alert ul {
  margin: 0;
  padding-left: 18px;
}

.workspace-problems-warning {
  background: var(--warning-soft);
  border: 1px solid var(--warning-border);
  border-radius: 6px;
  padding: 12px;
  color: var(--warning-strong);
  font-size: 12px;
}

.workspace-no-problems {
  color: var(--success);
  background: var(--success-soft);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
}

/* States */
.workspace-alert {
  background: var(--danger-soft);
  color: var(--danger-text);
  border: 1px solid var(--danger-border);
  padding: 12px 16px;
  margin: 16px 20px;
  border-radius: 6px;
  font-size: 13px;
}

.workspace-empty {
  color: var(--text-muted);
  font-style: italic;
  padding: 24px;
  text-align: center;
}

@media (max-width: 800px) {
  .workspace-body {
    flex-direction: column;
  }
  .workspace-sidebar {
    width: 100%;
    border-left: none;
    border-top: 1px solid var(--border);
  }
}

/* ------------------------------------------------------------------
   WS13.1: lector (render + fuente), enlaces, foco y rango local de Code
   ------------------------------------------------------------------ */

.workspace-view [hidden] {
  display: none !important;
}

.workspace-reader-columns {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

@media (max-width: 900px) {
  .workspace-reader-columns {
    grid-template-columns: minmax(0, 1fr);
  }
}

.workspace-reader-col {
  min-width: 0;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  background: var(--surface-panel);
  padding: 8px 12px;
  overflow: auto;
  max-height: 70vh;
}

.workspace-reader-col h3 {
  margin: 4px 0 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.workspace-render h2,
.workspace-render h3,
.workspace-render h4,
.workspace-render h5,
.workspace-render h6 {
  margin: 12px 0 6px;
  color: var(--ink);
}

.workspace-render p,
.workspace-render ul {
  margin: 6px 0;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.workspace-render-block.is-focused,
.workspace-ir-section.is-focused,
.workspace-payload-field.is-focused,
.workspace-edge-item.is-focused,
.workspace-code-file-card.is-focused,
.workspace-outline li.is-focused {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  background: var(--surface-muted);
}

.workspace-render-frontmatter,
.workspace-render-code {
  background: var(--surface-sunken);
  padding: 8px;
  border-radius: 4px;
  overflow: auto;
  font-size: 12px;
}

.workspace-source {
  font-size: 12px;
  overflow: auto;
}

.workspace-src-line.is-focused td,
.workspace-code-line.in-range td {
  background: var(--surface-muted);
  box-shadow: inset 2px 0 0 var(--primary);
}

.workspace-code-line.selectable {
  cursor: pointer;
  user-select: none;
}

.workspace-doc-link {
  color: var(--primary);
  text-decoration: underline;
  cursor: pointer;
}

.workspace-link-broken {
  color: var(--warning-strong);
  text-decoration: line-through;
}

.workspace-link-external,
.workspace-link-unresolved {
  color: var(--text-muted);
}

.workspace-link-btn,
.workspace-ir-focus-btn,
.workspace-code-ref-btn {
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
  padding: 0 2px;
  text-align: left;
}

.workspace-link-btn {
  color: var(--primary);
  text-decoration: underline;
  font-size: 12px;
  margin-left: 6px;
}

.workspace-ir-focus-btn:disabled {
  cursor: default;
}

.workspace-focus-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 6px 20px;
  background: var(--surface-muted);
  border-bottom: 1px solid var(--border);
  font-size: 12px;
}

.workspace-edge-item {
  cursor: pointer;
}

.workspace-edge-prov {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
}

.workspace-code-range-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  margin: 8px 0 4px;
}

.workspace-code-full {
  margin-top: 8px;
  max-height: 50vh;
  overflow: auto;
}

.workspace-outline {
  list-style: none;
  padding-left: 0;
}

/* El monospace genérico del navegador puede resolver a una fuente sin métricas (texto de
   alto cero: código e identificadores en blanco); se fija una pila con fuentes concretas. */
.workspace-view code,
.workspace-view pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'DejaVu Sans Mono', 'Noto Sans Mono', 'Liberation Mono', monospace;
}

/* Explorer (WS13.2) */
.workspace-explorer {
  width: 280px;
  min-width: 220px;
  border-right: 1px solid var(--border);
  background: var(--surface-panel);
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 13px;
}

.workspace-explorer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.workspace-explorer-head h3,
.workspace-explorer h4 {
  margin: 0;
}

.workspace-explorer h4 {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.workspace-explorer-filter {
  width: 100%;
  box-sizing: border-box;
  padding: 6px 8px;
  border: 1px solid var(--border-input);
  border-radius: 4px;
  background: var(--surface-app);
  color: var(--text);
}

.workspace-explorer-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 42vh;
  overflow-y: auto;
}

.workspace-explorer-list {
  list-style: none;
  margin: 0;
  padding-left: 12px;
}

.workspace-explorer-section > .workspace-explorer-group > .workspace-explorer-list,
.workspace-explorer-section > .workspace-explorer-list {
  padding-left: 0;
}

.workspace-explorer-group-title {
  font-weight: 600;
  margin: 6px 0 2px;
  color: var(--text);
}

.workspace-explorer-item,
.workspace-explorer-folder-btn {
  display: block;
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  color: var(--text);
  font: inherit;
  padding: 3px 6px;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
}

.workspace-explorer-item {
  white-space: normal;
}

.workspace-explorer-item:hover,
.workspace-explorer-folder-btn:hover {
  background: var(--surface-muted);
}

.workspace-explorer-item.is-selected {
  background: var(--primary-soft);
  outline: 1px solid var(--primary);
}

.workspace-explorer-item-title {
  display: block;
  white-space: normal;
  overflow-wrap: anywhere;
}

.workspace-explorer-item-title .workspace-badge {
  white-space: normal;
  overflow-wrap: anywhere;
}

.workspace-explorer-item-path {
  display: block;
  white-space: normal;
  word-break: break-all;
  color: var(--text-muted);
  font-size: 11px;
  overflow-wrap: anywhere;
}

.workspace-explorer-roots {
  margin: 0;
  color: var(--text-muted);
  font-size: 12px;
}

.workspace-badge-warn {
  background: var(--warning-soft);
  color: var(--warning-strong);
  border: 1px solid var(--warning-border);
}

.workspace-relations-notice {
  margin-bottom: 12px;
  font-size: 12px;
  line-height: 1.4;
}

@media (max-width: 800px) {
  .workspace-explorer {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border);
    max-height: 280px;
  }
}

FILE:frontends/mindmap/index.html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>KB · Mindmap</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='16' fill='%237552b8'/%3E%3C/svg%3E">
<script type="importmap">{"imports":{"react":"https://esm.sh/react@18.3.1","react/":"https://esm.sh/react@18.3.1/","react-dom":"https://esm.sh/react-dom@18.3.1?deps=react@18.3.1","react-dom/client":"https://esm.sh/react-dom@18.3.1/client?deps=react@18.3.1","@xyflow/react":"https://esm.sh/@xyflow/react@12.11.5?external=react,react-dom","htm":"https://esm.sh/htm@3.1.1","dagre":"https://esm.sh/dagre@0.8.5","elkjs":"https://esm.sh/elkjs@0.11.1/lib/elk.bundled.js","lucide":"https://esm.sh/lucide@0.577.0"}}</script>
<link rel="stylesheet" href="https://esm.sh/@xyflow/react@12.11.5/dist/style.css">
<link rel="stylesheet" href="/skins/light.css">
<link rel="stylesheet" href="/skins/dark.css">
<link rel="stylesheet" href="/styles/base.css">
<link rel="stylesheet" href="/styles/shell.css">
<script>document.documentElement.dataset.skin=(function(){try{return localStorage.getItem('kb-skin')||'light'}catch(e){return 'light'}})()</script>
</head><body>
<div id="root"></div>
<script type="module" src="/app.js"></script>
</body></html>

FILE:tests/mindmap-workspace-reader.test.mjs
// Funciones puras de foco con dueño (WS13.1 correccion). Las entradas tienen la forma exacta que
// entrega /api/workspace/node (aristas con `provenance` y `owner`); la prueba sobre respuestas
// reales del servidor esta en tests/test_mindmap_workspace_reader.py (test_focus_uses_only_...).
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  edgeFields,
  edgeDeclarations,
  edgeHighlighted,
  fieldHighlighted,
  referenceHighlighted,
  correspondence,
  edgeFocus,
  fieldFocus,
  referenceFocus,
  ownedProvenance,
} from '../frontends/mindmap/views/workspace/node/reader.mjs';

const A = 'TaskDoc:a';
const B = 'TaskDoc:b';
const C = 'TaskDoc:c';
const D = 'TaskDoc:d';
const prov = (owner, field, declared, extra = {}) => ({origin: 'schema', owner, field, declared, ...extra});
const edge = (source, target, provenance, type = 'references') => ({source, target, type, origin: 'schema', relationDoc: null, provenance});

// A.depends_on = [c]; B.depends_on = [a] (entrante, mismo nombre de campo); D.depends_on = [b] (2 saltos)
const aToC = edge(A, C, [prov(A, 'depends_on', 'c')]);
const bToA = edge(B, A, [prov(B, 'depends_on', 'a')]);
const dToB = edge(D, B, [prov(D, 'depends_on', 'b')]);
const edges = [aToC, bToA, dToB];
const fields = [{field_path: 'depends_on'}, {field_path: 'title'}];

test('la arista saliente resalta el campo del documento abierto', () => {
  assert.deepEqual(edgeFields(aToC, A), ['depends_on']);
  assert.equal(fieldHighlighted('depends_on', edgeFocus(aToC), edges, A), true);
  assert.equal(edgeHighlighted(aToC, fieldFocus('depends_on'), A), true);
});

test('la entrante de otro documento con el mismo nombre de campo no resalta el campo propio', () => {
  assert.deepEqual(edgeFields(bToA, A), []);
  assert.equal(fieldHighlighted('depends_on', edgeFocus(bToA), edges, A), false);
  assert.equal(edgeHighlighted(bToA, fieldFocus('depends_on'), A), false);
  // su declaracion se conserva y se atribuye a su dueño
  assert.deepEqual(edgeDeclarations(bToA), [{owner: B, field: 'depends_on', declared: 'a'}]);
});

test('el vecino a dos saltos tampoco resalta campos del documento abierto', () => {
  assert.equal(fieldHighlighted('depends_on', edgeFocus(dToB), edges, A), false);
  assert.equal(edgeHighlighted(dToB, fieldFocus('depends_on'), A), false);
});

test('el foco de campo solo resalta las aristas que declara el documento abierto', () => {
  const hl = edges.filter(e => edgeHighlighted(e, fieldFocus('depends_on'), A));
  assert.deepEqual(hl, [aToC]);
});

test('correspondence cuenta solo elementos del documento abierto', () => {
  assert.deepEqual(correspondence(edgeFocus(aToC), {fields, edges, files: [], docId: A}), {document: 1, graph: 1, code: 0});
  // la entrante antes contaba document:1 por igualdad de nombre de campo
  assert.deepEqual(correspondence(edgeFocus(bToA), {fields, edges, files: [], docId: A}), {document: 0, graph: 1, code: 0});
  assert.deepEqual(correspondence(edgeFocus(dToB), {fields, edges, files: [], docId: A}), {document: 0, graph: 1, code: 0});
});

test('un campo propio cuya procedencia apunta a otro destino no cuenta para la referencia seleccionada', () => {
  const aToX = edge(A, 'TaskDoc:x', [prov(A, 'references', 'x')]);
  const aToY = edge(A, 'TaskDoc:y', [prov(A, 'references', 'y')]);
  const list = [aToX, aToY];
  const files = [{doc: A, field: 'references', position: 0, value: 'x'}, {doc: A, field: 'references', position: 1, value: 'y'}];
  const focus = referenceFocus(files[0]);
  assert.equal(edgeHighlighted(aToX, focus, A), true);
  assert.equal(edgeHighlighted(aToY, focus, A), false); // mismo campo, otro valor/destino
  assert.deepEqual(correspondence(focus, {fields: [{field_path: 'references'}], edges: list, files, docId: A}), {document: 1, graph: 1, code: 1});
  // la referencia de otro documento no resalta nada aqui
  const foreign = referenceFocus({doc: B, field: 'references', position: 0, value: 'x'});
  assert.equal(edgeHighlighted(aToX, foreign, A), false);
  assert.equal(fieldHighlighted('references', foreign, list, A), false);
  assert.equal(referenceHighlighted(files[0], referenceFocus({doc: B, field: 'references', position: 0, value: 'x'}), A), false);
});

test('relation_doc y structural no tienen campo: no resaltan ninguno', () => {
  const rel = {source: A, target: C, type: 'task_activates', origin: 'relation_doc', relationDoc: 'r1',
    provenance: [{origin: 'relation_doc', owner: null, condition: ''}]};
  assert.deepEqual(edgeFields(rel, A), []);
  assert.deepEqual(ownedProvenance(rel, A), []);
  assert.equal(edgeHighlighted(rel, fieldFocus('depends_on'), A), false);
});

test('se conservan todas las procedencias reales: varias del dueño correcto', () => {
  const multi = edge(A, C, [prov(A, 'depends_on', 'c'), prov(A, 'inherits_from', 'c'), prov(B, 'depends_on', 'zzz')]);
  assert.deepEqual(edgeFields(multi, A).sort(), ['depends_on', 'inherits_from']);
  assert.equal(multi.provenance.length, 3);
  assert.equal(edgeDeclarations(multi).length, 3);
});

test('sin identidad abierta no se resalta nada por propiedad', () => {
  assert.deepEqual(edgeFields(aToC, ''), []);
  assert.equal(edgeHighlighted(aToC, fieldFocus('depends_on'), ''), false);
});

FILE:instruccion
Cold-bundle de la tarea task-lector-del-workspace-render-markdown-legible-citas-énfasis-código-inline-enlaces-estándar-con-un-mot: con el TaskDoc, los rituales enrutados por el Board, las pills ligadas, los átomos ligados y los archivos que el TaskDoc nombra, reformula el encargo, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

Sección de validación del TaskDoc:
- node --test tests/mindmap-workspace-reader.test.mjs tests/mindmap-workspace.test.mjs
- python -m pytest -q -rs tests/test_mindmap_workspace_reader.py tests/e2e_mindmap_workspace.py

