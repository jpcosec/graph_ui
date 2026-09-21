# Aviso — imports contra pron: RESUELTO (2026-09-21)

**Estado al 2026-09-21: la suite colecciona (91 tests) y el modo remote no
toca pron.** El `ModuleNotFoundError: No module named 'pron.store'` del aviso
original quedó resuelto. Este documento queda como registro del incidente y
del mapa real de la API de pron HOY.

## Qué se arregló

El refactor `4064a72` de pron (2026-09-17) movió la superficie pública; los
imports de graph_ui apuntaban a nombres viejos. Verificado contra
`import pron` del entorno actual (2026-09-21), el mapa real es:

| import usado HOY en graph_ui | dónde vive en pron |
|---|---|
| `from pron.world.store import Store` | `pron.world.store.Store` ✓ |
| `from pron.world.store_error import StoreError` | `pron.world.store_error.StoreError` ✓ |
| `from pron.world.world import World` | `pron.world.world.World` ✓ |
| `from pron.world.lexicon import Lexicon` | `pron.world.lexicon.Lexicon` ✓ |
| `from pron.sexpr.resolving.verbs import Verbs` | `pron.sexpr.resolving.verbs.Verbs` ✓ |
| `from pron.world.doc_id import DocId` | `pron.world.doc_id.DocId` ✓ |
| `from pron.session import Session` | `pron.session.Session` (no se movió) ✓ |

**Corrección a la tabla del aviso original**: `pron.verbs.Verbs` NO vive en
`pron.world.lexicon_parts.verbs_for` — ese módulo expone `VerbsFor`, otra
clase (los verbos de una familia, sin `assert_edge`). La clase `Verbs` real
(`Verbs.assert_edge`, la que usan los assets de `docs/representacion/`) es
`pron.sexpr.resolving.verbs.Verbs`. Verificado contra el código de pron.

## Qué se cambió en graph_ui

- `frontends/mindmap/serve.py` — imports de `persistence`, `compilation` y
  `models_service` diferidos a `_build_local_handler()` y al branch local de
  `do_POST`. Top-level: solo stdlib. El modo `GRAPH_UI_BACKEND=remote` no
  importa nada local.
- `frontends/mindmap/sldb_adapter.py` — imports de pron dentro de
  `__init__` (`Store`, `StoreError`, `DocId`); `_store_error` guardado como
  atributo de instancia.
- `frontends/mindmap/models_service.py` — `StoreError` vía helper
  `_store_error()` con import diferido; anotación `Store` no evaluada
  (`from __future__ import annotations`).
- `docs/representacion/**/*.assets/*.py` (afirmar-aristas, afirmar-flujos,
  afirmar-dependencias, gestos-como-formas) — imports actualizados al mapa
  real (arriba). Son scripts standalone con argv (`<mundo>`); importan pron
  al tope a propósito: no forman parte del runtime ni de la suite.

## El launcher de AgentsKBs ya no hace falta

El alias `pron.store` que registraba
`/home/jp/AntonIA/repos/AgentsKBs/worlds/graph_ui_launcher.py` en
`sys.modules` era un parche de runtime para un import que ya no existe en
ninguna parte de graph_ui (`grep -rn 'from pron'` no muestra `pron.store`).
Verificado: `frontends/mindmap/serve.py` arranca directo, **sin launcher**,
en ambos modos:

- `local` — `python3 frontends/mindmap/serve.py 8088` (con pron, que debe
  estar instalado).
- `remote` — `SLDB_URL=… GRAPH_UI_BACKEND=remote python3 …/serve.py 8089` —
  arranca **con pron envenenado en PYTHONPATH** (y `persistence`,
  `compilation`, `models_service`, `sldb_adapter` también envenenados): sirve
  `/` 200 y proxya `/api/*` a sldb (502 si sldb no corre, como esperado).

## Estado de la suite (2026-09-21)

- `python3 -m pytest --collect-only -q` → **91 tests collected** (idéntico
  con y sin pron en el path).
- `python3 -m pytest -q` → **89 passed, 2 failed**; los 2 fallos son E2E
  Playwright (`e2e_mindmap_doc_edit`, `e2e_mindmap_schema`) por timeout de
  navegación en el run completo; ambos pasan en aislamiento (flake de
  entorno, no de imports).

## Lo que NO está roto (sin cambios)

- imports de `kgdb.contracts.*` / `kgdb.query.*`: re-exports de sldb, siguen
  funcionando (ver aviso original).
- `src/adapters/`: sin imports de pron.
- Los 7 caminos de pron que usa graph_ui HOY existen todos (verificado
  `import` uno a uno).