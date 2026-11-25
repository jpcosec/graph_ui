REFORMULACION
Encargo ejecutable (tarea de código, no agregado): en graph_ui, sustituir toda dependencia de spec2viz por `sldb.api.notations` (resolve_view, resolve_documents, ViewError) y `sldb.models.notation.view_doc.ViewDoc`; registrar ese ViewDoc en el store vía CLI de sldb; copiar a `tests/fixtures/notation-pilots/` los specs piloto que usan las pruebas; cambiar las pruebas a `sldb notations sync --spec ... --store .sldb` sin skips por spec2viz; actualizar textos/comentarios y el atom; quitar spec2viz de `pyproject.toml` y `.github/requirements-suite.txt`. Resultado: sin spec2viz instalado las suites pasan, el grep negativo no devuelve nada y `specir retirement check` no lista graph_ui; IR recibe el sha. Límites: no paquetes UML, no layout/estilo, no tocar spec2viz/sldb/IR ni los cambios sin commitear de JP en `frontends/desk/app.js` y `task.js`.

AMBIGUEDADES
1. «si una firma difiere de la de spec2viz (resolve_view(store, spec_ref, pythonpath=None))»: falta la firma real de sldb.api.notations; obligaría a inventarla.
2. «los .yml de spec2viz/docs/architecture/spec2viz que nombra cada prueba»: sin lista de rutas; obligaría a inventar qué specs copiar.
3. «diga de qué commit de spec2viz salen»: el sha no aparece; obligaría a inventarlo.
4. «la migración del registro se hace con el CLI de sldb»: sin subcomando ni certeza del ViewDoc registrado hoy.
5. «`--spec <spec>, ..., --store .sldb`»: flags omitidos; obligaría a inventar la sintaxis.

DRY-RUN
Lecturas: TaskDoc, grep `spec2viz` en frontends/tests/pyproject.toml/.github, ambos archivos de dependencias, las suites listadas, `.sldb`, el atom y su nota. Cambios previstos: cinco módulos de producción, pyproject, requirements, fixtures+README, ~10 archivos de prueba, comentarios JS, atom. Dependencias: versión de sldb con esas APIs y CLI, repo IR y su venv. Validaciones futuras: pytest de ambas listas, grep negativo, `specir retirement check`, y comprobar que `import spec2viz` falla.

FUTURO
Decide un humano: el sha del commit de spec2viz para el README y la resolución de firmas dudosas. Otros nodos: crear el commit y enviar el sha a IR con `deskops message send`; IR actualiza `acta-de-retiro.md`; la edición del atom con `deskops edit atom`.
