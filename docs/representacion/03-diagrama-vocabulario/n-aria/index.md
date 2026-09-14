# Relaciones n-arias y reificadas

## Dónde vive el significado

En **la relación misma como cosa**. Hay relaciones que tienen atributos propios (una matrícula
entre estudiante y curso tiene nota y fecha) o que unen más de dos elementos a la vez (un
proveedor suministra una pieza a un proyecto). Dibujarlas como una línea entre dos cajas pierde
información: la relación necesita un **nodo propio** del que salen **roles** con nombre hacia cada
participante.

En `kgdb` una `RelationDoc` es binaria (`source_id`, `target_id`) y sus campos son fijos: los campos
extra se descartan en silencio, y no es un nodo del grafo, así que nada puede apuntarle (verificado en
[clase de asociación](clase-de-asociacion.md)). Toda relación con datos, con más de dos extremos o sobre la
que se quiera discutir se **reifica en un modelo** con un verbo por rol. `graph_ui` hoy dibuja ese modelo
como un nodo más.

## Qué tiene que poder declarar un vocabulario de esta forma

- **Qué modelo o relación se reifica**: se dibuja como nodo (rombo en ER, clase unida por línea
  punteada en UML) en vez de arista.
- **Roles**: nombre, multiplicidad y participante de cada extremo.
- **Atributos de la relación** visibles en el nodo.
- **Gestos**: conectar un participante más a la relación agrega un rol; eliminar la relación
  elimina todos sus roles, no deja aristas huérfanas.

## Ejemplos

| Documento | Vocabulario | Qué representa | Estado |
|---|---|---|---|
| [clase-de-asociacion.md](clase-de-asociacion.md) | UML, clase de asociación | una asociación que tiene atributos propios | escrito |
| [er-n-aria.md](er-n-aria.md) | ER, relación n-aria | una relación entre tres o más entidades | escrito |
| [argument-maps-ibis.md](argument-maps-ibis.md) | IBIS / mapas de argumentos | discusiones: preguntas, posiciones y argumentos a favor y en contra | escrito |

## Implicancias

Lo que dejaron los tres ejemplos:

| | Qué se reifica | Por qué no alcanza una arista | Qué no se pudo declarar |
|---|---|---|---|
| [clase de asociación](clase-de-asociacion.md) | la reserva entre cliente y mesa | tiene datos propios | que dos verbos son los extremos de una misma asociación |
| [ER n-aria](er-n-aria.md) | el abastecimiento proveedor × ingrediente × local | tiene tres extremos; tres binarias inventan tuplas | unicidad de la tupla y dependencias funcionales entre roles |
| [IBIS / AIF](argument-maps-ibis.md) | el apoyo y la objeción (en AIF) | se quiere atacar la flecha | "exactamente uno de varios verbos" |

- **En `pron`/`kgdb` la reificación siempre es posible y siempre es manual**: un modelo más un verbo
  `many_to_one` por rol monta, y los máximos por rol se hacen cumplir. Lo que falta es declararla: nada une
  los verbos-rol en "una relación", ni exige que estén todos, ni que la tupla sea única.
- **El dibujo tiene que re-colapsar**: una clase de asociación es una línea con una caja, una relación
  ternaria de Chen es un rombo, un RA de AIF no atacado es una flecha. El `VocabularyDoc` necesita un
  constructo "relación reificada" que diga qué modelo, qué verbos son sus roles y cómo se dibuja colapsada.
- **La inferencia no basta**: la heurística "dos o más verbos `many_to_one`" acierta con `Reservation` y
  `UmlAssociation` y se equivoca con `Message`; y la misma `Reservation` es entidad en un vocabulario (ER)
  y asociación en otro (UML). La reificación es una decisión del vocabulario.
- **Los gestos son compuestos y guiados**: crear una reserva, un abastecimiento o un follow-up de gIBIS es
  un nodo más sus aristas-rol, en una unidad; el menú legal sale de los verbos, pero la dirección de la
  jugada la declara el vocabulario.
- **El símbolo puede depender de las aristas** (`+`/`−` de un argumento según qué verbo sale), no solo de
  la clase o de un campo.

## Fuentes

- OMG, *UML* (AssociationClass): https://www.omg.org/spec/UML/
- P. Chen (1976), relaciones de grado n.
- W. Kunz, H. Rittel, *Issues as elements of information systems* (1970), origen de IBIS.
