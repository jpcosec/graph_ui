# Huecos

Lo que un vocabulario necesita y hoy no se puede expresar o hacer. Cada hueco enlaza al documento
que lo encontró y queda en uno de tres estados: **confirmado** (se intentó y no se pudo),
**por verificar** (se sospecha; lo confirmará un documento del eje 3) o **resuelto**.

Se agrupan por dónde tendría que resolverse. Que un hueco aparezca en `pron`, `kgdb` o `sldb` no
significa que haya que resolverlo ahí: la decisión de fondo es que el sustrato no conozca los
vocabularios, así que antes de proponer un cambio en el backend hay que descartar que se pueda
resolver en `graph_ui` o en el `VocabularyDoc`.

## graph_ui

| Hueco | Estado | Encontrado en |
|---|---|---|
| Los kinds de nodo y arista se **infieren por la forma del payload** (`isRelationDocument`, `CONTAINMENT`, `REFERENCE_FIELDS`), no se leen de una declaración. | confirmado | [`README.md`](README.md), `frontends/mindmap/source/graph.mjs` |
| **Ignora** `direction`, `cardinality` y `axis` de `RelationTypeDoc`, que `kgdb` ya declara. | confirmado | [`03-diagrama-vocabulario/nodo-arista-tipado/`](03-diagrama-vocabulario/nodo-arista-tipado/index.md) |
| Todas las aristas de un mismo kind estructural se dibujan igual: no hay terminales, roles ni multiplicidad. | confirmado | [`03-diagrama-vocabulario/nodo-arista-tipado/`](03-diagrama-vocabulario/nodo-arista-tipado/index.md) |
| "Contención" (dato) y "anidado" (dibujo) son lo mismo: toda contención se dibuja como cajas dentro de cajas en KB. | confirmado | [`03-diagrama-vocabulario/anidamiento/`](03-diagrama-vocabulario/anidamiento/index.md) |
| La posición es un dato de vista (`mindmap-view.json`) y el layout lo decide dagre: no hay ejes ni carriles con significado, y mover no puede escribir al mundo. | confirmado | [`03-diagrama-vocabulario/posicion/`](03-diagrama-vocabulario/posicion/index.md) |
| Las vistas se ofrecen a cualquier mundo (Flujo sobre datos que no son un flujo): no hay noción de aplicabilidad. | confirmado | [`03-diagrama-vocabulario/flujo/`](03-diagrama-vocabulario/flujo/index.md) |
| No valida conexiones contra una gramática antes de escribir. | confirmado | [`03-diagrama-vocabulario/estado-bipartito/`](03-diagrama-vocabulario/estado-bipartito/index.md) |
| Solo sabe renderizar con React Flow; una matriz necesita otro renderer. | confirmado | [`03-diagrama-vocabulario/matriz/`](03-diagrama-vocabulario/matriz/index.md) |

## kgdb

| Hueco | Estado | Encontrado en |
|---|---|---|
| `RelationDoc` es binaria (`source_id`, `target_id`): no hay relaciones de más de dos extremos. | por verificar | [`03-diagrama-vocabulario/n-aria/`](03-diagrama-vocabulario/n-aria/index.md) |
| No hay **roles con nombre** en los extremos de una relación (el "todo" y la "parte", el nombre del extremo en una asociación). | por verificar | [`03-diagrama-vocabulario/n-aria/`](03-diagrama-vocabulario/n-aria/index.md) |

## pron

Sin huecos confirmados todavía.

## sldb

| Hueco | Estado | Encontrado en |
|---|---|---|
| Un modelo nuevo requiere un módulo Python registrado (`models add module:Class`). `sldb models create` lo genera desde plantilla + YAML de campos; hay que confirmar si eso cubre "agregar clases sin tocar código" en todos los casos. | por verificar | [`README.md`](README.md) |
