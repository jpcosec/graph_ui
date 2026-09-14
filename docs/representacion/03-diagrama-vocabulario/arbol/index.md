# Árbol

## Dónde vive el significado

En **la jerarquía**: cada elemento tiene exactamente un padre (salvo la raíz) y el diagrama se
lee de lo general a lo particular. La profundidad significa nivel de detalle; los hermanos son
alternativas o partes del mismo todo. Un árbol es un grafo con una restricción de cardinalidad,
y esa restricción es lo que permite un layout jerárquico sin ambigüedad.

La vista Brainstorm de `graph_ui` es un árbol de ideas, pero de ideas sin tipo: no representa
nada del mundo hasta convertirse. Un árbol con significado declara qué relación es "padre de".

## Qué tiene que poder declarar un vocabulario de esta forma

- **Qué relación es la jerarquía** y exigir que sea `many_to_one` (en `kgdb`: `cardinality`).
- **Raíz**: qué documento o qué criterio la define.
- **Kinds de nodo por nivel o por tipo** (feature obligatoria / opcional / alternativa).
- **Gestos**: arrastrar un nodo a otro padre reescribe la relación; nunca puede dejar dos padres.

## Ejemplos

| Documento | Vocabulario | Qué representa | Estado |
|---|---|---|---|
| mind-map.md | mapa mental | ideas alrededor de un tema central | pendiente |
| feature-model.md | feature model (FODA) | variabilidad de una línea de productos: features y sus restricciones | pendiente |
| wbs.md | Work Breakdown Structure | descomposición del trabajo de un proyecto en entregables | pendiente |

## Implicancias

- Para `graph_ui`: Brainstorm podría ser un vocabulario de árbol sobre una relación real del mundo
  en vez de un borrador aparte en `localStorage`.
- Para el `VocabularyDoc`: la aplicabilidad puede depender de la cardinalidad declarada en
  `RelationTypeDoc`.

## Fuentes

- K. Kang et al., *Feature-Oriented Domain Analysis (FODA) Feasibility Study* (1990).
- PMI, *Practice Standard for Work Breakdown Structures*.
- T. Buzan, *Use Your Head* (1974): introduce el término "Mind Map".
