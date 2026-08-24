---
id: atom-commandmenu-how
title: CommandMenu
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:canvas
- topic:commands
provenance: docs/specs/matrix.graph-ui-views.yml
---

# CommandMenu

## Answer

It listens for Ctrl+K or Cmd+K in a document-level keydown effect and toggles a CommandDialog. Inside the dialog, action items call onSave, undo, or redo, and node items call setFocusedNode plus setEditorState('focus') before closing the palette.
