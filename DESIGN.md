---
version: "1.0"
name: KIMUN Knowledge Workspace
description: Design language for the standalone multi-projection Knowledge Workspace (frontends/workspace).
colors:
  page-default: "#0b0f16"
  surface-default: "#101621"
  surface-subtle: "#151d2b"
  fill-default: "#101621"
  fill-subtle: "#151d2b"
  fill-strong: "#1b2537"
  fill-inverse: "#e6edf6"
  fill-accent: "rgba(110, 231, 183, 0.12)"
  content-primary: "#e6edf6"
  content-secondary: "#cad5e6"
  content-muted: "#8b9bb4"
  content-extra-muted: "#56657d"
  content-inverse: "#0b0f16"
  content-accent: "#6ee7b7"
  content-reference: "#7aa2f7"
  content-warning: "#f6c177"
  content-danger: "#f7768e"
  color-line-default: "#202b3d"
  color-line-strong: "#2b3a52"
typography:
  mono:
    fontFamily: JetBrains Mono
  sans:
    fontFamily: Inter
  h1:
    className: type-h1
    fontFamily: Inter
    fontSize: 21px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.01em
  h2:
    className: doc-section-title
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0.04em
  bodyMd:
    className: doc-prose
    fontFamily: Inter
    fontSize: 13.5px
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: normal
  bodySm:
    className: type-body-sm
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: normal
  code:
    className: type-code
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: normal
---

## Overview

Quiet, high-density, and knowledge-first. The KIMUN Knowledge Workspace (`frontends/workspace/`) is a 3-column dark engineering IDE that projects a single canonical `.sldb` node simultaneously as readable prose (`Document`), local neighborhood (`Graph`), confined source (`Code`), and hash/impact state (`Changes`).

## Colors

- Use `page-default` (`#0b0f16`) for the main workspace canvas and code viewer background.
- Use `surface-default` (`#101621`) for the top bar, left navigation sidebar, primary document card, and right context sidebar.
- Use `surface-subtle` (`#151d2b`) and `fill-strong` (`#1b2537`) for nested cards, relation items, key-value blocks, and hover/active states.
- Use `color-line-default` (`#202b3d`) for structural 1px borders and `color-line-strong` (`#2b3a52`) for active or interactive boundaries.
- Limit primary semantic accent to `content-accent` (`#6ee7b7`) for the selected node, active tab indicator, and verified integrity states.
- Use `content-reference` (`#7aa2f7`) strictly for navigable `@mention` node chips and incoming edge indicators.
- Use `content-warning` (`#f6c177`) strictly for staleness, git working-tree mutations, and SLDB `EdgeIndex` problems.

## Typography

- Use `Inter` for UI labels, navigation, and long-form document prose.
- Use `JetBrains Mono` for canonical IDs (`Model:name`), SHA-256 hashes, line spans (`L36–L41`), file paths, and code projections.
- Apply `font-variant-numeric: tabular-nums` on all counters, badges, line numbers, hashes, and metric cards so numeric columns never jitter.
- Apply `text-wrap: balance` on headings (`h1`) and `text-wrap: pretty` on document prose (`.doc-prose`).

## Layout

- Use a fixed 3-column viewport grid (`height: 100dvh`, `grid-template-rows: 48px 1fr 30px`, `grid-template-columns: 270px 1fr 300px`).
- Keep scrolling localized to independent scroll containers (`.catalog-list`, `.content`, `.code-scroll`, `section.context`).
- Constrain readable document cards to `max-width: 840px` and graph/code cards to `max-width: 920px`.

## Elevation & Depth

- Rely on 1px structural borders (`color-line-default`) and surface step contrast (`#0b0f16` → `#101621` → `#151d2b`) rather than drop shadows.
- Reserve box shadows exclusively for floating overlays such as the `⌘K` global search results popover.
- Never use decorative radial glows or multi-color gradients on workspace surfaces.

## Shapes

- Use `10px` border radius for primary workspace cards (`.doc-card`, `.graph-box`), `8px` for nested items (`.node`, `.change-item`, `.kv`), `6px` for navigation items and inputs, and `999px` for metadata pills and filter chips.

## Components

- **Navigation & Catalog Items**: Single-line truncated titles with `tabular-nums` badges and clear active border state.
- **Inline Knowledge Mentions (`.mention`)**: Monospace clickable pills (`@atom-...`, `@TaskDoc:...`) that navigate the workspace to the referenced node without full page reload.
- **Code Chips (`.code-chip`)**: Monospace clickable file/line badges (`src/file.py:42`) that switch to the `Code` tab and highlight the target span.
- **2D Subgraph Canvas (`.graph-box`)**: Flat 28px grid surface with SVG edge lines and positioned `.node` cards (`center`, `1 hop`, `2 hops`).

## Do's and Don'ts

- **Do** provide visible `:focus-visible` outlines on interactive controls, tabs, chips, and search inputs.
- **Do** animate only compositor properties (`transform`, `opacity`) within `150ms ease-out`, respecting `prefers-reduced-motion: reduce`.
- **Don't** animate layout properties (`width`, `height`, `top`, `left`, `margin`, `padding`).
- **Don't** introduce mock, stub, or fabricated data into any workspace projection or empty state.
