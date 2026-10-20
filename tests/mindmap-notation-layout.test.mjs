// Layout de la vista Specs (notation-layout.mjs): tamaños desde el texto, contenedores, grilla,
// grafo ELK y elección del candidato. ELK real se prueba en el e2e; aquí uno falso alcanza para la
// elección, y lo demás es lógica pura.
import test from 'node:test';
import assert from 'node:assert/strict';
import {buildScene} from '../frontends/mindmap/views/specs/notation/notation.mjs';
import {wrapText, sizeGlyph, containerHeader, edgeLabelBox, gridEdges, elkGraph, fromElk, bestLayout, fitZoom, legibleZoom,
  approximateMeasure, DIAMOND_RATIO, GRID_MIN, FONT, MIN_TEXT_PX, headerId, diamondPorts, routeOf, placeLabels, layoutIssues,
  LABEL_MAX_DISTANCE, LABEL_MARGIN, labelsOnNodes} from '../frontends/mindmap/views/specs/notation/notation-layout.mjs';

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

test('elkGraph: jerarquía, título como nodo (vertical) o como padding (horizontal), rótulos medidos y grilla', () => {
  const scene = buildScene(containerView(['a', 'b', 'c', 'd', 'e']));
  const {graph, sizes, labels} = elkGraph(scene, {measure, wrapWidth: 170});
  assert.equal(graph.layoutOptions['elk.hierarchyHandling'], 'INCLUDE_CHILDREN');
  const container = graph.children.find(c => c.id === 'C');
  // R5: en vertical el título es un nodo de la primera capa, así ELK rutea las aristas alrededor.
  const title = container.children.find(c => c.id === headerId('C'));
  assert.equal(title.layoutOptions['elk.layered.layering.layerConstraint'], 'FIRST');
  assert.equal(title.height, sizes.get('C').header.height);
  assert.equal(container.children.length, 6);
  const sideways = elkGraph({...scene, direction: 'LR'}, {measure, wrapWidth: 170});
  const lrContainer = sideways.graph.children.find(c => c.id === 'C');
  assert.equal(lrContainer.children.length, 5);
  assert.match(lrContainer.layoutOptions['elk.padding'], new RegExp(`top=${sideways.sizes.get('C').header.height + 6}`));
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
  result.children[0].children.unshift({id: headerId('C'), x: 10, y: 4, width: 120, height: 30});
  const layout = fromElk(result, scene, built);
  assert.deepEqual([layout.nodes.find(n => n.id === 'C').header.x, layout.nodes.find(n => n.id === 'C').header.y], [10, 4]);
  const a = layout.nodes.find(n => n.id === 'a');
  assert.deepEqual([a.parent, a.x, a.y, a.depth], ['C', 10, 50, 1]);
  assert.ok(layout.nodes.find(n => n.id === 'C').container);
  assert.equal(layout.edges.length, 1);
  assert.deepEqual(layout.edges[0].points.map(p => [p.x, p.y]), [[430, 50], [430, 100], [45, 120]]);
  assert.deepEqual(layout.edges[0].labelBox.lines, ['entra']);
});

const flowView = {layout: {kind: 'graph', direction: 'TB'},
  nodes: [{doc: 'i', shape: 'filled-circle', label: ''}, {doc: 'q', shape: 'diamond', label: '¿Sí?'}, {doc: 'y', shape: 'box', label: 'Y'},
    {doc: 'n', shape: 'box', label: 'N'}, {doc: 'f', shape: 'bullseye', label: ''}],
  links: [line('i', 'q'), line('q', 'y', '[sí]'), line('q', 'n', '[no]'), line('y', 'f'), line('n', 'q')]};

test('R1/R2: el inicial va a la primera capa y el final a la última; las ramas de un rombo usan sus vértices', () => {
  const scene = buildScene(flowView);
  const {graph} = elkGraph(scene, {measure});
  const node = id => graph.children.find(c => c.id === id);
  assert.equal(node('i').layoutOptions['elk.layered.layering.layerConstraint'], 'FIRST');
  assert.equal(node('f').layoutOptions['elk.layered.layering.layerConstraint'], 'LAST');
  assert.deepEqual(node('q').ports.map(p => p.id), ['q#N', 'q#E', 'q#S', 'q#W']);
  const S = node('q').ports.find(p => p.id === 'q#S');
  assert.deepEqual([S.x, S.y], [node('q').width / 2, node('q').height]);
  const ports = diamondPorts(scene, 'TB');
  const byLabel = Object.fromEntries(scene.edges.map(e => [e.label || `${e.source}>${e.target}`, e]));
  assert.equal(ports.get(`${byLabel['i>q'].id}>target`), 'q#N');
  assert.equal(ports.get(`${byLabel['[sí]'].id}>source`), 'q#S');
  assert.equal(ports.get(`${byLabel['[no]'].id}>source`), 'q#E');
  assert.equal(diamondPorts(scene, 'LR').get(`${byLabel['i>q'].id}>target`), 'q#W');
});

