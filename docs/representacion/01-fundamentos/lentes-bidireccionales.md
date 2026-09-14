# Lentes bidireccionales: editar la vista y actualizar el dato

## Definición

El problema es viejo y tiene nombre: el **view update problem**. Una vista es una transformación
del dato; si alguien edita la vista, ¿qué cambio en el dato la produce? Bancilhon y Spyratos lo
estudiaron para vistas relacionales en 1981. Hay casos sin respuesta única (una vista que suma dos
columnas: si cambio la suma, ¿qué columna cambió?) y casos donde la vista olvidó información que
hay que recuperar del dato original.

Una **lente** (Foster, Greenwald, Moore, Pierce y Schmitt) empaqueta las dos direcciones:

- `get : S → V` toma la fuente y produce la vista;
- `put : V × S → S` toma la vista editada y la fuente original y produce la fuente actualizada.
  Necesita la fuente original porque la vista olvidó cosas.

Y exige leyes para que las dos direcciones sean coherentes (formulación de Diskin, Xiong y
Czarnecki 2010, def. 1, adaptada de Foster et al.):

| Ley | Ecuación | Qué garantiza |
|---|---|---|
| **GetPut** | `put(get(s), s) = s` | devolver la vista sin tocarla no cambia la fuente |
| **PutGet** | `get(put(v, s)) = v` | lo que se edita en la vista es exactamente lo que se vuelve a ver |
| **PutPut** | `put(v₂, put(v₁, s)) = put(v₂, s)` | dos ediciones seguidas equivalen a la última |

Una lente que cumple las dos primeras es *well-behaved*; si cumple las tres, *very well-behaved*.

## El límite de las lentes basadas en estados

Las lentes clásicas son **basadas en estados**: `put` recibe la vista final, no el gesto que la
produjo. Diskin, Xiong y Czarnecki lo señalan: *"propagation procedures take states of models
before and after updates as input and ignore how updates were actually done"*. Para comparar los
dos estados hace falta **alineación** (qué elemento del antes es cuál del después), y las
herramientas la resuelven con claves externas: dos objetos con la misma clave son el mismo.

Su ejemplo: en la vista, *Melinda French* pasa a llamarse *Melinda Gates*. Eso puede ser (u1) un
renombre de la misma persona, o (u2) borrar a una persona e insertar otra. La vista final es la
misma, pero la fuente correcta no: en (u1) se conserva la fecha de nacimiento y los autos que
posee; en (u2) no. La salida que proponen es hacer explícita la actualización —**lentes basadas en
deltas**: `put` recibe la vista *y* la correspondencia entre el antes y el después.

## Por qué importa aquí

Editar en `graph_ui` a través de un vocabulario es exactamente esto: el diagrama es `get` de un
mundo, y cada gesto tiene que volver como `put`. Las leyes son los criterios de aceptación de esa
vuelta, y el límite de los estados explica por qué un gesto (conectar, mover un extremo, soltar
dentro) tiene que viajar como **operación** y no como "este es el diagrama nuevo".

## Ejemplo en código: una lente sobre una `RelationDoc`

Archivo [`ejemplos/lente-arista.mjs`](ejemplos/lente-arista.mjs) (escrito para este manual). La
fuente es una `RelationDoc` de `kgdb` con la forma real de las del mundo del restaurante; la vista
es la arista que dibujaría un diagrama:

```js
// get: fuente -> vista. La vista olvida lo que el diagrama no muestra (condition, notes, title).
const get = rel => ({from: rel.payload.source_id, to: rel.payload.target_id, label: rel.payload.relation_type});

// put: (vista editada, fuente original) -> fuente actualizada.
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

assert.deepEqual(put(get(rel), rel), rel);                         // GetPut
const edited = {...get(rel), to: 'Table:table-14'};
assert.deepEqual(get(put(edited, rel)), edited);                   // PutGet
const again = {...edited, to: 'Table:table-20'};
assert.deepEqual(put(again, put(edited, rel)), put(again, rel));   // PutPut
```

