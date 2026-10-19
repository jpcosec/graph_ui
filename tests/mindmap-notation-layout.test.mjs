// Layout de la vista Specs (notation-layout.mjs): tamaños desde el texto, contenedores, grilla,
// grafo ELK y elección del candidato. ELK real se prueba en el e2e; aquí uno falso alcanza para la
// elección, y lo demás es lógica pura.
import test from 'node:test';
import assert from 'node:assert/strict';
import {buildScene} from '../frontends/mindmap/views/specs/notation/notation.mjs';
import {wrapText, sizeGlyph, containerHeader, edgeLabelBox, gridEdges, elkGraph, fromElk, bestLayout, fitZoom, legibleZoom,
  approximateMeasure, DIAMOND_RATIO, GRID_MIN, FONT, MIN_TEXT_PX} from '../frontends/mindmap/views/specs/notation/notation-layout.mjs';

const measure = (text, size) => (text || '').length * size * 0.5;

test('wrapText corta en palabras sin pasar del ancho, y parte una palabra demasiado larga', () => {
  const lines = wrapText('uno dos tres cuatro cinco seis', 60, 10, measure);
  assert.ok(lines.length > 1);
  assert.ok(lines.every(l => measure(l, 10) <= 60), lines);
  assert.equal(lines.join(' '), 'uno dos tres cuatro cinco seis');
  const long = wrapText('deploy/environments/dev/basic/servicios.yaml', 80, 10, measure);
  assert.ok(long.length > 1 && long.every(l => measure(l, 10) <= 80));
  assert.deepEqual(wrapText('', 80, 10, measure), ['']);
});

test('G4: una caja crece con su rótulo, a lo alto cuando el rótulo se corta', () => {
  const short = sizeGlyph({shape: 'box', label: 'S3'}, {measure, wrapWidth: 200});
  const long = sizeGlyph({shape: 'box', label: 'imagen runtime · antonia runtime (+ffmpeg) con un rótulo bastante largo'}, {measure, wrapWidth: 200});
  assert.ok(long.lines.length > 1);
  assert.ok(long.height > short.height);
  assert.ok(long.width <= 200 + 2 * 14 + 1, long.width);
  const keyword = sizeGlyph({shape: 'box', label: 'S3', keyword: '«device»'}, {measure, wrapWidth: 200});
  assert.ok(keyword.height > short.height);
});

test('G6: el rombo de una decisión contiene su rótulo', () => {
  const size = sizeGlyph({shape: 'diamond', label: '¿El plan es el esperado y está aprobado?'}, {measure, wrapWidth: 200});
  const textWidth = Math.max(...size.lines.map(l => measure(l, FONT.small)));
  const textHeight = size.lines.length * Math.ceil(FONT.small * FONT.line);
  // Un rectángulo w×h cabe en un rombo de semiejes a, b si w/(2a) + h/(2b) <= 1.
  assert.ok(textWidth / size.width + textHeight / size.height <= 1, size);
  assert.ok(Math.abs(size.width / size.height - DIAMOND_RATIO) < 0.1);
});

test('un pseudoestado tiene tamaño fijo y su rótulo va fuera, para que ELK le reserve sitio', () => {
  const start = sizeGlyph({shape: 'filled-circle', label: 'inicio del flujo'}, {measure});
  assert.deepEqual([start.width, start.height], [22, 22]);
  assert.ok(start.outside && start.outside.lines.length >= 1);
  assert.equal(sizeGlyph({shape: 'bullseye', label: ''}, {measure}).outside, null);
});

test('G2/G5: la cabecera del contenedor y el rótulo de arista tienen caja propia', () => {
  const head = containerHeader({label: 'Superficie 2 · «abstract» Satélite', keyword: '«component»'}, {measure, wrapWidth: 120});
  assert.ok(head.lines.length > 1 && head.height > 30);
  assert.equal(edgeLabelBox('', {measure}), null);
  const box = edgeLabelBox('HTTPS /basic/webhooks/*, /basic/demo/*, /basic/api/health', {measure, wrapWidth: 100});
  assert.ok(box.lines.length > 1 && box.width <= 100 + 8 + 1);
});

const nest = (parent, child) => ({source: parent, target: child, draw: 'nest', relation: 'contains'});
const line = (s, t, label = '') => ({source: s, target: t, draw: 'line', relation: 'uses', label});

function containerView(children, inner = []) {
  return {layout: {kind: 'graph', direction: 'TB'},
    nodes: [{doc: 'C', shape: 'rounded-box', label: 'Contenedor'}, {doc: 'X', shape: 'box', label: 'X'},
      ...children.map(id => ({doc: id, shape: 'box', label: id}))],
    links: [...children.map(id => nest('C', id)), ...inner, line('X', children[0], 'entra')]};
}

