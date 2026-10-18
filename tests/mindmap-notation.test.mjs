// Lógica pura de la vista de notación (views/specs/notation/notation.mjs).
// El fixture es la salida REAL de `spec2viz notation view` sobre el piloto
// state.diagram-sync-lifecycle (estado compuesto + transición que sale de él):
//   spec2viz diagram sync state-diagram-sync-lifecycle.yml --store .sldb
//   spec2viz notation view state.diagram-sync-lifecycle --store .sldb
// La paridad viva endpoint = resolve_view la fija tests/test_mindmap_notation.py.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {specCatalog, buildScene, byDepth, compartmentLine, glyphSize} from '../frontends/mindmap/views/specs/notation/notation.mjs';

const statechart = JSON.parse(readFileSync(new URL('./fixtures/notation-view-statechart.json', import.meta.url)));
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
  const view = {layout: {kind: 'lanes'}, nodes: [{doc: 'A', shape: 'lifeline', label: 'A'}, {doc: 'B', shape: 'lifeline', label: 'B'}],
    links: [{source: 'A', target: 'B', draw: 'cell', order: 3, label: 'call()', doc: 'R'}], skipped: ['x']};
  const scene = buildScene(view);
  assert.equal(scene.edges.length, 1);
  assert.equal(scene.edges[0].label, '3. call()', 'en carriles el orden es el tiempo y se muestra');
  assert.equal(scene.notices.length, 3);
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
