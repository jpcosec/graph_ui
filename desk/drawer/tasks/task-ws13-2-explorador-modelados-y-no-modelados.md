# WS13.2: explorador de documentos modelados y no modelados

Estado: candidato capturado directamente en drawer, 2026-11-02. Delta del nodo WS13.2. Encargo: `runs/subagents/20261102-ws13-1-correccion/review-source-final.md`.

## Problema

Para abrir un Markdown no modelado hay que conocer su ruta. El catálogo cae entero si un modelo no carga.

## Alcance propuesto

Explorador en `frontends/mindmap/views/workspace/explorer/` que consume el lector WS13.1, con ruta de listado bajo lista de permitidos del operador, refresco explícito y catálogo degradado. Sin pestañas ni split, sin escritura. No solapa con las draft de Changes y edición.
