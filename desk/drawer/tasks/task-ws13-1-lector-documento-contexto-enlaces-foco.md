# WS13.1: lector de documento, fuente, contexto, enlaces y foco

Estado: candidato capturado directamente en drawer, 2026-11-02. Delta del nodo WS13.1 del plan workspace-documental de deskops. Encargo: `runs/subagents/20261102-ws13-1-lector/review-source.md`.

## Problema

El workspace de Mindmap (`a1b2b22`) muestra IR y Code referenciado, pero no entrega la fuente propia, no lee Markdown no modelado, no sigue enlaces y no tiene foco interno.

## Alcance propuesto

Delta bajo `frontends/mindmap/views/workspace/`, rutas de lectura del contrato WS11 y `tests/`. Sin explorador, sin pestañas ni divisiones, sin escritura. No solapa con las tareas draft de Changes y edición contextual.
