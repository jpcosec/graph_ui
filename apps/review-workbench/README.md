# Review Workbench — referencia histórica

El desarrollo activo está en [KB Mindmap](../../frontends/mindmap/README.md).
Desde la raíz, ejecutar `python3 frontends/mindmap/serve.py 8088` y abrir
http://127.0.0.1:8088/.

Este workbench conserva el editor anterior y sus componentes compartidos.
La vista HUM, sus pruebas específicas y su evaluación de piezas recuperables
están en la rama `archive/hum-view`, bajo
`apps/review-workbench/src/features/hum-body/README.md`.
El selector HUM y la entrada `?view=hum` fueron retirados.

Para verificar el código compartido desde la raíz:

```sh
npm --prefix apps/review-workbench run test
npm --prefix apps/review-workbench run lint:architecture
npm --prefix apps/review-workbench run build
```
