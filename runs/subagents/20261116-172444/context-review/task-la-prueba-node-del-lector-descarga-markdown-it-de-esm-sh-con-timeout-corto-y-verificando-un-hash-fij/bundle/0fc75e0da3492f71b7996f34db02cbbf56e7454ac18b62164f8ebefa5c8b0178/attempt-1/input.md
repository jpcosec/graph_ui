FILE:desk/tasks/task-la-prueba-node-del-lector-descarga-markdown-it-de-esm-sh-con-timeout-corto-y-verificando-un-hash-fij.md
---
sldb:
  by: agent
  at: '2026-11-16T17:24:30Z'
  authority: generated
  via: save_document_payload
id: task-la-prueba-node-del-lector-descarga-markdown-it-de-esm-sh-con-timeout-corto-y-verificando-un-hash-fij
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
- host:robocop2
current_node: ritual-execution
history: []
references:
- runs/subagents/20261116-lector-tester-a1/result-summary.md
- 9bc308b
- frontends/mindmap/index.html
depends_on: []
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
files:
- tests/mindmap-workspace-reader.test.mjs
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# La prueba node del lector descarga markdown-it de esm.sh con timeout corto y verificando un hash fijado

## Rationale

_Explain why this task exists or the business driver behind it._

Al cerrar el lector Markdown del workspace (86ebce3, código 9bc308b), el tester independiente (runs/subagents/20261116-lector-tester-a1/result-summary.md, punto 4) encontró que tests/mindmap-workspace-reader.test.mjs es la primera prueba del job mindmap de la CI que necesita internet: un hook de load (líneas ~114-126) hace fetch(url) de los módulos https de esm.sh que nombra el import map de frontends/mindmap/index.html (markdown-it@14.1.0) sin timeout y sin verificar integridad. Sin red falla limpio en 0,34 s, pero con la red colgada (proxy que acepta y no responde) tarda 5 min en fallar, y el contenido descargado se ejecuta sin comprobar que es el esperado.

## Goal

_Describe the concrete result this task must produce._

El fetch del hook de load de tests/mindmap-workspace-reader.test.mjs usa un timeout de 20 s (AbortSignal.timeout(20000)) y cada módulo que trae de esm.sh se compara contra un sha256 fijado en el propio test; un contenido distinto o un timeout hacen fallar la prueba con un mensaje que nombra la URL y la causa.

## Scope

_State what is in scope and what is out of scope._

ENTRA: (1) tests/mindmap-workspace-reader.test.mjs: en HTTPS_HOOKS, fetch(url, {signal: AbortSignal.timeout(20000)}); un error de timeout se relanza como Error('GET <url> -> timeout 20 s'). (2) Un objeto EXPECTED_SHA256 {url: hex} en el test con el sha256 de cada módulo que hoy descarga el hook (markdown-it@14.1.0 y sus dependencias relativas de esm.sh; la lista sale de registrar las URLs en una corrida con red); el hook calcula el sha256 del texto (node:crypto) y, si no coincide o la URL no está en la tabla, lanza Error('GET <url> -> sha256 <obtenido> != <esperado>'). (3) Un comentario que diga cómo regenerar la tabla al cambiar la versión del import map. NO ENTRA: vendorizar markdown-it en el repo, cambiar el import map o el código de producción, cambiar .github/workflows/ci.yml, tocar otras pruebas.

## Implementation Path

_Outline the expected implementation route or affected surface._

1) Correr una vez `node --test tests/mindmap-workspace-reader.test.mjs` con un console.error temporal en el hook para listar las URLs descargadas y su sha256 (sha256 del texto UTF-8). 2) Escribir la tabla y el control en el hook; quitar el log temporal. 3) Comprobar los tres casos: con red pasa; con un sha256 alterado en la tabla falla con el mensaje de sha256; con HTTPS_PROXY a un listener local que acepta y no responde falla en menos de 30 s con el mensaje de timeout (node 22 respeta el proxy solo con NODE_USE_ENV_PROXY=1; si no, simularlo apuntando MD_URL a un puerto local que no responde, en una copia del test en /dev/shm).

## Validation

_List the checks required before this task can close._

