# Representación semántica — manual

Este manual reúne lo que necesitamos entender para que `graph_ui` deje de *proyectar* datos y
pase a *representarlos*: mostrar un mundo de `pron`/`sldb` con la notación y el significado de
un vocabulario (UML, ER, statecharts, BPMN…) y permitir editarlo a través de esa misma notación,
llevando la intención de vuelta al store.

No es documentación del código actual de `graph_ui` (para eso está
[`../mindmap-developer.md`](../mindmap-developer.md)). Es la base conceptual para diseñar lo que
viene y, sobre todo, para **reconocer qué les falta a `pron`, `kgdb`, `sldb` y `graph_ui`**. Cada
hueco que aparece en un documento se consolida en [`huecos.md`](huecos.md).

## Proyectar no es representar

- **Proyectar** es tomar lo que hay en el store y ponerlo en un canvas genérico: cada documento
  es una caja, cada campo que parece referencia es una línea. El significado se *infiere* de la
  forma del dato (¿el payload tiene `source_id` y `target_id`? entonces es una arista). Así
  funcionan hoy las vistas KB, Flujo y Schema de `graph_ui`.
- **Representar** es mostrar el dato *como* algo: una clase UML, una transición de estados, un
  carril de un proceso. El significado está *declarado* (por el mundo y por un vocabulario), la
  notación es consecuencia de ese significado, y una acción en el diagrama —arrastrar, conectar,
  anidar— significa algo en lo representado, no solo en el grafo.

La separación de fondo tiene nombre en la literatura: **sintaxis abstracta** (qué hay y qué
significa: lo que declara el mundo pron) y **sintaxis concreta** (cómo se ve y cómo se manipula:
lo que declarará un vocabulario visual, sobre las formas de `pron`). Ver [`01-fundamentos/`](01-fundamentos/index.md).

## Dónde está `graph_ui`

`graph_ui` es una **superficie de `pron`, al mismo nivel que el SHRDLU**: el SHRDLU proyecta lenguaje,
`graph_ui` proyecta visualizaciones. Las dos están sobre las formas de `pron` y ninguna pasa por la otra.

```
sldb | kgdb        documentos, esquema, grafo tipado
API de pron        Kernel, Verbs: verificación, MoveDoc, undo
formas de pron     s-expressions evaluadas de forma determinista (spec 13 de pron)
superficies        SHRDLU: oración → formas → respuesta en lenguaje
                   graph_ui: gesto → formas → visualización
```

Cada superficie tiene su vocabulario, y los dos nombran lo mismo: los modelos, campos, valores y verbos
(`RelationTypeDoc`) del mundo, recortados por un `ProjectionDoc`. El **léxico** del SHRDLU dice cómo se *dice*
cada forma (`class`, `interface`, `confirm it`); el **vocabulario visual** de `graph_ui` dice cómo se *dibuja* y
con qué gesto se *escribe*. `graph_ui` no dibuja palabras ni usa alias del léxico; el SHRDLU no conoce
notaciones.

## Las tres preguntas que ordenan el manual

| Eje | Pregunta | Carpeta |
|---|---|---|
| 1 | ¿Qué conceptos y teoría necesitamos? | [`01-fundamentos/`](01-fundamentos/index.md) |
| 2 | ¿A quién más se le ocurrió esto, y cómo lo resolvió? | [`02-prior-art/`](02-prior-art/index.md) |
| 3 | ¿Qué formas toma la relación entre un diagrama y su vocabulario? | [`03-diagrama-vocabulario/`](03-diagrama-vocabulario/index.md) |

Cada carpeta tiene un `index.md` que la resume y enlaza un documento por tipo. El eje 3 tiene dos
niveles: primero *dónde vive el significado* en el diagrama (forma de los nodos, anidamiento,
posición, …) y dentro de cada uno, *un documento por notación de ejemplo*.

Al final, con todo lo anterior, [`propuesta-vocabulario-visual.md`](propuesta-vocabulario-visual.md) propone el
vocabulario visual de `graph_ui` sobre las formas de `pron`.

## Decisiones ya tomadas

