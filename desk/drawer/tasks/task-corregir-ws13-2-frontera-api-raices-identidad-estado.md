# Corregir WS13.2: frontera API, raíces, identidad visible y estado de carga

Estado: candidato capturado directamente en drawer, 2026-11-02. Encargo: `runs/subagents/20261102-ws13-2-correccion/review-source.md`. WS13.2 no está aceptado; el closeout `3bb45f8` se conserva como historia.

## Problema

El refresco importa `sldb.store.*`; raíces prohibidas pasan el filtro; títulos iguales son indistinguibles; el explorador afirma carga de modelo sin saberla; el hook del Tester no tiene control positivo.

## Alcance propuesto

Corrección acotada del explorador y sus pruebas. Sin WS13.3.
