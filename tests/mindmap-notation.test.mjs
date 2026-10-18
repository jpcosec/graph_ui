// Lógica pura de la vista de notación (views/specs/notation/notation.mjs).
// Los fixtures son la salida REAL de `spec2viz notation view` sobre pilotos de
// spec2viz sincronizados en un store temporal:
//   spec2viz diagram sync <spec.yml> --store .sldb
//   spec2viz notation view <id> --store .sldb > tests/fixtures/notation-view-<x>.json
// statechart: state.diagram-sync-lifecycle (estado compuesto + transición que sale);
// sequence: sequence.render-pipeline (carriles, autollamada, retornos);
// matrix: matrix.quotation-view (spec2viz/tests/fixtures; grilla con filas anidadas);
// matrix-coverage: matrix.pipeline-coverage (dos vistas; trae fragments/data/source_label vacíos).
// La paridad viva endpoint = resolve_view la fija tests/test_mindmap_notation.py.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {specCatalog, buildScene, sceneFor, laneScene, gridScene, cellKey, byDepth, compartmentLine, glyphSize} from '../frontends/mindmap/views/specs/notation/notation.mjs';

const fixture = name => JSON.parse(readFileSync(new URL(`./fixtures/notation-view-${name}.json`, import.meta.url)));
const statechart = fixture('statechart'), sequence = fixture('sequence'), matrix = fixture('matrix'), coverage = fixture('matrix-coverage');
const tail = id => id.split('.').pop();

test('nest se vuelve contención, no arista: los subestados viven dentro de syncing', () => {
  const scene = buildScene(statechart);
  const parents = Object.fromEntries(scene.nodes.filter(n => n.parent).map(n => [tail(n.id), tail(n.parent)]));
  assert.deepEqual(parents, {validating: 'syncing', writing: 'syncing', indexing: 'syncing'});
  assert.deepEqual(scene.nodes.filter(n => n.container).map(n => tail(n.id)), ['syncing']);
  assert.equal(scene.edges.length, statechart.links.filter(l => l.draw !== 'nest').length);
  assert.ok(scene.edges.some(e => tail(e.source) === 'validating' && tail(e.target) === 'failed'), 'la transición que sale del compuesto se dibuja');
  assert.deepEqual(scene.notices, []);
});

test('el orden de capas pone cada contenedor antes que sus hijos', () => {
  const ordered = byDepth(buildScene(statechart).nodes).map(n => tail(n.id));
  assert.ok(ordered.indexOf('syncing') < ordered.indexOf('validating'));
});

test('las terminales y el trazo salen del link, no del tipo de relación', () => {
  const view = {layout: {kind: 'graph'}, nodes: [{doc: 'A', shape: 'class-box', label: 'A', compartments: []}, {doc: 'B', shape: 'class-box', label: 'B', compartments: []}],
    links: [{source: 'A', target: 'B', relation: 'whatever', draw: 'line', line: 'dashed', source_end: 'hollow-diamond', target_end: 'no-existe', doc: 'R1', label: 'x'}], skipped: []};
  const [edge] = buildScene(view).edges;
  assert.deepEqual([edge.sourceEnd, edge.targetEnd, edge.dash, edge.label], ['hollow-diamond', null, '6 4', 'x']);
});

test('lo que no se sabe dibujar se avisa y se dibuja como grafo/línea, sin descartarlo', () => {
  const view = {layout: {kind: 'axis'}, nodes: [{doc: 'A', shape: 'box', label: 'A'}, {doc: 'B', shape: 'box', label: 'B'}],
    links: [{source: 'A', target: 'B', draw: 'axis', order: 3, label: 'call()', doc: 'R'}], skipped: ['x']};
  const scene = sceneFor(view);
  assert.equal(scene.kind, 'graph');
  assert.equal(scene.edges.length, 1);
  assert.equal(scene.notices.length, 3);
});

test('carriles: uno por nodo en el orden de nodes, mensajes bajando por order', () => {
  const scene = sceneFor(sequence);
  assert.equal(scene.kind, 'lanes');
  assert.deepEqual(scene.notices, []);
  assert.deepEqual(scene.lanes.map(l => tail(l.id)), sequence.nodes.map(n => tail(n.doc)));
  assert.ok(scene.lanes.every((l, i) => i === 0 || l.x > scene.lanes[i - 1].x));
  assert.deepEqual(scene.messages.map(m => m.order), [...sequence.links].map(l => l.order).sort((a, b) => a - b));
  assert.ok(scene.messages.every((m, i) => i === 0 || m.y > scene.messages[i - 1].y), 'cada mensaje en su propia fila, más abajo');
  assert.ok(scene.messages.every(m => m.y > scene.lifelineTop && m.y < scene.height));
});

test('carriles: la autollamada es un bucle sobre su carril y ocupa su fila; los retornos traen su trazo', () => {
  const scene = laneScene(sequence);
  const self = scene.messages.filter(m => m.self);
  assert.equal(self.length, 1);
  assert.equal(tail(self[0].from), 'Loader');
  assert.equal(self[0].x1, self[0].x2);
  const returns = scene.messages.filter(m => m.relation === 'returns');
  assert.ok(returns.length && returns.every(m => m.dash === '6 4' && m.targetEnd === 'open-arrow'));
  const shuffled = {...sequence, links: [...sequence.links].reverse()};
  assert.deepEqual(laneScene(shuffled).messages.map(m => m.order), scene.messages.map(m => m.order), 'el orden sale de `order`, no del orden del JSON');
});

