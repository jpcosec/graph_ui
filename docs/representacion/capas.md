# Capas: sldb, kgdb, pron y graph_ui

Qué hace cada pieza del ecosistema en la representación, qué no hace, dónde está hoy cada responsabilidad
y qué descubrimos al intentar representar 26 notaciones sobre ella. Es la base para las revisiones que
vienen: cada afirmación sobre el código dice dónde se comprobó.

Verificado el 2026-09-14 contra estos árboles:

| Repo | Rama / commit | Nota |
|---|---|---|
| `tools/sldb` | `b0f196a` | v1, "frozen" desde 2026-09-07 pero recibe arreglos; es el núcleo vivo |
| `tools/kgdb` | `846f331` | v1 "frozen" (`v1-frozen`), con arreglos posteriores (`aeac2a7`, `846f331`); publicado en GitHub el 2026-09-15 |
| `~/proyectos/pron` | `master` `e0ff353`, hoy `b162f4b` | el que `graph_ui` importa (instalación editable). El 2026-09-15 se mezcló `sexp-core` (`ae2d0a3`: formas, léxico sobre formas, spec de capas) y se publicó en GitHub |
| `tools/graph_ui` | `master` `42c0375` | `frontends/mindmap/` es el desarrollo activo |

`pron` fija sus dependencias en `constraints.txt`. Desde `b162f4b`: kgdb `846f331` y sldb `b0f196a`. Con el
árbol de trabajo de sldb pasan 129 pruebas; con sldb `b0f196a` limpio falla una (la promoción de modelos necesita
un arreglo de `models_validate.py` que otra sesión todavía no commitea en sldb).

## 1. El mapa

La arquitectura que decidimos:

```
                 SHRDLU                                  graph_ui
    oración → formas → respuesta en lenguaje    gesto → formas → visualización
                        \                                 /
                         formas de pron (s-expressions, spec 13)
                                        |
                  API de pron: World, Store, Graph, Kernel, Verbs, Ledger
                           /                                  \
             sldb: documentos, modelos,                kgdb: tipos de relación,
             direcciones, predicados, hashes           aristas tipadas, grafo
```

| Capa | Es dueña de | No sabe |
|---|---|---|
| **sldb** | que un documento exista, tenga un modelo, se lea y escriba por dirección y siga siendo Markdown reversible | qué significa una relación, qué verbos hay, quién habla, cómo se dibuja |
| **kgdb** | qué tipos de relación hay, qué aristas existen, que el grafo ensamblado sea válido, cómo recorrerlo | cuándo se autoriza una escritura, condiciones al escribir, diálogo |
| **API de pron** | escribir con verificación (tipos, cardinalidad, condición, transición), prevalidar, registrar cada movimiento, deshacer, qué puede nombrar una sesión | cómo se dice o se dibuja algo |
| **formas de pron** | el lenguaje estructurado con que se pide todo lo anterior, y su evaluación determinista | de qué superficie viene la forma |
| **SHRDLU** | oraciones, léxico, alias, morfología, cercanos, diálogo, respuesta en lenguaje | notaciones |
| **graph_ui** | notaciones, símbolos, layouts, gestos, posiciones, la visualización | palabras, alias, oraciones |

La sección 6 muestra que el código todavía no respeta esa tabla en varios puntos, y la sección 7 lo lista.

## 2. sldb: documentos por dirección

### Qué es

Una base de datos de campos direccionables sobre Markdown. Cada documento es una instancia de un modelo
Pydantic (`StructuredNLDoc`); el modelo trae una plantilla con marcadores (`⸢rev•campo⸥`) que dice cómo se
extrae el payload del Markdown y cómo se vuelve a renderizar. El Markdown es canónico y humano; el payload es
su estado. *"Read and write by address. SLDB owns the file."* (`docs/addressability_model.md`).

Todo campo de modelo tiene que tener `description`: el esquema es también documentación para personas y LLM
(`src/sldb/models/structured_doc.py`).

### El store

`.sldb/` guarda punteros, no copias:

- `core/store_index.yaml`: stores enlazados, modelos registrados (`model_ref`, `path`, `family`, `semantics`,
  `base_models`), **predicados** con su eje (`HOW`, `WHY`, `WHAT`, `PROVENANCE`, `WHEN_WHERE`) y `hash_a`;
