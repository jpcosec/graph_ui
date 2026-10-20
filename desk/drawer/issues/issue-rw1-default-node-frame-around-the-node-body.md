---
title: "RW1: El nodo por defecto de review-workbench dibuja un marco ajeno, desplazado de su cuerpo"
severity: medium
category: rendering
status: open
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
