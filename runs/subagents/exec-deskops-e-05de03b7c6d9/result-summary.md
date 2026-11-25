# Resultado (intento 2) — G-D

run_id: exec-deskops-e-05de03b7c6d9 · session: n/a (ejecutor Claude Code) · session_sha256: n/a

## Cambios
- `notation-layout.mjs`: se quita el corte temprano de `bestIn` (era la regresión: cortaba en el primer candidato limpio y cambiaba el layout de state.diagram-sync-lifecycle; el puntaje premia el de más zoom). `bestIn` vuelve a ser idéntico al original. Se conserva el corte en el pase de rescate (`allIn` con `stopAtGood`).
- `notation-view.js` + `frontends/mindmap/vendor/elk-worker.min.js` (elkjs 0.11.1 vendorizado, servido por graph_ui): el Worker se crea con URL local; fallback al hilo principal si no carga. `index.html` mantiene el import de `elkjs/lib/elk-api.js`.
- `tests/fixtures/notation-view-activity.json`: salida real de `resolve_view` sobre `notation-pilots/activity-render-error-handling.yml`.
- `tests/mindmap-notation-layout.test.mjs`: usa ese fixture real, tope 56; y un test que fija que no se corta en el primer candidato limpio.

## Cuentas medidas (ELK real, lienzo 1200x900/700)
| spec | antes | ahora | mismo candidato/zoom |
|---|---|---|---|
| activity (13 nodos) | 99 | 56 | sí (zoom 0.9717) |
| statechart | 24 | 24 | sí |
| class | 24 | 24 | sí |
| sequence | 24 | 24 | sí |
(con el corte temprano de 8f617a4 statechart cambiaba a zoom 0.866 vs 1.073: la regresión.)

## Tope 30: no alcanzable sin cambiar layouts
56 = 24 (dirección de la notación, todos con problemas) + 24 (perpendicular) + 8 (rescate sin reservar rótulos, corta en el primero limpio). Bajar de ahí exige omitir el pase perpendicular o cortar `bestIn`, lo que altera layouts de specs que hoy salen bien. Un posible paso siguiente (no hecho): probar el rescate antes del pase perpendicular → 32 corridas, pero puede cambiar specs que hoy eligen el girado.

## Validación
Ver validation.log. Nota de entorno: el venv requirió `pip install -e pron -e sldb`, `--no-deps -e graph_ui` y `playwright install chromium`.
