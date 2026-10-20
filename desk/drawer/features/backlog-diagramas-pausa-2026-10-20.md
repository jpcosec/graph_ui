---
title: "Backlog: trabajo de diagramas en pausa (2026-10-20)"
status: paused
---
# Backlog: trabajo de diagramas en pausa (2026-10-20)

El dueño pausó el trabajo de diagramas. Nada quedó a medio hacer en el árbol: sin stash, sin ramas, sin WIP.
Al retomarlo, empezar por esta lista.

## graph_ui (vista Specs)

| Ítem | Estado | Refs |
|---|---|---|
| R13: el lienzo crece con la leyenda; «Ver todo» corta la parte de abajo | Hecho, CI verde | cb7623e, issue-r13-canvas-taller-than-the-window.md |
| R14: el texto de la cabecera de un participante de sequence se corta | Hecho, CI verde | 1b9a862, issue-r14-sequence-participant-header-text-cut.md |
| R15: el nodo central de un contexto queda en una esquina | Cerrado sin arreglo (los grupos del spec no dejan centrarlo con ELK layered; el detalle está en el issue) | 240c90b, issue-r15-context-central-node-in-a-corner.md |

Reporte de la ronda: issues/assets/specs-legibility-r13-2026-10-20/REPORTE-r13.md, con sus capturas en esa carpeta.

## spec2viz (contratos que la vista Specs va a leer)

| Ítem | Estado |
|---|---|
| Paquetes UML en diagramas de clase (anidables, con estilo por paquete) | Llegó el contrato (spec2viz 84686c3, notation-contract.md §15; inbox 20261020-122513). La vista no lo dibuja todavía: hay que dibujar cada paquete como contenedor con su pestaña, respetando los criterios de legibilidad y con su e2e. Sin empezar. |
| ELK con flechas ortogonales en el HTML | Lo lleva spec2viz; en este desk no hay reporte ni trabajo. |
| catalog build con notation | Lo lleva spec2viz; en este desk no hay reporte ni trabajo. |
