---
title: "R11: Una secuencia no tiene «Ver todo» y los participantes de la derecha quedan cortados"
severity: high
category: legibility
status: open
---
# R11: Una secuencia no tiene «Ver todo» y los participantes de la derecha quedan cortados

## What
En el layout de carriles (secuencias) no hay botón «Ver todo»; con 10 participantes, los de la derecha
quedan fuera del lienzo.

## Expected
«Ver todo» como en las otras vistas, con un encuadre que incluya a todos los participantes y todos los
mensajes, y texto >= 10 px.

## Where
frontends/mindmap/views/specs/notation/notation-view.js (render de layout lanes).

## Evidence
- assets/specs-legibility-r11-2026-10-20/sequence.mensaje-entrante.png
