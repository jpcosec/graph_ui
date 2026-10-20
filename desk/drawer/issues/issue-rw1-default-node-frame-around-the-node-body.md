---
title: "RW1: El nodo por defecto de review-workbench dibuja un marco ajeno, desplazado de su cuerpo"
severity: medium
category: rendering
status: closed
---
# RW1: El nodo por defecto de review-workbench dibuja un marco ajeno, desplazado de su cuerpo

## What
En el lienzo de review-workbench cada nodo (NodeShell) se ve con un marco blanco que no es suyo:
más angosto que el cuerpo del nodo y corrido respecto de él (el cuerpo sobresale a la derecha).

## Expected
El nodo es solo su cuerpo: el borde, el fondo y las esquinas que dibuja NodeShell (y el estilo de la
notación de una vista, cuando la hay); el contenedor de React Flow no agrega borde, relleno ni ancho.

## Where
apps/review-workbench/src/features/graph-editor/L2-canvas/xy-theme.css (`.react-flow__node`: borde
de 2 px y sombra para todo nodo) sumado a `.react-flow__node-default` de @xyflow/react (padding de
10 px, ancho fijo de 150 px y borde), que envuelven al cuerpo propio de NodeShell.

## Evidence
Captura del e2e de vistas con notación (tests/e2e_review_workbench_views.py, 2026-10-20): cada nodo
con un marco blanco de 150 px y el cuerpo coloreado, más ancho, desbordándolo a la derecha.

## Resolution

Closed: 2026-10-20
Reason: El contenedor del nodo por defecto ya no agrega borde, sombra, relleno ni ancho; e2e de marcos ajenos
Refs: 91192f9

## Grupos (revisado 2026-10-20)
El contenedor de un nodo de tipo group tenía el mismo marco ajeno alrededor del marco propio de
GroupShell: 10 px de padding y borde de xyflow, borde de 2 px y sombra de xy-theme.css, y un fondo en
gradiente con `!important`, esquinas y sombra de styles.css (medido en Chromium: 8 px de borde en
total, 20 px de padding, contenido corrido 24 px). Ningún camino de datos de la app produce grupos
hoy, así que el e2e lo mide en una sonda con las clases que React Flow le pone a ese contenedor, en el
lienzo real. Arreglado en el commit siguiente: el contenedor del grupo tampoco agrega marco.
