REFORMULACION
Propósito: retirar spec2viz de graph_ui (gate G4/IR13). Resultado: producción usa `sldb.api.notations`, el store registra `ViewDoc` de sldb, las pruebas sincronizan specs con `sldb notations sync` sobre 10 pilotos locales y `specir retirement check` no lista graph_ui. Repo: graph_ui, cwd `/home/jp/proyectos/SLDB_1/UIs/graph_ui`. Límites: no dibujar UML, no cambiar layout/estilo, no tocar repos spec2viz/sldb/IR ni cambios sin commitear de JP en desk. Es una tarea de código ejecutable, no un agregado.

AMBIGUEDADES
1. “notation-view.js, notation.mjs, notation-style.mjs, notation-swimlanes.mjs” figuran en alcance pero no en `files:`; obliga a inventar rutas exactas y si entran en el diff.
2. “reinstalar el entorno de pruebas sin spec2viz ('pip uninstall -y spec2viz')”: el comando no reinstala; obliga a decidir entorno y reinstalación.
3. “PILOTS y MATRIX pasan a tests/fixtures/notation-pilots/” no define sus valores; obliga a inventar el mapeo exacto por prueba.
4. “Actualizar el atom ... con 'deskops edit atom'” no da ruta ni texto final; obliga a inventar destino y redacción.

DRY-RUN
Sin ejecutar: leería el TaskDoc, `grep`, archivos listados, tests, `pyproject.toml`, requirements, store y los pilotos del commit. Cambiaría imports/`VIEW_MODEL_REF`, copiaría 10 fixtures más README, ajustaría tests y textos, quitaría dependencias y editaría el atom. Dependencias: sldb instalado con firmas equivalentes, acceso a `../../spec2viz` commit `2a218b1`, `deskops`, pytest y `specir`. Validaría: pytest de ambos grupos, grep negativo, `python -c "import spec2viz"` fallando y `specir retirement check`. No ejecuto nada.

FUTURO
Tras el commit, el ejecutor envía el sha a IR con `deskops message send`; IR lo incorpora al acta de retiro. Un humano revisa/aprueba commit, entorno sin spec2viz y cambios ajenos en desk.
