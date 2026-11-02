# Corregir WS13.1: lectura sin mutación, guardias previas, foco, estado y anclas

Estado: candidato capturado directamente en drawer, 2026-11-02. Encargo: `runs/subagents/20261102-ws13-1-correccion/review-source.md`. WS13.1 no está aceptado: el closeout `ca06f1b` se conserva como historia.

## Problema

Cinco hallazgos root: `/node` reconstruye; hay lecturas antes de las guardias; el foco de arista no comprueba el documento dueño; una navegación mezcla datos de dos documentos; un ancla inexistente se marca como enlace válido.

## Alcance propuesto

Corrección del lector y sus pruebas. Render fuera: tarea aparte.