```sh
node docs/representacion/01-fundamentos/ejemplos/lente-arista.mjs
```

Salida real:

```
GetPut, PutGet y PutPut se cumplen
put conserva id y notes: assigned_to--Reservation:r-1--Table:table-12 / ventana
pero el id ya no describe la arista: no
```

La lente es *very well-behaved*, y aun así la fuente resultante está mal para `pron`: la convención
de nombres de un mundo (en el restaurante, `ProjectionDoc.naming` declara
`"RelationDoc": "{relation_type}--{source_id}--{target_id}"`) mete los extremos en el id. Mover el
extremo de una arista deja un documento cuyo id dice `table-12` y cuyo payload dice `table-14`.
Es el problema de Diskin en miniatura: "mover el extremo" y "borrar y crear otra arista" producen la
misma vista final, y solo el gesto dice cuál era. En este mundo, la escritura correcta de mover un
extremo es **borrar y crear** (id nuevo), decidiendo explícitamente qué pasa con `notes`.

## Cómo alinea `graph_ui` hoy

El guardado actual es una lente basada en estados con clave externa: el id del documento
(`frontends/mindmap/source/batch.mjs`, código actual):

```js
export function changesBetween(baseline,documents) {
  const old=new Map(baseline.map(d=>[d.id,d])),current=new Map(documents.map(d=>[d.id,d]));
  const result=[];
  documents.forEach(d=>{const before=old.get(d.id);if(!before)result.push({action:'create',id:d.id,model:d.model_name,payload:d.payload});else if(JSON.stringify(before.payload)!==JSON.stringify(d.payload))result.push({action:'update',id:d.id,model:d.model_name,payload:d.payload,expected:before.payload});});
  baseline.forEach(d=>{if(!current.has(d.id))result.push({action:'delete',id:d.id,expected:d.payload});});
  return result;
}
```

Compara el baseline con la copia de trabajo y deduce `create`/`update`/`delete` por id. Funciona
porque hoy los gestos editan documentos directamente. Con un vocabulario de por medio ya no alcanza:
un gesto en el diagrama puede corresponder a varias escrituras (conectar = crear una `RelationDoc`;
reasignar = borrar una y crear otra; anidar = cambiar un campo del contenedor y del contenido), y el
diff de estados no sabe cuál fue la intención.

## Aplicación a `pron` y `graph_ui`

- Un `VocabularyDoc` debería declarar **gestos → operaciones** (qué escritura concreta produce cada
  gesto), no confiar en un diff posterior. Es lo que hace GLSP con sus *operations* tipadas
  ([`../02-prior-art/`](../02-prior-art/index.md)).
- GetPut y PutGet son tests naturales para cada mapeo de un vocabulario, contra un store real:
  cargar, no tocar, guardar → sin cambios; editar en el diagrama, guardar, recargar → se ve lo
  editado.
- La convención de ids de `RelationDoc` hace que editar extremos sea borrar + crear. Es una
  restricción de diseño a respetar, no un bug ([`../huecos.md`](../huecos.md) la registra como
  decisión a tomar: qué conservar al reasignar).

## Fuentes

- F. Bancilhon, N. Spyratos, *Update Semantics of Relational Views*, ACM TODS 6(4), 1981,
  pp. 557–575: https://dl.acm.org/doi/pdf/10.1145/319628.319634
- J. N. Foster, M. B. Greenwald, J. T. Moore, B. C. Pierce, A. Schmitt, *Combinators for
  bidirectional tree transformations: A linguistic approach to the view-update problem*, ACM TOPLAS
  29(3), 2007: https://dl.acm.org/doi/10.1145/1232420.1232424
- Z. Diskin, Y. Xiong, K. Czarnecki, *From State- to Delta-Based Bidirectional Model
  Transformations*, ICMT 2010, LNCS 6142, pp. 61–76: https://gsd.uwaterloo.ca/sites/default/files/ICMT10_0.pdf
- `graph_ui`, `frontends/mindmap/source/batch.mjs`; `pron`, `tests/worlds/restaurant.py`.
