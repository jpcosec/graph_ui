# Graph UI Architecture Linting

This documents the first architecture guardrail added to `graph_ui/apps/review-workbench` so we stop repeating the layer-boundary drift that happened between L1, L2, and L3.

## Why this exists

The failure mode was not a missing component. It was a hierarchy violation:

- L1 view code (`HumBodyPage`) started making layout/composition decisions that should be expressed as a higher-level preset
- L2 shell code (`GraphEditor`, `CanvasSidebar`) started accumulating view-specific behavior
- the result was that fixing one view required touching multiple layers

The purpose of the lint is to fail early when that drift starts again.

## The rule set

The architecture lint is currently implemented as a custom static checker:

- script: `graph_ui/apps/review-workbench/scripts/lint-architecture.mjs`
- npm command: `npm run lint:architecture`

It scans production source files under `graph_ui/apps/review-workbench/src/` and enforces these rules.

### 1. L1 may only mount the L2 public entrypoint

Files in:

- `src/features/graph-editor/L1-app/`

may import:

- `features/graph-editor/L2-canvas/GraphEditor`

but may not import deeper L2 implementation details such as:

- sidebar sections
- node shells
- edge components
- inspectors

This keeps L1 focused on orchestration and translation.

### 2. L2 must remain domain-agnostic

Files in:

- `src/features/graph-editor/L2-canvas/`

may not import:

- `src/features/graph-editor/L1-app/`
- `src/features/hum-body/`

L2 should expose slots and shell surfaces, not know HUM-specific view logic.

### 3. L3 content components must not depend on editor/runtime internals

Files in:

- `src/components/content/`

may not import:

- `@xyflow/react`
- Zustand stores under `src/stores/`
- L1 app files
- L2 canvas files
- HUM view files

This keeps L3 reusable and presentation-only.

### 4. HUM view files may only mount the generic L2 entrypoint

Files in:

- `src/features/hum-body/`

may import:

- `features/graph-editor/L2-canvas/GraphEditor`

but may not import internal L2 implementation files directly.

This prevents the HUM view from reaching into the canvas subsystem and bypassing the shell contract.

### 5. L2 cannot contain HUM/mode-specific language

The checker also scans `src/features/graph-editor/L2-canvas/` source text and fails if it finds mode-specific or HUM-specific terms such as:

- `structure`
- `routine`
- `trace`
- `compare`
- `hum-mode-`
- lens labels like `Topological lens`, `Anatomical lens`, etc.

This is a deliberate semantic lint: if those concepts appear in L2, it is a sign that navigation/view policy is leaking into the generic shell again.

## How it works

The script:

1. walks `src/`
2. ignores test files
3. classifies each file into an architectural zone:
   - `L1`
   - `L2`
   - `L3`
   - `HUM`
   - `OTHER`
4. extracts import specifiers with a lightweight parser
5. resolves alias imports (`@/...`) and relative imports into repo-relative paths
6. applies the boundary rules above
7. applies a content-level scan for forbidden HUM/mode terms inside L2

It is intentionally simple and explicit. The goal is fast feedback, not a full compiler.

## How to run it

From `graph_ui/apps/review-workbench`:

```bash
npm run lint:architecture
```

Recommended local sequence before committing:

```bash
npm run lint:architecture
npm test
npm run build
npm run test:user-flows
```

## What this catches today

Examples of violations this script is meant to stop:

- importing `CanvasSidebar` directly into an L1 page
- importing `HumBodyPage` logic into L2 shell code
- using React Flow primitives inside `components/content/`
- reintroducing structure/body/routine/trace-specific branching in `L2-canvas/`

## What this does not catch yet

This is the first guardrail, not the final one.

It does **not** yet verify:

- prop-shape purity (for example, whether `GraphEditor` exposes too many layout knobs)
- layout preset correctness
- whether a given slot is being used in the right architectural way
- semantic coupling that happens without imports or obvious string literals

## Next step

The next evolution should be to move from an imperative checker to a declared contract:

1. define the layer contract as data under `graph_ui/docs/architecture/`
2. compile it with `spec2viz` into both:
   - a human-readable component diagram
   - an enforcement artifact
3. make the lint script consume that artifact instead of hardcoding the rules

That would align the architecture diagram and the architecture lint into one source of truth.
