# Matriz

## Dónde vive el significado

En **la celda**. Una matriz pone elementos en filas y columnas, y cada celda dice algo sobre ese
par: si hay dependencia, quién es responsable, qué intensidad tiene. Es otra forma de dibujar una
relación: la misma que en un grafo sería una arista, aquí es una marca en la intersección. Escala
mejor que un grafo cuando hay muchas relaciones densas y hace visibles patrones (bloques,
ciclos, huecos) que en un grafo se pierden.

`spec2viz` ya tiene un tipo `component_view_matrix` (`MatrixIR`: etapas, filas, spans), pensado para
etapas de un flujo y no para pares (ver [DSM](dsm.md)).

## Qué tiene que poder declarar un vocabulario de esta forma

- **Qué modelos van en filas y cuáles en columnas** (pueden ser los mismos: DSM).
- **Qué relación o campo llena la celda** y cómo se codifica (marca, valor, letra R/A/C/I).
- **Orden de filas y columnas** (por campo, por agrupamiento, por clustering).
- **Gestos**: marcar una celda crea la relación; cambiar su valor edita un campo de la relación.

## Ejemplos

| Documento | Vocabulario | Qué representa | Estado |
|---|---|---|---|
| [dsm.md](dsm.md) | Design Structure Matrix | dependencias entre elementos de un mismo sistema | escrito |
| [raci.md](raci.md) | matriz RACI | responsabilidad de cada rol en cada actividad | escrito |

## Implicancias

Lo que dejaron los dos ejemplos:

| | Filas × columnas | La celda es | Regla que sí hizo cumplir el sustrato | Qué calculó la vista |
|---|---|---|---|---|
| [DSM](dsm.md) | el mismo conjunto | existencia de un verbo + peso (`notes`) | tipos | orden particionado, bloques (ciclos) |
| [RACI](raci.md) | dos conjuntos | **cuál de cuatro verbos** existe | un solo A (`many_to_one`) | la letra, el color |

- **Una matriz es otro renderer, no otro estilo**: ni React Flow ni el tipo `component_view_matrix` de
  `spec2viz` (que funde celdas contiguas en barras de etapas) dibujan pares. Los dos ejemplos se renderizaron
  con Vega-Lite desde el mundo.
- **El orden es significado y suele ser derivado**: el particionamiento de la DSM mostró un ciclo entre
  `shell`, `dialogs` y las vistas de `graph_ui` que el grafo no dejaba ver. El vocabulario visual tiene que
  poder pedir un orden calculado (componentes fuertemente conexos, clustering) o un campo.
- **La celda puede ser una familia de verbos**: RACI son cuatro verbos sobre el mismo par; declararlos por
  separado permite que `kgdb` haga cumplir el A único. El vocabulario los agrupa y les asigna letras (y el
  juego de letras es un parámetro: RASCI, DACI).
- **Gestos sobre celdas**: marcar, cambiar de letra y vaciar son escrituras de relaciones; reemplazar una
  letra son dos escrituras que deben ir juntas.
- **Algunas matrices son de solo lectura**: la DSM de código se genera del código; el vocabulario tiene que
  poder declarar una vista sin gestos de escritura.

## Fuentes

- D. V. Steward, *The design structure system* (1981); https://dsmweb.org/
- `spec2viz`, `spec2viz/ir.py` (`MatrixIR`).
