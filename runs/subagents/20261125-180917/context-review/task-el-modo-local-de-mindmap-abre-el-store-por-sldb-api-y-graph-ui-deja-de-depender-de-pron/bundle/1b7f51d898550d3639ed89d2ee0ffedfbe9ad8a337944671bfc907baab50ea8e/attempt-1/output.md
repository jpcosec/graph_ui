## REFORMULACION

El nodo es una tarea ejecutable (`task.code`), no un agregado ni paquete. Propósito: retirar `pron` del modo local de mindmap y abrir el store mediante `sldb.api`. Resultado: lectura, creación, reemplazo y borrado de documentos, registro de modelos y edición de clases en modo local sin importar `pron`; dependencias limpias y tests verdes sin `pron`. Repo: `graph_ui` (workspace indicado por cwd y rituales). Límites: tocar `frontends/mindmap/sldb_adapter.py`, `models_service.py`, `serve.py`, `pyproject.toml` y `.github/requirements-suite.txt`; fuera: edición por gestos, modo remoto y reescritura de `docs/`.

## AMBIGUEDADES

1. “`models_service.py`” no incluye ruta completa. Obligaría a inventar su ubicación.
2. “`serve.py`” aparece solo en Scope. Obligaría a inventar qué archivo y responsabilidad tiene.
3. “se usan esas funciones” no nombra funciones ni módulos concretos de `sldb/src/sldb/cli/serve/`. Obligaría a inventar el mapeo API.
4. “registre modelos y edite clases” no fija contrato ni criterios observables. Obligaría a inventar aceptación.
5. “En un entorno sin pron instalado” no define cómo aislar o simular ese entorno. Obligaría a inventar el procedimiento.
6. “`python -m pytest -q tests`” no fija directorio de ejecución ni requisitos previos. Obligaría a asumir la raíz y el entorno.

## DRY-RUN

Lecturas: `docs/mindmap-developer.md`, implementación de `sldb/src/sldb/cli/serve/`, `sldb_adapter.py`, `models_service.py`, `serve.py`, `pyproject.toml`, `.github/requirements-suite.txt` y tests afectados. Cambios previstos: sustituir importaciones y `pron.world.store.Store` por llamadas equivalentes de `sldb.api`; ajustar servicios locales; eliminar `pron` de dependencias; adaptar tests si corresponde. Dependencias: versión/API de `sldb.api`, utilidades de `serve`, entorno sin `pron`, pills y guardrails del Board. Validaciones futuras: el `grep` indicado, `pytest -q tests`, ausencia de `pron` en dependencias y prueba del modo local. Nada se ejecuta aquí.

## FUTURO

El nodo de ejecución implementará el cambio; el de testing validará el contrato; closeout reconciliará el Board y registrará el commit atómico. Un humano debe decidir las ambigüedades anteriores: rutas, mapeo de funciones, criterios de aceptación y procedimiento de entorno sin `pron`.
