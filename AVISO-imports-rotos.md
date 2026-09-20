# Aviso — este repo está roto contra pron (y no es por la fusión de kgdb)

**Estado al 2026-09-20: la suite no coleccciona.** `ModuleNotFoundError: No module named
'pron.store'`.

## Lo que está roto: los imports de pron

El refactor `4064a72` de pron (**2026-09-17**, "una clase por archivo en cuatro ejes") movió la
superficie pública. graph_ui no se actualizó:

| import de graph_ui | dónde vive hoy |
|---|---|
| `from pron.store import Store, StoreError` | `pron.world.store.Store`, `pron.world.store_error.StoreError` |
| `from pron.world import World` | `pron.world.world.World` |
| `from pron.lexicon import Lexicon` | `pron.world.lexicon.Lexicon` |
| `from pron.verbs import Verbs` | `pron.world.lexicon_parts.verbs_for.Verbs` |

`pron.session.Session` no se movió. El mapa completo, con los tres caminos posibles y por qué
ninguno está tomado, está en `pron/docs/API-movida.md`.

Archivos afectados: `frontends/mindmap/models_service.py`, `src/adapters/`, los `*.assets/*.py`
de `docs/representacion/`.

## Lo que NO está roto: los imports de kgdb

`src/adapters/kgdb_adapter.py` y los tests importan `kgdb.contracts.*` y `kgdb.query.*`. kgdb fue
absorbido por sldb el 2026-09-20 y esos nombres ahora son re-exports de las clases de sldb —
misma clase, no una copia. **Esa parte sigue funcionando.** Verificado: falla idéntico con y sin
la fusión.

Para código nuevo, importá de `sldb.store.graph`. Mapa en `hum-ecosystem/tools/kgdb/README.md`.
