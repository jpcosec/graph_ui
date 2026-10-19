---
title: "G5: Las aristas entre contenedores van por el mismo carril y sus rótulos se enciman"
severity: high
category: layout
status: open
---
# G5: Las aristas entre contenedores van por el mismo carril y sus rótulos se enciman

## What
Las aristas que cruzan contenedores salen todas por el mismo carril horizontal; sus rótulos se superponen y no se leen.

## Expected
Ruteo de aristas por ELK (puertos y carriles separados) y rótulos colocados por el layout, sin superponerse.

## Where
frontends/mindmap/views/specs/notation (notation-view.js, notation.mjs) y el servidor (serve.py, sldb_adapter.py) para G1.

## Evidence
Reporte de la sesión de 2026-10-19 sobre un store de prueba de solo lectura con 6 specs de spec2viz (component, deployment, activity, matriz).
- ![component.superficies-kit-y-satelite.png](assets/specs-legibility-2026-10-19/component.superficies-kit-y-satelite.png)

## Acceptance
Criterio de aceptación (común a G1-G7): en /specs/notation, con «Ver todo», cada spec del store de prueba se lee al 100% de zoom en 1800x1200 (texto ≥ 10 px), sin títulos tapados, sin rótulos encimados y con la categoría del vistas.yml. Se verifica con capturas propias antes de cerrar.
