# Notas del coordinador al cierre (vistas sin migrar y save 503)

- **Código.** Commit d62195c. El tester independiente da PASS: sldb origin/main d50dd6a9, 76 passed, endpoints 33 passed. Las 3 pruebas nuevas fallan en HEAD. En procesos reales, las 5 rutas dan 503 store_no_preparado y no cambia ninguno de los 406 archivos de .sldb y .sldb_cache.
- **Desvío aceptado.** Se tocó serve.py, cerca de la línea 477: el handler real de /api/save no es la línea 144 que citó la Disposition. Además SLDBStoreError se re-exporta desde sldb_adapter, porque test_no_duplicate_sldb_imports_outside_adapter exige que solo el adaptador importe sldb.
- **e2e intermitente.** Una corrida dio 24 passed y 1 failed en e2e_mindmap_workspace::test_explorer_equal_titles_show_distinct_visible_paths_and_open_their_origin, por un timeout de document-reader. Corrida sola pasó 3 de 3, también sobre el código viejo. No es regresión de este cambio (O3).
- **O1.** Con .sldb borrado, save responde 503 'store not prepared', pero en realidad el store no existe. Viene de que sldb read_store usa ese texto también para un store inexistente. Se avisa a sldb por inbox.
- **O2.** Los vite preview huérfanos ya tienen su tarea: task-la-e2e-de-vistas-de-review-workbench-no-deja-procesos-vite-preview-huérfanos-al-terminar.
