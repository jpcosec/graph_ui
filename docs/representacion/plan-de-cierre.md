# Plan de cierre

Qué falta para pasar del manual a las dos primeras visualizaciones (UML de clases y secuencia) con `graph_ui`
como superficie de `pron`, y en qué orden. Escrito el 2026-09-15 después de verificar el estado de cada repo;
las revisiones grandes de capas están en [`capas.md`](capas.md) §8 y aquí solo se ordenan.

## Estado verificado

| Pieza | Estado |
|---|---|
| `graph_ui` | `master` `10b91fe`, árbol limpio. `python3 -m pytest tests -q`: 91 pasan; `node --test tests/mindmap-model.test.mjs`: 40 pasan. |
| Manual | escrito: 3 ejes, [`huecos.md`](huecos.md), [propuesta v3](propuesta-vocabulario-visual.md), [`capas.md`](capas.md) |
| `pron` | `master` `b162f4b`, publicado. Formas (spec 13), `session.eval`, `pron eval`; `graph_ui` importa esta copia, así que ya puede evaluar formas. Otra sesión trabaja en el worktree `pron-corpus`. |
| `kgdb` | `846f331`, publicado (lee `ref` escritos como formas) |
| `sldb` | `b0f196a` más cambios sin commitear de otra sesión en `src/` (45 archivos). La promoción de modelos de `pron` depende de ellos, y agregan etiquetas `representation.*`/`source.*` a todo documento. |
| Store propio de `graph_ui` | `.sldb` de deskops (`TaskDoc`, `AtomDoc`…), **no** es un mundo de `pron`: las vistas nuevas se prueban sobre mundos de ejemplo (`SLDB_STORE`). |

## Decisiones que necesito antes de ciertas partes

| # | Decisión | Qué bloquea | Recomendación |
|---|---|---|---|
| D1 | `(created)` como sustantivo de cualquier `move` (spec 13) | asociación UML en un movimiento; insertar un mensaje de secuencia | extender las formas: es lo que `compose` ya hace por dentro |
| D2 | Lectura estructurada con proyección para superficies que no hablan | quitar la copia en JS de proyección y `display` | que el contrato de runtime la ofrezca (spec 12); mientras tanto `graph_ui` aplica `World.projection()` |
| D3 | Dónde viven los modelos del vocabulario visual (`NotationDoc`, `GlyphDoc`, `LinkDoc`, `GestureDoc`) y si `kgdb` genera aristas `names` para toda familia con `ref` | validar notaciones rotas en el ingest | modelos en `graph_ui`, registrados en el mundo; generalizar el ingest en `kgdb` |
| D4 | Quién commitea los cambios pendientes de `sldb` | fijar versiones en `pron/constraints.txt` | la sesión dueña; después se fija el pin |
| D5 | Revisiones pesadas de `pron` (capas §8.2–8.3) antes o después de las visualizaciones | alcance de la fase 3 | después: las dos visualizaciones, usando solo el contrato estable (spec 12), definen qué tiene que ofrecer el núcleo |

## Fase 1: cerrar la documentación (sin código)

1. **Quitar lo que ya no es cierto.** [`uml-clases.md`](03-diagrama-vocabulario/nodo-arista-tipado/uml-clases.md)
   §8 dice que `pron` no expone afirmar aristas por CLI; hoy existe `pron eval`. Buscar en el eje 3 otras
   afirmaciones de ese tipo (`grep -rn "pron say\|solo se puede" docs/representacion`).
2. **Pasar a formas verificadas los gestos de las dos notaciones**, con un script como
   [`gestos-como-formas.py`](propuesta-vocabulario-visual.assets/gestos-como-formas.py) por notación:
   - UML de clases: conectar, rechazar por condición, editar multiplicidad, `reconnect-end` (`forget` + `assert`
     en un `move`), borrar asociación, asociación nueva (hoy no evalúa: D1).
   - Secuencia: reordenar un mensaje (N `change` en un `move`), mover una línea de vida, insertar mensaje (D1).
   Lo que no evalúe se anota en [`huecos.md`](huecos.md) con su salida.
3. **Registrar el trabajo en `deskops`** (spec → atoms → tasks) con el CLI; no editar `desk/` a mano.

