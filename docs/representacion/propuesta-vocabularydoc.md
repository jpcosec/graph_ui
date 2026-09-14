# Propuesta: `VocabularyDoc`

**Estado: propuesta para discutir.** No hay código en `graph_ui`, `pron`, `kgdb` ni `sldb`. Todo lo que
aparece como "probado" se probó con los mundos del manual y un validador de prototipo en
[`propuesta-vocabularydoc.assets/`](propuesta-vocabularydoc.assets/validar-vocabulario.py).

## 1. Qué es

Un **documento del mundo** que declara un vocabulario de representación sobre ese mundo:

- **qué nivel** dibuja (tipos, instancias o ambos);
- **cuándo aplica** (qué modelos y verbos tiene que tener el mundo para que la vista se ofrezca);
- **qué símbolo** le toca a cada documento, según su modelo y sus campos;
- **cómo se dibuja cada relación**: línea, contención, franja, eje, celda, o colapsada desde un modelo
  reificado;
- **qué se deriva** (totales, orden, estado actual) en vez de guardarse;
- **qué reglas** se verifican además de las que el sustrato hace cumplir;
- **qué gestos** existen y qué **operación** de escritura dispara cada uno.

Se apoya en un `ProjectionDoc` (qué documentos entran y cómo se nombran) sin repetirlo: es la separación
*lens*/*format* de [Fresnel](02-prior-art/fresnel.md). Y respeta la decisión de fondo del
[README](README.md): **el sustrato no conoce el vocabulario**. `pron`, `kgdb` y `sldb` guardan el
`VocabularyDoc` como a cualquier documento; quien lo interpreta es `graph_ui`, y las escrituras siguen
pasando por `pron`.

Lo que **no** es:

- no es un tema visual: declara **funciones** (`function: interface`) y **formas** de un catálogo; el
  skin de `graph_ui` elige colores (la regla "solo tokens" del frontend);
- no es código: reglas, derivaciones, formas y operaciones salen de catálogos cerrados que `graph_ui`
  implementa;
- no reemplaza a `RelationTypeDoc`: tipos, cardinalidad máxima y `condition` siguen en el mundo.

## 2. De dónde sale cada parte

| Necesidad | Dónde apareció | Sección del documento |
|---|---|---|
| Distinguir nivel de tipos y de instancias | [metamodelado](01-fundamentos/metamodelado-mof.md), [statecharts](03-diagrama-vocabulario/estado-bipartito/statecharts.md) (máquina + estado actual) | `level` |
| No ofrecer vistas que no representan nada | [flujo](03-diagrama-vocabulario/flujo/index.md) (captura de la vista Flujo), [DSM](03-diagrama-vocabulario/matriz/dsm.md) | `applies_when` |
| Un diagrama por algo (una interacción, una máquina) | [secuencia](03-diagrama-vocabulario/posicion/uml-secuencia.md), [statecharts](03-diagrama-vocabulario/estado-bipartito/statecharts.md) | `scope`, `parameters` |
| Símbolo según un campo, no según el modelo | [actividad](03-diagrama-vocabulario/flujo/uml-actividad.md) (`kind`), [BPMN](03-diagrama-vocabulario/flujo/bpmn.md) (`position`, `trigger`), [UML de clases](03-diagrama-vocabulario/nodo-arista-tipado/uml-clases.md) | `symbols[].where` |
| Nodos que no son documentos | [statecharts](03-diagrama-vocabulario/estado-bipartito/statecharts.md) (inicial) | `pseudo` |
| Contención y franjas como dibujo de una relación | [anidamiento](03-diagrama-vocabulario/anidamiento/index.md), [carriles](03-diagrama-vocabulario/posicion/swimlanes.md) | `containers` |
| Aristas basadas en verbo, en elemento y reificadas | [Sirius](02-prior-art/sirius-web.md), [clase de asociación](03-diagrama-vocabulario/n-aria/clase-de-asociacion.md), [secuencia](03-diagrama-vocabulario/posicion/uml-secuencia.md) | `connectors[].relations`, `.element`, `.reified` |
| Varios verbos, un constructo | [DFD](03-diagrama-vocabulario/flujo/dfd.md), [RACI](03-diagrama-vocabulario/matriz/raci.md), [mapa mental](03-diagrama-vocabulario/arbol/mind-map.md) | `connectors[].relations` con lista |
| Terminales y líneas según un campo | [UML de clases](03-diagrama-vocabulario/nodo-arista-tipado/uml-clases.md) (agregación), [secuencia](03-diagrama-vocabulario/posicion/uml-secuencia.md) (`sort`) | `{field, map}` |
| Ejes con tipo de medida | [posición](03-diagrama-vocabulario/posicion/index.md) | `layout.kind: axes` |
| Renderers que no son grafo | [matriz](03-diagrama-vocabulario/matriz/index.md), [Wardley](03-diagrama-vocabulario/posicion/wardley.md) | `layout.kind` |
| Valores derivados | [treemap](03-diagrama-vocabulario/anidamiento/treemap.md), [WBS](03-diagrama-vocabulario/arbol/wbs.md), [DSM](03-diagrama-vocabulario/matriz/dsm.md), [C4](03-diagrama-vocabulario/anidamiento/c4.md) | `derived` |
| Reglas que el sustrato no expresa | resumen de [huecos](huecos.md) | `rules` |
| Gestos → operaciones con nombre, compuestas y atómicas | [GLSP](02-prior-art/eclipse-glsp.md), [lentes](01-fundamentos/lentes-bidireccionales.md), [clase de asociación](03-diagrama-vocabulario/n-aria/clase-de-asociacion.md) | `tools[].operation`, `atomic` |
| Elegir el verbo por contexto, prohibir lo que no cabe | [BPMN](03-diagrama-vocabulario/flujo/bpmn.md) (bpmn-js), [IBIS](03-diagrama-vocabulario/n-aria/argument-maps-ibis.md) (gIBIS) | `tools[].from`, `.to` con `where` |
| Editar la máquina vs ejecutarla | [statecharts](03-diagrama-vocabulario/estado-bipartito/statecharts.md), [Petri](03-diagrama-vocabulario/estado-bipartito/petri.md) | `tools[].context: instance`, `via: kernel` |

## 3. Forma

Un solo documento, con secciones como campos (como `ProjectionDoc`). Los nombres de modelos, verbos y campos
son los del mundo; los predicados (`where`) son predicados de `sldb`, el mismo lenguaje que la `condition` de
un `RelationTypeDoc`.

| Sección | Contenido |
|---|---|
| `name`, `description` | identidad |
| `level` | `types`, `instances` o `both` |
| `projection` | nombre del `ProjectionDoc` en que se apoya (`all` por defecto); los rótulos sin plantilla usan su `display` |
| `parameters` | valores que el resto del documento interpola (`{machine}`), para reusar un vocabulario en otro campo o con otro juego de letras (RACI/RASCI) |
| `applies_when` | `models` y `relations` que el mundo tiene que tener |
| `scope` | un diagrama por documento de `model`, filtrado por `where` o agrupando por `relation` |
| `layout` | `kind` de un catálogo: `graph` (con `direction`), `tree` (verbos de jerarquía), `axes` (`x`, `y` con `model`, `field`, `measure`: `ordinal`, `temporal`, `continuous`, `bands`), `lanes`, `matrix` (`rows`, `columns`, verbos de celda, `order`), `radial` |
| `symbols[]` | `id`, `model`, `where` (primer símbolo que coincide), `shape` (catálogo), `keyword`, `label` (plantilla), `label_style`, `compartments` (campos), `function` |
| `pseudo[]` | nodos que no son documentos: `shape` y a qué documento apuntan (`points_to: {model, field, equals}`) |
| `containers[]` | `relation` y `draw`: `nest` o `lane` |
| `connectors[]` | una de tres fuentes: `relations: [verbos]` (uno o varios), `element: {model, source, target}` (un documento con dos verbos-extremo, como un mensaje), `reified: {model, roles, draw}` (una relación reificada dibujada como `line`, `diamond` o `node`); más `line`, `source_end`, `target_end` (constante o `{field, map}`), `label`, `ends` por rol, `axis` |
| `derived[]` | derivaciones de un catálogo: `sum` (totales por jerarquía), `scc_order` (particionado), `instance_marker` (estado actual), `implied_relation` (elevar relaciones por contención), `enabled` (transiciones habilitadas), `solver` (análisis externo) |
| `rules[]` | reglas de un catálogo: `exactly_one`, `at_most_one`, `min_participation`, `one_of_verbs` (por origen o por par), `unique` (campo o tupla, `per`), `range`, `acyclic`, `tree`, `no_outgoing`, `same_container`, `formula`; con `policy`: `block` o `warn` |
| `tools[]` | `id`, `gesture` (catálogo: `palette`, `connect`, `drop-into`, `drag-axis`, `drag-end`, `edit-label`, `click`, `tab`), `from`, `to` (modelo o `{model, where}`), `over` (a qué símbolo o conector), `context` (`instance` para ejecutar), `atomic`, `operation[]` |
| `operation[]` | pasos: `create` (con `as`, `defaults`, `set`), `assert` y `retract` (por `Verbs`, que evalúa tipos, cardinalidad y `condition`), `change` (por `Kernel.change` si hay máquina de estados: `via: kernel`), `reorder` (`strategy: renumber` o `fractional`); variables `$from`, `$to`, `$element`, `$scope`, `$instance`, `$text`, `$axis.y`, `$target` |

Tres elecciones que conviene explicitar:

1. **Primer símbolo que coincide.** Los símbolos de un modelo se ordenan de lo particular a lo general
   (`interfaz`, `clase-abstracta`, `clase`). Evita un lenguaje de prioridades.
2. **Catálogos cerrados.** Formas, derivaciones, reglas y gestos son listas que `graph_ui` implementa. Lo
   que no está en el catálogo (una fórmula de feature model) se declara como `formula` o `solver` y lo
   resuelve una herramienta externa, como flamapy en el [feature model](03-diagrama-vocabulario/arbol/feature-model.md).
3. **Las operaciones van por `pron`.** `assert` es `Verbs.assert_edge`, no `Store.create`; `change` de un
   campo con máquina es `Kernel.change`, no `Store.replace`. Es lo que cierra los huecos "escribe sin
   validar" de [UML de clases](03-diagrama-vocabulario/nodo-arista-tipado/uml-clases.md) y
   [statecharts](03-diagrama-vocabulario/estado-bipartito/statecharts.md).

## 4. Tres vocabularios completos

Validados contra los tres casos que el plan pedía para no diseñar solo para nodo-arista: uno de nodo-arista
tipado, uno de estado y uno de posición.

### UML de clases (nivel de tipos, relación reificada)

[`uml-clases.vocabulario.yaml`](propuesta-vocabularydoc.assets/uml-clases.vocabulario.yaml), sobre el mundo de
[UML de clases](03-diagrama-vocabulario/nodo-arista-tipado/uml-clases.md). Extracto:

```yaml
symbols:
  - id: interfaz
    model: UmlClass
    where: kind = "interface"
    shape: class-box
    keyword: «interface»
    label: "{name}"
    compartments: [attributes, operations]
    function: interface
  # clase-abstracta, clase ...
connectors:
  - id: realizacion
    relations: [realizes]
    line: dashed
    target_end: hollow-triangle
  - id: asociacion
    reified:
      model: UmlAssociation
      roles: {a: end_a, b: end_b}
      draw: line
    line: solid
    ends:
      a:
        label: "{a_role} {a_multiplicity}"
        terminal: {field: aggregation, map: {shared: hollow-diamond, composite: filled-diamond, none: none}}
      b:
        label: "{b_role} {b_multiplicity}"
tools:
  - id: realizar
    gesture: connect
    from: UmlClass
    to: {model: UmlClass, where: kind = "interface"}
    operation:
      - {assert: realizes, source: $from, target: $to}
  - id: asociar
    gesture: connect
    from: UmlClass
    to: UmlClass
    atomic: true
    operation:
      - {create: UmlAssociation, as: $asoc}
      - {assert: end_a, source: $asoc, target: $from}
      - {assert: end_b, source: $asoc, target: $to}
```

`realizar` solo se ofrece hacia interfaces (`to.where`), y además `pron` vuelve a evaluar la `condition` del
verbo al afirmar. `asociar` es un gesto y tres escrituras, atómicas.

### Statechart (tipos e instancias, contención, ejecución)

[`statechart.vocabulario.yaml`](propuesta-vocabularydoc.assets/statechart.vocabulario.yaml), sobre el mundo de
[statecharts](03-diagrama-vocabulario/estado-bipartito/statecharts.md). Extracto:

```yaml
level: both
parameters:
  machine: Reservation.status
scope: {model: State, where: 'machine = "{machine}"'}
pseudo:
  - id: inicial
    shape: filled-circle
    points_to: {model: State, field: initial, equals: true}
containers:
  - {relation: substate_of, draw: nest}
derived:
  - id: estado-actual
    kind: instance_marker
    instance_field: "{machine}"
    matches: name
rules:
  - {no_outgoing: {model: State, where: kind = "final", relation: transitions_to}}
tools:
  - id: disparar
    gesture: click
    over: transicion
    context: instance
    operation:
      - {change: "{machine}", of: $instance, value: $target.name, via: kernel}
```

El mismo diagrama sirve para **editar la máquina** (`transicion`, `anidar`) y para **ejecutarla** sobre una
reserva seleccionada (`disparar`, que pasa por `Kernel.change` y respeta transiciones y guardas).

### Secuencia (ejes ordinales, arista basada en elemento)

[`uml-secuencia.vocabulario.yaml`](propuesta-vocabularydoc.assets/uml-secuencia.vocabulario.yaml), sobre el mundo
de [secuencia](03-diagrama-vocabulario/posicion/uml-secuencia.md). Completo:

```yaml
name: uml-secuencia
description: Una interacción por diagrama; líneas de vida en x y mensajes en y, ambos ejes ordinales.
level: instances
projection: all
applies_when:
  models: [Interaction, Lifeline, Message]
  relations: [sends, receives, in_interaction]
scope: {model: Interaction, relation: in_interaction}
layout:
  kind: axes
  x: {model: Lifeline, field: position, measure: ordinal}
  y: {model: Message, field: order, measure: ordinal}
symbols:
  - id: actor
    model: Lifeline
    where: kind = "actor"
    shape: lifeline-actor
    label: "{name}"
    function: actor
  - id: linea-de-vida
    model: Lifeline
    shape: lifeline
    label: "{name}"
    function: component
connectors:
  - id: mensaje
    element: {model: Message, source: sends, target: receives}
    axis: y
    label: "{text}"
    line: {field: sort, map: {synchCall: solid, asynchCall: solid, reply: dashed}}
    target_end: {field: sort, map: {synchCall: filled-arrow, asynchCall: open-arrow, reply: open-arrow}}
rules:
  - {exactly_one: {model: Message, relation: sends}}
  - {exactly_one: {model: Message, relation: receives}}
  - {unique: {model: Message, field: order, per: in_interaction}}
  - {unique: {model: Lifeline, field: position, per: in_interaction}}
tools:
  - id: nuevo-mensaje
    gesture: connect
    from: Lifeline
    to: Lifeline
    atomic: true
    operation:
      - {create: Message, as: $msg, defaults: {sort: synchCall}, set: {order: $axis.y}}
      - {assert: sends, source: $msg, target: $from}
      - {assert: receives, source: $msg, target: $to}
      - {assert: in_interaction, source: $msg, target: $scope}
  - id: mover-mensaje
    gesture: drag-axis
    over: mensaje
    axis: y
    operation:
      - {reorder: order, of: $element, per: in_interaction, strategy: renumber}
  - id: reconectar-receptor
    gesture: drag-end
    over: mensaje.target
    to: Lifeline
    atomic: true
    operation:
      - {retract: receives, source: $element}
      - {assert: receives, source: $element, target: $to}
```

## 5. Validación

### Contra los mundos

[`validar-vocabulario.py`](propuesta-vocabularydoc.assets/validar-vocabulario.py) toma un vocabulario y un mundo
y revisa referencias, aplicabilidad, qué símbolo toca a cada documento, reglas sobre los datos y
compatibilidad de cada operación con los tipos de sus verbos. Transcripción completa en
[`validaciones.txt`](propuesta-vocabularydoc.assets/validaciones.txt).

| Vocabulario | Mundo | Resultado |
|---|---|---|
| UML de clases | [UML de clases](03-diagrama-vocabulario/nodo-arista-tipado/uml-clases.md) | referencias ok; 1 abstracta, 6 clases, 1 interfaz; 4 asociaciones colapsadas desde `UmlAssociation`; reglas se cumplen; 5 herramientas compatibles |
| UML de clases, con `asociar` al revés ([variante](propuesta-vocabularydoc.assets/uml-clases-herramienta-al-reves.vocabulario.yaml)) | ídem | `asociar (connect): INCOMPATIBLE: end_a no admite UmlClass como origen; end_a no admite UmlAssociation como destino` |
| UML de clases | [Gantt](03-diagrama-vocabulario/posicion/gantt.md) | `aplicable: no (faltan UmlClass, generalizes, realizes)`: la vista no se ofrece |
| Statechart | [statecharts](03-diagrama-vocabulario/estado-bipartito/statecharts.md) | `ERROR pseudo.inicial: State no tiene el campo initial` |
| Statechart | [`reserva-con-inicial.mundo.yaml`](propuesta-vocabularydoc.assets/reserva-con-inicial.mundo.yaml) (el mismo mundo con `State.initial`) | referencias ok; 1 compuesto, 2 estados, 2 finales, 4 transiciones, 2 contenciones; 3 herramientas compatibles |
| Secuencia | [secuencia](03-diagrama-vocabulario/posicion/uml-secuencia.md) | 1 actor, 4 líneas de vida, 8 mensajes colapsados desde `Message`; reglas se cumplen |
| Secuencia | la variante con orden repetido | `VIOLA unique order: Message:m6 repite 5 de Message:m5`, lo que ni `kgdb` ni `pron check` detectaron |

La fila del statechart muestra el papel del vocabulario frente al mundo: **pide un dato** (qué estado es
inicial) que el mundo no tenía. No lo inventa; el validador lo reporta y el mundo se extiende con un campo
declarado por CLI (`type: bool`), sin código.

### Dentro del mundo

[`montar-con-vocabulario.py`](propuesta-vocabularydoc.assets/montar-con-vocabulario.py) monta cada mundo con su
vocabulario adentro: agrega el modelo `VocabularyDoc` con `sldb models create` (campos `str`, `dict` y
`list[dict]`) y el vocabulario como documento, y lo vuelve a leer con `sldb docs show`:

```
mundo sano: /tmp/mundo-oss0uzci/world  ·  comandos con error: 0
vocabulary-uml-clases: vuelve idéntico desde /tmp/mundo-oss0uzci/world
mundo sano: /tmp/mundo-3qhzhfow/world  ·  comandos con error: 0
vocabulary-statechart: vuelve idéntico desde /tmp/mundo-3qhzhfow/world
mundo sano: /tmp/mundo-2qr_tjvm/world  ·  comandos con error: 0
vocabulary-uml-secuencia: vuelve idéntico desde /tmp/mundo-2qr_tjvm/world
```

Un vocabulario es un documento más: se versiona, se enlaza y, el día que `graph_ui` lo lea, se edita con la
misma herramienta.

**Algo que la prueba encontró.** La primera versión usaba una clave `on:` en las herramientas
(`on: asociacion.ends.b`). YAML 1.1, el que lee el frontmatter, la convierte en el booleano `true`: el
validador ignoró la clave sin avisar y el documento no volvía idéntico. Se renombró a `over:`. El catálogo
de claves del `VocabularyDoc` tiene que evitar `on`, `off`, `yes`, `no`, `y`, `n`.

## 6. Qué cubre de los huecos

Los ocho temas del [resumen de huecos](huecos.md):

| Tema | Qué resuelve el `VocabularyDoc` | Qué queda fuera |
|---|---|---|
| Representación declarada | `symbols`, `connectors`, `containers`, `layout`, `applies_when` | `graph_ui` tiene que implementar los catálogos de formas y layouts |
| Reglas que el sustrato no expresa | `rules` con verificación en el front y `policy` | que sean garantías del store y no de una vista: las generales podrían subir a `kgdb` |
| Aristas pobres | `reified` y `element` colapsan modelos en líneas; `{field, map}` lee datos del documento reificado | que `kgdb` no pise aristas paralelas ni descarte campos extra en silencio |
| Valores derivados | `derived` | nada los guarda consistentes si alguien los escribe como campo |
| Escritura sin validación ni unidad | `operation` por `Verbs`/`Kernel`, `atomic` | atomicidad real entre varias escrituras (`pron` prevalida una jugada con `dry_run`, pero no deshace escrituras a medias) |
| Gestos guiados por la gramática | `tools[].from`, `.to` con `where`; derivar lo legal de `source_types`/`target_types` | la dirección de la jugada y el hijo por defecto hay que declararlos herramienta por herramienta |
| Ejecutar además de editar | `context: instance`, `via: kernel`, `derived: instance_marker` | jerarquía, acciones y aritmética en la ejecución siguen fuera de `pron` |
| Renderers y estado de la vista | `layout.kind` elige renderer | implementar matriz, ejes y franjas; arreglar las referencias intermitentes de KB |

## 7. Qué cambiaría en `graph_ui`

Solo un bosquejo, para ver el tamaño; nada de esto está hecho:

- **Leer `VocabularyDoc`** del store igual que hoy lee `ProjectionDoc` (`source/projections.mjs`), y ofrecer
  en el shell los vocabularios cuyo `applies_when` se cumple.
- **Una vista genérica por `layout.kind`** (grafo, árbol, ejes, franjas, matriz) que recibe el vocabulario,
  en vez de vistas fijas por faceta.
- **KB, Flujo y Brainstorm como vocabularios**: KB es un vocabulario genérico de documentos (contención
  como `nest`, referencias como conectores); Flujo solo se ofrece donde hay verbos de flujo; Brainstorm es un
  vocabulario `tree` que oculta el tipo y declara el hijo por defecto de cada clase.
- **Escrituras por operación** (`/api/operation` → `Verbs`/`Kernel`) en lugar del diff de estados de
  `/api/save`.
- **Un verificador de reglas** que corra antes de escribir (`policy: block`) o marque después (`warn`).

## 8. Decisiones abiertas

1. **Dónde vive el modelo `VocabularyDoc`.** (a) En `pron`, junto a `ProjectionDoc`; (b) en `graph_ui`, que
   lo registra en el mundo como `pron` registra los suyos; (c) declarado por CLI en cada mundo, como en la
   prueba. Recomendación: **(b)**. Mantiene al sustrato sin conocer vocabularios (decisión 1 del README) y
   evita que cada mundo copie la definición.
2. **Un documento o una familia.** Un documento anidado (esta propuesta) se lee y se versiona entero y ya
   probó que se declara por CLI. Una familia (`VocabularyDoc` + un documento por símbolo, conector y
   herramienta) permitiría editar un vocabulario con un vocabulario, pero los modelos del mundo no son
   documentos y las referencias a ellos seguirían siendo texto. Recomendación: **un documento** para empezar.
3. **Catálogos cerrados o extensibles.** Recomendación: cerrados, con `formula`/`solver` como salida hacia
   herramientas externas.
4. **Reglas: bloquear o avisar**, y si las generales (participación mínima, unicidad, aristas paralelas)
   deberían pasar a `kgdb`.
5. **Ejecutar: escribir o simular.** Disparar una transición sobre una instancia real escribe por
   `Kernel.change`; una red de Petri probablemente se simula en la vista.
6. **Guardado.** Pasar de `/api/save` (diff de estados) a operaciones cambia el contrato entre el front y
   `serve.py`.

## 9. Fuentes

Todo lo citado está en los tres ejes de este manual; en particular:

- [Sirius Web](02-prior-art/sirius-web.md) (mappings de nodo, contenedor y arista; herramientas), [GLSP](02-prior-art/eclipse-glsp.md)
  (operaciones), [MetaEdit+/GOPPRR](02-prior-art/metaedit-gopprr.md) (roles), [Fresnel](02-prior-art/fresnel.md) (lens/format).
- [Lentes bidireccionales](01-fundamentos/lentes-bidireccionales.md), [metamodelado](01-fundamentos/metamodelado-mof.md),
  [variables visuales](01-fundamentos/variables-visuales.md), [Physics of Notations](01-fundamentos/physics-of-notations.md).
- [Huecos](huecos.md) y los 26 documentos del [eje 3](03-diagrama-vocabulario/index.md).
- `pron`: `src/pron/models/projection.py` (`ProjectionDoc`), `src/pron/verbs.py` (`assert_edge`,
  `transition`), `src/pron/kernel.py` (`change`).
