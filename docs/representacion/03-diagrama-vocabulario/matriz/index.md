# Matriz

## Dónde vive el significado

En **la celda**. Una matriz pone elementos en filas y columnas, y cada celda dice algo sobre ese
par: si hay dependencia, quién es responsable, qué intensidad tiene. Es otra forma de dibujar una
relación: la misma que en un grafo sería una arista, aquí es una marca en la intersección. Escala
mejor que un grafo cuando hay muchas relaciones densas y hace visibles patrones (bloques,
ciclos, huecos) que en un grafo se pierden.

`spec2viz` ya tiene un tipo `matrix` (`MatrixIR`: etapas, filas, spans).

## Qué tiene que poder declarar un vocabulario de esta forma

- **Qué modelos van en filas y cuáles en columnas** (pueden ser los mismos: DSM).
- **Qué relación o campo llena la celda** y cómo se codifica (marca, valor, letra R/A/C/I).
- **Orden de filas y columnas** (por campo, por agrupamiento, por clustering).
- **Gestos**: marcar una celda crea la relación; cambiar su valor edita un campo de la relación.

## Ejemplos

| Documento | Vocabulario | Qué representa | Estado |
|---|---|---|---|
| [dsm.md](dsm.md) | Design Structure Matrix | dependencias entre elementos de un mismo sistema | escrito |
| raci.md | matriz RACI | responsabilidad de cada rol en cada actividad | pendiente |

## Implicancias

- Para `graph_ui`: una vista que no es React Flow. Prueba de que el vocabulario decide el renderer,
  no solo el estilo.
- Para el `VocabularyDoc`: el "cómo" de una relación incluye "celda de matriz".

## Fuentes

- D. V. Steward, *The design structure system* (1981); https://dsmweb.org/
- `spec2viz`, `spec2viz/ir.py` (`MatrixIR`).
