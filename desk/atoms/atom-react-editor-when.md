---
id: atom-react-editor-when
title: React Editor
five_wh_one_plus: when
tags:
- system:graph_ui
- layer:frontend
- topic:architecture
provenance: docs/specs/component.graph-ui.yml
---

# React Editor

## Answer

The React Editor runs when the browser boots the review-workbench SPA and `src/App.tsx` mounts the app inside `QueryClientProvider` and `AppShell`. After boot, it keeps running through page-level fetches, store hydration, canvas interaction, and save attempts. It is the long-lived frontend session for operator interaction.
