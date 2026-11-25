# result-summary — T1 IR13: migrar graph_ui de spec2viz a sldb.api.notations

- run_id: run-deskops-e-687036bb547d (executor deskops-e-687036bb547d, intento 1; pane claude7)
- task: task-ir13-migrar-graph-ui-de-spec2viz-a-sldb-api-notations-resolve-view-sync-de-specs-viewdoc-pilotos-com
- session: scion://agent/deskops-e-687036bb547d (la del run.md); session_sha256: no disponible para el ejecutor (sesión interactiva de Claude Code, sin archivo de transcript a mano)
- Estado: pasos 1 a 6 del Implementation Path hechos. Sin commit, sin avance de la tarea, sin aviso a IR (paso 7, del coordinador).

## Qué hice

1. **Producción** (`frontends/mindmap/`): `sldb_adapter.py` importa `from sldb.api.notations import ViewError, resolve_view` / `resolve_documents` (import directo, sin envolver); desaparece el 501 «spec2viz no está instalado». `projection_views.py` pierde la rama `except ImportError` (ya no puede ocurrir) y su docstring habla de sldb. `views_routes.py`: `VIEW_MODEL_REF = 'sldb.models.notation.view_doc:ViewDoc'`. Docstrings de `persistence.py` y `serve.py`.
2. **Empaquetado**: `pyproject.toml` sin el extra `notation` ni `spec2viz>=0.1.0` en `test`; `.github/requirements-suite.txt` sin la línea `-e git+…spec2viz` ni su comentario de tres líneas.
3. **Fixtures**: `tests/fixtures/notation-pilots/` con los 10 pilotos + README de una línea. Copiados con `git -C ../../spec2viz show 2a218b1:<ruta>`; verifiqué byte a byte que `git hash-object` de cada copia coincide con el blob de 2a218b1 (10/10 OK).
4. **Pruebas**: los 11 archivos del alcance. PILOTS/MATRIX/ACTIVITY apuntan a `tests/fixtures/notation-pilots/`; fuera `importorskip("spec2viz")`, `shutil.which("spec2viz")` y sus `pytest.skip`; cada `spec2viz diagram sync A B [--notation N] --store .sldb` es ahora `sldb notations sync --spec A --spec B [--notation N] --store .sldb` (mismo cwd); `resolve_view` y `ViewDoc` se importan de sldb.
5. **Textos visibles y comentarios**: `notation-view.js`, `notation.mjs` (aviso «sldb omitió N elemento(s)…»; estado vacío sugiere `sldb notations sync --spec spec.yml --store .sldb`), `notation-style.mjs`, `notation-swimlanes.mjs`.
6. **Atom**: `deskops edit atom` sobre `answer`, `title` y `tags` (el id y el nombre de archivo no cambian).

## Archivos cambiados (`git status --short`, sin app.js ni task.js)

