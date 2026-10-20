---
title: "R13: El lienzo crece con la leyenda y queda más alto que la ventana; «Ver todo» corta la parte de abajo"
severity: high
category: legibility
status: closed
---
# R13: El lienzo crece con la leyenda y queda más alto que la ventana; «Ver todo» corta la parte de abajo

## What
Con una leyenda larga (14 glifos y 8 links) en el panel izquierdo, a 1800x1200 el lienzo de React Flow
mide top 113 / bottom 1705: la vista se estira con la leyenda y el documento recorta lo que pasa de 1200.
«Ver todo» encuadra contra ese lienzo, así que la parte de abajo del diagrama queda fuera de la ventana.
El e2e de margen (3998c51) medía contra el lienzo y no contra la ventana, por eso no lo vio.

## Expected
El lienzo ocupa exactamente el alto disponible; la leyenda hace scroll en su propio panel. El margen de
«Ver todo» se mide contra la ventana (window.innerWidth/innerHeight); con el código anterior, falla.

## Where
frontends/mindmap/views/specs/notation/notation.css (alto de la vista); tests/e2e_notation_legibility.py (FRAMED).

## Evidence
- assets/specs-legibility-r13-2026-10-20/fit-component.contexto.png
- assets/specs-legibility-r13-2026-10-20/fit-deployment.dev-aws.png
- assets/specs-legibility-r13-2026-10-20/fit-component.kit-componentes.png

## Resolution

Closed: 2026-10-20
Reason: La vista queda acotada a la ventana (min-height:0) y la leyenda hace scroll en el catálogo; el e2e mide el encuadre contra la ventana y falla sin el arreglo
Refs: cb7623e