Verificación: `python3 -m pytest tests/test_representacion_docs.py -q`, y cada script corre sobre su mundo montado.

## Fase 2: lo que tiene que dar `pron` (repo `pron`)

1. `(created)` en `move` si D1: spec 13, `forms.py`, prueba en `tests/test_13_forms.py`; el script de la fase 1
   tiene que mostrar la asociación en un movimiento y un `undo`.
2. Lectura estructurada si D2: cambio del capítulo 12 y de `serve.py` para que el socket la exponga igual.
3. Aristas `names` para familias con `ref` en `kgdb` si D3.

No hace falta cambio para deshacer por vista: `speaker` es opaco, así que una vista abierta usa un hablante propio
(`graph_ui:<vista>:<id>`) y `undo` ya deshace solo lo suyo.

Verificación por cambio: suite de `pron` (129 hoy), `pron docs --check`, `pron check`, suite de `kgdb` si se toca;
commit y push de cada repo.

## Fase 3: `graph_ui` como superficie (código)

1. **Evaluar formas desde el servidor.** `POST /api/eval` en `frontends/mindmap/serve.py`: abre `World` sobre el
   store servido y una `Session` por vista (`speaker = graph_ui:<vista>:<id>`), evalúa y devuelve `outcome`, `text`,
   `record["writes"]` y `move_id`. Prueba real en `tests/` con un mundo temporal: afirmación aceptada, condición
   rechazada sin escritura, `undo`.
2. **El vocabulario visual como documentos**: los modelos de D3 y un validador (partiendo de
   [`validar-vocabulario.py`](propuesta-vocabulario-visual.assets/validar-vocabulario.py), con `ref` como formas).
   Declarar `uml-clases` y `uml-secuencia` como documentos en sus mundos de ejemplo.
3. **Una sola vista de notación**, genérica (`views/notation/…`, una línea en `shell/registry.js`), que lee el
   `NotationDoc` elegido y dibuja con primitivas: caja con compartimentos, línea con terminales, arista reificada
   colapsada, ejes (categórico y ordinal) para secuencia. Nada que distinga UML en el código.
4. **Paleta de gestos** desde `World.relation_types()` y la proyección (un endpoint que junte eso con los
   `GestureDoc`); cada gesto llena su `form` y llama a `/api/eval`.
5. **E2E con Playwright** sobre los dos mundos: lo dibujado equivale a lo que muestra el oráculo del manual (nodos,
   aristas, terminales, orden); un gesto legal escribe; uno ilegal muestra el error y no escribe; `undo` vuelve atrás.

Verificación: `python3 -m pytest tests -q`, `node --test tests/mindmap-model.test.mjs`,
`python3 -m pytest tests/e2e_mindmap_*.py -q`.

## Fase 4: retirar lo duplicado en `graph_ui` (después de la 3)

- `applyProjection` y `renderDisplay` de `source/projections.mjs` pasan a usar datos de `pron` (depende de D2).
- La inferencia por forma del payload (`CONTAINMENT`, `REFERENCE_FIELDS` en `source/graph.mjs`) queda solo en las
  vistas KB y Flujo, hasta que tengan su `NotationDoc`.
- `/api/save` deja de escribir datos: las escrituras de datos van por formas; la edición de esquema sigue por
  `pron.Store` (spec 12 §4).
- Posiciones: en las notaciones de posición las decide el mundo (campos con eje); para el layout libre, decidir
  entre `.sldb/runtime/mindmap-view.json` (hoy) y el directorio derivado del mundo.

## Fase 5: revisiones pesadas (cada una con su plan, en su repo)

Del [§8 de `capas.md`](capas.md): invertir dependencias en `pron`; separar `ProjectionDoc` y `MoveDoc`; sacar de
`kgdb` el conocimiento de `AnchorDoc` y del ledger; un solo mecanismo de relación; reglas generales al sustrato;
decidir la relación con `kimun`. Empiezan cuando las fases 3 y 4 hayan mostrado qué usa de verdad una superficie.

## Riesgos

- Otra sesión trabaja sobre `pron` `master` (`pron-corpus`): coordinar antes de mezclar cambios de la fase 2.
- Los cambios pendientes de `sldb` agregan etiquetas a todo documento: cualquier vista que agrupe por etiqueta
  tiene que excluir `representation.` y `source.`.
