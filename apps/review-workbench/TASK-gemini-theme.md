# Task: re-skin graph_ui with the gemini_test warm/amber design system

## Goal (what the user wants)
graph_ui currently wears the cyan "HUM/tactical observatory" theme (cyan glow
background, Space Grotesk, `--token-hum-*`, scanlines). Replace it with the
gemini_test design system: warm charcoal + amber accent, Inter, knowledge-family
colors. Reference: `/home/jp/proyectos/gemini_test/frontends/shared/theme.css`
and `UI-GUIDE.md §0`. The look should match flow_editor.

## Environment
- App root: `/home/jp/proyectos/hum-ecosystem/tools/graph_ui/apps/review-workbench`
- Branch: `iso-lab/graph_ui-antonia-demo` (experimental; master untouched). Edit ONLY here.
- Baseline that MUST stay green: **graph_ui 79 tests** (`npm test`), 0 failures. `npm run build` must pass.
- NO mocks/TODO. This is a styling change; keep all behavior identical.

## The gemini_test tokens (source of truth — from their theme.css)
```
--bg-page:            #0a0a0f
--bg-panel:           #0d1526
--bg-panel-solid:     #111a2e
--bg-panel-elevated:  #16223a
--bg-panel-strong:    #1c2b45
--border:             rgba(245,240,232,0.08)
--border-accent:      rgba(212,165,116,0.18)
--border-strong:      rgba(245,240,232,0.14)
--text-primary:       #f5f0e8
--text-muted:         rgba(245,240,232,0.45)
--text-muted-2:       rgba(245,240,232,0.55)
--accent:             #d4a574   (amber)
--accent-hover:       #e6a85c
--danger:             #e06c5a
font sans:            'Inter'
font mono:            'JetBrains Mono'
radius card:          14px ; radius tag: 8px
/* knowledge families */
--family-self:         #7cba7c  (sage green)
--family-domain:       #7fb3d5  (steel blue)
--family-conversation: #e6a85c  (amber)
--family-user:         #c97db9  (magenta)
--family-none:         #9aa7bd
scrollbar thumb:      rgba(212,165,116,0.35) on rgba(13,21,38,0.9)
```

## Implementation

### Part 1 — Tailwind tokens (`tailwind.config.js`) — the main leverage point
Remap the `colors` block from the cyan scheme to the gemini scheme. Keep the SAME
KEYS (so the 22 files using `bg-background`, `text-on-surface`, `border-border`,
`bg-card`, `text-muted-foreground`, `bg-primary`, etc. keep working) but change
the VALUES:
```
background:            #0a0a0f
foreground:            #f5f0e8
surface:               #0d1526
surface-low:           #111a2e
surface-container:     #16223a
surface-high:          #1c2b45
surface-highest:       #22304b
card:                  #111a2e
card-foreground:       #f5f0e8
popover:               #16223a
popover-foreground:    #f5f0e8
primary:               #d4a574     (was cyan #00f2ff — this is the big one)
primary-dim:           #e6a85c
primary-on:            #0a0a0f
primary-foreground:    #0a0a0f
secondary:             #e6a85c
secondary-dim:         #d4a574
secondary-on:          #0a0a0f
secondary-foreground:  #0a0a0f
muted:                 #111a2e
muted-foreground:      rgba(245,240,232,0.55)   (use a hex approximation if the token system needs hex: #b5afa6)
accent:                #16223a
accent-foreground:     #f5f0e8
error:                 #e06c5a
destructive:           #93000a
destructive-foreground:#ffb4ab
outline:               rgba(245,240,232,0.14)   (hex approx #2b2a27 if needed)
outline-variant:       rgba(212,165,116,0.18)
on-surface:            #f5f0e8
on-muted:              #b5afa6
border:                rgba(212,165,116,0.18)   (hex approx if the config needs solid: use #2e2a24 — but prefer keeping rgba; tailwind accepts rgba string values)
input:                 rgba(245,240,232,0.14)
ring:                  #d4a574
```
Also set the default font family: make `body` -> `Inter`, `headline` -> `Inter`
(drop Space Grotesk; the gemini look uses Inter for headings too), keep `mono` ->
JetBrains Mono. Add a `family` color group if convenient:
`family-self/domain/conversation/user/none` with the hex values above (used by future badges).