- un índice por modelo y uno de documentos por modelo (`path`, `hash_c`, `hash_d`);
- `runtime/`: índice semántico, índice de secciones, cachés.

Cascada de hashes (`src/sldb/store/hashing.py`): `hash_c` es el texto del archivo, `hash_d` el payload extraído,
`hash_b` el modelo y sus documentos, `hash_a` el store entero. Cualquier escritura mueve la cadena hacia arriba.

### Direcciones y consultas

| Forma | Qué nombra |
|---|---|
| `st.{Modelo}.doc.campo.sub` | un valor, un subcampo de dict o un ítem de lista por posición |
| `st.{Modelo+}` | la familia: el modelo y sus subclases por MRO, esté o no registrada la base |
| `b:st.…` | lo mismo en el store enlazado `b` |
| `se.tag`, `gse.tag` | documentos por tag semántico, local o entre stores por equivalencias |

`--where` toma **un** predicado: `has(f)`, `"x" in f`, `f ~ "regex"`, `f = "v"`, `f != "v"`, `f >= n`,
`model <= Base`. No hay conjunción: `pron` intersecta listas de direcciones (spec 02 de `pron`).

### Escribir

`save_payload` (`src/sldb/cli/commands/fields_save.py`): renderiza el payload completo con la plantilla, verifica
que el Markdown vuelva a extraer el mismo payload (si no, rechaza: *"Field mutation broke idempotency"*), escribe
el archivo, actualiza `hash_c`/`hash_d`, guarda índices bajo `store_lock` y cascadea `hash_a`. Toda escritura del
ecosistema termina ahí: `sldb fields update`, `pron.Store.replace`/`update_field` y, por lo tanto, las formas.

Los modelos se editan en borrador: `models template edit` y `models fields add|remove` escriben un `.py.temp`
junto al módulo; `models validate --promote` lo instala, reindexa y sube la versión.

### Relaciones en sldb (sí, hay)

sldb no es "solo documentos". Tiene tres mecanismos de relación propios, además de los de kgdb:

1. **Metadatos de grafo en el modelo**: `__containment__` (campo → modelos destino, *"visual containment"* dice el
   comentario en `structured_doc.py`) y `__references__` (campos que guardan ids). `graph_ui` los lee
   (`sldb_adapter.py:78`) y su compilador de contratos los genera (`compiler.py:112`); `deskops` los declara en sus
   modelos; `kgdb` los agregó a `RelationDoc` (`aeac2a7`).
2. **Links en el Markdown** con predicado, `[pred:: [[x]]]`, cuyo predicado y eje están en `store_index.yaml`
   (spec 01 de `pron`; `src/sldb/links/`), y transclusiones `![[x]]`.
3. **Tags y DAG semántico** (`se.`), que `kgdb` convierte en `semantic_parent`/`tagged_as`.

### Qué no hace

No evalúa reglas entre documentos ni sobre valores: sin unicidad, sin rangos, sin valores derivados, sin
restricciones entre campos. Un campo extra en un payload se descarta en silencio. `sldb models create` no puede
declarar `__containment__` ni `__references__`. No sabe qué es un verbo, una condición o una proyección.

### Superficies propias

CLI (`sldb`), biblioteca, y un servidor HTTP (`sldb serve`) al que `graph_ui` hace de proxy en `/sldb/`
(`SLDB_URL`, por defecto `127.0.0.1:8787`). También `stores semantic-export`, el contrato de entrega hacia kgdb.

## 3. kgdb: tipos de relación y grafo

### Qué es

La capa de grafo tipado. Desde 2026-09-09 los tipos de relación son documentos sldb que kgdb posee
(`src/kgdb/models/`):

| Modelo | Campos | Qué es |
|---|---|---|
| `RelationTypeDoc` | `title`, `name`, `direction`, `cardinality`, `axis`, `source_types`, `target_types`, `condition`, `description` | un verbo: qué clases conecta (con herencia por `base_models`), cuántas veces, en qué eje, y una condición por defecto |
| `RelationDoc` | `source_id`, `target_id`, `relation_type`, `condition`, `notes` | una arista autorada; **no es un nodo del grafo** |

