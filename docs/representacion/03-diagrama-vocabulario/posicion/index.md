# Posición

## Dónde vive el significado

En **el lugar**. En estos diagramas mover un elemento cambia lo que dice: en una secuencia, bajar
un mensaje lo hace ocurrir después; en un carril, cambiar de franja cambia quién es responsable;
en un Gantt, desplazar una barra cambia la fecha; en un mapa de Wardley, mover a la derecha dice
que el componente está más evolucionado. El lienzo tiene **ejes o franjas con significado**.

Es la forma que más choca con `graph_ui` actual: ahí la posición es un dato de vista
(`mindmap-view.json`) sin significado, y el layout lo decide dagre.

## Qué tiene que poder declarar un vocabulario de esta forma

- **Ejes**: cuántos, de qué tipo (ordinal, temporal, continuo, categórico) y **qué campo o
  relación del mundo** alimenta cada uno (fecha, orden, madurez, actor).
- **Franjas / carriles**: qué relación asigna un elemento a un carril.
- **Layout derivado del dato**: la posición no se guarda como vista; se calcula del mundo.
- **Gestos que escriben**: arrastrar sobre un eje edita el campo que ese eje representa (mover una
  barra de Gantt cambia `start`; mover un mensaje cambia su orden). Es la edición de vuelta más
  directa y la más fácil de romper.

## Ejemplos

| Documento | Vocabulario | Qué representa | Estado |
|---|---|---|---|
| [uml-secuencia.md](uml-secuencia.md) | UML, diagrama de secuencia | intercambio de mensajes entre participantes en el tiempo | escrito |
| [swimlanes.md](swimlanes.md) | carriles (BPMN pools/lanes, actividad UML) | responsabilidad de cada actor sobre los pasos de un proceso | escrito |
| [gantt.md](gantt.md) | Gantt | tareas en el tiempo, duración y dependencias | escrito |
| wardley.md | mapa de Wardley | cadena de valor por visibilidad (eje y) y evolución (eje x) | pendiente |

## Implicancias

- Para `graph_ui`: necesita layouts por vocabulario (no solo dagre) y que "mover" pueda ser una
  escritura al mundo, no solo guardar coordenadas de vista.
- Para el `VocabularyDoc`: tiene que poder declarar ejes y su fuente de datos; es la prueba de que
  el diseño no es solo nodo-arista.

## Fuentes

- OMG, *UML* (interacciones): https://www.omg.org/spec/UML/
- OMG, *BPMN 2.0*: https://www.omg.org/spec/BPMN/2.0/
- S. Wardley, *Wardley Maps*: https://learnwardleymapping.com/
- J. Bertin, *Sémiologie graphique* (1967): la posición como variable visual.
