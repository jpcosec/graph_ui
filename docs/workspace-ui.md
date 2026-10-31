---
title: Workspace Multi-proyección en Mindmap
source_atoms:
  - atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node
---

# Workspace Multi-proyección en Mindmap

La ruta **`/workspace/node`** presenta un nodo del store documental bajo tres proyecciones simultáneas y coherentes (Documento, Grafo Local y Código), acompañadas de una barra lateral de Contexto con identidad canónica, hashes verificables, relaciones navegables y reporte de problemas de integridad.

```sh
pip install -e '.[deskops]'
SLDB_STORE=/ruta/a/repo/.sldb graph-ui 8091
```

Abrir `http://127.0.0.1:8091/workspace/node?id=TaskDoc:mi-tarea&depth=1&tab=document`.

## Proyecciones del Nodo

Cada nodo del store documental es un único recurso que se proyecta en tres facetas según la necesidad del operador:

1. **Documento**: Presenta la estructura documental mediante el Intermediate Representation (IR) de SLDB (desglosando secciones jerárquicas y spans de líneas cuando están disponibles) junto con el payload de campos del documento (título, objetivo, alcance, validación, metadatos). Si el documento se encuentra sintácticamente degradado en disco, se visualiza un banner explicativo y se preserva el frontmatter legible sin romper la interfaz.
2. **Grafo Local**: Muestra la vecindad de relaciones incidentes y salientes a una profundidad configurable de **1 salto** o **2 saltos**. Las relaciones provienen de la topología real resuelta por SLDB (`document_edges`), mostrando aristas tipadas (`specifies`, `depends_on`, `relates_to`, etc.) con selector interactivo para filtrar por tipo de relación. Hacer clic sobre cualquier tarjeta de nodo vecino reorienta el workspace completo a ese nodo y actualiza la URL en el historial.
3. **Código**: Expone los archivos de código vinculados declarados en las listas `files` o `references` del payload del documento, soportando especificadores de línea (`ruta/archivo.py:42`). Muestra el fragmento de código con números de línea y resalta visualmente la línea objetivo. Si el documento está degradado, se indica explícitamente que el código no está disponible.

## Panel Lateral de Contexto

A la derecha (o en bloque vertical en dispositivos móviles) se despliega el panel de contexto:

- **Identidad Canónica**: Identificador unívoco (`Model:name`), modelo documental, estado (`status`), nodo actual de ciclo de vida (`current_node`) y ruta relativa dentro del repositorio.
- **Hashes Distintos y Verificables**:
  - `Content Hash (SLDB)`: Hash del contenido del documento calculado por SLDB (`doc_version`), informando errores si el cálculo falla.
  - `File Revision (Git/Disk)`: SHA256 del archivo físico en disco, informando errores si el archivo no puede leerse.
- **Relaciones Incidentes y Salientes**: Listado interactivo de aristas entrantes (`← rel`) y salientes (`rel →`). Cada elemento actúa como enlace para navegar al nodo enlazado sin recargar la aplicación.
- **Problemas de Integridad**: Reporte delimitado de inconsistencias reportadas por el `EdgeIndex` de SLDB distinguiendo tres estados:
  - *Error de lectura*: Falla al consultar el store.
  - *Problemas en este nodo*: Muestra las inconsistencias directas en las que participa el nodo.
  - *Inconsistencias globales del store*: Alerta si existen relaciones rechazadas en el store aunque no nombren directamente al nodo.
  - *Limpio*: Confirmación visual de integridad.

## Seguridad y Confinamiento

- **Confinamiento en Repositorio**: La proyección de código solo sirve archivos existentes dentro de la raíz del repositorio (`repo_root`). Cualquier intento de path traversal (`..` o `/` inicial) o lectura fuera de la raíz devuelve HTTP 400.
- **Protección ante Symlinks**: Los enlaces simbólicos que apunten fuera del repositorio son rechazados de forma segura.
- **Archivos Ignorados**: Los archivos ignorados por `.gitignore` (como `.env` o `secrets.json`) no se exponen; la verificación con `git check-ignore` falla cerrada ante cualquier anomalía y distingue entornos sin repositorio git.

## Contrato de API

- `GET /api/workspace/nodes`: Catálogo de nodos disponibles en el store `{ ok: true, nodes: [...] }`.
- `GET /api/workspace/node?id=...&depth=1|2`: Datos multi-proyección del nodo especificado `{ ok: true, node, projections: { document, graph, code }, context }`.

Esta implementación materializa el átomo:
[`atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node`](../desk/atoms/atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node.md).
