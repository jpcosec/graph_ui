---
title: "R10: Un diagrama de clases grande queda en ~5 px porque las clases sueltas van en una fila"
severity: high
category: legibility
status: closed
---
# R10: Un diagrama de clases grande queda en ~5 px porque las clases sueltas van en una fila

## What
Un diagrama de clases real de 26 clases y 15 relaciones deja 18 clases sin relaciones en una sola fila
al pie; con «Ver todo» el texto queda en ~5 px.

## Expected
>= 10 px con «Ver todo»: las clases sueltas se acomodan en una grilla cerca de la proporción del lienzo,
eligiendo la que maximiza el zoom (como el layout propio de despliegues, R8).

## Where
frontends/mindmap/views/specs/notation/notation-layout.mjs (elección del layout).

## Evidence
- assets/specs-legibility-r11-2026-10-20/class.esquema-runtime.png

## Resolution

Closed: 2026-10-20
Reason: Los sueltos en una grilla que maximiza el zoom; el esquema real queda en 11,1 px; e2e con class-large.yml
Refs: 9c44bc1