Las relaciones estructurales que kgdb produce (`has_model`, `has_document`, `has_section`, `tagged_as`,
`semantic_parent`, `semantic_equivalent`, `has_field`, `extends`, `applies_to_source`, `applies_to_target`,
`names`) también vienen como `RelationTypeDoc` (`kgdb.models.builtin`): el grafo se describe con documentos.

### `kgdb init` y `kgdb ingest --store`

- `init` registra los dos modelos en el store, escribe y trackea los tipos estructurales y registra cada nombre de
  relación como **predicado de sldb** con su eje. Es idempotente.
- `ingest --store` corre el export semántico de sldb por biblioteca y agrega: nodos de documento tipados por
  modelo; un nodo `sldb_field` por campo con `has_field` y `extends`; un nodo `relation_type` por verbo con
  `applies_to_*` hacia sus modelos (así "qué verbos aplican a esta clase" es `edges_to` sobre el modelo); **un
  nodo `anchor` por alias de `pron` con aristas `names`** hacia lo que su `ref` nombra; y una arista por
  `RelationDoc`, colgada del origen, con `origin`, `condition` y `axis` en su metadata. Deja fuera los documentos
  con tag `type.pron.move` (el ledger de `pron`).
- Ids: `sldb://document/Modelo:nombre`, `sldb://model/…`, `sldb://relation_type/…`, `sldb://anchor/…`.

### Validación al ensamblar

Cada arista: su tipo existe, sus dos extremos existen, sus clases están permitidas, la cardinalidad se cumple,
los tipos no dirigidos reciben la inversa. Cualquier violación es error y no se escribe nada. **La `condition` no
se evalúa aquí**: *"The world prevents at authoring time; kgdb detects at assembly time"*. El grafo es un
`MultiDiGraph` con clave `(source, target, relation_type)`.

### Qué no hace

No autoriza escrituras ni evalúa condiciones; no tiene aciclicidad, participación mínima, "exactamente uno de
varios verbos" ni aristas n-arias; una arista no puede tener otra arista como extremo, ni apuntar a un
`RelationTypeDoc` o a un modelo como documento.

### Lo que kgdb sabe de pron (acoplamiento)

`src/kgdb/ingest/typed.py` reconoce los alias por el tag `type.knowledge.anchor` (`ANCHOR_TAG`), parsea la
gramática de `ref` de `pron` (las cadenas antiguas y, desde `846f331`, las formas: `_read_form`, `_form_targets`) y
excluye `type.pron.move` por defecto. Es decir, el sustrato conoce el léxico del SHRDLU y el ledger de `pron`.

## 4. pron: la capa que verifica, registra y habla

### Documentos que pron posee

| Modelo | Familia | Para qué |
|---|---|---|
| `ProjectionDoc` | knowledge | qué puede nombrar una sesión: `stores`, `models`, `relations` (con modo), `actions`, y además `aliases`, `naming`, `display`, `key`, `matching`, `exposed`, `description` |
| `AnchorDoc` | knowledge | un alias del léxico: `symbol`, `forms` (formas de decir), `ref` (una forma), `steps`, `motive` |
| `MoveDoc` | ledger | un movimiento: `id`, `at`, `speaker`, `outcome`, `state_before`/`state_after` (del diálogo), `hash_before`/`hash_after`, `refers_to`, `sentence`, `record` (`queries`, `writes`, `edges`, `forms`, `resolved`, …) |
| `SpecDoc`, `SurfaceDoc`, `CliCommandDoc` | — | la KB de `pron` sobre sí mismo, derivada del repo (`pron docs`) |

`pron` también registra `RelationTypeDoc`/`RelationDoc` de kgdb para poder autorar verbos.

### Los módulos, por capa (`master`)

