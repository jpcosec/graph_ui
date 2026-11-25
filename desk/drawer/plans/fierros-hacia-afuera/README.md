# Plan: graph_ui como editor de grafo

Reescrito el 2026-11-25. Las decisiones y su porqué están en los ADR de sldb
(`sldb/docs/architecture/`): `surface-is-an-editor-contract.md` (graph_ui es el caso de grafo del
contrato de editor, sobre Astryx, con XState), `pron-is-archived.md` (la edición escribe por sldb)
y `mechanism-in-sldb-content-in-specir.md` (las notaciones son contenido de specIR). El dibujo
completo está en `sldb/desk/drawer/plans/superficie-como-contrato-de-editores/`. Aquí va solo el
trabajo de graph_ui; estados y dependencias en `dag.yaml`.

## Dónde está parado

Medido el 2026-11-25 (graph_ui `36adfbb`, sldb `61c5847f`), en Chrome real, con las specs que eran
el corpus de spec2viz:

- 38 specs válidas, de los 8 tipos de diagrama. Todas se dibujan sin errores de página ni avisos.
- Una actividad de 13 nodos y 17 relaciones hace 99 corridas de ELK y tarda 3,5 s; las demás
  hacen 24 y tardan 0,3 a 0,5 s. ELK corre sin worker y la página no responde mientras tanto.
- La vista de notación es de solo lectura, y seleccionar un nodo solo lo resalta.
- La vista solo lista `SpecDoc`. Un `ViewDoc` con notación se evalúa en el servidor y ninguna
  vista lo muestra.
- El modo local abre el store con `pron.world.store.Store` (`sldb_adapter.py`).
- `frontends/mindmap` es React 18 con `htm`, sin build, con importmap.

## Trabajo

| Bloque | Qué es | Estado al 2026-11-25 |
|---|---|---|
| A. Editor de grafo como caso del contrato | Componente de integración de Astryx en React 19: se monta en un contenedor ajeno, recibe cliente y tema, avisa la selección | Las tareas G-A1 a G-A4 se escribieron para React 18 sin build y están frenadas. Se rehacen cuando exista la prueba de integración de `sldb/surface` |
| B. Modo lector | SVG y HTML autocontenido con el mismo layout que la vista | 2 tareas (G-B1, G-B2) |
| C. `ViewDoc` en la vista | La vista lista y dibuja también `ViewDoc` | 1 tarea (G-C) |
| D. Rendimiento del layout | Cortar la búsqueda de candidatos y correr ELK en un worker | 1 tarea (G-D) |
| E. Sin pron | El modo local del adaptador abre el store por `sldb.api` | sin tarea |
| F. Carriles por partición | Layout genérico de carriles, para BPMN y para las capas de specIR; sin código por notación | sin tarea |
| G. Edición por gestos | Editar desde el diagrama, proponiendo cambios a sldb | sin tarea; depende del rechazo antes de escribir en sldb y de la máquina común de guardado |
| H. Ambiente local | Explorador a la izquierda y editor de grafo, con una plantilla de Astryx | sin tarea; depende de A |

Ajuste pendiente de aplicar a G-B1: hoy cubre solo la escena de grafo. Las secuencias y las
matrices calculan su geometría en `notation.mjs` pero su dibujo está dentro de `notation-view.js`
(`LanesDiagram`, `GridDiagram`); hay que sacarlo a un módulo puro que usen la vista y el exportador.

## Lo que ya no es de graph_ui

- El panel del nodo (documento, átomos, referencias) y las anotaciones son del editor de texto.
- El tema: los tokens y skins propios se reemplazan por temas de Astryx.

## Sin decidir

Qué pasa con lo que hoy tiene `mindmap` y no es explorador ni editor de grafo (editor de clases,
vistas de mapa, flujo y esquema), y con `frontends/desk`, `flow_editor`, `workspace` y `apps/`.