### Part 2 — Global styles (`src/styles.css`)
- Replace the font @import: use
  `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');`
  (drop Space Grotesk).
- Replace the cyan `html`/`body` background (the `radial-gradient(... rgba(0,242,255,...))`
  cyan glow + `linear-gradient(#0b1116 ...)`) with the gemini flat warm bg:
  `background: #0a0a0f;` on both html and body. Remove the cyan radial glow.
- Replace the `--token-hum-*` block: these are node color tokens still referenced
  by the HUM observatory (`token-hum-body` etc.). DO NOT delete them (the ?view=hum
  page uses them) — but they are irrelevant to Antonia. Leave them as-is OR retune
  to warm equivalents; simplest: LEAVE them so the HUM view still renders. Focus the
  reskin on the shared/Antonia surfaces.
- Add scrollbar styling from gemini theme.css (thin, amber thumb
  `rgba(212,165,116,0.35)` on `rgba(13,21,38,0.9)`) globally.
- Retune `.glass-panel` / `.section-card` utilities to the warm palette:
  panel bg `linear-gradient(180deg, rgba(18,18,26,0.98), rgba(10,10,15,0.98))`,
  border `rgba(212,165,116,0.18)`, and on hover border `#d4a574`. Drop the cyan
  `tactical-glow`/`scanline` from Antonia surfaces (you may keep the utility classes
  defined but ensure Antonia's shell doesn't apply the cyan glow).

### Part 3 — token-conversation and the StepCard family colors
- Ensure the conversation family accent is amber `#e6a85c` everywhere it shows
  (the AppShell rail, the "Antonia flow" toggle active state, the hero eyebrow).
  If a `--token-conversation` CSS var exists, set it to `#e6a85c`.
- The StepCard already uses the correct per-kind colors (ported from flow_editor) —
  leave it, just confirm it still reads well on the new warm bg.

### Part 4 — the app chrome (AppShell / hero / control surface)
Skim `src/components/layouts/AppShell.tsx` and the Antonia hero/control-surface
components. Where they hardcode cyan-ish values or use `primary` (now amber),
verify they now read amber. The right-hand "Control surface" panel, the Save button
(currently teal/cyan), Undo/Redo/Copy/Paste, and the left rail should adopt the
amber accent. Prefer fixing via the token remap (Part 1); only touch component files
where a color is hardcoded (hex) rather than tokenized.

## Validation (do ALL, paste output)
1. `npm test` -> 79 passed, 0 failures.
2. `npm run build` -> succeeds.
3. Visual proof with Playwright against the running stack (vite already on 5173 with
   sldb serve proxied). Capture full-page screenshots of BOTH:
   - `http://127.0.0.1:5173/` (Antonia live) — should show warm charcoal bg + amber
     accents (NOT cyan). Zoom in to show the StepCards on the warm theme.
   - the inspector open (double-click a node) on the warm theme.
   Save screenshots under `auto_user_test/theme/`.
   Also assert programmatically: the computed `background-color` of body is the warm
   `rgb(10, 10, 15)` (#0a0a0f), and that the primary accent is amber not cyan
   (e.g. grab a Save button's computed color and assert it's not `#00f2ff`/cyan).

## Done when
- The Antonia view renders in the gemini_test warm/amber theme (no cyan glow,
  Inter font, amber accents, warm charcoal panels).
- 79 tests green, build passes.
- Screenshots saved showing the new theme (canvas + inspector).
- HUM view (?view=hum) still renders (its own tokens untouched).

## Commit
When ALL green, commit on the branch:
`git add -A && git commit -m "style(theme): adopt gemini_test warm/amber design system (Inter, amber accent, family colors)"`
Do NOT touch master. Do NOT promote. Report: files edited, npm test output, build result, the body-bg + accent assertions, screenshot paths, commit hash. If blocked, STOP and report.
