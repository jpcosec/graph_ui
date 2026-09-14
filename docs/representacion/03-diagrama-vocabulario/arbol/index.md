# Árbol

## Dónde vive el significado

En **la jerarquía**: cada elemento tiene exactamente un padre (salvo la raíz) y el diagrama se
lee de lo general a lo particular. La profundidad significa nivel de detalle; los hermanos son
alternativas o partes del mismo todo. Un árbol es un grafo con una restricción de cardinalidad,
y esa restricción es lo que permite un layout jerárquico sin ambigüedad.

La vista Brainstorm de `graph_ui` es un árbol de ideas guardado aparte (`localStorage`) que se convierte
en documentos; no dibuja el mundo. Un árbol con significado declara qué relación (o qué verbos) es "padre
de", aunque la vista decida no mostrar el tipo (ver [mapa mental](mind-map.md)).

## Qué tiene que poder declarar un vocabulario de esta forma

- **Qué relación es la jerarquía** y exigir que sea `many_to_one` (en `kgdb`: `cardinality`).
- **Raíz**: qué documento o qué criterio la define.
- **Kinds de nodo por nivel o por tipo** (feature obligatoria / opcional / alternativa).
- **Gestos**: arrastrar un nodo a otro padre reescribe la relación; nunca puede dejar dos padres.

## Ejemplos

| Documento | Vocabulario | Qué representa | Estado |
|---|---|---|---|
| [mind-map.md](mind-map.md) | mapa mental | ideas alrededor de un tema central | escrito |
| [feature-model.md](feature-model.md) | feature model (FODA) | variabilidad de una línea de productos: features y sus restricciones | escrito |
| [wbs.md](wbs.md) | Work Breakdown Structure | descomposición del trabajo de un proyecto en entregables | escrito |

## Implicancias

Lo que dejaron los tres ejemplos:

| | Qué agrega al árbol | Regla que `kgdb` hizo cumplir | Qué tuvo que verificar un script |
|---|---|---|---|
| [mapa mental](mind-map.md) | nada: oculta el tipo | cada verbo `many_to_one` | un solo padre en la **unión** de verbos, una raíz, sin ciclos |
| [feature model](feature-model.md) | variabilidad y fórmulas | jerarquía `many_to_one` | configuraciones, features muertas (con un solucionador SAT) |
| [WBS](wbs.md) | aritmética (regla del 100 %) y códigos | jerarquía `many_to_one` | totales, códigos únicos y coherentes |

- **Un árbol en un mundo tipado suele ser la unión de varios verbos** (el manual: cuatro). `many_to_one` por
  verbo no garantiza el árbol; la vista tiene que verificarlo o el vocabulario declararlo como invariante. Y un
  árbol dibujado sobre algo que no lo es duplica nodos en silencio.
- **Brainstorm como mapa mental del mundo** (la dirección de producto: el mismo contenido que KB, sin mostrar el
  tipo) necesita dos declaraciones que hoy no existen: qué verbos forman la jerarquía y **qué clase y verbo crea
  Tab** para cada clase de madre. En el propio manual, `Axis` es ambiguo (`Folder` o `Document`). Mientras
  tanto Brainstorm guarda un borrador aparte en `localStorage`.
- **Los árboles más útiles tienen semántica global**: productos válidos de un feature model, totales de una
  WBS. Son derivados (un solucionador, una suma) y el vocabulario tiene que poder pedir que se calculen y se
  marquen, o que se propaguen al editar.
- **Símbolos que no son de un nodo ni de una arista**: el arco de grupo de un feature model agrupa las líneas de
  una madre; el color de rama de un mapa mental es la ascendencia.
- **La posición escrita como dato** (código WBS, igual que `order` en una secuencia) obliga a renumerar al mover.

## Fuentes

- K. Kang et al., *Feature-Oriented Domain Analysis (FODA) Feasibility Study* (1990).
- PMI, *Practice Standard for Work Breakdown Structures*.
- T. Buzan, *Use Your Head* (1974): introduce el término "Mind Map".
