## REFORMULACION

**Propósito:** retirar spec2viz como dependencia de graph_ui (gate G4 de IR13) sustituyéndolo por `sldb.api.notations` (`resolve_view`, `resolve_documents`, `ViewError`), `sldb notations sync` y `sldb.models.notation.view_doc.ViewDoc`.

**Resultado:** código de producción, store, pruebas y fixtures de graph_ui sin rastro de spec2viz; pilotos copiados como fixtures propios; `specir retirement check` sin entradas de graph_ui.

**Repo:** `graph_ui` (`/mnt/ssd/proyectos/SLDB_1/UIs/graph_ui`), con acceso de lectura a `../../spec2viz` e `../../IR`.

**Límites:** no dibujar paquetes UML, no alterar layout/estilo, no tocar repos spec2viz/sldb/IR, no tocar cambios sin commitear en `frontends/desk/app.js` y `task.js`. Nodo ejecutable (`task.code`), no agregado.

## AMBIGUEDADES

1. «`git -C ../../spec2viz show 2a218b1:<ruta>`» — no se especifica la ruta absoluta/relativa real del clon de spec2viz ni que exista. Obliga a inventar su ubicación.
2. «reinstalar el entorno de pruebas sin spec2viz (`pip uninstall -y spec2viz`)» — no identifica venv ni intérprete. Obliga a inventar el entorno.
3. «pasan a decir sldb» (textos visibles en .js/.mjs) — no da redacción literal. Obliga a inventar el texto exacto.
4. «responder a IR con `deskops message send --to IR`» — sin cuerpo/formato del mensaje. Obliga a inventar contenido.
5. «El .sldb de graph_ui no registra ViewDoc» — asume existencia previa del store; no dice qué hacer si falta.

## DRY-RUN

**Lecturas:** `grep -rn spec2viz frontends tests pyproject.toml .github`; verificar commit `2a218b1` y contenido de los 10 pilotos; inspeccionar imports y `VIEW_MODEL_REF`.
**Cambios previstos:** los `files` listados (imports, docstrings, `VIEW_MODEL_REF`, pilotos+README, pruebas, textos .js/.mjs, `pyproject.toml`, `.github/requirements-suite.txt`) y el atom vía `deskops edit atom`.
**Dependencias:** sldb instalado; acceso a `spec2viz@2a218b1`; venv IR con `specir`; entorno de pruebas reconstruible.
**Validaciones futuras:** los tres `pytest`, el grep negativo y `specir retirement check --path graph_ui=../UIs/graph_ui`.

## FUTURO

Commit con sha; mensaje a IR; entrada en `IR/docs/spec2viz/acta-de-retiro.md`; decisión humana sobre aceptación del commit y sobre los cambios sin commitear de JP.
