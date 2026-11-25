# Resultado
- Nuevo `frontends/mindmap/embed/notation.js`: `mount(container,{baseUrl,spec,view,theme})` / `unmount`; monta la vista de notación con ViewContext + SourceProvider + request(baseUrl), sin shell; enlaza skins/base/notation.css contra baseUrl. Documenta el importmap (react, @xyflow/react, elkjs, ...) que debe poner el anfitrión.
- `views/specs/notation/notation-view.js`: prop opcional `spec` (spec inicial); sin ella, comportamiento intacto.
- `tests/fixtures/embed/host.html`: página ajena con su importmap y una llamada a mount.
- `tests/e2e_embed_notation.py`: sirve graph_ui, abre host.html en /__embed/ (fuera de mindmap), comprueba catálogo, dibuja spec, cambia de spec, «Ver todo» encuadra, sin pageerror/console error, sin topbar.
- Validación: ver validation.log. e2e_embed_notation pasa. tests/e2e_mindmap_notation.py::test_specs_view_draws_nest_... FALLA (margen de encuadre 5<8) también sin mis cambios (checkout principal): fallo previo de entorno, no tocado.
- Revisar: tema solo fija data-skin en <html> (alcance G-A3 fuera); el fallo previo bloquea el criterio «pasan juntas».
- run_id: exec-deskops-e-edb4d68cbe34 (sin sesión hija).
