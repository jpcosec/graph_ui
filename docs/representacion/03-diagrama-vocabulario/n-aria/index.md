# Relaciones n-arias y reificadas

## Dónde vive el significado

En **la relación misma como cosa**. Hay relaciones que tienen atributos propios (una matrícula
entre estudiante y curso tiene nota y fecha) o que unen más de dos elementos a la vez (un
proveedor suministra una pieza a un proyecto). Dibujarlas como una línea entre dos cajas pierde
información: la relación necesita un **nodo propio** del que salen **roles** con nombre hacia cada
participante.

En `kgdb` una `RelationDoc` es binaria (`source_id`, `target_id`) pero ya es un documento, así que
puede tener campos. Lo que no existe es la noción de rol ni más de dos extremos. `graph_ui` hoy
colapsa una `RelationDoc` en una arista (vista Flujo) o la muestra como nodo suelto.

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
| clase-de-asociacion.md | UML, clase de asociación | una asociación que tiene atributos propios | pendiente |
| er-n-aria.md | ER, relación n-aria | una relación entre tres o más entidades | pendiente |
| argument-maps-ibis.md | IBIS / mapas de argumentos | discusiones: preguntas, posiciones y argumentos a favor y en contra | pendiente |

## Implicancias

- Para `pron`/`kgdb`: probablemente el hueco más claro del sustrato (roles con nombre, relaciones
  de más de dos extremos). Hay que verificar si se expresa como documento-nodo + varias
  `RelationDoc`, y a qué costo.
- Para el `VocabularyDoc`: un kind de relación tiene que poder dibujarse como nodo con roles.

## Fuentes

- OMG, *UML* (AssociationClass): https://www.omg.org/spec/UML/
- P. Chen (1976), relaciones de grado n.
- W. Kunz, H. Rittel, *Issues as elements of information systems* (1970), origen de IBIS.
