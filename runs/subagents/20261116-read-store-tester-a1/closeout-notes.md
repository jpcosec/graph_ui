# Notas del coordinador al cierre (read_store)

- **Código y tester.** Código en 1479e24. El tester independiente da PASS (result-summary.md). Su entorno: sldb de origin/main df3903db, deskops 7ccd5dce, pron 39ea9724. V3 da 124 passed y V4 22 passed, sin skips.
- **Validación V5 (F1).** El comando `git -C ../../sldb branch -r --contains f515d91c` sale vacío. f515d91c solo existe en la rama local backup/pre-align-20261116 de sldb. El mismo parche entró en origin/main como 77b6dc34, con el closeout 336cde87 entrado como d40ee439: mismo mensaje y mismo read_store.py. El coordinador acepta 77b6dc34 como equivalente; la CI instala sldb@main y trae read_store, extract_payload y store_is_prepared.
- **F2 (baja).** Si el store se des-prepara con el servidor ya arrancado, POST /api/save pasa de 409 a 500 'store not prepared'. No escribe nada. Va a una tarea de seguimiento, junto con load_runtime_documents (sldb_adapter.py:409-415), que todavía usa open_store y migra al leer.
- **F3-F6 (bajas o informativos).** No requieren cambio.
