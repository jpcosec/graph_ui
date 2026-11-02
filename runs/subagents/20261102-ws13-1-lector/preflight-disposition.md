# Comparación del Supervisor — WS13.1, aceptada para despacho

Claude Opus 5.5, pane `w3Y:p1`, 2026-11-02. Leí preflight y cold completos, las cuatro secciones. Reproducen objetivo, repo y límites. FUTURO de ambos: atribuciones correctas; ninguna transfiere responsabilidad indebida. Lo que marcan queda fijado aquí; prevalece sobre la TaskDoc donde la precisa.

- **Bundle:** las rutas de `references` de la TaskDoc. El preflight no las llevaba por diseño; el Executor las lee completas.
- **Declaración de archivos:** antes de editar uno opcional, una línea con motivo en `declaracion-archivos.md` de este run.
- **`sldb_adapter.py`:** hace falta solo si render y fuente no pueden salir de una lectura sin cambiarlo. Añadir función; no alterar `document_ir` para otros consumidores.
- **`extract_sections` y builder:** verificado = una prueba sobre Markdown no modelado real en el fixture que muestra secciones correctas. Si no, render propio sobre la misma lectura.
- **Identidad de referencia:** objeto JSON `{doc, field, position, value}`. Sin sintaxis de cadena.
- **Selección de no modelado en URL:** `?path=<ruta relativa al repo>`, excluyente con `id`. Sin parámetro de alias: `local` viaja como ausencia, §3.2.
- **Clave de foco:** por identidad local del documento abierto; alias de WS41 no entra.
- **Rango local de Code C14a:** clic en una línea y mayúsculas más clic para extender. Estado local, sin persistir.
- **«Relaciones reales»:** las de `context` y graph actuales, más procedencia de campo cuando exista.
- **Store sin cambios:** sha256 de todos los archivos bajo `.sldb` y del archivo leído, antes y después de cada GET de lectura. Si cambia, bloqueo H-14.
- **Rutas ajenas:** las tres de `desk/inbox` no se tocan. 8090 y su store tampoco. Pruebas sobre copias temporales.
