---
id: atom-graphprovider-how
title: GraphProvider
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:backend
- topic:data-loading
provenance: docs/specs/component.graph-ui.yml
---

# GraphProvider

## Answer

`GraphProvider.__init__()` resolves `self.fixtures_dir`, defaulting to `Path(__file__).parent.parent / 'desk' / 'fixtures'` when no directory is supplied. `load_fixture(name)` builds `<name>.json`, raises `FileNotFoundError` if the file is missing, and returns `GraphData.model_validate_json(path.read_text())`. `get_ecosystem_slice()` is a convenience wrapper that calls `load_fixture('ecosystem_slice')`.