test('G3: los hijos sueltos de un contenedor se apilan en filas con aristas invisibles', () => {
  const kids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
  const scene = buildScene(containerView(kids));
  const edges = gridEdges(scene);
  assert.ok(edges.length > 0 && edges.every(e => e.id.startsWith('grid:')));
  // 9 hijos -> 3 columnas: cada arista baja una fila.
  assert.deepEqual(edges.map(e => [e.sources[0], e.targets[0]]).slice(0, 2), [['a', 'd'], ['b', 'e']]);
  assert.equal(gridEdges(buildScene(containerView(kids.slice(0, GRID_MIN - 1)))).length, 0);
  // Hijos que ya se conectan entre sí dentro del contenedor no se tocan.
  const chained = buildScene(containerView(kids, kids.slice(1).map((k, i) => line(kids[i], k))));
  assert.equal(gridEdges(chained).length, 0);
});

test('elkGraph: jerarquía, cabecera como padding, rótulos medidos y grilla', () => {
  const scene = buildScene(containerView(['a', 'b', 'c', 'd', 'e']));
  const {graph, sizes, labels} = elkGraph(scene, {measure, wrapWidth: 170});
  assert.equal(graph.layoutOptions['elk.hierarchyHandling'], 'INCLUDE_CHILDREN');
  const container = graph.children.find(c => c.id === 'C');
  assert.equal(container.children.length, 5);
  assert.match(container.layoutOptions['elk.padding'], new RegExp(`top=${sizes.get('C').header.height + 6}`));
  const entering = graph.edges.find(e => e.sources[0] === 'X');
  assert.equal(entering.labels[0].text, 'entra');
  assert.ok(labels.get(entering.id).width > 0);
  assert.ok(graph.edges.some(e => e.id.startsWith('grid:')));
});

test('fromElk: posiciones relativas al padre, recorrido de aristas y caja del rótulo; sin aristas de grilla', () => {
  const scene = buildScene(containerView(['a', 'b', 'c', 'd']));
  const built = elkGraph(scene, {measure});
  const edge = built.graph.edges.find(e => e.sources[0] === 'X');
  const result = {width: 500, height: 400, children: [
    {id: 'C', x: 10, y: 20, width: 300, height: 200, children: ['a', 'b', 'c', 'd'].map((id, i) => ({id, x: 10 + i * 60, y: 50, width: 50, height: 30}))},
    {id: 'X', x: 400, y: 20, width: 60, height: 30}],
    edges: [{id: edge.id, sections: [{startPoint: {x: 430, y: 50}, bendPoints: [{x: 430, y: 100}], endPoint: {x: 45, y: 120}}],
      labels: [{x: 300, y: 90, width: 40, height: 16}]},
      {id: 'grid:a>d', sections: [{startPoint: {x: 0, y: 0}, endPoint: {x: 1, y: 1}}]}]};
  const layout = fromElk(result, scene, built);
  const a = layout.nodes.find(n => n.id === 'a');
  assert.deepEqual([a.parent, a.x, a.y, a.depth], ['C', 10, 50, 1]);
  assert.ok(layout.nodes.find(n => n.id === 'C').container);
  assert.equal(layout.edges.length, 1);
  assert.deepEqual(layout.edges[0].points.map(p => [p.x, p.y]), [[430, 50], [430, 100], [45, 120]]);
  assert.deepEqual(layout.edges[0].labelBox.lines, ['entra']);
});

test('bestLayout: prefiere el orden del spec mientras se lea; si no, el que mejor cabe', async () => {
  const scene = buildScene(containerView(['a', 'b', 'c', 'd']));
  const sized = (w, h) => ({width: w, height: h, children: [], edges: []});
  const canvas = {width: 1000, height: 800};
  // ELK falso: el tamaño depende de si el candidato pide el orden del modelo.
  const fake = big => ({layout: async graph => (graph.layoutOptions['elk.layered.cycleBreaking.strategy'] === 'MODEL_ORDER' ? sized(big, big) : sized(700, 500))});
  const legible = await bestLayout(fake(700), scene, {measure, canvas});
  assert.ok(legible.candidate.ordered && legible.zoom >= legibleZoom);
  const cramped = await bestLayout(fake(4000), scene, {measure, canvas});
  assert.equal(cramped.candidate.ordered, false);
  assert.ok(Math.abs(cramped.zoom - fitZoom({width: 700, height: 500}, canvas)) < 1e-9);
  assert.equal(MIN_TEXT_PX, 10);
  assert.ok(approximateMeasure('abc', 10) > 0);
});
