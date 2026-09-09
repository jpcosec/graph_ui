# Procedencia

Copiado el 2026-09-09 desde:
`/home/jp/proyectos/_worktrees/hcp/frontends/flow_editor`.

Se incluye también la carpeta `frontends/shared` de ese worktree como `shared/`,
porque el HTML del editor depende de ella. Las rutas `/static/` del HTML se
convirtieron en `./shared/`; el resto del editor de referencia se conserva.

Este directorio preserva el editor original y su exportador. El exportador
requiere `knowledge_base.operations` del proyecto HCP y la UI original requiere
sus APIs `/api/flow` y `/api/tools`. La versión integrada con esta KB, servida en
8088 y adaptada a nodos circulares/fichas modales, está en `../mindmap/`.