- node --test tests/mindmap-workspace-reader.test.mjs tests/mindmap-workspace.test.mjs
- node --test tests/*.test.mjs

## Done When

_Name the observable condition that makes the task complete._

Con red, `node --test tests/*.test.mjs` pasa entero; con la tabla alterada la prueba falla nombrando la URL y el sha256; con la red colgada falla en menos de 30 s con el mensaje de timeout. La evidencia de los tres casos queda en el run_dir.

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

FILE:tests/mindmap-workspace-reader.test.mjs
// Funciones puras de foco con dueño (WS13.1 correccion). Las entradas tienen la forma exacta que
// entrega /api/workspace/node (aristas con `provenance` y `owner`); la prueba sobre respuestas
// reales del servidor esta en tests/test_mindmap_workspace_reader.py (test_focus_uses_only_...).
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {register} from 'node:module';
import {
  createMarkdown,
  renderBlocks,
  splitInline,
  linksByRaw,
  inlineText,
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

// ---------------------------------------------------------------- render Markdown con el motor real
// El motor es el mismo modulo que carga el navegador: la URL sale del import map de index.html
// (markdown-it de esm.sh). Node no importa https por si mismo; este hook solo trae ese modulo
// (y sus dependencias relativas del mismo origen) por red, sin copia local.
const indexHtml = readFileSync(new URL('../frontends/mindmap/index.html', import.meta.url), 'utf-8');
const importMap = JSON.parse(indexHtml.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]);
const MD_URL = importMap.imports['markdown-it'];
const HTTPS_HOOKS = `
export async function resolve(specifier, context, next) {
  const parent = context.parentURL || '';
  if (specifier.startsWith('https://')) return {url: specifier, shortCircuit: true};
  if (parent.startsWith('https://') && /^[./]/.test(specifier)) return {url: new URL(specifier, parent).href, shortCircuit: true};
  return next(specifier, context);
}
export async function load(url, context, next) {
  if (!url.startsWith('https://')) return next(url, context);
  const res = await fetch(url);
  if (!res.ok) throw new Error('GET ' + url + ' -> ' + res.status);
  return {format: 'module', source: await res.text(), shortCircuit: true};
}`;
register('data:text/javascript,' + encodeURIComponent(HTTPS_HOOKS));
const {default: MarkdownIt} = await import(MD_URL);
const md = createMarkdown(MarkdownIt);

const DOC = [
  '---',                                             // 1
  'id: guia',                                        // 2
  '---',                                             // 3
  '# Guia',                                          // 4
  '',                                                // 5
  '> Una cita con *énfasis* y [[otro.md]]',          // 6
  '> en dos lineas.',                                // 7
  '',                                                // 8
  'Texto **fuerte** con `codigo [[no.md]]` y [la web](https://example.com/x).', // 9
  'Segunda linea con _[[otro.md#Segunda parte]]_ y <script>alert(1)</script>.', // 10
  '',                                                // 11
  '- uno [pred:: [[otro.md]]]',                      // 12
  '- dos',                                           // 13
  '',                                                // 14
  '```',                                             // 15
  'x = 1',                                           // 16
  '```',                                             // 17
].join('\n') + '\n';

const find = (nodes, type) => {
  for (const n of nodes || []) {
    if (n.type === type) return n;
    const inner = find(n.children, type);
    if (inner) return inner;
  }
  return null;
};

test('el motor del import map es markdown-it 14.1.0 por esm.sh', () => {
  assert.equal(MD_URL, 'https://esm.sh/markdown-it@14.1.0');
  assert.equal(md.options.html, false);
  assert.equal(md.options.linkify, false);
});

test('renderBlocks: line_start/line_end en base 1 desde token.map, con el frontmatter separado', () => {
  const blocks = renderBlocks(DOC, md);
  assert.deepEqual(blocks.map(b => [b.kind, b.line_start, b.line_end]), [
    ['frontmatter', 1, 3],
    ['heading', 4, 4],
    ['quote', 6, 7],
    ['paragraph', 9, 10],
    ['list', 12, 14], // markdown-it incluye en el map de la lista la linea en blanco que la cierra
    ['code', 15, 17],
  ]);
  assert.deepEqual(blocks[0].lines, ['id: guia']);
  assert.deepEqual(blocks[5].lines, ['x = 1']);
  assert.deepEqual(blocks[4].items.map(it => [it.line_start, it.line_end]), [[12, 12], [13, 14]]);
});

test('renderBlocks: cita con énfasis y enlace SLDB dentro', () => {
  const quote = renderBlocks(DOC, md)[2];
  assert.equal(quote.kind, 'quote');
  const para = quote.blocks[0];
  assert.equal(para.kind, 'paragraph');
  assert.deepEqual(find(para.inline, 'em').children, [{type: 'text', text: 'énfasis'}]);
  const text = para.inline.find(n => n.type === 'text' && n.text.includes('[[otro.md]]'));
  assert.ok(text, JSON.stringify(para.inline));
  const links = linksByRaw([{raw: '[[otro.md]]', status: 'ok', open: {path: 'docs/otro.md'}}]);
  const seg = splitInline(text.text, links).find(s => s.type === 'link');
  assert.equal(seg.link.status, 'ok');
});

test('renderBlocks: negrita, código inline literal, enlace estándar sin clasificar y HTML como texto', () => {
  const para = renderBlocks(DOC, md)[3];
  assert.deepEqual(find(para.inline, 'strong').children, [{type: 'text', text: 'fuerte'}]);
  // [[…]] dentro de code_inline queda literal: es un nodo code, no un texto que splitInline resuelva
  assert.deepEqual(find(para.inline, 'code'), {type: 'code', text: 'codigo [[no.md]]'});
  assert.deepEqual(find(para.inline, 'std_link'), {type: 'std_link', href: 'https://example.com/x', text: 'la web'});
  assert.ok(para.inline.some(n => n.type === 'softbreak'));
  // el HTML del documento no se interpreta: llega como texto
  assert.ok(inlineText(para.inline).includes('<script>alert(1)</script>'));
  assert.equal(find(para.inline, 'html_inline'), null);
});

test('renderBlocks: un [[…]] dentro de énfasis conserva su resolución', () => {
  const para = renderBlocks(DOC, md)[3];
  const em = find(para.inline, 'em');
  assert.deepEqual(em.children, [{type: 'text', text: '[[otro.md#Segunda parte]]'}]);
  const links = linksByRaw([{raw: '[[otro.md#Segunda parte]]', status: 'roto', cause: 'ancla inexistente'}]);
  const [seg] = splitInline(em.children[0].text, links);
  assert.equal(seg.type, 'link');
  assert.equal(seg.label, 'otro.md#Segunda parte');
  assert.equal(seg.link.status, 'roto');
});

test('renderBlocks: items de lista con [pred:: [[…]]] en su texto', () => {
  const list = renderBlocks(DOC, md)[4];
  assert.equal(list.ordered, false);
  const [first] = list.items[0].blocks;
  assert.equal(first.tight, true);
  const segs = splitInline(first.inline[0].text);
  assert.deepEqual(segs.map(s => s.type), ['text', 'link']);
  assert.equal(segs[1].raw, '[pred:: [[otro.md]]]');
});

test('renderBlocks: sin frontmatter las lineas son las de la fuente; HTML de bloque queda como texto', () => {
  const blocks = renderBlocks('Intro\n\n<div onclick="x()">hola</div>\n\n## Fin\n', md);
  assert.deepEqual(blocks.map(b => [b.kind, b.line_start, b.line_end]), [['paragraph', 1, 1], ['paragraph', 3, 3], ['heading', 5, 5]]);
  assert.deepEqual(blocks[1].inline, [{type: 'text', text: '<div onclick="x()">hola</div>'}]);
});

FILE:instruccion
Cold-bundle de la tarea task-la-prueba-node-del-lector-descarga-markdown-it-de-esm-sh-con-timeout-corto-y-verificando-un-hash-fij: con el TaskDoc, los rituales enrutados por el Board, las pills ligadas, los átomos ligados y los archivos que el TaskDoc nombra, reformula el encargo, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

Sección de validación del TaskDoc:
- node --test tests/mindmap-workspace-reader.test.mjs tests/mindmap-workspace.test.mjs
- node --test tests/*.test.mjs

