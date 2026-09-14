# Sintaxis abstracta, sintaxis concreta y semántica

## Definición

Un lenguaje de modelado —textual o visual— tiene tres partes (Harel & Rumpe 2004):

| Parte | Qué es | Ejemplo en UML de clases |
|---|---|---|
| **Sintaxis** | el conjunto de expresiones legales | "una clase con atributos, unida a otra por una asociación con multiplicidad `*` a `1`" |
| **Dominio semántico** | los conceptos que existen en el universo de discurso | objetos, valores, vínculos entre objetos |
| **Mapeo semántico** | la función que asigna a cada expresión su significado en el dominio | "una asociación `*`–`1` significa que cada reserva está vinculada a exactamente un cliente" |

La sintaxis a su vez tiene dos caras:

- **Sintaxis abstracta**: la estructura de las expresiones, sin notación. Qué constructos hay y
  cómo se combinan (una `Association` tiene dos `memberEnd`, cada uno con `multiplicity`). En
  lenguajes definidos por metamodelo, *el metamodelo es la sintaxis abstracta*.
- **Sintaxis concreta**: la forma perceptible. En texto, caracteres y gramática; en un diagrama,
  cajas, líneas, flechas y cómo se combinan en el plano.

Y hay una capa que suele confundirse con semántica: las **context conditions**, restricciones
sobre qué expresiones son válidas (tipos compatibles, multiplicidades bien formadas). Siguen siendo
sintaxis.

## Dos advertencias de Harel y Rumpe que nos aplican directo

1. **El metamodelo no es la semántica.** *"Semantics is the metamodel. This is a common misuse of
   the term. The metamodel is but a way to describe the language's syntax; it is a crucial
   precursor, but it is not the semantics itself. Knowing what a language looks like does not
   equate with understanding what it means."* (p. 65). Declarar modelos y tipos de relación en
   un mundo `pron` es declarar sintaxis abstracta y context conditions; el significado lo aportan
   el mapeo (hoy informal, en `description`) y el uso.
2. **Todo lo que se ve o se guarda es sintaxis.** *"Everything on paper or the screen is a
   syntactic representation. This is also true of the machine's internal representation, the
   so-called abstract syntax or metamodel."* (p. 65). Un documento Markdown de `sldb`, su payload
   JSON y la caja que dibuja `graph_ui` son tres sintaxis de lo mismo.

## Sintaxis concreta de un lenguaje visual

Para lenguajes diagramáticos, Harel y Rumpe describen las piezas y cómo se componen: *"basic
expressions include lines, arrows, closed curves and boxes, and composition mechanisms involve
connectivity, partitioning, and 'insideness'"* (p. 65). Y proponen construir la sintaxis concreta
en capas (p. 68):

1. elementos topológicos básicos (segmentos abiertos y cerrados);
2. especialización geométrica (flechas, líneas, cajas, círculos; estilos y colores);
3. combinación topológica con significado (**conectividad, anidamiento, partición,
   intersección**) y su disposición en el plano;
4. context conditions sobre el conjunto de diagramas legales.

La capa 3 es la base de la clasificación del [eje 3](../03-diagrama-vocabulario/index.md): cada
carpeta de ese eje es un mecanismo de composición distinto (conectividad → nodo-arista,
insideness → anidamiento, partición → carriles, …).

## Ejemplo en código: una sintaxis abstracta, varias concretas

El mismo contenido —reservas del restaurante de `pron` (spec 09a): una reserva la hace un
cliente y se asigna a una mesa— en cuatro sintaxis.

**1. Mundo `pron`: sintaxis abstracta + context conditions.** Tipo de relación declarado en el
fixture del mundo (`/home/jp/proyectos/pron/tests/worlds/restaurant.py`, dato real):

```python
{
    "name": "assigned_to",
    "cardinality": "many_to_one",
    "axis": "WHERE",
    "source_types": ["Reservation"],
    "target_types": ["Table"],
    "condition": "capacity >= {party_size}",
    "description": "Which table a reservation gets. The table must seat everyone.",
},
```

