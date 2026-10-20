// Carriles UML de una activity (notation-swimlanes.mjs): filas por el flujo, una columna por
// partición y ruteo ortogonal; lógica pura, sin ELK.
import test from 'node:test';
import assert from 'node:assert/strict';
import {buildScene} from '../frontends/mindmap/views/specs/notation/notation.mjs';
import {usesSwimlanes, layoutIssues, absoluteBoxes} from '../frontends/mindmap/views/specs/notation/notation-layout.mjs';
import {flowRanks, swimlaneLayout} from '../frontends/mindmap/views/specs/notation/notation-swimlanes.mjs';

const measure = (text, size) => (text || '').length * size * 0.5;
const step = (id, partition, extra = {}) => ({doc: `S.${id}`, label: id, shape: 'rounded-box', data: partition ? {partition, ...extra} : extra});
const flow = (a, b, order, label = '') => ({doc: `R.${a}-${b}`, source: `S.${a}`, target: `S.${b}`, relation: 'next', draw: 'line', line: 'solid', target_end: 'open-arrow', order, label});
const view = {spec: 'SpecDoc:S', notation: 'activity', layout: {kind: 'graph', direction: 'TB'},
  nodes: [step('a', 'Uno'), step('b', 'Dos', {notes: 'una nota'}), {...step('d', 'Dos'), shape: 'diamond', label: '¿ok?'}, step('c', 'Uno'),
    {doc: 'S.start', label: '', shape: 'filled-circle', data: {initial: true}}, {doc: 'S.end', label: '', shape: 'bullseye', data: {final: true}}],
  links: [flow('start', 'a', 1), flow('a', 'b', 2), flow('b', 'd', 3), flow('d', 'c', 4, '[sí]'), flow('d', 'a', 5, '[no]'), flow('c', 'end', 6)]};

test('§14: una partición es un carril de la escena, en orden de aparición; sin partición no hay carriles', () => {
  const scene = buildScene(view);
  assert.deepEqual(scene.lanes.map(l => l.name), ['Uno', 'Dos']);
  assert.equal(scene.nodes.find(n => n.id === 'S.b').lane, 'S#partition:1');
  assert.equal(scene.nodes.find(n => n.id === 'S.b#note').lane, 'S#partition:1');
  assert.equal(scene.nodes.find(n => n.id === 'S.start').lane, null);
  assert.ok(usesSwimlanes(scene));
  const plain = buildScene({...view, nodes: view.nodes.map(n => ({...n, data: {}}))});
  assert.deepEqual(plain.lanes, []);
  assert.ok(!usesSwimlanes(plain));
});

test('flowRanks: el rango es el camino más largo desde el inicio; la vuelta a un paso abierto es un bucle', () => {
  const scene = buildScene(view);
  const {rank, back} = flowRanks(scene.nodes.filter(n => n.glyph.function !== 'note'), scene.edges.filter(e => !e.note));
  assert.deepEqual(['S.start', 'S.a', 'S.b', 'S.d', 'S.c', 'S.end'].map(id => rank.get(id)), [0, 1, 2, 3, 4, 5]);
  assert.deepEqual([...back], ['R.d-a']);
});

test('swimlaneLayout: cada paso en la columna de su carril, el flujo baja, la nota a su lado y rutas ortogonales', () => {
  const layout = swimlaneLayout(buildScene(view), {measure, wrapWidth: 170});
  const abs = absoluteBoxes(layout);
  const [uno, dos] = ['S#partition:0', 'S#partition:1'].map(id => abs.get(id));
  assert.ok(uno.x + uno.width <= dos.x, 'carriles lado a lado, en orden');
  for (const [id, lane] of [['S.a', uno], ['S.c', uno], ['S.b', dos], ['S.d', dos], ['S.b#note', dos]]) {
    const b = abs.get(id);
    assert.ok(b.x >= lane.x && b.x + b.width <= lane.x + lane.width, id);
  }
  // El inicio y el fin, sin partición, van en la columna de su vecino y sin padre.
  assert.equal(layout.nodes.find(n => n.id === 'S.start').parent, null);
  assert.ok(abs.get('S.start').x >= uno.x && abs.get('S.start').x <= uno.x + uno.width);
  const order = ['S.start', 'S.a', 'S.b', 'S.d', 'S.c', 'S.end'].map(id => abs.get(id));
  order.slice(1).forEach((b, i) => assert.ok(b.y >= order[i].y + order[i].height, i));
  const note = abs.get('S.b#note'), b = abs.get('S.b');
  assert.ok(note.x >= b.x + b.width && Math.abs(note.y + note.height / 2 - (b.y + b.height / 2)) < 1);
  assert.equal(layoutIssues(layout).total, 0, JSON.stringify(layoutIssues(layout)));
  // El bucle [no] sale del rombo por un costado y sube por el pasillo del carril.
  const loop = layout.edges.find(e => e.id === 'R.d-a');
  const d = abs.get('S.d');
  assert.ok(Math.abs(loop.points[0].y - (d.y + d.height / 2)) < 0.5, loop.points);
  assert.ok(loop.points.at(-1).y <= abs.get('S.a').y + abs.get('S.a').height, loop.points);
});
