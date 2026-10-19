# Changelog

## Sin publicar (0.1.0)

- Python 3.12 o superior (`requires-python >=3.12`): 3.10 llega a fin de vida. La CI corre
  pytest, `node --test` y los e2e en 3.12 y 3.13.
- CI en GitHub Actions (`.github/workflows/ci.yml`): mindmap (pytest + `node --test`),
  review-workbench (`npm ci`, tsc, vitest, lint de arquitectura) y e2e con Playwright y chromium.
  Los repos hermanos se instalan desde sus ramas principales (`.github/requirements-suite.txt`).
- graph_ui es instalable como paquete `mindmap` (`graph-ui` en `[project.scripts]`) y depende de
  `structuredLanguageDB` y `pron`; kgdb sale: la capa de grafo es `sldb.api.graph`.