| Capa | Módulo | Qué hace |
|---|---|---|
| puerta a sldb | `store.py` | *"The only door to sldb"*: `find`, `list`, `get`, `glob`, `schema`, `payload`, `create`, `replace`, `update_field`, `append`, `remove_field`, `clean`, `untrack`, stores enlazados, edición de modelos (`model_*`) |
| puerta a kgdb | `graph.py` | *"The only door to kgdb"*, solo lectura de `.pron/graph.nx.json`: `edges_from`, `edges_to`, `targets`, `roots`, `descendants`…; sabe si está fresco por los `hash_b` |
| mundo | `world.py` | abre el store, `family_of`, `relation_types()`, `projection()`, `hash_mundo()`, `refresh()` (llama a kgdb por biblioteca), plantillas de mundo |
| verbos | `verbs.py` | lee aristas del grafo con caída a los `RelationDoc` de sldb; `applies`, `cardinality_ok`, `condition_holds` (evalúa la condición con un predicado de sldb sobre el sujeto), `assert_edge`, `negate_edge`, `machine`/`transition` (convención `State`), `broken_conditions` |
| kernel | `kernel.py` | `create`, `change`, `add`, `remove`, `clean`, `forget`; `dry_run` (prevalidación), `expect` (guarda por `hash_c`), reevaluación de condiciones alrededor del documento, `refresh`, `undo` |
| ledger | `ledger.py` | un `MoveDoc` por movimiento; `last_with_write(speaker)` para `undo`; `about(address)` para `why` |
| nombres | `display.py` | plantillas `display` de la proyección (`{rel.field}` sigue una arista) y `render_name` para `naming` |
| formas | `sexp.py`, `forms.py`, `refs.py` | lector e impresor; `Compiler` (forma → partes), `said` (lo dicho, sin resolver), `resolved` (por dirección); qué nombra cada `ref` |
| evaluación | `session.py` (`_eval`, `_plan`, `_execute`), `resolve.py`, `dialogue.py` | compila, resuelve sustantivos, planifica, registra `forms`/`resolved`, prevalida el movimiento entero, compara `hash_mundo`, ejecuta, refresca, escribe el `MoveDoc`; la pendiente y los referentes |
| SHRDLU | `surface/` (`tokens`, `nouns`, `interpret`, `dates`, `patterns.yaml`, `function_words.yaml`), `lexicon.py`, `embedder.py` | oración → formas sin resolver; palabras del mundo y alias cortados por la proyección; cercanos por similitud (solo ofrecen, nunca ejecutan) |
| afuera | `serve.py`, `client.py`, `cli/`, `docs.py`, `lints.py` | socket (una petición por conexión, un escritor), federación y proyecciones expuestas, CLI (`say`, `eval`, `check`, `refresh`, `lexicon`, `docs`…), KB propia, lints |

### Qué garantiza una escritura por pron

Probado sobre UML en esta sesión ([`gestos-como-formas.txt`](propuesta-vocabulario-visual.assets/gestos-como-formas.txt)):
tipos y cardinalidad del verbo, su `condition` (`condition 'kind = "interface"' does not hold…`), transiciones
de la máquina, campos obligatorios, prevalidación del movimiento entero antes de tocar nada, segunda lectura de
`hash_mundo` entre comprender y escribir, `MoveDoc` con valores anteriores, refresh del grafo y `undo`. Nada de eso
ocurre escribiendo por `pron.Store` ni por el CLI de sldb.

### El contrato de runtime (spec 12)

Estable: `Session` (`turn`, `eval`), `RemoteSession`, `Response` (`text`, `outcome`, `trace`, `move_id`,
`record`), los cuatro `outcome` (`unico`, `ambiguo`, `missing`, `error`), las formas del capítulo 13,
`world.store.payload`, los métodos de `World` y `Graph` de §5, `pron.graph`/`pron.ids`, el socket, plantillas.
Interior: el léxico, la superficie, `resolve`, `verbs`, `kernel`, `dialogue`, `ledger`, `display` y la forma de
`AnchorDoc`/`ProjectionDoc` más allá de 01 y 05. *"Lo que un runtime necesite y no esté acá se pide como cambio de
este capítulo, no se toma de adentro."*

## 5. graph_ui hoy

Servidor Python stdlib (`frontends/mindmap/serve.py`) y UI React/htm por CDN. Importa `pron` desde
`~/proyectos/pron/src` (`master`), así que **no tiene formas**.

### Cómo lee

- `GET /api/graph`: todos los documentos de todos los modelos por `pron.Store.docs()` (`sldb_adapter.py:94`), más
  el estado de la vista. Sin proyección de `pron` y sin el grafo de kgdb.
