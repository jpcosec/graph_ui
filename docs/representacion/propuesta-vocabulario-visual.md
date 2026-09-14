# Propuesta: el vocabulario visual de `graph_ui` sobre el vocabulario de `pron`

**Estado: segunda versión, para discutir.** No hay código nuevo en `graph_ui`, `pron`, `kgdb` ni `sldb`.
La primera versión proponía un `VocabularyDoc` que mezclaba en un documento lo que ya es de `pron` (verbos,
operaciones, reglas) con lo que es de `graph_ui` (cómo se dibuja). Esta versión sale de revisar el spec de
`pron` (`source/spec/01`–`12`) y de probar sus alias sobre un mundo UML; la primera queda en el
[apéndice](#apéndice-la-primera-versión).

## 1. Dos vocabularios

En `pron`, el **vocabulario** de un mundo es su léxico (spec 05): *"El léxico no es una tabla de pron. Se
deriva del mundo"*, desde los modelos y sus campos, los valores acotados, los `RelationTypeDoc`, los verbos
del kernel y los alias `AnchorDoc`, recortado por el `ProjectionDoc` de la sesión. Y el spec lo dice del
editor, que es `graph_ui` (spec 10 §3): *"El editor no tiene vocabulario propio. Sus formularios salen de
`/schema`, sus enums son los `Literal`, sus relaciones son los `RelationTypeDoc`."*

Lo que `graph_ui` sí tiene es un **vocabulario visual**: cómo se dibujan esas palabras en una notación y qué
gesto dice cada una.

| En el mundo | Palabra de `pron` (vocabulario) | Qué hace el vocabulario visual |
|---|---|---|
| modelo | `model:UmlClass`, con alias `class` | le da un símbolo |
| adjetivo | alias `predicate:UmlClass:kind = "interface"` (`interface`) | le da un símbolo más específico |
| campo | `field:M.f`, con alias | lo pone en un compartimento, un eje o un rótulo |
| verbo | `RelationTypeDoc` `realizes` (`relation:realizes`) | lo dibuja como línea, contención, franja o celda |
| acción con valor fijo | alias `action:change Reservation.status=confirmed` (`confirm`) | la ata a un gesto (clic en una transición) |
| oración compuesta | alias `compose` (`book`, `associate`) | la ata a un gesto (conectar dos clases) |
| qué se puede nombrar | `ProjectionDoc` (`models`, `relations` con modo, `actions`) | decide qué gestos existen en la sesión |
| cómo se muestra y se nombra | `ProjectionDoc.display`, `key`, `naming` | rótulos y nombres de lo que crea un gesto |
| qué admite una clase | `Lexicon.verbs_for(model)` | la paleta de gestos legales sobre un símbolo |
| movimiento | `MoveDoc`, `undo` | historial y deshacer de la vista |

Es la misma división que `pron` hace consigo mismo, *"el mundo declara palabras, pron declara sintaxis"*
(spec 11 §1): **el mundo declara la notación y `graph_ui` declara las primitivas visuales** (formas, trazos,
terminales, layouts, gestos), que valen para toda notación. Si aparece un `if` que distingue UML en
`graph_ui`, está en el lugar equivocado (regla 5 del spec de `pron`).

## 2. Lo que `pron` ya resuelve

Probado sobre el mundo de [UML de clases](03-diagrama-vocabulario/nodo-arista-tipado/uml-clases.md) con cuatro
alias agregados (`class`, `interface`, `realizes`, `associate`), por `pron say`:

```
### the interface classes
Bookable.
  · find 'st.{UmlClass+}' --where 'kind = "interface"' → 1

### the class Table realizes the class Bookable
Could not do that: a RelationDoc named 'realizes--UmlClass:table--UmlClass:bookable' already exists
  · pre-validation: find 'st.{UmlClass+}' --where 'kind = "interface"'
```

- El adjetivo `interface` es el mismo predicado que la primera versión escribía en `symbols[].where`: ya es
  una palabra del mundo.
- Afirmar `realizes` pasa por tipos, cardinalidad y la `condition` del verbo, y dos afirmaciones iguales
  chocan por el nombre canónico del `RelationDoc` (spec 10 §2.2). Lo que la primera versión llamaba
  `operation: assert` es esto.
- Una transición es `change` del campo con `State` y `transitions_to` (spec 10 §2.5); "ejecutar" una
  máquina desde la vista es decir el alias de acción.
- Cada escritura deja un `MoveDoc`, se prevalida entera antes de escribir y se deshace con `undo`
  (spec 11 §7). Es lo que la vista necesita para escribir **de inmediato**, sin borrador.

Por lo tanto salen del vocabulario visual, respecto de la primera versión: `operation[]`, `rules[]`,
`applies_when` y el `where` de los símbolos.

## 3. Una forma posible del vocabulario visual

Una forma de trabajo, a validar con **dos visualizaciones concretas distintas en paralelo** (decisión 2 del
README): documentos con la misma gramática de `ref` que `AnchorDoc` (spec 05). Si conviene un documento o
varios lo van a decidir esas dos implementaciones, no esta tabla.

| Documento | Campos | Dice |
|---|---|---|
| `NotationDoc` | `name`, `level` (`types`, `instances`, `both`), `projection`, `layout` (`kind` y parámetros), `scope` | una notación sobre una proyección |
| `GlyphDoc` | `ref` (`model:M`, `predicate:M:<where>` o el símbolo de un alias), `shape`, `label`, `compartments`, `function` | cómo se ve un sustantivo |
| `LinkDoc` | `ref` (`relation:R`, o `compose` + el alias que crea una relación reificada), `draw` (`line`, `nest`, `lane`, `cell`, `axis`), `line`, `source_end`, `target_end`, `ends` | cómo se ve un verbo |
| `GestureDoc` | `gesture` (`connect`, `drop-into`, `drag-axis`, `drag-end`, `edit-label`, `click`, `tab`), `over` (un glyph o link), `ref` (la palabra que dice: `relation:R`, un alias `action` o `compose`), `new_end` (qué extremo es el nodo nuevo) | qué palabra dice un gesto |

Tres propiedades salen solas de hacerlo así:

1. **Aplicabilidad sin campo propio.** `pron` ya tiene la regla: *"Un alias entra a una sesión solo si todo lo
   que apunta está en la proyección"* (spec 05). Una notación se ofrece si todo lo que sus glyphs, links y
   gestos nombran está en el léxico de la sesión.
2. **Gestos legales derivados.** `verbs_for(model)` da los verbos, acciones y compuestos de una clase; un
   `GestureDoc` elige cuáles se hacen con qué gesto, y los demás quedan en un menú.
3. **Nada en código por notación.** Las formas y los layouts son primitivas de `graph_ui`, como los patrones
   de la superficie son de `pron`.

Un extracto de UML de clases con esta forma (sin montar todavía; ver §4 por qué):

```yaml
# NotationDoc notation-uml-clases
name: uml-clases
level: types
projection: all
layout: {kind: graph, direction: TB}
---
# GlyphDoc glyph-interfaz
ref: 'predicate:UmlClass:kind = "interface"'
shape: class-box
label: "«interface» {name}"
compartments: [attributes, operations]
function: interface
---
# LinkDoc link-realizacion
ref: relation:realizes
draw: line
line: dashed
target_end: hollow-triangle
---
# LinkDoc link-asociacion: la relación reificada se dibuja colapsada
ref: compose associate
draw: line
ends:
  a: {label: "{a_role} {a_multiplicity}", terminal: {field: aggregation, map: {shared: hollow-diamond, composite: filled-diamond}}}
  b: {label: "{b_role} {b_multiplicity}"}
---
# GestureDoc gesture-realizar
gesture: connect
ref: relation:realizes
---
# GestureDoc gesture-confirmar (statechart): clic sobre una transición, con una instancia seleccionada
gesture: click
over: link-transicion
ref: confirm
```

## 4. Lo que hay que extender en `pron` y `kgdb`

Tres cosas aparecieron al probar, y las tres son extensiones del sustrato, no del front.

**4.1 Un runtime no puede decir una jugada con direcciones.** El contrato de runtime (spec 12) tiene una
entrada: `session.turn(sentence)`. Un gesto ya sabe sus extremos exactos, pero tiene que convertirse en una
oración que el parser vuelva a resolver. Probado en una sesión en proceso:

```
### associate Client with Table      → 'associate' has no antecedent of class UmlClass.
### the class Client                 → unico | Client.
### associate it with the class Table → error | Could not do that: no naming rule for UmlAssociation; say the name
```

El `compose` resuelve `$referent` por el diálogo, no por una dirección dada. El spec 06 ya define la
**interpretación** (forma, sujeto con direcciones, verbo, objeto, campo, valor): la extensión es aceptarla
directamente, `session.move(interpretation)`, con las mismas verificaciones, prevalidación, `MoveDoc` y
`undo` que un turno. Spec 12 §9 dice cómo pedirlo: *"Lo que un runtime necesite y no esté acá se pide como
cambio de este capítulo, no se toma de adentro."*

**4.2 Un documento no puede apuntar a una palabra.** Para que un `LinkDoc` dijera "dibujo `realizes`" como
arista tipada, se montó la familia con verbos `draws` (hacia `RelationTypeDoc`) y `speaks` (hacia
`AnchorDoc`). `kgdb` la rechaza:

```
- relation 'draws--LinkDoc:link-realizacion--RelationTypeDoc:rt-realizes': target 'RelationTypeDoc:rt-realizes' is not a tracked document
- relation 'speaks--GestureDoc:gesture-realizar--AnchorDoc:anchor-realizes': target 'AnchorDoc:anchor-realizes' is not a tracked document
```

En el grafo, un verbo es `sldb://relation_type/<name>` y un alias `sldb://anchor/<symbol>`, no documentos. Lo
que `kgdb` ya hace con los alias (`_anchor_targets` en `ingest/typed.py`: un documento con `ref` produce
aristas `names` hacia modelo, campo, relación o pasos de un `compose`) es exactamente lo que necesitan los
glyphs, links y gestos. La extensión es general: **toda familia de documentos con `ref` en la gramática de
`pron` recibe aristas hacia lo que nombra**, con su propia relación estructural, sin volverse alias del
léxico. Así una notación rota (un link hacia un verbo que ya no existe) la detecta el ingest, igual que un
`RelationDoc` huérfano.

**4.3 Las reglas generales suben al sustrato y bloquean.** De los [huecos](huecos.md), las que no son de una
notación sino del mundo:

| Regla | Dónde, por analogía con lo que ya existe |
|---|---|
| participación mínima (toda reserva tiene cliente) | `RelationTypeDoc`, junto a `cardinality`; la verifica `pron` al crear y `kgdb` al ensamblar |
| exactamente uno entre varios verbos (un argumento apoya u objeta) | `RelationTypeDoc` o un documento de restricción del mundo |
| unicidad de un campo o de una tupla | esquema del modelo (`sldb`) o restricción del mundo |
| aciclicidad, árbol sobre varios verbos | `RelationTypeDoc` (`acyclic`) o restricción del mundo |
| rangos | esquema del modelo (`sldb`, tipos con restricción) |

Las de una notación en particular (que un fork tenga una entrada, la regla del 100 % de una WBS) siguen
siendo del mundo que modela esa notación: sus verbos y sus condiciones, no del dibujo.

## 5. Cómo escribe `graph_ui`

- Cada gesto produce una interpretación y la entrega a `pron` (4.1). La respuesta trae `record["writes"]` y el
  `MoveDoc`; la vista se actualiza desde el mundo.
- Se escribe **de inmediato**. Desaparecen el borrador, el botón "Guardar en SLDB" y el diff de estados de
  `/api/save`. Deshacer es `undo` de `pron`; las versiones las lleva git.
- Una respuesta `error` (transición ilegal, condición, cardinalidad) se muestra sobre el gesto y no deja nada
  escrito, por la prevalidación.
- Las escrituras de esquema (editor de clases) siguen por debajo de `pron`, como define spec 12 §4.

## 6. Qué cambia en los huecos

Revisar el spec cambió el estado de varios [huecos](huecos.md): algunos son decisiones documentadas de `pron`
(la convención `State`, un solo `RelationDoc` por par y tipo, `compose` sin aritmética), uno estaba mal
(sí se puede afirmar validando por CLI, con `pron say`) y aparecieron dos nuevos (4.1 y 4.2).

## 7. Preguntas que quedan

1. **Nombres y modelos.** `NotationDoc`, `GlyphDoc`, `LinkDoc` y `GestureDoc` son nombres de trabajo. ¿Viven
   sus modelos en `graph_ui` y se registran en el mundo como `pron` registra `AnchorDoc`?
2. **Contrato 4.1.** ¿`session.move(interpretation)` en `pron`, o prefieres que `graph_ui` arme oraciones con las
   formas de los alias?
3. **Extensión 4.2.** ¿La generalizamos en el ingest de `kgdb` (aristas por `ref` para cualquier familia
   marcada) o se valida desde `pron`?

## Apéndice: la primera versión

Un solo `VocabularyDoc` con `symbols`, `connectors`, `rules`, `derived` y `tools[].operation`. Lo que se probó
sigue siendo cierto y queda en [`propuesta-vocabulario-visual.assets/`](propuesta-vocabulario-visual.assets/validar-vocabulario.py):

- los tres documentos ([UML de clases](propuesta-vocabulario-visual.assets/uml-clases.vocabulario.yaml),
  [statechart](propuesta-vocabulario-visual.assets/statechart.vocabulario.yaml),
  [secuencia](propuesta-vocabulario-visual.assets/uml-secuencia.vocabulario.yaml)) resolvieron sus referencias
  contra sus mundos, detectaron una herramienta al revés, no aplicaron al mundo del Gantt, pidieron el campo
  `State.initial` que faltaba y encontraron el orden repetido de una secuencia
  ([`validaciones.txt`](propuesta-vocabulario-visual.assets/validaciones.txt));
- montados dentro de sus mundos con un modelo declarado por CLI (`dict`, `list[dict]`, `bool`), volvieron
  idénticos al leerlos ([`montar-con-vocabulario.py`](propuesta-vocabulario-visual.assets/montar-con-vocabulario.py));
- una clave `on:` se leía como el booleano `true` en YAML 1.1; se renombró a `over:`, y los nombres de clave de
  estos documentos tienen que evitar `on`, `off`, `yes`, `no`, `y`, `n`.

Lo que no sobrevive es dónde estaba cada cosa: `tools[].operation` son palabras de `pron` (§2), `rules` son del
sustrato (§4.3), `applies_when` y `symbols[].where` ya existen como regla de proyección y como alias `predicate`.