test('routeOf sigue las secciones en el orden en que se conectan', () => {
  const sections = [{id: 's1', incomingSections: ['s0'], startPoint: {x: 5, y: 0}, endPoint: {x: 5, y: 9}},
    {id: 's0', outgoingSections: ['s1'], startPoint: {x: 0, y: 0}, bendPoints: [{x: 5, y: 0}], endPoint: {x: 5, y: 0}}];
  assert.deepEqual(routeOf(sections).map(p => [p.x, p.y]), [[0, 0], [5, 0], [5, 0], [5, 9]]);
});

function plainLayout(edges, nodes) {
  return {width: 400, height: 400, nodes: nodes.map(([id, x, y, w, h, extra = {}]) => ({id, parent: null, x, y, width: w, height: h, container: false, glyph: {}, ...extra})), edges};
}

test('R3: placeLabels deja cada rótulo pegado a un tramo de su arista, sin pisar nodos ni otros rótulos', () => {
  const layout = plainLayout([
    {id: 'e1', source: 'A', target: 'B', points: [{x: 50, y: 40}, {x: 50, y: 200}], labelSize: {width: 40, height: 16, lines: ['[sí]']}},
    {id: 'e2', source: 'A', target: 'C', points: [{x: 60, y: 40}, {x: 60, y: 200}], labelSize: {width: 40, height: 16, lines: ['[no]']}},
  ], [['A', 30, 0, 60, 40], ['B', 30, 200, 60, 40], ['C', 90, 200, 60, 40]]);
  placeLabels(layout);
  const [l1, l2] = layout.edges.map(e => e.labelBox);
  assert.ok(Math.abs(l1.x - 54) < 1 || Math.abs(l1.x + l1.width - 46) < 1, l1);
  assert.ok(!(l1.x < l2.x + l2.width && l2.x < l1.x + l1.width && l1.y < l2.y + l2.height && l2.y < l1.y + l1.height), [l1, l2]);
  assert.equal(layoutIssues(layout).farLabels, 0);
});

test('layoutIssues: arista diagonal o con un extremo al aire, rótulo lejos y arista sobre un encabezado', () => {
  const nodes = [['A', 0, 0, 40, 40], ['B', 200, 200, 40, 40]];
  const good = plainLayout([{id: 'e', source: 'A', target: 'B', points: [{x: 20, y: 40}, {x: 20, y: 120}, {x: 220, y: 120}, {x: 220, y: 200}]}], nodes);
  assert.equal(layoutIssues(good).total, 0);
  assert.equal(layoutIssues(plainLayout([{id: 'e', source: 'A', target: 'B', points: [{x: 20, y: 40}, {x: 220, y: 200}]}], nodes)).broken, 1);
  assert.equal(layoutIssues(plainLayout([{id: 'e', source: 'A', target: 'B', points: [{x: 20, y: 40}, {x: 20, y: 120}, {x: 220, y: 120}, {x: 220, y: 150}]}], nodes)).broken, 1);
  const far = plainLayout([{...good.edges[0], labelBox: {x: 100, y: 120 + LABEL_MAX_DISTANCE + 10, width: 30, height: 14}}], nodes);
  assert.equal(layoutIssues(far).farLabels, 1);
  const withHeader = plainLayout(good.edges, [...nodes, ['K', 0, 100, 300, 60, {container: true, header: {x: 10, y: 10, width: 150, height: 30}}]]);
  assert.equal(layoutIssues(withHeader).headerCrossings, 1);
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


test('R6: con dos ramas paralelas, cada guarda va a la salida de su vértice y más cerca de su rama que de la otra', () => {
  // Rombo Q (100..180 x 0..40): [no] sale por E y sube por x=200; [sí] sale por S y corre por x=212.
  const no = {id: 'no', source: 'Q', target: 'A', points: [{x: 180, y: 20}, {x: 200, y: 20}, {x: 200, y: 300}],
    labelSize: {width: 30, height: 16, lines: ['[no]']}};
  const yes = {id: 'si', source: 'Q', target: 'B', points: [{x: 140, y: 40}, {x: 140, y: 60}, {x: 212, y: 60}, {x: 212, y: 300}],
    labelSize: {width: 30, height: 16, lines: ['[sí]']}};
  const layout = plainLayout([no, yes], [['Q', 100, 0, 80, 40, {glyph: {shape: 'diamond'}}], ['A', 170, 300, 60, 30], ['B', 190, 330, 60, 30]]);
  placeLabels(layout);
  // Distancia de una caja a una polilínea ortogonal, muestreada cada 1 px.
  const near = (box, pts) => Math.min(...pts.slice(1).flatMap((b, i) => {
    const a = pts[i], n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y)));
    return Array.from({length: n + 1}, (_, k) => {
      const x = a.x + (b.x - a.x) * k / n, y = a.y + (b.y - a.y) * k / n;
      return Math.hypot(Math.max(box.x - x, 0, x - box.x - box.width), Math.max(box.y - y, 0, y - box.y - box.height));
    });
  }));
  for (const [edge, other] of [[no, yes], [yes, no]]) {
    const box = edge.labelBox;
    assert.ok(near(box, other.points) >= near(box, edge.points) + LABEL_MARGIN, [edge.id, box]);
    // En el primer tramo, junto al vértice por donde sale.
    const [a] = edge.points;
    assert.ok(Math.hypot(box.x + box.width / 2 - a.x, box.y + box.height / 2 - a.y) < 60, [edge.id, box]);
  }
  assert.equal(layoutIssues(layout).ambiguousGuards, 0);
});

