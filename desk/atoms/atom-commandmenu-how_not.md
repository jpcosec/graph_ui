---
id: atom-commandmenu-how_not
title: CommandMenu
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:canvas
- topic:commands
provenance: docs/specs/matrix.graph-ui-views.yml
---

# CommandMenu

## Answer

CommandMenu does not create nodes in the current source, even though a command palette could be used that way in another design. Here it is limited to session actions and node focus, and it delegates the real work to the stores or the parent onSave callback.
