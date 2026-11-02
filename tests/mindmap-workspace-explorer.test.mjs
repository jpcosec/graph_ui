import test from 'node:test';
import assert from 'node:assert/strict';
import {
  matches,
  modeledGroups,
  buildTree,
  countFiles,
  describeInvalidRoots,
} from '../frontends/mindmap/views/workspace/explorer/explorer.mjs';

// Entradas con la forma que entrega GET /api/workspace/explorer y /nodes.
const modeled = [
  {id: 'TaskDoc:b', name: 'b', model_name: 'TaskDoc', title: 'b', path: 'desk/tasks/b.md', estado: 'ok'},
  {id: 'TaskDoc:a', name: 'a', model_name: 'TaskDoc', title: 'a', path: 'desk/tasks/a.md', estado: 'ok'},
  {id: 'Bitacora:b1', name: 'b1', model_name: 'Bitacora', title: 'b1', path: 'bitacoras/b1.md', estado: 'ok'},
  {id: 'PillDoc:p', name: 'p', model_name: 'PillDoc', title: 'p', path: 'desk/contexts/p.md', estado: 'protegido'},
];
const nodes = [
  {id: 'TaskDoc:a', title: 'Zeta tarea', estado: 'ok'},
  {id: 'TaskDoc:b', title: 'Alfa tarea', estado: 'ok'},
  {id: 'Bitacora:b1', title: 'b1', estado: 'modelo_no_carga', causa: "No module named 'ws132_bitacora'"},
];

test('modeledGroups agrupa por modelo y ordena por titulo del catalogo', () => {
  const groups = modeledGroups(modeled, nodes, '');
  assert.deepEqual(groups.map(g => g.model), ['Bitacora', 'PillDoc', 'TaskDoc']);
  assert.deepEqual(groups[2].entries.map(e => e.id), ['TaskDoc:b', 'TaskDoc:a']);
});

test('modeledGroups conserva el estado y la causa recibidos', () => {
  const groups = modeledGroups(modeled, nodes, '');
  const bit = groups[0].entries[0];
  assert.equal(bit.estado, 'modelo_no_carga');
  assert.equal(bit.causa, "No module named 'ws132_bitacora'");
  const pill = groups[1].entries[0];
  assert.equal(pill.estado, 'protegido');       // la guardia de ruta de /explorer prevalece
  assert.equal(pill.causa, null);
});

test('modeledGroups sin catalogo no inventa titulos ni causas', () => {
  const groups = modeledGroups(modeled, [], '');
  assert.equal(groups[0].entries[0].title, 'b1');
  assert.equal(groups[0].entries[0].estado, 'ok');
  assert.equal(groups[0].entries[0].causa, null);
});

test('el filtro local mira id, titulo, ruta y modelo', () => {
  assert.deepEqual(modeledGroups(modeled, nodes, 'alfa')[0].entries.map(e => e.id), ['TaskDoc:b']);
  assert.deepEqual(modeledGroups(modeled, nodes, 'bitacoras/').map(g => g.model), ['Bitacora']);
  assert.deepEqual(modeledGroups(modeled, nodes, 'pilldoc').map(g => g.model), ['PillDoc']);
  assert.deepEqual(modeledGroups(modeled, nodes, 'nada-coincide'), []);
  assert.equal(matches('', 'x'), true);
});

const unmodeled = [
  {path: 'docs/faq.md', name: 'faq.md'},
  {path: 'desk/notas/sub/dos.md', name: 'dos.md'},
  {path: 'desk/notas/uno.md', name: 'uno.md'},
  {path: 'desk/README.md', name: 'README.md'},
];

test('buildTree arma carpetas antes que archivos, ambos por nombre', () => {
  const tree = buildTree(unmodeled, '');
  assert.deepEqual(tree.folders.map(f => f.name), ['desk', 'docs']);
  const desk = tree.folders[0];
  assert.deepEqual(desk.folders.map(f => f.name), ['notas']);
  assert.deepEqual(desk.files.map(f => f.path), ['desk/README.md']);
  const notas = desk.folders[0];
  assert.equal(notas.path, 'desk/notas');
  assert.deepEqual(notas.folders.map(f => f.path), ['desk/notas/sub']);
  assert.deepEqual(notas.files.map(f => f.path), ['desk/notas/uno.md']);
  assert.equal(countFiles(tree), 4);
});

test('buildTree filtra por ruta y no deja carpetas vacias con coincidencias', () => {
  const tree = buildTree(unmodeled, 'sub');
  assert.equal(countFiles(tree), 1);
  assert.deepEqual(tree.folders.map(f => f.name), ['desk']);
  assert.equal(countFiles(buildTree(unmodeled, 'zzz')), 0);
  assert.equal(countFiles(buildTree([], '')), 0);
});

test('describeInvalidRoots nombra la entrada y la razon recibida', () => {
  assert.deepEqual(
    describeInvalidRoots([{entry: '/etc', reason: 'ruta_absoluta'}, {entry: 'x', reason: 'otra'}]),
    ['/etc (ruta absoluta)', 'x (otra)'],
  );
  assert.deepEqual(describeInvalidRoots(undefined), []);
});
