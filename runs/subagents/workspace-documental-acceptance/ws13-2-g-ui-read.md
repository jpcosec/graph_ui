# Recibo G_UI_READ del delta WS13.2

Es el recibo de este delta solamente; no transfiere el de WS13.1. No es firma ni prueba funcional del humano y no acepta el resultado. `G_HUMAN_READ` y WS16 siguen pendientes de recorrido real.

- **Actor:** solicitante designado P01 (`decisiones.md`).
- **Instrucción humana original:** «Mira, en http://127.0.0.1:8090/ hicieron algo parecido. Creo que quizas hay cosas que se pueden aprovechar de ahi. Revisa eso y luego manda al implementaador a implementar»
- **Selección técnica de root:** esta hoja WS13.2, por delegación: `runs/subagents/20261102-ws13-1-correccion/review-source-final.md`, 2026-11-02.
- **Alcance:** explorador de documentos reales modelados y Markdown no modelado, refresco explícito, catálogo degradado. Contrato fuente WS11: `contratos/navegacion.md` sha256 `6a4f8518f3d69de6118550b3077921db4bbb46bc9123c26980c6c8fc5f62361e`.
- **Efecto:** autorizar preparación e implementación de este delta.
- **Repo y base:** graph_ui, HEAD `a2f0bba`.
- **Tarea receptora:** candidato `desk/drawer/tasks/task-ws13-2-explorador-modelados-y-no-modelados.md`, commit `a2f0bba`, blob `fa3a3eed3731`; tarea activa en el commit de promoción.
- **No solapamiento:** las draft `task-vista-changes-…` y `task-edicion-contextual-…` no se tocan. El render sigue en `task-render-markdown-legible-del-lector`.
