---
id: atom-graph-ui-se-instala-como-paquete-mindmap
title: graph_ui se instala como paquete mindmap
five_wh_one_plus: how
tags:
- system:graph_ui
- topic:packaging
provenance: pyproject.toml
---

# graph_ui se instala como paquete mindmap

## Answer

graph_ui se instala con pip install -e . desde la raíz del repo: pyproject.toml mapea el paquete mindmap a frontends/mindmap (package-dir) y empaqueta el HTML/JS/CSS que sirve el servidor. Sus dependencias son structuredLanguageDB>=0.1.11 y pron; spec2viz es el extra opcional notation. Los módulos del mindmap se importan como mindmap.<módulo>, nunca manipulando sys.path; el servidor arranca con python3 frontends/mindmap/serve.py o con el comando graph-ui.
