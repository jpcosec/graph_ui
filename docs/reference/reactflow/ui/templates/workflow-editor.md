---
source: https://reactflow.dev/ui/templates/workflow-editor
title: Workflow Editor
---

# Workflow Editor

The Workflow Editor template is a Next.js-based application designed to
help you quickly create, manage, and visualize workflows. Built with
<a href="/ui">React Flow UI</a>
and styled using
<a href="https://tailwindcss.com/">Tailwind CSS </a>
and
<a href="https://ui.shadcn.com/">shadcn/ui </a>,
this project provides a highly customizable foundation for building and
extending workflow editors.

<div
class="border-border mt-4 h-[75vh] max-h-[650px] min-h-[400px] overflow-hidden rounded-sm border bg-muted animate-pulse"
role="status" aria-label="Loading example preview">

</div>

## Tech Stack

-   **React Flow UI**: The project uses
    <a href="/ui">React Flow UI</a>
    to build nodes. These components are designed to help you quickly
    get up to speed on projects.

-   **shadcn CLI**: The project uses the
    <a href="https://ui.shadcn.com/docs/cli">shadcn CLI </a>
    to manage UI components. This tool builds on top of
    <a href="https://tailwindcss.com/">Tailwind CSS </a>
    and
    <a href="https://ui.shadcn.com/">shadcn/ui </a>
    components, making it easy to add and customize UI elements.

-   **State Management with Zustand**: The application uses Zustand for
    state management, providing a simple and efficient way to manage the
    state of nodes, edges, and other workflow-related data.

## Features

-   **Automatic Layouting**: Utilizes the
    <a href="https://github.com/kieler/elkjs">ELKjs </a>
    layout engine to automatically arrange nodes and edges.
-   **Drag-and-Drop Sidebar**: Add and arrange nodes using a
    drag-and-drop mechanism.
-   **Customizable Components**: Uses React Flow UI and the shadcn
    library to create highly-customizable nodes and edges.
-   **Dark Mode**: Toggles between light and dark themes, managed
    through the Zustand store.
-   **Runner Functionality**: Executes and monitors nodes sequentially
    with a workflow runner.
