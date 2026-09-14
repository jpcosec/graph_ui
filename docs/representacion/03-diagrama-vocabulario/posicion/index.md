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
| [wardley.md](wardley.md) | mapa de Wardley | cadena de valor por visibilidad (eje y) y evolución (eje x) | escrito |

## Implicancias

Lo que dejaron los cuatro ejemplos:

| | Eje | Tipo de medida | Fuente en el mundo | Mover escribe |
|---|---|---|---|---|
| [secuencia](uml-secuencia.md) | y | ordinal | `Message.order` | `order` en el mensaje **y en los desplazados** |
| [carriles](swimlanes.md) | franja | categórico | verbo `performed_by` | borrar + crear la arista; dentro de la franja, nada |
| [Gantt](gantt.md) | x | temporal métrico | `Task.start`, `Task.end` | `start` y `end` |
| [Wardley](wardley.md) | x e y | continuo `[0, 1]`, x con bandas | `maturity`, `visibility` | los dos campos |

- **Un eje es una declaración con tres partes**: qué campo o relación lo alimenta, qué tipo de medida
  tiene (ordinal, categórico, temporal, continuo con bandas) y qué hace un gesto sobre él. Con eso se
  describen los cuatro ejemplos; sin el tipo de medida no se sabe si arrastrar cuesta una escritura o N
  (secuencia) ni si una distancia significa algo.
- **Mover en un eje sin significado no escribe** (dentro de un carril). El vocabulario tiene que
  declarar qué ejes son del mundo y cuáles del layout; `graph_ui` hoy trata todo como layout
  (`mindmap-view.json`, dagre).
- **Las reglas de posición no viven en el sustrato**: orden único (secuencia), fin ≥ inicio (Gantt),
  rango `[0, 1]` y aciclicidad (Wardley) montan sanos en los tres casos. Solo lo que se puede decir como
  tipos, cardinalidad o `condition` entre extremos de una arista lo hace cumplir `pron`/`kgdb`. El resto
  lo tuvo que verificar un script del vocabulario (`verificar-plan.py`, `verificar-mapa.py`).
- **Valores derivados o heredados** aparecen dos veces (inicio desde dependencias en Gantt, visibilidad
  del sucesor en Wardley): el vocabulario necesita decir si un gesto **restringe** o **propaga**.
- **La notación trae dato de vista** (desplazamiento de rótulos en OnlineWardleyMaps): una lente desde
  el texto necesita un complemento, porque el mundo no lo guarda.

## Fuentes

- OMG, *UML* (interacciones): https://www.omg.org/spec/UML/
- OMG, *BPMN 2.0*: https://www.omg.org/spec/BPMN/2.0/
- S. Wardley, *Wardley Maps*: https://learnwardleymapping.com/
- J. Bertin, *Sémiologie graphique* (1967): la posición como variable visual.