`source_types`, `target_types`, `cardinality` y `condition` son context conditions: `kgdb` rechaza
una arista que no las cumpla. `description` es el mapeo semántico en prosa.

**2. `spec2viz`, diagrama de clases.** Archivo
[`ejemplos/restaurante.spec2viz.yml`](ejemplos/restaurante.spec2viz.yml), validado con
`spec2viz diagram validate` (salida: `restaurante.spec2viz.yml: OK`):

```yaml
relations:
  - {from: Reservation, to: Client, relation: association, label: booked_by, from_multiplicity: "*", to_multiplicity: "1"}
  - {from: Reservation, to: Table, relation: association, label: assigned_to, from_multiplicity: "*", to_multiplicity: "1"}
```

**3. PlantUML.** Archivo [`ejemplos/restaurante.puml`](ejemplos/restaurante.puml), sintaxis
verificada con `plantuml -syntax` (salida: `CLASS (3 entities)`):

```plantuml
Reservation "*" --> "1" Client : booked_by
Reservation "*" --> "1" Table : assigned_to
```

**4. `graph_ui`, vista Schema actual.** Dibuja `assigned_to` como una arista color *accent* de
`Reservation` a `Table` con la etiqueta `assigned_to ×n`. No muestra la multiplicidad ni la
condición.

Lo que conserva cada sintaxis concreta del mismo contenido abstracto:

| Constructo abstracto | mundo `pron` | spec2viz | PlantUML | Schema de `graph_ui` |
|---|---|---|---|---|
| tipo de relación `assigned_to` | sí | sí (`label`) | sí (`label`) | sí (etiqueta) |
| origen y destino | sí | sí | sí | sí |
| cardinalidad `many_to_one` | sí | sí (`*`, `1`) | sí (`"*"`, `"1"`) | **no** |
| condición `capacity >= {party_size}` | sí | no | no | **no** |
| clasificación como asociación | **no** | sí | sí (`-->`) | no |

La última fila es el punto: el mundo no dice que `assigned_to` sea una *asociación*. Esa
clasificación pertenece al vocabulario (UML), no al dato. Y la penúltima: la condición existe en el
mundo pero ninguna notación estándar de clases tiene dónde ponerla; un vocabulario puede decidir
mostrarla (como nota, restricción OCL o tooltip) o no.

## Aplicación a `pron` y `graph_ui`

- Entre un mundo y lo que se dibuja hay **dos mapeos**, no uno:
  1. **mundo → constructos del vocabulario** (el modelo `Reservation` es una `Class`;
     `assigned_to` es una `Association` con extremos `*` y `1`);
  2. **constructos del vocabulario → notación** (una `Association` es una línea sólida con
     multiplicidades en los extremos).
  El segundo es fijo por vocabulario (lo define UML); el primero es lo que cada mundo necesita
  declarar. `spec2viz` tiene esta separación: el YAML es el primer mapeo ya hecho, y el renderer
  es el segundo.
- En un editor, la sintaxis concreta incluye **gestos**: arrastrar, conectar, soltar dentro. Un
  gesto es una expresión de la sintaxis concreta que tiene que traducirse a sintaxis abstracta
  (una escritura en el mundo). Ver [lentes bidireccionales](lentes-bidireccionales.md).
- Hueco: `graph_ui` no muestra `cardinality` ni `condition`, que ya están en la sintaxis abstracta
  del mundo ([`../huecos.md`](../huecos.md)).

## Fuentes

- D. Harel, B. Rumpe, *Meaningful Modeling: What's the Semantics of "Semantics"?*, IEEE Computer
  37(10), 2004, pp. 64–72: https://www.se-rwth.de/staff/rumpe/publications20042008/HR_ModSemantics_IEEEComp_04.pdf
- `pron`, `tests/worlds/restaurant.py` y `source/spec/09a-el-mundo-del-restaurante.md`.
- `spec2viz`, `docs/CLASS_DIAGRAMS.md` (`tools/spec2viz`).
- PlantUML, diagramas de clases: https://plantuml.com/class-diagram
