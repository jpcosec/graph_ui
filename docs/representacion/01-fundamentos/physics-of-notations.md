# Physics of Notations: cómo evaluar una notación

## Definición

Daniel Moody (2009) propuso tratar el diseño de notaciones visuales como un problema de ingeniería
con criterios explícitos, en vez de convención o gusto. Su variable a optimizar es la **efectividad
cognitiva**: la velocidad, facilidad y precisión con que la mente procesa una representación. Parte
de la teoría de la comunicación: el diseñador **codifica** (elige símbolos sobre las variables
visuales) y el lector **decodifica** en dos fases, una **perceptual** (automática, rápida,
paralela) y una **cognitiva** (lenta, con esfuerzo, secuencial). Una buena notación desplaza
trabajo de la segunda a la primera.

Moody observó que en ingeniería de software el razonamiento se pone en la semántica y la notación
es un agregado posterior, sin justificación (el ejemplo clásico: por qué una clase UML es un
rectángulo).

## Los nueve principios

| Principio | Qué pide | Pregunta de chequeo para un vocabulario visual |
|---|---|---|
| **Claridad semiótica** | correspondencia 1:1 entre constructos semánticos y símbolos | ¿hay dos constructos con el mismo símbolo, o uno con varios? |
| **Discriminabilidad perceptual** | símbolos distintos fáciles de distinguir; depende de la *distancia visual* (en cuántas variables difieren y cuánto); la forma es la variable principal | ¿dos kinds distintos difieren solo en un punteado? |
| **Transparencia semántica** | que el aspecto sugiera el significado (inmediato, opaco o perverso) | ¿un ícono o forma evoca el constructo? |
| **Gestión de complejidad** | modularización y jerarquía para no exceder la memoria de trabajo | ¿el vocabulario permite plegar, enfocar, dividir en diagramas? |
| **Integración cognitiva** | mecanismos para integrar varios diagramas: contexto y navegación | si un mundo tiene varias vistas, ¿se puede saber dónde se está y saltar entre ellas? |
| **Expresividad visual** | usar el rango de variables visuales (de 0, texto, a 8, saturado) | ¿todo se distingue solo por forma, o se usan también color, tamaño, posición? |
| **Doble codificación** | texto que *complementa* (no reemplaza) lo gráfico | ¿las multiplicidades y nombres de rol van como texto junto al símbolo? |
| **Economía gráfica** | cantidad manejable de símbolos; el ojo discrimina ~6 categorías por variable | ¿cuántos kinds distintos tiene que memorizar el lector? |
| **Ajuste cognitivo** | dialectos visuales distintos para tareas y audiencias distintas | ¿el mismo mundo tiene una notación para expertos y otra para novatos? |

Claridad semiótica tiene cuatro anomalías con nombre:

| Anomalía | Qué es |
|---|---|
| **redundancia** | varios símbolos para el mismo constructo |
| **sobrecarga** | el mismo símbolo para varios constructos |
| **exceso** | símbolos que no representan ningún constructo |
| **déficit** | constructos que no tienen símbolo |

Los principios interactúan y a veces se oponen: reducir la cantidad de símbolos (economía gráfica)
puede introducir déficit a propósito (dejar algo en texto); aumentar la expresividad visual sube la
discriminabilidad.

## Por qué importa aquí

Un vocabulario visual es, entre otras cosas, una tabla constructo → símbolo. Los principios de Moody
dan una forma de **evaluar esa tabla automáticamente** antes de dibujar nada, y de detectar
defectos en las vistas actuales de `graph_ui`. Ajuste cognitivo, además, respalda una de las
decisiones del manual: no toda vista representa lo mismo para todo dato, y un mismo mundo puede
tener varios vocabularios.

## Ejemplo en código: auditoría de claridad semiótica

Archivo [`ejemplos/claridad-semiotica.mjs`](ejemplos/claridad-semiotica.mjs) (escrito para este
manual). Un símbolo es un objeto `{variable visual: valor}`; la auditoría reporta las cuatro
anomalías y los pares de constructos cuya distancia visual es 1 (difieren en una sola variable):