1. **`graph_ui` y el SHRDLU son superficies hermanas sobre las formas de `pron`.** Uno proyecta lenguaje y el
   otro visualizaciones; `graph_ui` no pasa por el SHRDLU ni depende de su léxico (alias `AnchorDoc`, formas
   de decir). Lo que comparten está debajo: los nombres del mundo (modelos, campos, valores, `RelationTypeDoc`,
   verbos del kernel), el `ProjectionDoc`, las formas y su evaluación. `pron`, `kgdb` y `sldb` no deberían
   saber que UML existe como notación.
2. **Se parte con dos visualizaciones concretas distintas a la vez**, para que nada del diseño quede
   hecho a la medida de una sola. Lo que falte para representarlas se agrega **extendiendo `pron`**
   (formas, reglas, contrato de runtime), no reimplementándolo en el front.
3. **Se escribe por formas y de inmediato.** Cada gesto evalúa formas de `pron` (spec 13: `session.eval`),
   con su `MoveDoc`, sus verificaciones y `undo`, sin construir oraciones; no hay borrador ni botón de guardar.
   Las versiones las lleva git. Por debajo de las formas queda solo lo que no tiene forma: la edición de
   esquema (spec 12 §4 de `pron`).
4. **Las reglas generales van al sustrato y bloquean** (participación mínima, unicidad…), en `kgdb`
   o `pron`, no como verificadores del front.
5. **UML es el primer vocabulario de prueba.** Si el diseño es bueno, implementarlo no toca código:
   basta declarar modelos y verbos en un mundo y su vocabulario visual. Los alias del léxico no hacen falta
   para dibujar ni para editar.
6. **No toda vista aplica a todo dato.** Una vista se ofrece solo cuando la proyección de la sesión tiene los
   modelos y verbos que su vocabulario visual nombra.

La [propuesta](propuesta-vocabulario-visual.md) explica qué cambió respecto de las versiones anteriores: la
primera mezclaba en un solo documento lo que es de `pron` y lo visual; la segunda ataba el vocabulario visual
a las palabras del léxico, como si `graph_ui` estuviera encima del SHRDLU.

## Cómo leer cada documento

Todos los documentos de un mismo eje siguen la misma plantilla, para que se puedan comparar y,
más adelante, modelar como documentos de un store.

- **Fundamentos** (eje 1): definición · por qué importa aquí · ejemplo en código · aplicación a
  `pron`/`graph_ui` · fuentes.
- **Prior art** (eje 2): qué es · arquitectura · cómo declara el mapeo semántico → notación · cómo
  resuelve la edición de vuelta · fragmento de código real · qué tomamos y qué no · fuentes.
- **Notación de ejemplo** (eje 3):
  1. qué representa;
  2. sintaxis abstracta (constructos y su significado);
  3. sintaxis concreta (constructo → símbolo);
  4. reglas de conexión;
  5. ejemplo en su notación estándar, renderizado con la herramienta que ya existe (resultado
     esperado);
  6. el mismo ejemplo como mundo `pron`, montado de verdad;
  7. qué tendría que declarar el vocabulario visual para dibujarlo y editarlo (la columna *Operación*
     nombra la intención del gesto, como `assert(realizes, A, B)` o `reparent(nodo, padre)`; lo que escribe
     se evalúa como formas de `pron`: `assert`, `change`, `create`, `forget`, `move`. Donde un documento del
     eje 3 usa `pron say` o un alias del léxico, es porque se verificó hablando con el SHRDLU, no porque
     `graph_ui` lo necesite);
  8. huecos;
  9. fuentes.

### Por qué cada ejemplo trae una imagen renderizada y un mundo `pron`

Hoy `graph_ui` no puede dibujar UML, BPMN ni statecharts; eso es lo que vamos a diseñar. Mientras
tanto, cada ejemplo del eje 3 se renderiza con la herramienta que ya lo hace (`plantuml`, `mmdc`,
`dot`, `spec2viz`, bpmn-js, Vega) y la imagen queda en `<documento>.assets/`. Cuando la notación no
tiene renderer instalado (Wardley, Petri, DFD, IBIS), el documento lo dice y dibuja desde el mundo con
las convenciones de la notación. Esa imagen es el **resultado
esperado**: el día que `graph_ui` + vocabulario visual funcione, desde el mundo `pron` del mismo
documento tiene que producir algo semánticamente equivalente. Renderizar también atrapa ejemplos
mal escritos, que de otro modo pasarían inadvertidos en un manual.

