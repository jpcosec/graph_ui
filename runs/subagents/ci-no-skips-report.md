# ci-no-skips: test_review_workbench sin skips en el job mindmap

Rama `wt/ci-no-skips` (base origin/master `9d0eba7`). Ítem del drawer: `task-el-job-mindmap-del-ci-salta-3-tests-de-test-review-workbench-porque-no-corre-npm-ci` (commit bf57bb6 del checkout principal, sin push).

## Causa raíz

`tests/test_review_workbench.py` tenía un `pytestmark = pytest.mark.skipif(shutil.which("npx") is None or not (APP / "node_modules").is_dir())`. Los 3 tests (`test_typecheck` → `npx tsc -p tsconfig.app.json --noEmit`, `test_vitest` → `npx vitest run`, `test_architecture_lint` → `node scripts/lint-architecture.mjs`) solo necesitan `node_modules` instalado en `apps/review-workbench`. No necesitan un build. El job `mindmap` instala node 22 pero nunca corre `npm ci`, así que en CI `node_modules` no existe y los 3 tests se saltan sin avisar. Solo corrían si un `npm ci` previo había dejado `node_modules` en el mismo clon.

## Arreglo elegido: (a)

- `.github/workflows/ci.yml`, job `mindmap`: `setup-node` usa `cache: npm` con `cache-dependency-path: UIs/graph_ui/apps/review-workbench/package-lock.json` (igual que el job e2e). Hay un paso nuevo, `npm ci` con `working-directory: UIs/graph_ui/apps/review-workbench`, que corre antes de construir los stores y de pytest.
- `tests/test_review_workbench.py`: el `skipif` se cambió por un fixture autouse que hace `pytest.fail("review-workbench needs node and `npm ci` in apps/review-workbench")`. Si falta el toolchain, el resultado es un fallo explícito y no un skip silencioso.
- `tests/test_ci_workflow.py`: el test del job mindmap ahora exige que haya un `npm ci` antes del paso pytest y que su working-directory sea `apps/review-workbench`. También se corrigió el comentario que decía "skips".

Por qué (a) y no (b): `npm ci` añade unos 3 s con el cache local caliente (298 paquetes). En Actions, con cache de npm, debería añadir del orden de 10–20 s por celda de la matriz. Es un cambio de 5 líneas en el workflow. Con (b) habría que sacar los tests de `pytest tests` o ignorarlos en mindmap, y eso deja la suite local y la de CI distintas. Con (a), `python -m pytest tests` sigue siendo la suite completa en todas partes. El job `review-workbench` repite tsc/vitest/lint, pero esa duplicación ya existía y `test_ci_workflow` la usa para comprobar que los comandos coinciden.

## Verificación (clon limpio, layout CI)

Layout: `/dev/shm/ciskips/UIs/graph_ui` (clon de `wt/ci-no-skips`), `/dev/shm/ciskips/deskops` (opsys `main`, `0eb4f36b`) y venv py3.12 en `/dev/shm/ciskips/venv` (creado con `uv venv --seed` porque el sistema no tiene `python3.12-venv`).

| Paso | Comando | rc |
|---|---|---|
| install | `python -m pip install --src $B/suite-src -r .github/requirements-suite.txt -e ".[test]"` | 0 |
| npm ci | `npm ci` (apps/review-workbench) | 0 |
| stores | `(cd ../../deskops && sldb stores build)`; `sldb stores build` | 0; 0 |
| check | `sldb stores build --check` | 0 |
| test_review_workbench | `python -m pytest -q -p no:cacheprovider -rs tests/test_review_workbench.py` | 0 (3 passed, **0 skipped**) |
| test_ci_workflow | `python -m pytest -q -p no:cacheprovider -rs tests/test_ci_workflow.py` | 0 (6 passed) |
| pytest del job (corrida 1) | `timeout 900 … python -m pytest tests -q -p no:cacheprovider -rs --ignore-glob='tests/e2e_*'` | 124 (timeout al 89%; ver nota) |
| pytest del job (corrida 2) | igual, con `-v -o faulthandler_timeout=120` | 0 (**225 passed, 0 skipped**, 824 s) |
| node --test | `node --test tests/*.test.mjs` | 0 (150 pass, 0 fail, 0 skipped) |
| negativo | `test_review_workbench.py` sin `node_modules` | 1 (3 errors, `pytest.fail`: ya no hay skip) |

Nota sobre la corrida 1: se cortó por el `timeout 900` del brief en el test 201 (el primero de `test_projection_views.py`). Ese archivo pasa solo (11 passed, 37 s) y la corrida 2 completa pasó sin que saltara faulthandler, así que no hubo cuelgue. La suite completa tarda unos 14 min en esta máquina con carga, y eso queda cerca del techo de 900 s. Para correr la suite entera conviene un timeout mayor. Esto no tiene que ver con este cambio: los 3 tests de review-workbench suman unos 15 s.

Hecho cuando el CI de master no tenga skips en test_review_workbench: hace falta mergear `wt/ci-no-skips` a master. Eso lo decide el coordinador.

Limpieza: se borró `/dev/shm/ciskips` y el worktree quedó limpio.