test('grilla: columnas por data.order agrupadas por vista, filas en preorden de nest', () => {
  const scene = sceneFor(matrix);
  assert.equal(scene.kind, 'grid');
  assert.deepEqual(scene.notices, []);
  assert.deepEqual(scene.grids.map(g => [g.view, g.label]), [['quotation', 'Quotation View']]);
  assert.deepEqual(scene.grids[0].columns.map(c => tail(c.id)), ['quotation__browse', 'quotation__client', 'quotation__basket', 'quotation__validation', 'quotation__completed']);
  assert.deepEqual(scene.rows.map(r => [tail(r.id), r.depth]), [['QuotationFlow', 0], ['Store', 1], ['Basket', 1], ['BasketItem', 2]]);
});

test('grilla: celda en la intersección fila × columna, filas vacías incluidas', () => {
  const scene = gridScene(matrix);
  const id = el => matrix.nodes.find(n => tail(n.doc) === el).doc;
  assert.deepEqual(scene.cells[cellKey(id('BasketItem'), id('quotation__validation'))], ['quotation']);
  assert.equal(scene.cells[cellKey(id('BasketItem'), id('quotation__browse'))], undefined);
  assert.equal(Object.keys(scene.cells).length, matrix.links.filter(l => l.draw === 'cell').length);
  const twoViews = {...matrix, nodes: [...matrix.nodes, {doc: 'S2', collection: 'stages', label: 'Otra', data: {view: 'b', view_label: 'B', order: 1}}]};
  const grids = gridScene(twoViews).grids;
  assert.deepEqual(grids.map(g => g.view), ['quotation', 'b']);
  assert.equal(gridScene(twoViews).rows.length, 4, 'las filas sin celdas en la vista b se dibujan igual');
});

test('grilla real de dos vistas: una tabla por vista, mismas filas en las dos', () => {
  assert.ok('fragments' in coverage && coverage.links.every(l => 'data' in l && 'source_label' in l), 'el fixture trae los campos nuevos');
  const scene = sceneFor(coverage);
  assert.deepEqual(scene.notices, [], 'fragments/data/source_label no rompen ni avisan');
  assert.deepEqual(scene.grids.map(g => [g.label, g.columns.length]), [['Render pipeline', 5], ['Store sync', 5]]);
  assert.equal(scene.rows.length, 12);
  assert.equal(scene.rows.filter(r => r.depth > 0).length, 9);
  assert.equal(Object.keys(scene.cells).length, 30);
  assert.ok(scene.grids.every(g => g.columns.every((c, i) => i === 0 || c.order >= g.columns[i - 1].order)));
});

test('una grilla sin columnas cae a grafo con aviso', () => {
  const scene = sceneFor({...matrix, nodes: matrix.nodes.filter(n => n.collection !== 'stages')});
  assert.equal(scene.kind, 'graph');
  assert.ok(scene.notices[0].includes('no tiene columnas'));
});

test('un ciclo de anidado se corta en vez de colgar el layout', () => {
  const view = {layout: {kind: 'graph'}, nodes: [{doc: 'A', shape: 'box', label: 'A'}, {doc: 'B', shape: 'box', label: 'B'}],
    links: [{source: 'A', target: 'B', draw: 'nest'}, {source: 'B', target: 'A', draw: 'nest'}], skipped: []};
  const scene = buildScene(view);
  assert.ok(scene.nodes.some(n => !n.parent));
  assert.ok(scene.notices.some(n => n.includes('ciclo')));
});

test('catálogo: SpecDoc agrupados por category, los sin categoría al final', () => {
  const doc = (id, payload) => ({id, model_name: 'SpecDoc', payload});
  const catalog = specCatalog([doc('s1', {category: 'Zeta', nav: 'B'}), doc('s2', {category: 'Zeta', nav: 'A'}),
    doc('s3', {title: 'Suelto'}), doc('s4', {category: 'Alfa', nav: 'C'}), {id: 'x', model_name: 'AtomDoc', payload: {}}]);
  assert.deepEqual(catalog.map(g => [g.category, g.specs.map(s => s.id)]), [['Alfa', ['s4']], ['Zeta', ['s2', 's1']], ['Sin categoría', ['s3']]]);
});

test('compartimentos: atributos y métodos de un spec de clases, una línea cada uno', () => {
  assert.equal(compartmentLine({name: 'id', type: 'str'}), 'id: str');
  assert.equal(compartmentLine({name: 'render', returns: 'str'}), 'render(): str');
  assert.equal(compartmentLine('literal'), 'literal');
  const [, h] = glyphSize({shape: 'class-box', label: 'C', compartments: [{path: 'data.attributes', items: [{name: 'a'}, {name: 'b'}]}]});
  assert.ok(h > glyphSize({shape: 'class-box', label: 'C', compartments: []})[1]);
});