```
 M .github/requirements-suite.txt
 M .sldb/core/documents/AtomDoc/atom-la-vista-specs-dibuja-lo-que-resuelve-spec2viz.yaml
 M .sldb/core/documents/TaskCodeDoc/task-ir13-migrar-graph-ui-de-spec2viz-a-sldb-api-notations-resolve-view-sync-de-specs-viewdoc-pilotos-com.yaml
 M ".sldb/core/documents/TaskDecisionDoc/task-decisi\303\263n-de-jp-el-workspace-de-graph-ui-edita-y-ancla-c\303\263digo-softfactory-k03-k05-k12-o-solo-muestra.yaml"
 M .sldb/core/models/AtomDoc.yaml
 M .sldb/core/models/ReviewDoc.yaml
 M .sldb/core/models/RunDoc.yaml
 M .sldb/core/models/TaskCodeDoc.yaml
 M .sldb/core/models/TaskDecisionDoc.yaml
 M .sldb/core/store_index.yaml
 M .sldb/store.yaml
 M README.md
 M desk/atoms/atom-la-vista-specs-dibuja-lo-que-resuelve-spec2viz.md
 M "desk/tasks/task-decisi\303\263n-de-jp-el-workspace-de-graph-ui-edita-y-ancla-c\303\263digo-softfactory-k03-k05-k12-o-solo-muestra.md"
 M desk/tasks/task-ir13-migrar-graph-ui-de-spec2viz-a-sldb-api-notations-resolve-view-sync-de-specs-viewdoc-pilotos-com.md
 M frontends/mindmap/README.md
 M frontends/mindmap/persistence.py
 M frontends/mindmap/projection_views.py
 M frontends/mindmap/serve.py
 M frontends/mindmap/sldb_adapter.py
 M frontends/mindmap/views/specs/notation/notation-deployment.mjs
 M frontends/mindmap/views/specs/notation/notation-style.mjs
 M frontends/mindmap/views/specs/notation/notation-swimlanes.mjs
 M frontends/mindmap/views/specs/notation/notation-view.js
 M frontends/mindmap/views/specs/notation/notation.css
 M frontends/mindmap/views/specs/notation/notation.mjs
 M frontends/mindmap/views_routes.py
 M pyproject.toml
 M tests/e2e_mindmap_notation.py
 M tests/e2e_notation_activity.py
 M tests/e2e_notation_class.py
 M tests/e2e_notation_deployment.py
 M tests/e2e_notation_legibility.py
 M tests/e2e_notation_sequence.py
 M tests/e2e_notation_style.py
 M tests/e2e_review_workbench_views.py
 M tests/test_mindmap_notation.py
 M tests/test_mindmap_skin.py
 M tests/test_projection_views.py
?? ".sldb/core/documents/ReviewDoc/review-task-decisi\303\263n-de-jp-el-workspace-de-graph-ui-edita-y-ancla-c\303\263digo-softfactory-k03-k05-k12-o-solo-muestra-owner-1.yaml"
?? .sldb/core/documents/RunDoc/
?? .sldb/core/documents/TaskDoc/
?? .sldb/runtime/
?? "desk/reviews/task-decisi\303\263n-de-jp-el-workspace-de-graph-ui-edita-y-ancla-c\303\263digo-softfactory-k03-k05-k12-o-solo-muestra/"
?? runs/subagents/20261116-ir13-executor-a1/
?? runs/subagents/20261116-triaje-graph-ui/
?? tests/fixtures/notation-pilots/
```

De esa lista **no son míos** (ya estaban sucios al empezar, ver git-status.txt): `.sldb/core/documents/TaskCodeDoc/task-ir13…yaml`, `.sldb/core/models/RunDoc.yaml`, `.sldb/core/models/TaskCodeDoc.yaml`, `.sldb/core/store_index.yaml`, `.sldb/store.yaml`, `desk/tasks/task-ir13…md`, `.sldb/core/documents/RunDoc/`, `.sldb/core/documents/TaskDoc/`, `.sldb/runtime/`, `runs/subagents/20261116-triaje-graph-ui/`. Ojo: `store_index.yaml` y `store.yaml` ya estaban modificados y además los pudo tocar mi `deskops edit atom`. Lo que sí generó mi `deskops edit atom`: `desk/atoms/atom-la-vista-specs…md`, `.sldb/core/documents/AtomDoc/atom-la-vista-specs…yaml` y `.sldb/core/models/AtomDoc.yaml`.

## Validación (detalle y exit codes en validation.log)

Entorno: venv `/dev/shm/venv-ir13`, donde `python -c "import spec2viz"` falla (ModuleNotFoundError, exit 1).

| Comando | Resultado | Exit |
|---|---|---|
| `python -m pytest -q -rs tests/test_projection_views.py tests/test_mindmap_notation.py tests/test_mindmap_skin.py` | 20 passed, 0 skipped | 0 |
| `python -m pytest -q -rs tests/e2e_notation_{class,sequence,deployment,activity,style,legibility}.py tests/e2e_mindmap_notation.py tests/e2e_review_workbench_views.py` | 21 passed, 0 skipped (6 min 05 s) | 0 |
| `grep -rnE '…' frontends tests pyproject.toml .github` | sin salida | 1 (el `! grep` del contrato: 0) |
| `specir retirement check --path graph_ui=../UIs/graph_ui` (tal cual el contrato) | `Error: no path given for: deskops, pron, sldb, spec2viz/.sldb` | 2 |
| `specir retirement check` con las 5 rutas del inventario | 88 dependencias, **0 de graph_ui** | 1 (gate global abierto por otros repos) |
| extra: `node --test tests/mindmap-notation.test.mjs tests/mindmap-notation-style.test.mjs` | 27 pass | 0 |

