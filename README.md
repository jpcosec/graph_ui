# graph_ui — KB Mindmap

El desarrollo activo está en `frontends/mindmap/`: editor visual de documentos
SLDB con creación, referencias, contenedores plegables y guardado real.

## Ejecutar

Desde la raíz del repositorio:

```sh
python3 frontends/mindmap/serve.py 8088
```

Abrir http://127.0.0.1:8088/. Requiere `sldb` y los modelos registrados
(`deskops` para esta KB) en el entorno Python. Usa la `.sldb` del repositorio;
`SLDB_STORE` permite elegir otra. Las dependencias del navegador se cargan vía CDN.

Ver [uso y pruebas](frontends/mindmap/README.md) y
[guía de desarrollo](docs/mindmap-developer.md).

## Vista HUM archivada

La rama `archive/hum-view` conserva la implementación completa del observatorio
HUM y una evaluación de piezas reutilizables en
`apps/review-workbench/src/features/hum-body/README.md`.
HUM está retirado de la rama activa.

Para leer esa evaluación sin cambiar de rama:

```sh
git show archive/hum-view:apps/review-workbench/src/features/hum-body/README.md
```

`apps/review-workbench/` conserva el editor anterior como referencia.
El frontend activo y su comando de arranque son los de Mindmap indicados arriba.
`frontends/flow_editor/` conserva el editor HCP del que se adaptó Mindmap.
