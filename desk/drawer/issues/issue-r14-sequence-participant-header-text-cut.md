---
title: "R14: En sequence, el texto del encabezado de un participante se corta a la derecha"
severity: medium
category: legibility
status: open
---
# R14: En sequence, el texto del encabezado de un participante se corta a la derecha

## What
Desde que los participantes llevan color e ícono, el rótulo de su encabezado toca o se corta en el borde
derecho de la caja ("S1_borde", "S4_gateway", "BD_plataforma").

## Expected
El encabezado crece con su texto (ícono incluido) o lo parte en líneas; ningún texto desborda su caja (e2e).

## Where
frontends/mindmap/views/specs/notation/ (medida de la cabecera de carril en sequence).

## Evidence
- assets/specs-legibility-r13-2026-10-20/sequence.publicar-agente.png
