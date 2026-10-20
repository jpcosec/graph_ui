---
title: "R9: En class, las multiplicidades se dibujan encima de la caja de la clase"
severity: high
category: legibility
status: open
---
# R9: En class, las multiplicidades se dibujan encima de la caja de la clase

## What
Los rótulos de extremo de una asociación ("1", "*", "0..1") quedan dentro de la caja de la clase:
tapan el keyword «record» y letras de los atributos ("«*ecord»", "updat|1|d_at", "label: te|1|t").

## Expected
Cada multiplicidad va pegada al extremo de su arista, por fuera de la caja, sin pisar texto.

## Where
frontends/mindmap/views/specs/notation (rótulos de extremo, sourceLabel/targetLabel de las aristas).

## Evidence
- assets/specs-legibility-r11-2026-10-20/class.esquema-plataforma.png (13 clases, 10 relaciones).