Los vocabularios que **se ejecutan** tienen además un oráculo de comportamiento: XState para el
statechart, SNAKES para la red de Petri, flamapy para el feature model. Y los que tienen editores
maduros, un oráculo de reglas: `bpmnRules.canConnect` de bpmn-js, la matriz de relaciones de Archi,
los esquemas oficiales (SCXML, PNML, BPMN) — que en dos casos resultaron no validar la gramática que
su especificación exige.

El mundo `pron` equivalente se monta de verdad en un directorio temporal y se pasa por
`pron check`. Si algo del ejemplo no se puede expresar, no se esconde: es un hueco y se anota. Las
reglas que el mundo acepta y la notación no (el "monta sano" de cada control negativo) las verifica un
script; esas reglas son las que el sustrato tendría que poder declarar (decisión 4).

Los fragmentos de código de herramientas y notaciones externas se copian de su documentación
oficial con el enlace exacto.

Los mundos de ejemplo se montan con [`herramientas/montar_mundo.py`](herramientas/montar_mundo.py),
que lee un YAML (modelos, tipos de relación, documentos, relaciones) y solo invoca los CLI de `sldb`
y `pron`.

## Glosario mínimo

| Término | Significado en este manual |
|---|---|
| Mundo | Un store `sldb` convertido en mundo `pron` (`pron init`): documentos, verbos, aristas, anclas, proyecciones. |
| Sintaxis abstracta | Los constructos de un lenguaje y sus relaciones, sin notación. En nuestro caso, lo que el mundo declara. |
| Sintaxis concreta | La forma perceptible de esos constructos (símbolos, trazos, posición) y los gestos para manipularlos. |
| Metamodelo | Modelo que define un lenguaje de modelado. UML está definido por un metamodelo. |
| Forma | Una s-expression de `pron` (spec 13): `(assert realizes (doc "UmlClass:table") (doc "UmlClass:bookable"))`. Es el lenguaje que evalúan todas las superficies. |
| Superficie | Lo que convierte una entrada en formas y proyecta el resultado: el SHRDLU (oraciones, lenguaje) y `graph_ui` (gestos, visualizaciones), al mismo nivel. |
| Vocabulario (léxico) | Las palabras del SHRDLU (spec 05 de `pron`): cómo se dice cada forma, con alias `AnchorDoc`. Es de `pron`. |
| Notación | Un lenguaje de representación concreto (UML de clases, ER, BPMN…): qué constructos tiene y cómo se ven. |
| Vocabulario visual | Documentos del mundo, interpretados por `graph_ui`, que dicen cómo se dibujan en una notación los modelos, campos y verbos del mundo y qué forma escribe cada gesto. Es de `graph_ui`, hermano del léxico. |
| `ProjectionDoc` | Documento de `pron` que declara qué puede nombrar una sesión de cualquier superficie (modelos, relaciones, plantillas de nombre). |
| Proyectar | Mostrar datos infiriendo su forma visual de la forma del payload. |
| Representar | Mostrar datos según un significado declarado, con acciones que significan algo en lo representado. |
| Canal visual | Variable perceptible que carga significado: forma, color, trazo, posición, anidamiento (Bertin). |
| Lente | Par de transformaciones `get` (dato → vista) y `put` (dato + vista editada → dato) que mantiene ambos sincronizados. |
| Hueco | Algo que un vocabulario necesita y que hoy `pron`/`kgdb`/`sldb`/`graph_ui` no puede expresar o hacer. |

## Estado

| Documento | Estado |
|---|---|
| [`01-fundamentos/`](01-fundamentos/index.md) | escrito |
| [`02-prior-art/`](02-prior-art/index.md) | escrito |
| [`03-diagrama-vocabulario/`](03-diagrama-vocabulario/index.md) | escrito |
| [`huecos.md`](huecos.md) | consolidado, con resumen por tema |
| [`propuesta-vocabulario-visual.md`](propuesta-vocabulario-visual.md) | propuesta para discutir |