- `GET /api/schema`: modelos con campos, `__containment__` y `__references__`.
- El front **infiere** qué es qué por la forma del payload (`source/graph.mjs`): `CONTAINMENT` por modelo, una lista
  fija `REFERENCE_FIELDS` de 24 nombres de campo (`routine`, `source_id`, `depends_on`, `steps`…),
  `isRelationDocument` por tener `source_id`/`target_id`.
- **Reimplementa en JS conceptos de `pron`**: `applyProjection` (*"pron's own semantics"*) y `renderDisplay`
  (*"mirrors pron's own Display.render (pron/display.py)"*) en `source/projections.mjs`, alias incluidos.

### Cómo escribe

- `POST /api/save` (`persistence.py`): un lote de `create`/`update`/`delete` calculado en el cliente como diff de
  estados; prevalida el lote con el roundtrip de sldb, rechaza documentos obsoletos, escribe por
  `pron.Store.create`/`replace`/`untrack`. Sin verbos, sin condición, sin máquina de estados, sin `MoveDoc`, sin
  `undo`; un fallo a mitad devuelve lo completado.
- `POST /api/models/*`: editor de clases sobre `pron.Store.model_*` (borrador, validar, promover).
- `POST /api/validate|plan|compile|export`: un **contrato JSON propio** (`contract.py`, `compiler.py`) que genera un
  módulo Python de modelos con `__containment__`/`__references__` y los registra en el store.
- Posiciones y plegado en `.sldb/runtime/mindmap-view.json`, dentro del directorio de runtime de sldb.
- Brainstorm (`/draft/tree`) vive en `localStorage` hasta "Convertir a SLDB".

### Vistas

`/documents/map` (KB, contención anidada y referencias), `/documents/flow` (grafo dagre), `/draft/tree`
(Brainstorm), `/models/diagram` (Schema). Todas **proyectan** (infieren la notación del dato); ninguna
**representa** (ver [README](README.md)).

## 6. Dónde está hoy cada responsabilidad

| Responsabilidad | Debería estar | Está hoy |
|---|---|---|
| existencia, esquema, roundtrip, hashes | sldb | sldb |
| qué campo contiene o referencia a otro documento | un solo mecanismo declarado | cuatro: `__containment__`/`__references__` (sldb), links `[pred:: [[x]]]` (sldb), `RelationDoc` (kgdb), y la lista `REFERENCE_FIELDS` de `graph_ui`; `pron` solo entiende `RelationDoc` |
| tipos de relación y validez del grafo | kgdb | kgdb |
| condición de una arista | `pron` al escribir y kgdb al ensamblar | solo `pron` al escribir |
| reglas generales (mínimos, unicidad, aciclicidad) | sustrato, bloqueando | en ningún lado (los nueve `verificar-*.py` del manual) |
| qué puede nombrar una sesión | API de `pron` | `ProjectionDoc`, que mezcla permisos con `aliases` y `matching`; y una copia en JS en `graph_ui` |
| verificar y registrar escrituras | API de `pron` | `pron`, pero `Verbs` y `Kernel` se construyen desde un `Lexicon` (§7.1) |
| resolver un sustantivo a direcciones | formas de `pron` | `resolve.py`, que recibe un `NounPhrase` de la superficie y un `Lexicon` |
| convertir el resultado en lenguaje | SHRDLU | la evaluación (`session.py`: `"Done: …"`, `"Created …"`) |
| alias, formas de decir, cercanos | SHRDLU | `lexicon.py`, `AnchorDoc`, `embedder.py`; y el ingest de kgdb los conoce |
| rótulo de un verbo | mundo (`RelationTypeDoc.title`) | `graph_ui` muestra el token `relation_type` |
| cómo se muestra un documento | mundo (`display`, `naming`) | `pron` (`display.py`) y una copia en JS en `graph_ui` |
| notación, símbolos, gestos | vocabulario visual de `graph_ui` | inferencia por forma del payload |
| posición y layout | `graph_ui`; en las notaciones de posición (secuencia, Gantt, Wardley), el mundo | `.sldb/runtime/mindmap-view.json` |
| deshacer | por sesión o por vista | por hablante (`last_with_write(speaker)`) |

