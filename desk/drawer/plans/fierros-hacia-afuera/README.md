# Plan: los fierros de graph_ui hacia afuera

Escrito el 2026-11-25. Recoge lo decidido por JP ese día sobre qué tiene que poder entregar
graph_ui a las demás interfaces y a specIR. El detalle de tareas y dependencias está en `dag.yaml`.

## De dónde sale

JP fijó (2026-11-25) que **el render principal de un diagrama, con edición e interacción, es la
vista de notación de graph_ui**, y que HTML o SVG queda solo para cuando el diagrama va en línea
dentro de otro documento. Reafirma la decisión del 2026-10-17 (todo spec2viz se muestra sobre
graph_ui).

Pidió dos capacidades antes que cualquier otra cosa:

1. "graph_ui debería permitir exportar un panel de edición embebible, algo así como un componente
   que se pueda llegar e insertar en cualquier otra UI y que tenga las mismas funcionalidades que
   tiene en su propia UI ahora."
2. "graph_ui debería permitir exportar html o svg de modo lector tal como los que tenía spec2viz."

## Dónde está parado graph_ui

Medido el 2026-11-25 en johanes (graph_ui `36adfbb`, sldb `61c5847f`), en Chrome real, con el
corpus de specs de spec2viz (`IR/tests/visual/fixtures/`):

- 38 specs válidas distintas, de los 8 tipos de diagrama. **Todas se dibujan sin errores de página
  y sin avisos de "no sé dibujar esto".** En dibujo, la paridad con spec2viz ya está.
- Una actividad de 13 nodos y 17 relaciones (`activity.render-error-handling`) hace 99 corridas de
  ELK y tarda 3,5 s; las demás hacen 24 y tardan 0,3 a 0,5 s. ELK corre sin worker, así que la
  página no responde mientras tanto.
- Las specs sincronizadas sueltas caen todas en "Sin categoría"; la categoría la da la
  sincronización del catálogo (`vistas.yml`).
- La vista de notación es de **solo lectura** (`nodesConnectable=false`, sin diálogos).
- La vista solo lista `SpecDoc`. Un `ViewDoc` con notación se evalúa en el servidor
  (`POST /api/views/evaluate`) pero ninguna vista del frontend lo muestra.

## Bloques

| Bloque | Qué es | Estado al 2026-11-25 |
|---|---|---|
| A. Panel embebible | Montar una vista en una página ajena con una llamada, sin el cascarón | 4 tareas en borrador (G-A1 a G-A4) |
| B. Modo lector | SVG y HTML autocontenido, con el mismo layout que la vista | 2 tareas en borrador (G-B1, G-B2) |
| C. `ViewDoc` en la vista | La vista de notación lista y dibuja también `ViewDoc` | 1 tarea en borrador (G-C) |
| D. Rendimiento del layout | Cortar la búsqueda de candidatos y correr ELK en un worker | 1 tarea en borrador (G-D) |
| E. Átomos y anotaciones | Panel de átomos por nodo y anotaciones guardadas en el store | sin tarea |
| F. BPMN | Layout de carriles, eventos y compuertas para una notación BPMN | decidido que va; sin brief |
| G. Edición por gestos | Editar desde el diagrama | decidido que entra; sin diseño |
| H. Tema y vistas nuevas | Tema de papel; vistas con la estructura del prototipo de Kimun | espera al bloque A |

### A. Panel embebible

A favor: `SourceProvider` ya recibe `request` inyectado (`frontends/mindmap/app.js`,
`source/source.js`). Lo que hoy lo impide:

- rutas absolutas a la raíz del servidor (`/api/...`, `/skins/*.css`, `/views/.../*.css`);
- cinco vistas importan `request` de `shell/api.js` en vez de recibirlo;
- el importmap de `index.html` (React, xyflow, elkjs) tiene que ponerlo la página anfitriona;
- el tema va en `data-skin` de `<html>` y hay claves globales de `localStorage` (`kb-skin`,
  `kb-notation-spec`, `kb-editor-route`).

Ajustes de la revisión en frío, pendientes de aplicar a los briefs:

- **G-A2** pide probar que "la edición de un label persiste". La vista de notación no edita. La
  prueba embebida tiene que comprobar lo que sí hace: listar el catálogo, dibujar un spec, cambiar
  de spec, «Ver todo», sin errores de página. Falta `elkjs` en la lista del importmap.

### B. Modo lector

El generador usa la lógica pura que ya existe (`sceneFor`, `bestLayout`, `notation-style.mjs`,
`notation-swimlanes.mjs`, `notation-deployment.mjs`), no un segundo layout.

Ajuste de la revisión en frío:

- **G-B1 cubre solo la escena de grafo.** Las secuencias (`lanes`) y las matrices (`grid`) calculan
  su geometría en `notation.mjs` (`laneScene`, `gridScene`), pero su dibujo está dentro de
  `notation-view.js` como componentes htm (`LanesDiagram`, `GridDiagram`). Para que el exportador
  cubra los 8 tipos hay que sacar ese dibujo a un módulo puro que usen la vista y el exportador.
- La prueba compara posiciones contra la escena calculada con la misma medida de texto aproximada:
  en node no hay canvas.

### G. Edición por gestos

El diseño que existe es de septiembre (`docs/representacion/plan-de-cierre.md`, fase 3): un gesto
escribe una forma de pron con huecos, declarada en un `GestureDoc`, por `POST /api/eval`. Nunca se
construyó: no existe el endpoint ni `GestureDoc`.

Cinco días después, el ADR `sldb/docs/architecture/sldb-absorbs-kgdb.md` (aceptado el 2026-09-20)
dice que "graph_ui is a graphical UI over SLDB, not a surface over pron". Y hay un borrador más
nuevo (`desk/tasks/task-edicion-contextual-de-relaciones-y-campos-con-control-de-concurrencia`, del
2026-11-16) que escribe con `sldb.api.apply_batch` pero valida relaciones con pron.

Por dónde escribe la edición es una decisión abierta de JP (ver abajo).

## Decisiones

Tomadas por JP el 2026-11-25:

- El render principal es graph_ui; HTML y SVG, solo en línea.
- Los bloques A y B van primero.
- La edición por gestos entra ahora, no después.
- BPMN va como notación en el render principal, no solo como XML.
- La UI nueva de specIR espera al panel embebible (bloque A) antes de decidirse.

Abiertas:

- **Por dónde escribe la edición**: por sldb sin pron, o por formas de pron. Depende de qué se
  haga con pron (ver `sldb/desk/drawer/plans/pedidos-de-specir-y-graph-ui/`, sección pron).
- **Dónde caen el panel de átomos y las anotaciones**: en la vista de notación de graph_ui, o como
  vista aparte.
- **Dónde vive la UI de specIR** cuando exista el panel: una app que lo incrusta, o vistas y un
  tema dentro de graph_ui.

## Quién lo corre

El despacho de robocop2 (panel `wA:p1`) creó las tareas G-A, G-B, G-C y G-D en este desk. graph_ui
todavía no tiene cola, integrate ni entrada en el timer de deskops; el despacho dijo que lo cablea
copiando la configuración de IR. Hasta entonces nada de esto corre.
