import {test} from 'node:test';
import assert from 'node:assert/strict';
import {irSections, irFields, irSpanOf, irSectionsWithCleanMeta, irMeta} from '../frontends/mindmap/shared/document-ir.mjs';

// Shape OBSERVADO en sldb serve (vuelta 5, verificado contra 8310 el
// 2026-09-21, doc atom-antonia-aplicacion / DomainAtom): structure con
// secciones y span real de líneas; nodes con field_path y span null para
// los campos de front-matter (viven en el YAML, no en el cuerpo).
const IR = {
  context: {physical: {store: 'local', path: 'domain/tratamiento/atom-antonia-aplicacion.md'},
    semantic: {model: 'DomainAtom', tags: ['domain:tratamiento']}},
  structure: [{
    kind: 'section', name: 'administraci-n-de-selfix', title: 'Administración de Selfix',
    model: 'DomainAtom', field_path: null, owning_section: null,
    span: {line_start: 16, line_end: 20},
    children: [{
      kind: 'section', name: 'administraci-n-de-selfix/answer', title: 'Answer',
      span: {line_start: 18, line_end: 20}, children: [], metadata: {level: 2, slug: 'answer'},
    }],
    metadata: {level: 1, slug: 'administraci-n-de-selfix'},
  }],
  nodes: [
    {kind: 'field', name: 'field:title', field_path: 'title', value: 'Administración de Selfix',
      owning_section: null, span: {line_start: null, line_end: null}},
    {kind: 'field', name: 'field:summary', field_path: 'summary', value: null,
      owning_section: null, span: {line_start: null, line_end: null}},
    {kind: 'field', name: 'field:tags', field_path: 'tags', value: ['domain:tratamiento', 'system:laboratorio-chile'],
      owning_section: null, span: {line_start: null, line_end: null}},
  ],
};
const PAYLOAD = {title: 'Administración de Selfix', summary: 'Resumen del payload', tags: null};

test('irSections devuelve las secciones reales del documento con su span', () => {
  const sections = irSections(IR);
  assert.equal(sections.length, 1);
  assert.equal(sections[0].title, 'Administración de Selfix');
  assert.equal(sections[0].children[0].name, 'administraci-n-de-selfix/answer');
});
test('irSectionsWithCleanMeta conserva span y children, sin inventar', () => {
  const sections = irSectionsWithCleanMeta(IR);
  assert.deepEqual(sections[0].span, {line_start: 16, line_end: 20});
  assert.equal(sections[0].children.length, 1);
  assert.equal(sections[0].children[0].span.line_start, 18);
  assert.equal(sections[0].kind, 'section');
});
test('irSpanOf: span solo con líneas reales; null no fabrica span', () => {
  assert.deepEqual(irSpanOf({line_start: 16, line_end: 20}), {line_start: 16, line_end: 20});
  assert.equal(irSpanOf({line_start: null, line_end: null}), null);
  assert.equal(irSpanOf(undefined), null);
});
test('irFields: lista de campos con field_path; value del nodo o del payload; span null queda null', () => {
  const fields = irFields(IR, PAYLOAD);
  assert.deepEqual(fields.map(f => f.field_path), ['title', 'summary', 'tags']);
  assert.equal(fields[0].value, 'Administración de Selfix');   // value del nodo
  assert.equal(fields[1].value, 'Resumen del payload');        // fallback al payload
  assert.deepEqual(fields[2].value, ['domain:tratamiento', 'system:laboratorio-chile']);
  assert.equal(fields[0].span, null);                           // front-matter: sin líneas
});
test('irMeta: modelo y path desde el IR (context) con fallback al doc', () => {
  assert.deepEqual(irMeta(IR, {path: 'ignorado'}), {
    model_name: 'DomainAtom', path: 'domain/tratamiento/atom-antonia-aplicacion.md'});
  assert.equal(irMeta({}, {model_name: 'X', path: 'y.md'}).model_name, 'X');
});