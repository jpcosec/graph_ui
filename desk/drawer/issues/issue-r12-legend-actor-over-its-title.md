---
title: "R12: El actor de la leyenda pisa el título de la leyenda"
severity: low
category: legibility
status: closed
---
# R12: El actor de la leyenda pisa el título de la leyenda

## What
En la leyenda de una notación de secuencia, la figura de actor (stick-figure) se monta sobre el título
«LEYENDA · UML-SEQUENCE».

## Expected
Cada muestra de la leyenda queda dentro de su renglón, sin pisar el título ni otros renglones.

## Where
frontends/mindmap/views/specs/notation/notation.css (muestra de la leyenda con shape stick-figure).

## Evidence
- assets/specs-legibility-r11-2026-10-20/sequence.mensaje-entrante.png (abajo a la izquierda).

## Resolution

Closed: 2026-10-20
Reason: La figura de actor se escala al alto de la muestra; e2e de renglones de la leyenda
Refs: 766eb09
