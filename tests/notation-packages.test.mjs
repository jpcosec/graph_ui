// Paquetes UML en la vista Specs: un spec class con data.packages, resuelto por sldb de verdad
// (`sldb notations sync` + `sldb notations view` sobre un store temporal con
// tests/fixtures/notation-packages/class.packages.yml, copia literal del fixture de sldb), se arma como
// contenedores anidados (buildScene), su layout reserva la cabecera de cada paquete (elkGraph) y el
// contorno de carpeta envuelve la caja entera con la pestaña en esa cabecera (containerOutline).
// La geometría con ELK real y el navegador la prueba tests/e2e_notation_class.py.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, copyFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildScene} from '../frontends/mindmap/views/specs/notation/notation.mjs';
import {elkGraph, containerHeader, headerId, approximateMeasure} from '../frontends/mindmap/views/specs/notation/notation-layout.mjs';
import {containerOutline} from '../frontends/mindmap/views/specs/notation/notation-style.mjs';

const FIXTURE = fileURLToPath(new URL('./fixtures/notation-packages/class.packages.yml', import.meta.url));
const SPEC = 'class.packages';
const doc = name => `SpecNodeDoc:${SPEC}.${name}`;
// Lo que declara el fixture: core > billing > Invoice, Payment; core > identity > User; shared > AuditLog.
const CONTAINS = {core: ['billing', 'identity'], billing: ['Invoice', 'Payment'], identity: ['User'], shared: ['AuditLog']};

function sldb(args, cwd) {
  const run = spawnSync('sldb', args, {cwd, encoding: 'utf8'});
  assert.ok(!run.error, `sldb no está disponible: ${run.error}`);
  assert.equal(run.status, 0, `sldb ${args.join(' ')}: ${run.stderr}`);
  return run.stdout;
}

function resolvedView() {
  const root = mkdtempSync(join(tmpdir(), 'notation-packages-'));
  try {
    copyFileSync(FIXTURE, join(root, 'class.packages.yml'));
    sldb(['stores', 'init', '--path', root], root);
    sldb(['notations', 'sync', '--spec', 'class.packages.yml', '--store', '.sldb'], root);
    return JSON.parse(sldb(['notations', 'view', SPEC, '--store', '.sldb'], root));
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
}

const view = resolvedView();

test('buildScene: cada paquete es contenedor de lo que declara, a dos niveles, y las clases son hojas', () => {
  const scene = buildScene(view);
  const byId = new Map(scene.nodes.map(n => [n.id, n]));
  for (const [pkg, kids] of Object.entries(CONTAINS)) {
    const node = byId.get(doc(pkg));
    assert.ok(node, pkg);
    assert.equal(node.glyph.shape, 'package');
    assert.equal(node.container, true, pkg);
    for (const kid of kids) assert.equal(byId.get(doc(kid)).parent, doc(pkg), kid);
  }
  assert.equal(byId.get(doc('core')).parent, null);
  assert.equal(byId.get(doc('shared')).parent, null);
  for (const cls of ['Invoice', 'Payment', 'User', 'AuditLog']) {
    const node = byId.get(doc(cls));
    assert.equal(node.container, false, cls);
    // Las clases no heredan el color de su paquete: su estilo resuelto no trae relleno.
    assert.ok(!node.glyph.style?.fill, cls);
  }
  // billing e identity traen el relleno de su kind (style.kinds del spec); core y shared, ninguno.
  for (const pkg of ['billing', 'identity']) assert.equal(byId.get(doc(pkg)).glyph.style?.source?.fill, 'spec', pkg);
  for (const pkg of ['core', 'shared']) assert.ok(!byId.get(doc(pkg)).glyph.style?.fill, pkg);
  // Los contains se dibujan como anidado, no como aristas.
  assert.ok(scene.edges.every(e => e.relation !== 'contains'), scene.edges.map(e => e.relation));
  assert.ok(!scene.notices.some(n => n.includes('nest')), scene.notices);
});

test('elkGraph: cada paquete reserva su cabecera y sus hijos van debajo (G2)', () => {
  const scene = buildScene(view);
  const {graph, sizes} = elkGraph(scene, {measure: approximateMeasure});
  const find = (node, id) => node.id === id ? node : (node.children || []).map(c => find(c, id)).find(Boolean);
  for (const [pkg, kids] of Object.entries(CONTAINS)) {
    const node = find(graph, doc(pkg));
    const ids = (node.children || []).map(c => c.id);
    assert.deepEqual(new Set(ids.filter(id => id !== headerId(doc(pkg)))), new Set(kids.map(doc)), pkg);
    const header = sizes.get(doc(pkg)).header;
    assert.deepEqual(header.lines, [view.nodes.find(n => n.doc === doc(pkg)).label]);
    if (ids.includes(headerId(doc(pkg)))) {
      for (const kid of kids) assert.ok(graph.edges.some(e => e.sources[0] === headerId(doc(pkg)) && e.targets[0] === doc(kid)), kid);
    } else {
      assert.match(node.layoutOptions['elk.padding'], new RegExp(`top=${header.height + 6}`));
    }
  }
});

// Puntos de un path de solo M/L/Z en coordenadas absolutas.
const pointsOf = d => [...d.matchAll(/[ML]\s*(-?[\d.]+),(-?[\d.]+)/g)].map(m => [Number(m[1]), Number(m[2])]);

test('containerOutline: la carpeta envuelve toda la caja y su pestaña es la cabecera del paquete', () => {
  for (const node of view.nodes.filter(n => n.shape === 'package')) {
    const head = containerHeader(node, {measure: approximateMeasure});
    // Las dos cabeceras que reserva el layout: en el padding de arriba (horizontal) o como nodo título (vertical).
    for (const header of [{...head, x: 8, y: 0}, {...head, x: 8, y: 8}]) {
      const width = head.width + 160, height = 420;
      const outline = containerOutline(node.shape, {width, height, header});
      assert.ok(outline, node.doc);
      assert.equal(outline.viewBox, `0 0 ${width} ${height}`);
      const pts = pointsOf(outline.d);
      assert.ok(pts.every(([x, y]) => x >= 0 && x <= width && y >= 0 && y <= height), outline.d);
      for (const corner of [[0, 0], [width, height], [0, height]]) assert.ok(pts.some(([x, y]) => x === corner[0] && y === corner[1]), corner);
      // La pestaña llega al borde derecho y al de abajo del título; el cuerpo empieza ahí, a todo lo ancho.
      assert.equal(outline.tab.width, header.x + header.width);
      assert.equal(outline.tab.height, header.y + header.height);
      assert.ok(outline.tab.width < width - 4);
      assert.ok(pts.some(([x, y]) => x === width && y === outline.tab.height), outline.d);
      assert.ok(!pts.some(([x, y]) => x === width && y < outline.tab.height), outline.d);
    }
  }
  // Una caja más alta no agranda la pestaña (estirar OUTLINES.package sí lo hacía: 14 % del alto).
  const header = {width: 80, height: 28, x: 8, y: 0};
  assert.deepEqual(containerOutline('package', {width: 300, height: 200, header}).tab, containerOutline('package', {width: 300, height: 900, header}).tab);
  // Sin cabecera o sin forma de paquete no hay contorno de contenedor: se dibuja como siempre.
  assert.equal(containerOutline('package', {width: 300, height: 200, header: null}), null);
  assert.equal(containerOutline('rounded-container', {width: 300, height: 200, header}), null);
  assert.equal(containerOutline('cylinder', {width: 300, height: 200, header}), null);
});