## 7. Lo que descubrimos

### 7.1 La dirección de las dependencias dentro de pron está invertida respecto de las capas

El flujo de ejecución ya es el que decidimos: toda oración se vuelve formas y se evalúa por el único camino
(`_eval`; `_execute` solo se llama desde ahí). Pero el grafo de módulos no:

- `Verbs.__init__(self, lex: Lexicon)` (`verbs.py:38`) y `Kernel(verbs, projection)`: la API de escritura se
  construye desde el léxico del SHRDLU; lee `self.lex.relation_types`.
- `resolve(np: NounPhrase, lex: Lexicon)` (`resolve.py:44`) usa el tipo de la superficie y, para `missing`, los
  cercanos del léxico (`lex.near`, `lex.values_of`).
- `forms.py` importa `surface.interpret.Part`, `surface.nouns.NounPhrase`, `surface.tokens.Item` y `lexicon.Word`:
  las formas compilan hacia las estructuras de la superficie, y `_need_model` pregunta a `self.lex.models`.
- `Session._load` arma siempre `Lexicon`, `Interpreter`, `Verbs`, `Kernel` y `Display` (`session.py:60`): una
  sesión que solo evalúa formas carga la superficie entera.
- La evaluación produce el texto en inglés; `Response` es texto más `record`. Una lectura (`show`, `targets`)
  devuelve lenguaje, no datos.

Consecuencia para `graph_ui`: una superficie hermana del SHRDLU hoy depende de piezas del SHRDLU aunque no las use.

### 7.2 Documentos compartidos que mezclan capas

- `ProjectionDoc`: permisos (`stores`, `models`, `relations`, `actions`) junto a lenguaje (`aliases`,
  `matching`) y nombres (`naming`, `display`, `key`).
- `MoveDoc`: ledger (`speaker`, `hash_*`, `writes`) junto a diálogo (`state_before`, `state_after`, `sentence`).
- kgdb reconoce `AnchorDoc` y `type.pron.move` (§3).
- sldb declara *"visual containment"* en su clase base (§2).

### 7.3 Formas

| Hallazgo | Estado |
|---|---|
| `pron` solo aceptaba oraciones; un gesto con extremos conocidos no cabía (`'associate' has no antecedent`) | resuelto (capítulo 13, `session.eval`, `pron eval`, socket `eval`; en `master` desde `ae2d0a3`) |
| toda palabra del léxico nombra una forma; los alias se escriben como formas | resuelto; kgdb las lee desde `846f331` |
| la pista de `missing` ofrecía ejemplos del mundo del restaurante (de `patterns.yaml`) en cualquier mundo | resuelto en `1730b8b` |
| `(created)` es sustantivo solo dentro de un alias `compose`; crear y enlazar en un movimiento sin alias da `not a noun: (created …)`, y un `(doc …)` del documento que se crea da `missing` | abierto: dos movimientos sin atomicidad, o depender del léxico |
| lectura estructurada: por socket `payload` respeta la proyección, en proceso no | abierto |
| `change` escribe valores literales: no hay aritmética (Petri) ni en formas ni en alias | decisión de `pron` (spec 05) |
| `undo` deshace el último movimiento con escrituras del hablante, no de la sesión | abierto para vistas simultáneas |
| `sexp-core` no estaba en `master`; `graph_ui` no podía usar formas | resuelto: mezclado en `ae2d0a3` y publicado |

### 7.4 Reglas que el sustrato no expresa

De los 41 mundos montados del eje 3 ([huecos](huecos.md)): participación mínima; exactamente uno entre varios
verbos; cardinalidad según la clase o un campo del extremo; unicidad de campo y de tupla; rangos; dependencias
entre campos (`end < start`); aciclicidad y árbol sobre uno o varios verbos (kgdb acepta `pron owned_by pron`);
reglas de contenedor; valores derivados (totales, orden, habilitación). Un predicado con literal a la izquierda
(`"start" != "end"`) evalúa falso, así que ninguna condición puede depender solo del origen.

### 7.5 Grafo

