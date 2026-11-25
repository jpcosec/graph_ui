REFORMULACION

El nodo es un `task.code` ejecutable, no un agregado. Propósito: retirar spec2viz de graph_ui para el gate G4/IR13, migrando la resolución de notación, `ViewDoc`, sincronización de specs y pilotos a `sldb.api.notations`, `sldb.models.notation.view_doc.ViewDoc` y `sldb notations sync`. Resultado: graph_ui deja de importar, instalar o invocar spec2viz; `specir retirement check` no lista dependencias de graph_ui; se commitea y se avisa a IR con el sha. Repo: graph_ui, sin tocar spec2viz, sldb ni IR. Límites: no dibujar paquetes UML, no cambiar layout/estilo, no tocar cambios sin commitear de JP en `frontends/desk/app.js` y `task.js`.

AMBIGUEDADES

1. En `test_mindmap_notation.py` aparece `from spec2viz.notation_view import resolve_view`, pero el alcance solo dice: “importorskip('spec2viz') y shutil.which('spec2viz') se quitan”. ¿Se sustituye por `sldb.api.notations.resolve_view` o se elimina la comparación? Obliga a inventar el reemplazo.
2. En `e2e_notation_legibility.py` aparece `ACTIVITY = Path(spec2viz.__file__)...`, pero el alcance dice: “PILOTS y MATRIX pasan a tests/fixtures/notation-pilots/”; ese archivo no usa `PILOTS` ni `MATRIX`. ¿Se reapunta `ACTIVITY` al fixture copiado? Obliga a inventarlo.
3. En `test_projection_views.py` aparece `pytest.importorskip("spec2viz.sldb_models").ViewDoc`; el alcance ordena cambiar `'spec2viz.sldb_models.ViewDoc'`, pero no menciona ese `importorskip`. ¿Se cambia a `sldb.models.notation.view_doc.ViewDoc`? Obliga a decidirlo.

DRY-RUN

Lecturas: TaskDoc, rituales execution/testing/closeout, pill, átomos y archivos listados; luego `grep -rn spec2viz frontends tests pyproject.toml .github`. Cambios previstos: imports y docstrings en `sldb_adapter.py`, `views_routes.py`, `projection_views.py`, `persistence.py`, `serve.py`; `VIEW_MODEL_REF`; quitar extra `notation` y spec2viz de `pyproject.toml` y `.github/requirements-suite.txt`; copiar los 10 pilotos con `git -C ../../spec2viz show 2a218b1:<ruta>` a `tests/fixtures/notation-pilots/` más README; repuntar tests y cambiar `spec2viz diagram sync` por `sldb notations sync --spec`; quitar skip/which de spec2viz; textos JS; editar el átomo. Dependencias: commit `2a218b1` accesible, API/CLI sldb con firmas indicadas, entorno sin spec2viz. Validaciones futuras: los tres bloques pytest, grep negativo, `specir retirement check`, commit atómico y mensaje a IR.

FUTURO

El ejecutor futuro ejecutará los cambios y validaciones; IR decidirá el acta de retiro con el sha recibido; el ritual de closeout reconciliará Board y commit.
