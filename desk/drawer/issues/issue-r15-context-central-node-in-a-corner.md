---
title: "R15: En un diagrama de contexto, el nodo central queda en una esquina"
severity: low
category: legibility
status: open
---
# R15: En un diagrama de contexto, el nodo central queda en una esquina

## What
En un component de contexto, el sistema (el nodo al que llegan casi todas las aristas) queda en la esquina
inferior derecha y las aristas cruzan todo el lienzo.

## Expected
Deseable: el nodo de más grado al centro, o como mínimo en la capa media entre las fuentes y los destinos,
sin romper los criterios de legibilidad. Si no sale limpio, se cierra explicando por qué.

## Where
frontends/mindmap/views/specs/notation/notation-layout.mjs (elección del layout).

## Evidence
- assets/specs-legibility-r13-2026-10-20/component.contexto.png
- assets/specs-legibility-r13-2026-10-20/fit-component.contexto.png
