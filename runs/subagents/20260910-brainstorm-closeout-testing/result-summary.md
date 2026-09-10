# Resultado — Brainstorm (paso 4)

- `frontends/mindmap/brainstorm.js`: componente Preact con vista independiente.
- `model.mjs`: funciones `brainstormToSource`, `brainstormIssues`, `newIdea`.
- `editor.js`: modo toggle persistido en localStorage, guarda ResizeObserver en modo mapa.
- `editor.css`: estilos Brainstorm (nodos redondeados, selectores de clase/emoji, jerarquía con bordes punteados).
- E2E: `tests/e2e_mindmap_brainstorm.py` — captura 3 ideas con teclado, recarga, asigna clase, convierte a SLDB.
- Unit: `tests/mindmap-model.test.mjs` — verifica conversión BoardDoc → TaskDoc con contención correcta.
