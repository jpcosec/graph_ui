# Tester WS13.2 corrección: renovación focal, rutas largas

Objeto: bytes de `entregable-executor.sha256` en 5243ffe. `sha256sum -c`: 8/8 OK. Frente a `git show 999d2b2:` del mismo archivo cambiaron exactamente dos entradas: `frontends/mindmap/views/workspace/node/workspace.css` y `tests/e2e_mindmap_workspace.py`; las otras seis son idénticas. La versión previa del informe está en `renovacion-1/`. Evidencia: `tester/run_long.py`, `tester/result-long*.json`, `tester/capturas-renov/`.

| Objeto | Evidencia real (ejecución propia) | Resultado |
|---|---|---|
| 1. Rutas largas distinguibles | Store y repo temporales reales, Chromium/Playwright, servidor real. Casos propios: dos rutas que difieren solo en `-alfa`/`-beta`; dos con un segmento de 95 `x` sin separadores que difieren solo en la última letra (`A.md`/`B.md`); nombre de 120 caracteres sin separadores ni espacios; dos modelados (Bitacora) con id de 100 caracteres y ruta profunda. Viewports 1440, 800 y 360 de ancho, con dos destinos de página distintos. Medido por viewport sobre 36-37 rutas: texto visible == ruta completa, sin tooltip, scrollWidth-clientWidth <= 0 en ruta, botón y aside, rectángulos del texto dentro del aside, títulos largos también dentro. 0 fallos en las 3 anchuras, 0 pageerror. Cada ruta larga abre su origen (contenido distinto, 5/5). Capturas vistas: `largo-1440-pagina.png` (rutas partidas en varias líneas, completas), `largo2-360-pagina.png`. | PASS |
| 2. La e2e nueva detecta el defecto | Copia desechable en `/tmp/tester-old-css` (frontends y tests del entregable, CSS revertido a lo de 999d2b2: sin `white-space: normal` en `.workspace-explorer-item` ni `word-break` en la ruta; árbol de trabajo intacto, sin worktree). `pytest -k long_paths` falla: `assert over[0] <= 0 ... AssertionError: [754, 748]` (ruta 754 px más ancha que su caja). Copia borrada; con el CSS actual la misma e2e pasa (dentro de las 19). | PASS |
| 3. No regresión | `test_mindmap_workspace_explorer.py` 40 passed; `e2e_mindmap_workspace.py` 19 passed; `node --test tests/mindmap-workspace-explorer.test.mjs` 13 pass, 0 fail. En las capturas con el CSS final siguen bien carpetas (con flecha y conteo), modelados con ruta secundaria, no modelados y selección. Las insignias («modelo sin confirmar», modelo_no_carga) las cubren las e2e del explorador que pasan. | PASS |

## Observación fuera del explorador (no bloquea)
Con viewport de 360 px la página completa tiene scroll horizontal: el título de cabecera y el selector de nodo con una ruta de 95 caracteres, y el panel de identidad, no envuelven. No está en el alcance de este ajuste (CSS del explorador); no probé si ocurre igual con el CSS de 999d2b2.

## No verificado
Suite general (la corre el Supervisor, no la declaro). No revisé visualmente las insignias en una captura nueva con el CSS final (solo vía e2e). Modo oscuro y otros navegadores. 8090/8091/8092 y sus stores no tocados; no hice commits ni cambié producto o tests.

RESULTADO: PASS
