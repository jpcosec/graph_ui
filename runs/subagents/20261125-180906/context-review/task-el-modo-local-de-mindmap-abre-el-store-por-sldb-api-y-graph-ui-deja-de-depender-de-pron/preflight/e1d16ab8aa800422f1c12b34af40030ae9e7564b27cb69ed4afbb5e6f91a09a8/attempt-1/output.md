## REFORMULACION

**Propósito:** eliminar la dependencia de `pron` en el modo local de mindmap, sustituyendo `pron.world.store.Store` por `sldb.api`, conforme al ADR `sldb/docs/architecture/pron-is-archived.md`.

**Resultado:** mindmap lee, crea, reemplaza y elimina documentos, registra modelos y edita clases en modo local sin importar `pron`; en un entorno sin `pron` la suite de `tests/` pasa y ni `frontends/` ni `src/` lo importan.

**Repo/superficie:** `frontends/mindmap/sldb_adapter.py`, `models_service.py`, `serve.py`, `pyproject.toml`, `.github/requirements-suite.txt`; referencia `sldb/src/sldb/cli/serve/`. Fuera: gestos, modo remoto, `docs/`.

**Límites:** no crear capa nueva; reutilizar funciones de `sldb serve`.

## AMBIGUEDADES

1. "sldb/docs/architecture/pron-is-archived.md" — ruta relativa a qué repo; el cwd es `graph_ui`. Obligaría a inventar la raíz del repo `sldb`.
2. "frontends/mindmap/sldb_adapter.py, models_service.py, serve.py" — solo el primero lleva ruta; los otros dos podrían estar en `frontends/mindmap/` o en `sldb/`. Inventar su ubicación.
3. "pyproject.toml y .github/requirements-suite.txt" — no se dice de qué repo; hay al menos dos candidatos. Inventar cuál se modifica.
4. "se usan esas funciones, sin una capa nueva" — `sldb/src/sldb/cli/serve/` es superficie CLI; no se aclara si sus funciones son importables como API o si hay que reflejarlas. Inventar el mecanismo de reutilización.
5. "registre modelos y edite clases" — no se nombran endpoints ni funciones concretas de `sldb.api`. Inventar el mapeo operación→API.
6. "python -m pytest -q tests" — no se indica el directorio raíz de ejecución ni si `tests/` es de mindmap, de `sldb` o de ambos. Inventar el alcance de la suite.

## DRY-RUN

**Lecturas:** ADR citado, `docs/mindmap-developer.md`, `sldb_adapter.py`, `models_service.py`, `serve.py`, `sldb/src/sldb/cli/serve/`, ambos `pyproject.toml`/requirements.
**Cambios previstos:** reemplazar imports/usos de `pron.world.store.Store` por llamadas a `sldb.api`; ajustar dependencias; retirar `pron` de requisitos.
**Dependencias:** API pública de `sldb.api` y funciones de `sldb serve`; entorno sin `pron` para validar.
**Validaciones futuras:** `grep -rnE '^(from|import) pron|pron\.world' frontends src` sin coincidencias; `pytest -q tests` verde; revisión de `pyproject.toml` y `requirements-suite.txt`. Nada se ejecuta aquí.

## FUTURO

Un ejecutor con acceso al repo `sldb` resuelve ubicaciones y mapeos; un humano confirma alcance de `tests/` y que no se abre capa nueva.
