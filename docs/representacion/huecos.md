# Huecos

Lo que un vocabulario necesita y hoy no se puede expresar o hacer. Cada hueco enlaza al documento
que lo encontró y queda en uno de cuatro estados: **confirmado** (se intentó y no se pudo),
**por verificar** (se sospecha; lo confirmará un documento del eje 3), **decisión de diseño** (no
es un defecto sino una restricción que el diseño tiene que resolver explícitamente) o **resuelto**.

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
| **Sobrecarga semiótica** en Schema: una relación declarada con instancias y una relación observada que nadie declaró se dibujan idénticas (tono *accent*, trazo sólido, flecha llena). | confirmado | [`01-fundamentos/physics-of-notations.md`](01-fundamentos/physics-of-notations.md) |
| No muestra `cardinality` ni `condition` de un tipo de relación, que están en la sintaxis abstracta del mundo. | confirmado | [`01-fundamentos/sintaxis-abstracta-y-concreta.md`](01-fundamentos/sintaxis-abstracta-y-concreta.md) |
| No distingue a qué **nivel** aplica una vista: Schema lee tipos, KB y Flujo leen instancias, sin declararlo. | confirmado | [`01-fundamentos/metamodelado-mof.md`](01-fundamentos/metamodelado-mof.md) |
| El guardado es un **diff de estados** alineado por id (`source/batch.mjs`): con un vocabulario de por medio, un gesto puede ser varias escrituras y el diff no conoce la intención. Hace falta gesto → operación. | confirmado | [`01-fundamentos/lentes-bidireccionales.md`](01-fundamentos/lentes-bidireccionales.md) |

## kgdb

| Hueco | Estado | Encontrado en |
|---|---|---|
| `RelationDoc` es binaria (`source_id`, `target_id`): no hay relaciones de más de dos extremos. | por verificar | [`03-diagrama-vocabulario/n-aria/`](03-diagrama-vocabulario/n-aria/index.md) |
| No hay **roles con nombre** en los extremos de una relación (el "todo" y la "parte", el nombre del extremo en una asociación). | por verificar | [`03-diagrama-vocabulario/n-aria/`](03-diagrama-vocabulario/n-aria/index.md) |

## pron

Un mundo cuyo dominio es UML (opción B) se monta completo con CLI y pasa `pron check`
([`01-fundamentos/metamodelado-mof.md`](01-fundamentos/metamodelado-mof.md)).

| Hueco | Estado | Encontrado en |
|---|---|---|
| El id de una `RelationDoc` sigue la convención de nombres del mundo (en el restaurante, `ProjectionDoc.naming`: `{relation_type}--{source_id}--{target_id}`): mover un extremo no puede ser un `update`, es borrar + crear. Decisión pendiente: qué se conserva (`notes`, `condition`) al reasignar. | decisión de diseño | [`01-fundamentos/lentes-bidireccionales.md`](01-fundamentos/lentes-bidireccionales.md) |

## sldb

| Hueco | Estado | Encontrado en |
|---|---|---|
| `sldb models create` no genera `from typing import Literal`: un campo enum (`type: "Literal['terrace', 'indoor']"`, como `Table.zone` del restaurante) produce un módulo que falla con `NameError: name 'Literal' is not defined`. | confirmado | [`01-fundamentos/metamodelado-mof.md`](01-fundamentos/metamodelado-mof.md) |
| `sldb models create` con `base: Persona` genera `from sldb import Persona`: no se puede declarar por CLI un modelo que herede de otro modelo del mundo (generalización entre clases en la opción A). | confirmado | [`01-fundamentos/metamodelado-mof.md`](01-fundamentos/metamodelado-mof.md) |
| `sldb models create` no tiene cómo declarar `__containment__` ni `__references__` (el generador solo escribe `__family__`, `__semantics__` y `__template__`, `sldb/cli/commands/models_create.py`). | confirmado | [`01-fundamentos/metamodelado-mof.md`](01-fundamentos/metamodelado-mof.md) |