test('§14: una nota de un paso es un nodo derivado justo después de él, unido por una línea punteada sin punta', () => {
  const view = {notation: 'activity', layout: {kind: 'graph', direction: 'TB'},
    nodes: [{doc: 'S.a', label: 'a', shape: 'rounded-box', data: {notes: 'una nota'}}, {doc: 'S.b', label: 'b', shape: 'rounded-box', data: {}}],
    links: [{doc: 'R.ab', source: 'S.a', target: 'S.b', relation: 'next', draw: 'line', line: 'solid', target_end: 'open-arrow'}]};
  const scene = buildScene(view);
  assert.deepEqual(scene.nodes.map(n => n.id), ['S.a', 'S.a#note', 'S.b']);
  const note = scene.nodes[1].glyph;
  assert.equal(note.shape, 'note');
  assert.equal(note.function, 'note');
  assert.equal(note.label, 'una nota');
  const link = scene.edges.find(e => e.target === 'S.a#note');
  assert.equal(link.source, 'S.a');
  assert.equal(link.dash, '2 3');
  assert.equal(link.targetEnd, null);
  assert.equal(link.sourceEnd, null);
});

test('elkGraph reserva sitio a los rótulos de arista que se le piden (todos, ninguno o un conjunto)', () => {
  const scene = {direction: 'LR', diagramType: 'deployment', nodes: [{id: 'a', glyph: {shape: 'box', label: 'a'}}, {id: 'b', glyph: {shape: 'box', label: 'b'}}, {id: 'c', glyph: {shape: 'box', label: 'c'}}],
    edges: [{id: 'ab', source: 'a', target: 'b', label: 'HTTPS'}, {id: 'bc', source: 'b', target: 'c', label: 'Postgres'}]};
  const labelled = opts => elkGraph(scene, {measure, ...opts}).graph.edges.filter(e => e.labels?.length).map(e => e.id);
  assert.deepEqual(labelled({}), ['ab', 'bc']);
  assert.deepEqual(labelled({reserveLabels: false}), []);
  assert.deepEqual(labelled({reserveLabels: new Set(['bc'])}), ['bc']);
  // Sin reserva, el tamaño del rótulo se sigue midiendo para que placeLabels lo coloque.
  assert.equal(elkGraph(scene, {measure, reserveLabels: false}).labels.size, 2);
});

test('labelsOnNodes: un rótulo encima de un nodo o del encabezado de un contenedor cuenta como problema', () => {
  const layout = {width: 400, height: 200,
    nodes: [{id: 'k', parent: null, x: 0, y: 0, width: 200, height: 120, container: true, header: {x: 0, y: 0, width: 200, height: 24}, glyph: {shape: 'node-box'}},
            {id: 'a', parent: 'k', x: 10, y: 40, width: 80, height: 40, container: false, glyph: {shape: 'box'}},
            {id: 'b', parent: null, x: 300, y: 40, width: 80, height: 40, container: false, glyph: {shape: 'box'}}],
    edges: [{id: 'onNode', source: 'a', target: 'b', points: [{x: 90, y: 60}, {x: 300, y: 60}], labelBox: {x: 20, y: 50, width: 40, height: 14}},
            {id: 'onHead', source: 'a', target: 'b', points: [{x: 90, y: 60}, {x: 300, y: 60}], labelBox: {x: 100, y: 4, width: 40, height: 14}},
            {id: 'free', source: 'a', target: 'b', points: [{x: 90, y: 60}, {x: 300, y: 60}], labelBox: {x: 220, y: 44, width: 40, height: 14}}]};
  assert.deepEqual(labelsOnNodes(layout).sort(), ['onHead', 'onNode']);
  assert.equal(layoutIssues(layout).labelsOnNodes, 2);
});

test('buildScene lleva el tipo de diagrama (un despliegue no sigue el orden del spec)', () => {
  assert.equal(buildScene({diagram_type: 'deployment', layout: {kind: 'graph'}, nodes: [], links: []}).diagramType, 'deployment');
});