### Salida del grep

```
(vacía)
```

### Salida de specir (completa en specir-retirement-check.txt)

```
audited repos: graph_ui, deskops, pron, sldb, IR
audited stores: spec2viz/.sldb
dependencies: 88
  (por repo/store: IR 43, deskops 22, spec2viz/.sldb 19, pron 3, sldb 1, graph_ui 0)
rows not accredited: 23
gate: failed, the retirement is not declared
```

`graph_ui` solo aparece en la línea `audited repos`; ninguna línea de dependencia lo nombra (antes eran 34).

## Qué tiene que revisar el coordinador

1. **El comando de specir del contrato no corre tal cual**: exige `--path` para todo el inventario. Lo corrí con `--path deskops=../deskops --path pron=../pron --path sldb=../sldb --path spec2viz/.sldb=../spec2viz/.sldb` (solo lectura). Su exit es 1 porque el gate global sigue abierto por IR, deskops, pron, sldb y el store de spec2viz, no por graph_ui. El criterio del Done When («no lista ninguna dependencia de graph_ui») sí se cumple.
2. **Toqué dos archivos fuera de la lista `files` de la tarea**: `README.md` (raíz) y `frontends/mindmap/README.md`. Decían que spec2viz era opcional vía `.[notation]` (extra que ya no existe), que `resolve_view` era de spec2viz y que `--src` servía para el clon editable de spec2viz. Si no se quieren en este commit, `git checkout` de esos dos y nada más cambia. También ajusté comentarios en `notation.css` y `notation-deployment.mjs` (mismo directorio de la vista, solo comentarios).
3. **`.github/workflows/ci.yml` no lo toqué**: sigue pasando `--src "$RUNNER_TEMP/suite-src"` a pip (líneas 47 y 112). Sin la línea `-e` es inofensivo, pero quedó sin motivo. El atom `atom-cómo-corre-la-ci-de-graph-ui` (ligado a la tarea) puede mencionar ese clon editable; no lo edité porque el alcance (7) nombra solo el otro atom.
4. **Quedan menciones de spec2viz que dejé a propósito** (ninguna la detecta el grep ni specir): comentarios de procedencia en `tests/mindmap-notation.test.mjs` y `tests/mindmap-notation-style.test.mjs` (cuentan cómo se generaron los JSON de fixtures), los JSON `tests/fixtures/notation-view-*.json`, comentarios de cabecera de fixtures que «no se tocan» (notation-activity, notation-deployment, notation-style), el contenido de los pilotos copiados y `docs/how-it-works.md`.
5. **Atom**: cambié también `title` y `tags` (`system:spec2viz` pasó a `system:sldb`), además de `answer`. El id conserva «spec2viz» en el nombre: renombrarlo rompería las referencias de la tarea.
6. **La numeración «§13/§14» del contrato** en comentarios viene del documento de spec2viz; el de sldb (`docs/architecture/notations-and-views.md`) tiene otra numeración. Dejé «contrato de notación §N» sin verificar que exista esa sección en sldb.
7. **Entorno**: el venv `/dev/shm/venv-ir13` queda en pie para el tester (instala sldb, pron, deskops, graph_ui e IR en editable desde los checkouts locales, no desde git). Borrarlo al terminar. La instalación editable de IR dejó `src/specir.egg-info` y `__pycache__` sin trackear en IR; los borré y `git status` de IR quedó limpio. No corrí la suite completa (es del tester). Los `pip install -e` del venv regeneraron los `*.egg-info` (ignorados por git) de sldb, pron y deskops; no cambió ningún archivo trackeado de esos repos (los cambios sin commitear de `sldb/surface/` son de otra sesión, de las 23:19 del 15).

EXECUTOR DONE: graph_ui ya no importa, instala ni invoca spec2viz; validación en venv sin spec2viz: 20 + 21 passed sin skips, grep vacío, specir lista 0 dependencias de graph_ui (gate global aún abierto por otros repos). Cambios sin commitear.
