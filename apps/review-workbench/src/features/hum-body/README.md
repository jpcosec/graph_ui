# Vista HUM archivada

Esta vista queda preservada en la rama `archive/hum-view`, a partir de
`c0e31e5`. El desarrollo activo continúa en `frontends/mindmap/`.
Esta nota evalúa código existente; no compromete migrarlo al Mindmap.

## Qué vale la pena recuperar

| Pieza | Código | Utilidad y límites |
| --- | --- | --- |
| Proyecciones de un mismo modelo | `lib/adapter.ts`: `buildHumViewGraph`, `structureNodes`, `anatomyNodes` | Separar datos de su representación permite distintas lecturas sin duplicar documentos. La implementación está acoplada a tipos HUM; recuperar el patrón o funciones pequeñas. |
| Contenedores plegables y procedencia | `lib/adapter.ts`: `structureNodes`, `packFileColumns`; `../graph-editor/L2-canvas/hooks/use-edge-inheritance.ts` | Agrupa archivos/formas, conserva rutas y permite representar conexiones de grupos plegados. Mindmap ya tiene contención y plegado: reutilizar solo mejoras concretas. El empaquetado HUM usa tres columnas y medidas fijas. |
| Relación entre plan y ejecución | `lib/adapter.ts`: `routineOverlay`, `traceOverlay` | Construye pasos, eventos y conexiones `mirrors`/`deviates-from`. Es una base para inspeccionar ejecuciones futuras. Requiere `mirrorsStepId` explícito; no infiere correspondencias, omisiones ni divergencias. Marca desviación por resultados `failed`/`looping`. |
| Canvas de consulta | `HumBodyPage.tsx`; `../graph-editor/L2-canvas/GraphEditor.tsx`, `GraphCanvas.tsx`, `hooks/use-keyboard.ts` | El modo `editable=false` limita herramientas de edición y deja navegar una proyección. Es comportamiento de interfaz, no control de permisos del backend. |
| Layouts reutilizables del editor compartido | `../graph-editor/L2-canvas/layout/layout-strategies.ts` y su test | Hay layout ELK y organización por profundidad/distancia del grafo. No son exclusivos de HUM; podrían servir al Mindmap si su layout actual resulta insuficiente. Portar el algoritmo requiere adaptar contratos y evaluar el peso de ELK. |
| Pruebas de transformación | `lib/adapter.test.ts` | Cinco pruebas cubren registro de tipos, conversión, estructura, conexiones válidas, comparación y resumen. Son ejemplos útiles de invariantes de una proyección. Los documentos son fixtures escritos en el test, aunque la variable se llame `liveDocuments`; no certifican integración con datos reales. |

## Qué no tratar como terminado ni trasladar por defecto

- La pantalla, textos, cinco pestañas y estética del observatorio: quedan archivados.
- El adaptador reconoce nombres y alias de campos a mano; no es un adaptador
  genérico guiado por el esquema real de SLDB. Necesita validación con modelos
  reales antes de recuperarlo.
- HUM carga `/sldb/graph` al montar y usa un canvas de consulta. No implementa
  edición persistente propia ni actualización continua.
- `lib/presets.ts` y `HumBodyPage.tsx` duplican metadatos de los modos.
- Los flujos antiguos de `user_flows/` deben revisarse antes de tomarlos como
  aceptación: pueden depender de fixtures o de la interfaz anterior.
- Mindmap ya tiene contrato, adaptador SLDB, compilador y guardado propios.
  Esta rama no justifica reemplazarlos ni importar el workbench completo.

## Cómo consultar o recuperar

Desde la raíz del repositorio, sin cambiar la rama activa:

```sh
git show archive/hum-view:apps/review-workbench/src/features/hum-body/lib/adapter.ts
git worktree add ../graph_ui-hum-archive archive/hum-view
```

La copia archivada se ejecuta con `npm --prefix apps/review-workbench run dev`
y expone HUM mediante `?view=hum`. Requiere el backend `/sldb` y documentos
compatibles para poblar las vistas. Para recuperar algo, extraer únicamente la
pieza elegida y probarla contra el contrato del Mindmap; no fusionar toda la rama.
