// Carriles por partición como capacidad genérica: una notación que no es la de actividad declara
// layout {kind: 'partition-lanes', by: <campo>} y se dibuja con una columna por valor del campo.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {buildScene} from '../frontends/mindmap/views/specs/notation/notation.mjs';
import {usesSwimlanes, absoluteBoxes} from '../frontends/mindmap/views/specs/notation/notation-layout.mjs';
import {swimlaneLayout} from '../frontends/mindmap/views/specs/notation/notation-swimlanes.mjs';

const measure = (text, size) => (text || '').length * size * 0.5;
const view = JSON.parse(readFileSync(new URL('./fixtures/notation-partition-lanes/view-components.json', import.meta.url)));

test('tres particiones por `by: layer` dan tres carriles titulados con el valor del campo', () => {
  const scene = buildScene(view);
  assert.deepEqual(scene.lanes.map(l => l.name), ['Presentación', 'Lógica', 'Datos']);
  assert.ok(scene.lanes.every(l => l.glyph.lines?.length || l.glyph.label || l.name));
  assert.equal(scene.nodes.find(n => n.id === 'C.svc').lane, scene.lanes[1].id);
  assert.ok(!scene.notices.some(n => n.includes('todavía no está soportado')));
  assert.ok(usesSwimlanes(scene));
});

test('cada nodo queda dentro de la columna de su partición, columnas lado a lado', () => {
  const layout = swimlaneLayout(buildScene(view), {measure, wrapWidth: 170});
  const abs = absoluteBoxes(layout);
  const lanes = buildScene(view).lanes.map(l => abs.get(l.id));
  lanes.slice(1).forEach((l, i) => assert.ok(lanes[i].x + lanes[i].width <= l.x));
  for (const [id, i] of [['C.web', 0], ['C.api', 1], ['C.svc', 1], ['C.db', 2]]) {
    const b = abs.get(id), l = lanes[i];
    assert.ok(b.x >= l.x && b.x + b.width <= l.x + l.width, id);
  }
});

test('otro campo en `by` reparte distinto; sin `by` el campo es `partition` (actividad)', () => {
  const other = buildScene({...view, layout: {kind: 'partition-lanes', by: 'team'},
    nodes: view.nodes.map((n, i) => ({...n, data: {team: i < 1 ? 'A' : 'B'}}))});
  assert.deepEqual(other.lanes.map(l => l.name), ['A', 'B']);
  const legacy = buildScene({...view, layout: {kind: 'graph'}, nodes: view.nodes.map(n => ({...n, data: {partition: n.data.layer}}))});
  assert.deepEqual(legacy.lanes.map(l => l.name), ['Presentación', 'Lógica', 'Datos']);
});

test('la carpeta notation/ no ramifica por nombre de notación ni por tipo de diagrama de carriles', () => {
  const dir = new URL('../frontends/mindmap/views/specs/notation/', import.meta.url);
  for (const f of readdirSync(dir).filter(f => /\.(mjs|js)$/.test(f))) {
    const src = readFileSync(new URL(f, dir), 'utf8');
    assert.ok(!/(notation|diagramType|diagram_type)\s*(===|!==|==)\s*'activity'/.test(src), f);
    assert.ok(!/'activity'\s*(===|!==)\s*(view|scene)/.test(src), f);
  }
});
