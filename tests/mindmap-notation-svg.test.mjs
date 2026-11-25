// Exportador SVG del modo lector (notation-svg.mjs): mismo layout que la vista, no un segundo dibujo.
// En node no hay canvas: las posiciones se comparan contra la escena calculada con la misma medida aproximada.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {pathToFileURL, fileURLToPath} from 'node:url';
import {sceneFor, LANE} from '../frontends/mindmap/views/specs/notation/notation.mjs';
import {bestLayout, absoluteBoxes, approximateMeasure} from '../frontends/mindmap/views/specs/notation/notation-layout.mjs';
import {gridDrawing, laneDrawing} from '../frontends/mindmap/views/specs/notation/notation-draw.mjs';
import {exportSvg} from '../frontends/mindmap/views/specs/notation/notation-svg.mjs';

const fixture = name => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));
const measure = approximateMeasure;
const TOL = 1;

// ELK real si hay (el checkout principal lo trae en apps/review-workbench); si no, las pruebas de grafo con ELK se omiten.
async function loadElk() {
  const here = fileURLToPath(new URL('..', import.meta.url));
  const roots = [here, here.replace(/\/\.worktrees\/[^/]+\/?$/, '/'), `${here}apps/review-workbench/`, here.replace(/\/\.worktrees\/[^/]+\/?$/, '/apps/review-workbench/')];
  for (const root of roots) {
    const file = `${root.replace(/\/?$/, '/')}node_modules/elkjs/lib/elk.bundled.js`;
    if (existsSync(file)) { const m = await import(pathToFileURL(file)); return new (m.default.default || m.default)(); }
  }
  return null;
}
const elk = await loadElk();

// Las posiciones de un tipo de elemento en el SVG: data-<attr> de cada <g class="...">.
const nodesOf = (svg, cls, key) => [...svg.matchAll(new RegExp(`<g class="${cls}[^"]*"([^>]*)>`, 'g'))].map(m => {
  const a = Object.fromEntries([...m[1].matchAll(/ ([\w-]+)="([^"]*)"/g)].map(([, k, v]) => [k, v.replace(/&amp;/g, '&')]));
  return {key: a[key], a};
});
const near = (a, b, what) => assert.ok(Math.abs(Number(a) - b) <= TOL, `${what}: ${a} vs ${b}`);
const validSvg = svg => {
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"[^>]*viewBox="0 0 \d+ \d+"/);
  assert.ok(svg.endsWith('</svg>'));
  // Etiquetas balanceadas (el SVG es XML bien formado, sin dependencias).
  const stack = [];
  for (const m of svg.matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g)) {
    if (m[4]) continue;
    if (m[1]) assert.equal(stack.pop(), m[2], `cierre inesperado ${m[2]}`); else stack.push(m[2]);
  }
  assert.deepEqual(stack, []);
};

const step = (id, partition, extra = {}) => ({doc: `S.${id}`, label: id, shape: 'rounded-box', data: partition ? {partition, ...extra} : extra});
const flow = (a, b, order, label = '') => ({doc: `R.${a}-${b}`, source: `S.${a}`, target: `S.${b}`, relation: 'next', draw: 'line', line: 'solid', target_end: 'open-arrow', order, label});
const activity = {spec: 'SpecDoc:S', title: 'Actividad', diagram_type: 'activity', notation: 'NotationDoc:activity', layout: {kind: 'graph', direction: 'TB'},
  nodes: [step('a', 'Uno'), step('b', 'Dos', {notes: 'una nota'}), {...step('d', 'Dos'), shape: 'diamond', label: '¿ok?'}, step('c', 'Uno'),
    {doc: 'S.start', label: '', shape: 'filled-circle', data: {initial: true}}, {doc: 'S.end', label: '', shape: 'bullseye', data: {final: true}}],
  links: [flow('start', 'a', 1), flow('a', 'b', 2), flow('b', 'd', 3), flow('d', 'c', 4, '[sí]'), flow('d', 'a', 5, '[no]'), flow('c', 'end', 6)]};

test('actividad con carriles: las cajas del SVG son las de bestLayout con la misma medida', async () => {
  const svg = await exportSvg(activity, {measure});
  validSvg(svg);
  const layout = await bestLayout(null, sceneFor(activity, {measure}), {measure, canvas: {width: 1200, height: 900}});
  const abs = absoluteBoxes(layout);
  const drawn = nodesOf(svg, 'nv-node', 'data-id');
  assert.equal(drawn.length, layout.nodes.length);
  for (const {key, a} of drawn) {
    const box = abs.get(key);
    assert.ok(box, key);
    near(a['data-x'], box.x, `${key} x`); near(a['data-y'], box.y, `${key} y`);
    near(a['data-w'], box.width, `${key} w`); near(a['data-h'], box.height, `${key} h`);
  }
  assert.equal(nodesOf(svg, 'nv-edge', 'data-edge').length, layout.edges.length);
  assert.ok(svg.includes('marker id="nv-open-arrow"'));
  assert.ok(drawn.some(n => n.key.includes('#partition:1')), 'carriles dibujados');
});

