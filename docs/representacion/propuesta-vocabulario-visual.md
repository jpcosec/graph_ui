# Propuesta: el vocabulario visual de `graph_ui`, superficie hermana del SHRDLU

**Estado: tercera versión, para discutir.** No hay código nuevo en `graph_ui`. En `pron` hay código nuevo, las
formas (rama `sexp-core`), que esta propuesta usa.

- La primera versión proponía un `VocabularyDoc` que mezclaba lo que ya es de `pron` (verbos, operaciones,
  reglas) con lo que es de `graph_ui` (cómo se dibuja). Queda en el [apéndice](#apéndice-la-primera-versión).
- La segunda separó eso, pero ató el vocabulario visual a las **palabras** del léxico de `pron` (un glyph
  apuntaba al alias `interface`, un gesto al alias `confirm` o `associate`, la paleta salía de
  `Lexicon.verbs_for`), como si `graph_ui` estuviera encima del SHRDLU.
- Esta versión parte de la arquitectura: `graph_ui` y el SHRDLU son **superficies al mismo nivel** sobre las
  formas de `pron`. Uno proyecta lenguaje; el otro, visualizaciones. Ninguno pasa por el otro.

## 1. Dos superficies, dos vocabularios

```
sldb | kgdb        documentos, esquema, grafo tipado
API de pron        Kernel, Verbs: verificación, MoveDoc, undo
formas de pron     s-expressions evaluadas de forma determinista (spec 13 de pron)
superficies        SHRDLU: oración → formas → respuesta en lenguaje
                   graph_ui: gesto → formas → visualización
```

Las dos superficies nombran lo mismo, lo que el mundo declara y las formas escriben. Cada una agrega su
vocabulario: el SHRDLU, el **léxico** (spec 05: formas de decir, alias `AnchorDoc`); `graph_ui`, el
**vocabulario visual** (símbolos, trazos, layouts, gestos). Ninguno agrega capacidades: los dos nombran formas.

| Debajo de las dos superficies | Léxico del SHRDLU | Vocabulario visual de `graph_ui` |
|---|---|---|
| modelo `(model UmlClass)` | `class`, `classes` | un símbolo |
| subconjunto `(where UmlClass "kind = \"interface\"")` | el adjetivo `interface` (alias) | un símbolo más específico |
| campo `(field UmlClass attributes)` | `attributes of …` | un compartimento, un eje o un rótulo |
| verbo `(relation realizes)` (`RelationTypeDoc`) | `realizes` | una línea, contención, franja o celda |
| escritura `(change SUST status "confirmed")` | el alias de acción `confirm` | un gesto (clic en una transición) |
| movimiento `(move (create …) (assert …) …)` | el alias `compose` `associate` | un gesto (conectar dos clases) |
| `ProjectionDoc` (`models`, `relations` con modo, `actions`) | qué palabras entran a la sesión | qué vistas y gestos existen |
| `ProjectionDoc.display`, `key`, `naming` | cómo nombra la respuesta | rótulos y nombres de lo que crea un gesto |
| `MoveDoc`, `undo`, `why` | "undo", "why?" | historial y deshacer de la vista |

La columna del medio no hace falta para la de la derecha. Es la regla de `pron` aplicada a sus superficies:
*"el mundo declara palabras, pron declara sintaxis"* (spec 11 §1). **El mundo declara la notación y
`graph_ui` declara las primitivas visuales** (símbolos, trazos, terminales, layouts, gestos), que valen para toda
notación. Si aparece un `if` que distingue UML en `graph_ui`, está en el lugar equivocado (regla 5 del spec de
`pron`).

## 2. Lo que `pron` ya resuelve

Probado sobre el mundo de [UML de clases](03-diagrama-vocabulario/nodo-arista-tipado/uml-clases.md), que no
declara ningún alias, con cada gesto escrito como forma y evaluado en una sola sesión de hablante `graph_ui`
([`gestos-como-formas.py`](propuesta-vocabulario-visual.assets/gestos-como-formas.py), salida completa en
[`gestos-como-formas.txt`](propuesta-vocabulario-visual.assets/gestos-como-formas.txt)):

```
### conectar Client → Bookable con realizes
(assert realizes (doc "UmlClass:client") (doc "UmlClass:bookable"))
  → unico · 1 escrituras · Done: Client realizes Bookable.

### conectar Client → Person con realizes (Person no es interfaz)
(assert realizes (doc "UmlClass:client") (doc "UmlClass:person"))
  → error · 0 escrituras · Could not do that: condition 'kind = "interface"' does not hold for UmlClass:client → UmlClass:person (find 'st.{UmlClass+}' --where 'kind = "interface"')

### agregar un atributo en el compartimento
(add (doc "UmlClass:table") attributes "zone: Zone")
  → unico · 1 escrituras · Done.

### deshacer
(undo)
  → unico · 1 escrituras · Undid move-… (1 write(s)).
```

- Afirmar `realizes` pasa por tipos, cardinalidad y la `condition` del verbo, y dos afirmaciones iguales
  chocan por el nombre canónico del `RelationDoc` (spec 10 §2.2 de `pron`). Lo que la primera versión llamaba
  `operation: assert` es la forma `assert`.
- "Es una interfaz" es la forma `(where UmlClass "kind = \"interface\"")`, la misma que la primera versión
  escribía en `symbols[].where`. Que el SHRDLU tenga además el adjetivo `interface` no le importa a la vista.
- Una transición es `change` del campo con `State` y `transitions_to` (spec 10 §2.5); "ejecutar" una máquina
  desde la vista es evaluar ese `change`.
- Cada escritura deja un `MoveDoc`, se prevalida entera antes de escribir y se deshace con `undo` (spec 11 §7).
  Es lo que la vista necesita para escribir **de inmediato**, sin borrador.

Salen del vocabulario visual, respecto de la primera versión: `operation[]`, `rules[]`, `applies_when` y el
`where` de los símbolos.

## 3. Una forma posible del vocabulario visual

Una forma de trabajo, a validar con **dos visualizaciones concretas distintas en paralelo** (decisión 2 del
README): documentos cuyo `ref` es una forma de `pron` que nombra algo del mundo, nunca una palabra del léxico.
Si conviene un documento o varios lo van a decidir esas dos implementaciones, no esta tabla.

| Documento | Campos | Dice |
|---|---|---|
| `NotationDoc` | `name`, `level` (`types`, `instances`, `both`), `projection`, `layout` (`kind` y parámetros), `scope` | una notación sobre una proyección |
| `GlyphDoc` | `ref` (`(model M)` o `(where M "<predicado>")`), `shape`, `label`, `compartments`, `function` | cómo se ve un documento |
| `LinkDoc` | `ref` (`(relation R)`, o `(model M)` para una relación reificada con `ends` por `(relation R)`), `draw` (`line`, `nest`, `lane`, `cell`, `axis`), `line`, `source_end`, `target_end`, `ends` | cómo se ve un verbo |
| `GestureDoc` | `gesture` (`connect`, `drop-into`, `drag-axis`, `drag-end`, `edit-label`, `click`, `tab`), `over` (un glyph o link), `form` (la forma que escribe, con huecos `$source`, `$target`, `$selected`, `$container`, `$value`), `new_end` | qué forma escribe un gesto |

Un hueco de `form` lo llena `graph_ui` con `(doc "Modelo:nombre")` o con un valor antes de evaluar; es sustitución
de s-expressions, no interpretación. Tres propiedades salen de hacerlo así:

1. **Aplicabilidad sin campo propio.** La regla que `pron` usa para los alias —*"Un alias entra a una sesión solo
   si todo lo que apunta está en la proyección"* (spec 05)— vale igual para una notación: se ofrece si todo lo
   que sus glyphs, links y gestos nombran está en la proyección. `graph_ui` lo lee de lo estable del contrato de
   runtime, `World.projection()` y `World.relation_types()` (spec 12 §5), no del léxico, que es interior.
2. **Gestos legales derivados del mundo.** `source_types`, `target_types` y `cardinality` de cada verbo, y el modo
   de cada relación y las `actions` de la proyección, dan qué se puede conectar con qué; un `GestureDoc` elige
   cuáles se hacen con qué gesto y los demás quedan en un menú. La segunda versión los sacaba de
   `Lexicon.verbs_for`, que es del SHRDLU.
3. **Nada en código por notación.** Los símbolos y los layouts son primitivas de `graph_ui`, como los patrones de
   la oración son del SHRDLU.

Un extracto de UML de clases con esta forma (sin montar todavía; ver §4):

```yaml
# NotationDoc notation-uml-clases
name: uml-clases
level: types
projection: all
layout: {kind: graph, direction: TB}
---
# GlyphDoc glyph-interfaz
ref: '(where UmlClass "kind = \"interface\"")'
shape: class-box
label: "«interface» {name}"
compartments: [attributes, operations]
function: interface
---
# LinkDoc link-realizacion
ref: (relation realizes)
draw: line
line: dashed
target_end: hollow-triangle
---
# LinkDoc link-asociacion: la relación reificada se dibuja colapsada
ref: (model UmlAssociation)
draw: line
ends:
  a: {ref: (relation end_a), label: "{a_role} {a_multiplicity}", terminal: {field: aggregation, map: {shared: hollow-diamond, composite: filled-diamond}}}
  b: {ref: (relation end_b), label: "{b_role} {b_multiplicity}"}
---
# GestureDoc gesture-realizar
gesture: connect
over: glyph-clase
form: (assert realizes $source $target)
---
# GestureDoc gesture-asociar: hoy no evalúa, ver §4.2
gesture: connect
over: glyph-clase
form: (move (create UmlAssociation) (assert end_a (created) $source) (assert end_b (created) $target))
---
# GestureDoc gesture-transicion (statechart): clic sobre una transición, con una instancia seleccionada;
# $value es el name del State destino (convención State, spec 10 §2.5)
gesture: click
over: link-transicion
form: (change $selected status $value)
```

## 4. Lo que hay que extender en `pron` y `kgdb`

Son extensiones del sustrato y de las formas, no del front.

**4.1 Formas: el lenguaje común de las superficies.** `pron` solo aceptaba oraciones (`session.turn`), y un gesto
con extremos conocidos no cabía: `associate Client with Table` → `'associate' has no antecedent of class
UmlClass`. Ahora **todo pasa por s-expressions**: la superficie de lenguaje solo convierte una oración en formas
con los sustantivos sin resolver, y evaluar formas hace todo lo demás: resolver, preguntar, verificar, escribir y
registrar. `graph_ui` evalúa las formas directamente (`session.eval`, `pron eval`, operación `eval` del socket).
Está en la rama `sexp-core` de `pron` (worktree `~/proyectos/pron-sexp`, sin mezclar a `master`) con el capítulo
13 del spec, y en `kgdb` `846f331` para que los alias escritos como formas sigan nombrando lo mismo en el grafo.

**4.2 Un movimiento compuesto solo se puede escribir con un alias del léxico.** Conectar dos clases con una
asociación es crear un documento y afirmar sus dos extremos en un movimiento. Con formas sueltas no se puede
([`gestos-como-formas.txt`](propuesta-vocabulario-visual.assets/gestos-como-formas.txt)):

```
(move (create UmlAssociation (as "client-prefers-table") (name "prefers")) (assert end_a (created) (doc "UmlClass:client")) (assert end_b (created) (doc "UmlClass:table")))
  → error · 0 escrituras · Could not do that: not a noun: (created …)

(move (create UmlAssociation (as "client-prefers-table") (name "prefers")) (assert end_a (doc "UmlAssociation:client-prefers-table") (doc "UmlClass:client")))
  → missing · 0 escrituras · there is no UmlAssociation:client-prefers-table
```

`(created)` existe solo dentro del `ref` de un alias `compose`, y un `(doc …)` se resuelve antes de ejecutar,
cuando el documento todavía no existe. Hacerlo en dos movimientos funciona (`create`, y después un `move` con
los dos `assert`), pero son dos `MoveDoc` y dos `undo`, y si el segundo falla queda una asociación sin extremos.
La única manera de escribirlo atómico hoy es `(say associate …)`, que hace depender a `graph_ui` del léxico del
SHRDLU. La extensión es de las formas (spec 13), para toda superficie: **`(created)` como sustantivo de cualquier
`move`**, lo que el `compose` ya hace por dentro.

**4.3 Un documento no puede apuntar a un nombre del mundo.** Para que un `LinkDoc` dijera "dibujo `realizes`" como
arista tipada, se montó la familia con un verbo `draws` hacia `RelationTypeDoc`. `kgdb` la rechaza:

```
- relation 'draws--LinkDoc:link-realizacion--RelationTypeDoc:rt-realizes': target 'RelationTypeDoc:rt-realizes' is not a tracked document
```

En el grafo, un verbo es `sldb://relation_type/<name>` y un modelo `sldb://model/<name>`, no documentos. Lo que
`kgdb` ya hace con el `ref` de un alias (`_anchor_targets` en `ingest/typed.py`: aristas `names` hacia modelo,
campo, relación o pasos de un `compose`, y desde `846f331` también cuando el `ref` es una forma) es exactamente lo
que necesitan los glyphs, links y gestos. La extensión es general: **toda familia de documentos con `ref` en la
gramática de formas recibe aristas hacia lo que nombra**, con su propia relación estructural, sin volverse alias
del léxico. Así una notación rota (un link hacia un verbo que ya no existe) la detecta el ingest, igual que un
`RelationDoc` huérfano.

**4.4 Las reglas generales suben al sustrato y bloquean.** De los [huecos](huecos.md), las que no son de una
notación sino del mundo:

| Regla | Dónde, por analogía con lo que ya existe |
|---|---|
| participación mínima (toda reserva tiene cliente) | `RelationTypeDoc`, junto a `cardinality`; la verifica `pron` al evaluar y `kgdb` al ensamblar |
| exactamente uno entre varios verbos (un argumento apoya u objeta) | `RelationTypeDoc` o un documento de restricción del mundo |
| unicidad de un campo o de una tupla | esquema del modelo (`sldb`) o restricción del mundo |
| aciclicidad, árbol sobre varios verbos | `RelationTypeDoc` (`acyclic`) o restricción del mundo |
| rangos | esquema del modelo (`sldb`, tipos con restricción) |

Las de una notación en particular (que un fork tenga una entrada, la regla del 100 % de una WBS) siguen siendo
del mundo que modela esa notación: sus verbos y sus condiciones, no del dibujo.

## 5. Cómo lee y escribe `graph_ui`

- **Escribe por formas.** Cada gesto llena la `form` de su `GestureDoc` y la evalúa en la sesión de la vista
  (en proceso, porque el servidor de `graph_ui` ya importa `pron`; o por socket). Una sesión por vista abierta,
  para que `undo` deshaga lo de esa vista. La respuesta trae `record["writes"]` y el `MoveDoc`; la vista se
  redibuja desde el mundo. No se construyen oraciones ni se usa el léxico.
- Se escribe **de inmediato**. Desaparecen el borrador, el botón "Guardar en SLDB" y el diff de estados de
  `/api/save`. Deshacer es `(undo)`; las versiones las lleva git.
- Una respuesta `error` (transición ilegal, condición, cardinalidad) se muestra sobre el gesto y no deja nada
  escrito, por la prevalidación. Una `ambiguo` no debería ocurrir: los huecos de un gesto son direcciones.
- **Lee lo estable del contrato de runtime**: `World.graph` para las aristas, `store.payload`/`find` para los
  documentos, `World.relation_types()` y `World.projection()` para la notación (spec 12 §4–5). Una forma de
  lectura (`show`, `targets`) contesta en lenguaje, que es lo que proyecta el SHRDLU; lo que `graph_ui` proyecta
  necesita los datos. En proceso, `store.payload` no aplica la proyección: la vista la aplica (§7).
- Las escrituras de esquema (editor de clases) siguen por `pron.Store`, como define spec 12 §4: no tienen forma.

## 6. Qué cambia en los huecos

Revisar el spec cambió el estado de varios [huecos](huecos.md): algunos son decisiones documentadas de `pron`
(la convención `State`, un solo `RelationDoc` por par y tipo, `compose` sin aritmética), uno estaba mal (sí se
puede afirmar validando fuera de `graph_ui`, con `pron say` y ahora con `pron eval`) y aparecieron tres nuevos
(4.1, resuelto en `sexp-core`; 4.2; 4.3).

## 7. Preguntas que quedan

1. **Nombres y modelos.** `NotationDoc`, `GlyphDoc`, `LinkDoc` y `GestureDoc` son nombres de trabajo. ¿Viven
   sus modelos en `graph_ui` y se registran en el mundo como `pron` registra `AnchorDoc`?
2. **`(created)` en las formas (4.2).** ¿Se extiende el capítulo 13 para que cualquier `move` nombre lo que creó,
   o hay una forma mejor de escribir un movimiento compuesto sin alias?
3. **Extensión 4.3.** ¿La generalizamos en el ingest de `kgdb` (aristas por `ref` para cualquier familia marcada)
   o se valida desde `pron`?
4. **Lectura con proyección.** Por socket, `payload` respeta la proyección; en proceso no. ¿El contrato de runtime
   ofrece una lectura estructurada por proyección para superficies que no proyectan lenguaje, o `graph_ui` la
   aplica con `World.projection()`?

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

Lo que no sobrevive es dónde estaba cada cosa: `tools[].operation` son formas de `pron` (§2), `rules` son del
sustrato (§4.4), `applies_when` es la regla de proyección y `symbols[].where` es la forma `where`.
