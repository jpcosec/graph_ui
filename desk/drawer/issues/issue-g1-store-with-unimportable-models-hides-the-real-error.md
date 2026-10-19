---
title: "G1: Un store con modelos no importables muestra «no tiene specs» en vez del error real"
severity: high
category: data-loading
status: open
---
# G1: Un store con modelos no importables muestra «no tiene specs» en vez del error real

## What
Si los modelos de un store no se pueden importar (su paquete no está en el entorno y no se dio PYTHONPATH), /api/documents falla con SLDBModelError y la vista Specs dice «Este store no tiene specs de spec2viz», con un banner «Failed to fetch».

## Expected
La vista debe mostrar el error real (qué modelo y por qué) y graph-ui debe aceptar --pythonpath (o un equivalente declarado) para importar los modelos del store.

## Where
frontends/mindmap/views/specs/notation (notation-view.js, notation.mjs) y el servidor (serve.py, sldb_adapter.py) para G1.

## Evidence
Reporte de la sesión de 2026-10-19 sobre un store de prueba de solo lectura con 6 specs de spec2viz (component, deployment, activity, matriz).
- (sin captura propia; se reproduce con un rótulo largo)

## Acceptance
Criterio de aceptación (común a G1-G7): en /specs/notation, con «Ver todo», cada spec del store de prueba se lee al 100% de zoom en 1800x1200 (texto ≥ 10 px), sin títulos tapados, sin rótulos encimados y con la categoría del vistas.yml. Se verifica con capturas propias antes de cerrar.
