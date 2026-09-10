# Resultado — paso 7: edición de clases (primera entrega)

## Backend
- `models_service.py`: gateway CLI a `sldb models` (list, show, template edit, fields add/remove, validate, promote). Usa subprocess, nunca importa internos de SLDB.
- 6 nuevos endpoints en serve.py: `/api/models/list`, `detail`, `template-edit`, `fields-add`, `fields-remove`, `validate`, `promote`.

## Frontend
- `classes-dialog.js`: diálogo con lista de clases, tabla de campos, textarea de template, botones Validar / Promover.
- Botón "Editar clases" en la sidebar de clases.
- Integrado en el modal de editor.js.

## Pendiente (diferido según plan)
- UI para añadir/quitar campos (name, type, description) — se puede hacer desde CLI.
- Editar tipo/descripción de campo existente (SLDB no ofrece el contrato).
- Impacto completo después del primer doc inválido (SLDB falla en el primero).
