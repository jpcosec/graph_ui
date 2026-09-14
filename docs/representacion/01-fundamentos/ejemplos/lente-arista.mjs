// Lente asimétrica entre una RelationDoc de kgdb (fuente) y una arista de diagrama (vista).
// Ejecutar: node docs/representacion/01-fundamentos/ejemplos/lente-arista.mjs
import assert from 'node:assert/strict';

// get: fuente -> vista. La vista olvida lo que el diagrama no muestra (condition, notes, title).
const get = rel => ({from: rel.payload.source_id, to: rel.payload.target_id, label: rel.payload.relation_type});

// put: (vista editada, fuente original) -> fuente actualizada. Recupera de la fuente lo que la
// vista olvidó; lo que la vista sí muestra, lo toma de la vista.
const put = (edge, rel) => ({
  ...rel,
  payload: {...rel.payload, source_id: edge.from, target_id: edge.to, relation_type: edge.label},
});

const rel = {
  id: 'assigned_to--Reservation:r-1--Table:table-12',
  model_name: 'RelationDoc',
  payload: {source_id: 'Reservation:r-1', target_id: 'Table:table-12', relation_type: 'assigned_to',
    condition: 'capacity >= {party_size}', notes: 'ventana', title: 'r-1 assigned_to table 12'},
};

// GetPut: devolver la vista sin tocarla no cambia la fuente.
assert.deepEqual(put(get(rel), rel), rel);

// PutGet: lo que se edita en la vista es exactamente lo que se vuelve a ver.
const edited = {...get(rel), to: 'Table:table-14'};
assert.deepEqual(get(put(edited, rel)), edited);

// PutPut: dos ediciones seguidas equivalen a la última.
const again = {...edited, to: 'Table:table-20'};
assert.deepEqual(put(again, put(edited, rel)), put(again, rel));

console.log('GetPut, PutGet y PutPut se cumplen');

// El límite de una lente basada en estados: put ve la arista final, no el gesto.
// Mover el extremo (reasignar) y borrar + crear otra arista producen la misma vista final,
// pero no la misma fuente correcta: el id del documento, sus notes y su condition dependen del gesto.
const updated = put(edited, rel);
console.log('put conserva id y notes:', updated.id, '/', updated.payload.notes);
console.log('pero el id ya no describe la arista:', updated.id.includes('table-14') ? 'sí' : 'no');