| Hallazgo | Estado |
|---|---|
| la `condition` no se evalúa al ensamblar: lo escrito por fuera de `pron` puede violarla sin que nadie lo vea | decisión de diseño documentada |
| `pron check` da `ok` mientras `pron refresh` falla con traceback de `TypedIngestError` | confirmado |
| una `RelationDoc` no es nodo: una relación sobre otra falla con un mensaje engañoso (`is not a tracked document`) | confirmado; toda relación con datos se reifica en un modelo |
| dos `RelationDoc` con mismos extremos y tipo se pisan en `graph.nx.json`; por diseño hay uno por par y tipo | decisión de diseño |
| un documento no puede apuntar a un `RelationTypeDoc` ni a un modelo; el ingest ya arma `names` para alias y falta generalizarlo | confirmado |
| `sldb docs create` escribe una `RelationDoc` hacia algo que no existe; lo detectan después `refresh` y `check` | confirmado |

### 7.6 Máquinas de estado

La máquina se reconoce por el nombre de modelo `State` (convención, spec 10 §2.5); no hay estado inicial,
jerarquía, historia ni regiones; el evento solo existe como alias del léxico, atado al valor destino;
`Graph.roots` se documenta como estados de entrada y devuelve los que no tienen salidas; un valor fuera de la
máquina (`status: "banana"`) monta sano.

### 7.7 graph_ui

Escribe por debajo de las verificaciones (§5); guarda campos de máquina sin transición (`cancelled → seated`);
duplica en JS la proyección y el `display` de `pron`; infiere kinds con una lista fija de campos; tiene un contrato
JSON y un compilador de modelos propios; hace de proxy a un servidor HTTP de sldb; guarda posiciones en el runtime
de sldb; Brainstorm vive en `localStorage`; las referencias de la vista KB aparecen de forma intermitente (3 de 12
corridas) sin prueba E2E que lo cubra; etiqueta aristas con el token del tipo y no con `title`.

### 7.8 Herramientas vecinas

spec2viz dibuja los `return` de secuencia al revés en PlantUML y no escapa `--` en rótulos. `kimun`
(`~/proyectos/kimun`) es el sucesor declarado que funde sldb v1, kgdb y el evaluador de `pron` ("SLDB v2"); al
2026-09-10 solo tenía cerrado su hito S0, sin consultas de grafo ni cliente Python.

## 8. Revisiones que esto pide

No son decisiones tomadas: es el orden en que los hallazgos se apoyan unos en otros.

1. ~~Mezclar `sexp-core` a `master` de `pron` y alinear `constraints.txt`~~: hecho el 2026-09-15 (`ae2d0a3`,
   `b162f4b`). Queda fijar sldb al commit que traiga el arreglo de promoción de modelos.
2. **Invertir las dependencias en `pron`** (§7.1): un núcleo (`World`, `Store`, `Graph`, `Verbs`, `Kernel`, `Ledger`)
   que recibe una proyección de permisos y no un `Lexicon`; un evaluador de formas que resuelve direcciones y
   predicados sin tipos de la superficie y devuelve un resultado estructurado (direcciones, aristas, escrituras);
   el SHRDLU encima, dueño del léxico, los cercanos y el texto.
3. **Separar los documentos mezclados** (§7.2): permisos por un lado y lenguaje por otro en `ProjectionDoc`;
   ledger y diálogo en `MoveDoc`; quitarle a kgdb el conocimiento de `AnchorDoc` y del ledger a cambio de la regla
   general "una familia con `ref` en formas recibe aristas `names`", que sirve igual al vocabulario visual.
4. **Completar las formas**: `(created)` en cualquier `move`, lectura estructurada por proyección, `undo` por sesión.
5. **Un solo mecanismo de relación** (§6): decidir qué queda de `__containment__`/`__references__`, los links con
   predicado y `RelationDoc`, y cómo migra lo que `deskops` y `graph_ui` ya declaran.
6. **Reglas generales al sustrato** (§7.4), empezando por las que bloquean las dos primeras visualizaciones.
7. **graph_ui como superficie**: leer por el contrato estable, escribir por formas, borrar las copias en JS de la
   proyección y el `display`, reemplazar la inferencia por el vocabulario visual, decidir dónde viven las
   posiciones.
8. **Decidir la relación con kimun** antes de las revisiones grandes de sldb y kgdb: qué se hace en v1 y qué se
   espera del sucesor.