test('clases: mismas posiciones que la vista (ELK)', {skip: !elk && 'elkjs no está instalado'}, async () => {
  const view = fixture('notation-view-class.json');
  const svg = await exportSvg(view, {measure, elk});
  validSvg(svg);
  const layout = await bestLayout(elk, sceneFor(view, {measure}), {measure, canvas: {width: 1200, height: 900}});
  const abs = absoluteBoxes(layout);
  const drawn = nodesOf(svg, 'nv-node', 'data-id');
  assert.equal(drawn.length, layout.nodes.length);
  for (const {key, a} of drawn) { near(a['data-x'], abs.get(key).x, key); near(a['data-y'], abs.get(key).y, key); }
  assert.ok(drawn.length >= 2);
});

test('secuencia: participantes y mensajes en las posiciones de laneScene', async () => {
  const view = fixture('notation-view-sequence.json');
  const svg = await exportSvg(view, {measure});
  validSvg(svg);
  const scene = sceneFor(view, {measure});
  assert.equal(scene.kind, 'lanes');
  const heads = nodesOf(svg, 'nv-lane-head', 'data-lane');
  assert.equal(heads.length, scene.lanes.length);
  for (const {key, a} of heads) near(a['data-x'], scene.lanes.find(l => l.id === key).x, key);
  const msgs = nodesOf(svg, 'nv-message', 'data-message');
  assert.equal(msgs.length, scene.messages.length);
  for (const {key, a} of msgs) near(a['data-y'], scene.messages.find(m => m.id === key).y, key);
  assert.equal((svg.match(/class="nv-lifeline"/g) || []).length, scene.lanes.length);
});

test('fragmentos de secuencia: un marco por fragmento con mensajes', async () => {
  const view = fixture('notation-view-fragments.json');
  const svg = await exportSvg(view, {measure});
  validSvg(svg);
  assert.equal(nodesOf(svg, 'nv-frame', 'data-fragment').length, laneDrawing(sceneFor(view, {measure})).frames.length);
  assert.ok(nodesOf(svg, 'nv-frame', 'data-fragment').length >= 1);
});

test('matriz: celdas, filas y columnas donde las pone gridDrawing; las marcadas llevan marca', async () => {
  const view = fixture('notation-view-matrix.json');
  const svg = await exportSvg(view, {measure});
  validSvg(svg);
  const scene = sceneFor(view, {measure});
  assert.equal(scene.kind, 'grid');
  const draw = gridDrawing(scene, {measure});
  const cells = nodesOf(svg, 'nv-cell', 'data-cell');
  const expected = draw.grids.flatMap(g => g.rows.flatMap(row => row.cells.map(c => ({...c, key: `${row.id}|${c.col}`}))));
  assert.equal(cells.length, expected.length);
  for (const e of expected) {
    const got = cells.find(c => c.key === e.key && Math.abs(Number(c.a['data-x']) - e.x) <= TOL);
    assert.ok(got, e.key);
    near(got.a['data-y'], e.y, e.key);
  }
  assert.equal(cells.filter(c => c.a.class === undefined).length, cells.length);
  assert.equal((svg.match(/nv-cell is-filled/g) || []).length, expected.filter(c => c.filled).length);
});

test('la matriz de cobertura y el statechart también producen un SVG válido', async () => {
  validSvg(await exportSvg(fixture('notation-view-matrix-coverage.json'), {measure}));
  if (elk) validSvg(await exportSvg(fixture('notation-view-statechart.json'), {measure, elk}));
});

test('el texto se escapa: un rótulo con < & " no rompe el SVG', async () => {
  const view = {...activity, nodes: activity.nodes.map(n => (n.doc === 'S.a' ? {...n, label: 'a<b & "c"'} : n))};
  const svg = await exportSvg(view, {measure});
  validSvg(svg);
  assert.ok(svg.includes('a&lt;b &amp; &quot;c&quot;'));
});

test('LANE sigue siendo la geometría de la escena: la vista y el exportador comparten laneDrawing', () => {
  const scene = sceneFor(fixture('notation-view-sequence.json'), {measure});
  const draw = laneDrawing(scene);
  assert.equal(draw.messages.length, scene.messages.length);
  assert.equal(draw.lifelines[0].y1, LANE.top + scene.head);
});