```js
export function audit({constructs, mapping, symbols = []}) {
  const bySymbol = new Map(), byConstruct = new Map();
  for (const {construct, symbol} of mapping) {
    bySymbol.set(key(symbol), [...(bySymbol.get(key(symbol)) || []), construct]);
    byConstruct.set(construct, [...(byConstruct.get(construct) || []), symbol]);
  }
  const report = {
    sobrecarga: [...bySymbol.values()].filter(cs => new Set(cs).size > 1),
    redundancia: [...byConstruct].filter(([, ss]) => new Set(ss.map(key)).size > 1).map(([c]) => c),
    deficit: constructs.filter(c => !byConstruct.has(c)),
    exceso: symbols.filter(s => !bySymbol.has(key(s))),
    distanciaBaja: [],
  };
  // ... pares con distancia visual 1
  return report;
}
```

Se aplica a dos tablas: las aristas de la vista Schema actual de `graph_ui`, tomadas de
`views/models/diagram/diagram-view.js`, y un subconjunto de UML de clases.

```sh
node docs/representacion/01-fundamentos/ejemplos/claridad-semiotica.mjs
```

Salida real:

```
== Schema actual de graph_ui
{
  "sobrecarga": [
    [
      "relación declarada con instancias",
      "relación observada no declarada"
    ]
  ],
  "redundancia": [],
  "deficit": [],
  "exceso": [],
  "distanciaBaja": [
    "contención declarada ~ relación declarada con instancias",
    "contención declarada ~ relación observada no declarada",
    "relación declarada con instancias ~ relación declarada sin instancias",
    "relación declarada sin instancias ~ relación observada no declarada"
  ]
}

== UML de clases
{
  "sobrecarga": [],
  "redundancia": [],
  "deficit": [],
  "exceso": [],
  "distanciaBaja": [
    "generalización ~ realización",
    "generalización ~ asociación",
    "realización ~ dependencia",
    "composición ~ agregación",
    "composición ~ asociación",
    "agregación ~ asociación"
  ]
}
```

Lectura:

- **Schema de `graph_ui` tiene una sobrecarga real**: una relación declarada por un
  `RelationTypeDoc` que tiene instancias y una relación observada que *nadie declaró* se dibujan
  exactamente igual (tono *accent*, trazo sólido, flecha llena). Son constructos distintos —uno
  está en la sintaxis abstracta del mundo, el otro es una inferencia— y el lector no puede
  distinguirlos. Además, varios pares difieren en una sola variable.
- **UML tampoco sale limpio en discriminabilidad**: generalización y realización difieren solo en
  el trazo; composición y agregación solo en el relleno del rombo. Es una crítica que Moody hace a
  las notaciones de software, que dependen casi solo de la forma.
- Límite honesto de la auditoría: la distancia cuenta *en cuántas* variables difieren dos símbolos,
  no *cuánto*; un triángulo contra nada es más distancia que dos punteados parecidos, y aquí
  cuentan igual.

## Aplicación a `pron` y `graph_ui`

- Esta auditoría puede ser un lint del vocabulario visual: correrla sobre su tabla de símbolos al
  guardarlo, como `pron check` corre sobre un mundo.
- Hueco inmediato en `graph_ui`: la sobrecarga declarado/observado en Schema
  ([`../huecos.md`](../huecos.md)).
- Doble codificación sugiere mostrar `cardinality` como texto en los extremos, que hoy `graph_ui`
  omite.
- Economía gráfica pone un techo: un vocabulario con muchos kinds necesita leyenda o agrupar
  kinds; el ~6 por variable es una alarma útil.

## Fuentes

- D. L. Moody, *The "Physics" of Notations: Toward a Scientific Basis for Constructing Visual
  Notations in Software Engineering*, IEEE Transactions on Software Engineering 35(6), 2009,
  pp. 756–779: https://www.semanticscholar.org/paper/The-%E2%80%9CPhysics%E2%80%9D-of-Notations:-Toward-a-Scientific-for-Moody/bcd2c5379a34068040750a751e4fd2710d90c15c
- K. Shelley, presentación del artículo (resumen de los nueve principios y sus anomalías):
  https://pdfs.semanticscholar.org/fbc6/0c004d84d6ee55aaa02f34a823da4f898b2b.pdf
- `graph_ui`, `frontends/mindmap/views/models/diagram/diagram-view.js`.
