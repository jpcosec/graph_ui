---
title: "G4: Las cajas no crecen con el texto"
severity: high
category: layout
status: open
---
# G4: Las cajas no crecen con el texto

## What
El tamaño de la caja de un glifo es fijo por forma: un rótulo largo se sale de la caja.

## Expected
El tamaño de la caja se calcula del texto (rótulo, keyword, compartimentos) con un ancho máximo y salto de línea.

## Where
frontends/mindmap/views/specs/notation (notation-view.js, notation.mjs) y el servidor (serve.py, sldb_adapter.py) para G1.

## Evidence
Reporte de la sesión de 2026-10-19 sobre un store de prueba de solo lectura con 6 specs de spec2viz (component, deployment, activity, matriz).
- (sin captura propia; se reproduce con un rótulo largo)

## Acceptance
Criterio de aceptación (común a G1-G7): en /specs/notation, con «Ver todo», cada spec del store de prueba se lee al 100% de zoom en 1800x1200 (texto ≥ 10 px), sin títulos tapados, sin rótulos encimados y con la categoría del vistas.yml. Se verifica con capturas propias antes de cerrar.
