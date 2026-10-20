// Layout propio de despliegues (notation-deployment.mjs, issue R8): rangos de flujo entre hermanos,
// empaque anidado y ruteo ortogonal; lógica pura, sin ELK.
import test from 'node:test';
import assert from 'node:assert/strict';
import {siblingRanks, deploymentLayout} from '../frontends/mindmap/views/specs/notation/notation-deployment.mjs';
import {layoutIssues, absoluteBoxes, labelsOnNodes} from '../frontends/mindmap/views/specs/notation/notation-layout.mjs';

const measure = (text, size) => (text || '').length * size * 0.5;
const node = (id, parent = null, label = id) => ({id, parent, glyph: {shape: 'node-box', label, keyword: ''}});
// cliente -> (cuenta > red > {a, b}) y un externo en la cuenta; aristas de afuera hacia adentro.
const scene = {direction: 'LR', diagramType: 'deployment',
  nodes: [node('client'), node('account'), node('net', 'account'), node('a', 'net', 'service a'), node('b', 'net', 'service b'), node('ext', 'account', 'provider')],
  edges: [{id: 'c-a', source: 'client', target: 'a', label: 'HTTPS'}, {id: 'a-b', source: 'a', target: 'b', label: 'jobs'}, {id: 'b-ext', source: 'b', target: 'ext', label: 'SDK'}]};

test('siblingRanks: una arista ordena a los hermanos que separa, en el nivel de su ancestro común', () => {
  const {rank, kids, edgePair} = siblingRanks(scene);
  assert.deepEqual(kids.get(''), ['client', 'account']);
  assert.ok(rank.get('client') < rank.get('account'));
  assert.ok(rank.get('net') < rank.get('ext'));
  assert.ok(rank.get('a') < rank.get('b'));
  assert.equal(edgePair.get('c-a'), 'account|client');
  assert.equal(edgePair.get('a-b'), 'a|b');
});

test('deploymentLayout: cada hijo dentro de su contenedor, de afuera hacia adentro, con rutas ortogonales', () => {
  const layout = deploymentLayout(scene, {measure, canvas: {width: 1200, height: 800}, issues: layoutIssues});
  assert.equal(layout.engine, 'deployment');
  const abs = absoluteBoxes(layout);
  for (const [child, parent] of [['net', 'account'], ['a', 'net'], ['b', 'net'], ['ext', 'account']]) {
    const c = abs.get(child), p = abs.get(parent);
    assert.ok(c.x >= p.x && c.y >= p.y && c.x + c.width <= p.x + p.width && c.y + c.height <= p.y + p.height, child);
  }
  assert.ok(abs.get('client').x + abs.get('client').width <= abs.get('account').x, 'el cliente a la izquierda de la cuenta');
  // Ningún título tocado: el contenedor es más ancho que su título más el padding.
  for (const n of layout.nodes.filter(m => m.container)) assert.ok(n.header.x >= 14 && n.header.x + n.header.width <= n.width - 14, n.id);
  const issues = layoutIssues(layout);
  assert.equal(issues.total, 0, JSON.stringify(issues));
  assert.deepEqual(labelsOnNodes(layout), []);
  assert.ok(!layout.unrouted);
});
