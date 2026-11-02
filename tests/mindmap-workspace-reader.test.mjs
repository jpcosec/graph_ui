// Funciones puras de foco con dueño (WS13.1 correccion). Las entradas tienen la forma exacta que
// entrega /api/workspace/node (aristas con `provenance` y `owner`); la prueba sobre respuestas
// reales del servidor esta en tests/test_mindmap_workspace_reader.py (test_focus_uses_only_...).
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  edgeFields,
  edgeDeclarations,
  edgeHighlighted,
  fieldHighlighted,
  referenceHighlighted,
  correspondence,
  edgeFocus,
  fieldFocus,
  referenceFocus,
  ownedProvenance,
} from '../frontends/mindmap/views/workspace/node/reader.mjs';

const A = 'TaskDoc:a';
const B = 'TaskDoc:b';
const C = 'TaskDoc:c';
const D = 'TaskDoc:d';
const prov = (owner, field, declared, extra = {}) => ({origin: 'schema', owner, field, declared, ...extra});
const edge = (source, target, provenance, type = 'references') => ({source, target, type, origin: 'schema', relationDoc: null, provenance});

// A.depends_on = [c]; B.depends_on = [a] (entrante, mismo nombre de campo); D.depends_on = [b] (2 saltos)
const aToC = edge(A, C, [prov(A, 'depends_on', 'c')]);
const bToA = edge(B, A, [prov(B, 'depends_on', 'a')]);
const dToB = edge(D, B, [prov(D, 'depends_on', 'b')]);
const edges = [aToC, bToA, dToB];
const fields = [{field_path: 'depends_on'}, {field_path: 'title'}];

test('la arista saliente resalta el campo del documento abierto', () => {
  assert.deepEqual(edgeFields(aToC, A), ['depends_on']);
  assert.equal(fieldHighlighted('depends_on', edgeFocus(aToC), edges, A), true);
  assert.equal(edgeHighlighted(aToC, fieldFocus('depends_on'), A), true);
});

test('la entrante de otro documento con el mismo nombre de campo no resalta el campo propio', () => {
  assert.deepEqual(edgeFields(bToA, A), []);
  assert.equal(fieldHighlighted('depends_on', edgeFocus(bToA), edges, A), false);
  assert.equal(edgeHighlighted(bToA, fieldFocus('depends_on'), A), false);
  // su declaracion se conserva y se atribuye a su dueño
  assert.deepEqual(edgeDeclarations(bToA), [{owner: B, field: 'depends_on', declared: 'a'}]);
});

test('el vecino a dos saltos tampoco resalta campos del documento abierto', () => {
  assert.equal(fieldHighlighted('depends_on', edgeFocus(dToB), edges, A), false);
  assert.equal(edgeHighlighted(dToB, fieldFocus('depends_on'), A), false);
});

test('el foco de campo solo resalta las aristas que declara el documento abierto', () => {
  const hl = edges.filter(e => edgeHighlighted(e, fieldFocus('depends_on'), A));
  assert.deepEqual(hl, [aToC]);
});

test('correspondence cuenta solo elementos del documento abierto', () => {
  assert.deepEqual(correspondence(edgeFocus(aToC), {fields, edges, files: [], docId: A}), {document: 1, graph: 1, code: 0});
  // la entrante antes contaba document:1 por igualdad de nombre de campo
  assert.deepEqual(correspondence(edgeFocus(bToA), {fields, edges, files: [], docId: A}), {document: 0, graph: 1, code: 0});
  assert.deepEqual(correspondence(edgeFocus(dToB), {fields, edges, files: [], docId: A}), {document: 0, graph: 1, code: 0});
});

test('un campo propio cuya procedencia apunta a otro destino no cuenta para la referencia seleccionada', () => {
  const aToX = edge(A, 'TaskDoc:x', [prov(A, 'references', 'x')]);
  const aToY = edge(A, 'TaskDoc:y', [prov(A, 'references', 'y')]);
  const list = [aToX, aToY];
  const files = [{doc: A, field: 'references', position: 0, value: 'x'}, {doc: A, field: 'references', position: 1, value: 'y'}];
  const focus = referenceFocus(files[0]);
  assert.equal(edgeHighlighted(aToX, focus, A), true);
  assert.equal(edgeHighlighted(aToY, focus, A), false); // mismo campo, otro valor/destino
  assert.deepEqual(correspondence(focus, {fields: [{field_path: 'references'}], edges: list, files, docId: A}), {document: 1, graph: 1, code: 1});
  // la referencia de otro documento no resalta nada aqui
  const foreign = referenceFocus({doc: B, field: 'references', position: 0, value: 'x'});
  assert.equal(edgeHighlighted(aToX, foreign, A), false);
  assert.equal(fieldHighlighted('references', foreign, list, A), false);
  assert.equal(referenceHighlighted(files[0], referenceFocus({doc: B, field: 'references', position: 0, value: 'x'}), A), false);
});

test('relation_doc y structural no tienen campo: no resaltan ninguno', () => {
  const rel = {source: A, target: C, type: 'task_activates', origin: 'relation_doc', relationDoc: 'r1',
    provenance: [{origin: 'relation_doc', owner: null, condition: ''}]};
  assert.deepEqual(edgeFields(rel, A), []);
  assert.deepEqual(ownedProvenance(rel, A), []);
  assert.equal(edgeHighlighted(rel, fieldFocus('depends_on'), A), false);
});

test('se conservan todas las procedencias reales: varias del dueño correcto', () => {
  const multi = edge(A, C, [prov(A, 'depends_on', 'c'), prov(A, 'inherits_from', 'c'), prov(B, 'depends_on', 'zzz')]);
  assert.deepEqual(edgeFields(multi, A).sort(), ['depends_on', 'inherits_from']);
  assert.equal(multi.provenance.length, 3);
  assert.equal(edgeDeclarations(multi).length, 3);
});

test('sin identidad abierta no se resalta nada por propiedad', () => {
  assert.deepEqual(edgeFields(aToC, ''), []);
  assert.equal(edgeHighlighted(aToC, fieldFocus('depends_on'), ''), false);
});
