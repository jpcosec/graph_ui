---
source: https://reactflow.dev/ui
title: React Flow UI
---

# React Flow UI

Ready-to-use React Flow components built with
<a href="https://ui.shadcn.com/">shadcn/ui </a>
components and
<a href="https://tailwindcss.com/">Tailwind CSS </a>.
Useful for new projects, MVPs, or when you need to get up and running
quickly.

<div
class="nextra-callout x:overflow-x-auto x:not-first:mt-[1.25em] x:flex x:rounded-lg x:border x:py-[.5em] x:pe-[1em] x:contrast-more:border-current! x:bg-blue-100 x:dark:bg-blue-900/30 x:text-blue-700 x:dark:text-blue-400 x:border-blue-700 x:dark:border-blue-600">

<div
style="font-family:"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol""

</div>

<div>

**Note**

React Flow UI has been updated to support the latest version of
shadcn/ui, on **React 19 and Tailwind 4**! Read more about the changes
and how to upgrade
<a href="/whats-new/2025-10-28">here</a>.

</div>

</div>

## Prerequisites

You need to have **shadcn and tailwind configured in your project**. If
you haven’t installed it, you can follow the steps explained in the
<a href="https://ui.shadcn.com/docs/installation">shadcn installation guide </a>.
If shadcn and tailwind are part of your project, you can initialize
shadcn-ui by running:

<div
class="nextra-scrollbar x:overflow-x-auto x:overscroll-x-contain x:overflow-y-hidden x:mt-4 x:flex x:w-full x:gap-2 x:border-b x:border-gray-200 x:pb-px x:dark:border-neutral-800 x:focus-visible:nextra-focus"
role="tablist" aria-orientation="horizontal">

npm

pnpm

yarn

bun

</div>

<div>

<div id="headlessui-tabs-panel-_R_6ist5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="0"
headlessui-state="selected" data-selected="">

```tsx
npx shadcn@latest init
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_aist5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
pnpm dlx shadcn@latest init
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_eist5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
yarn dlx shadcn@latest init
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_iist5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
bun x shadcn@latest init
```

</div>

</div>

</div>

If you want to learn more about the motivation behind this project, you
can find a detailed blog post
<a href="https://xyflow.com/blog/react-flow-components">here </a>.
For a more in-depth tutorial, we also recently published a new guide on
<a href="/learn/tutorials/getting-started-with-react-flow-components">getting started with React Flow UI</a>.

<div
class="nextra-callout x:overflow-x-auto x:not-first:mt-[1.25em] x:flex x:rounded-lg x:border x:py-[.5em] x:pe-[1em] x:contrast-more:border-current! x:bg-purple-100 x:dark:bg-purple-900/30 x:text-purple-600 x:dark:text-purple-400 x:border-purple-600">

<div
style="font-family:"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol""

</div>

<div>

**Important**

Using React Flow UI components with Tailwind CSS 4 **requires importing
the main React Flow CSS stylesheet** after you import the **shadcn UI
stylesheet**. To ensure the styles are loaded in the correct order, you
should always import the styles in your `global.css` file (or
`index.css` file), after you import `tailwindcss`. **Avoid importing the
styles in your `App.tsx` file or any other file that is imported by your
`App.tsx` file.**

</div>

</div>

<div
class="x:px-4 x:text-xs x:text-gray-700 x:dark:text-gray-200 x:bg-gray-100 x:dark:bg-neutral-900 x:flex x:items-center x:h-12 x:gap-2 x:rounded-t-md x:border x:border-gray-300 x:dark:border-neutral-700 x:contrast-more:border-gray-900 x:contrast-more:dark:border-gray-50 x:border-b-0">

<span
class="x:truncate">global.css</span>

</div>

```tsx
@import "tailwindcss";
@import "tw-animate-css";
@layer base {
  @import "@xyflow/react/dist/style.css";
}
```

</div>

## Usage

Find a component you like and run the command to add it to your project.

<div
class="nextra-scrollbar x:overflow-x-auto x:overscroll-x-contain x:overflow-y-hidden x:mt-4 x:flex x:w-full x:gap-2 x:border-b x:border-gray-200 x:pb-px x:dark:border-neutral-800 x:focus-visible:nextra-focus"
role="tablist" aria-orientation="horizontal">

npm

pnpm

yarn

bun

</div>

<div>

<div id="headlessui-tabs-panel-_R_6lst5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="0"
headlessui-state="selected" data-selected="">

```tsx
npx shadcn@latest add https://ui.reactflow.dev/component-name
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_alst5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
pnpm dlx shadcn@latest add https://ui.reactflow.dev/component-name
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_elst5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
yarn dlx shadcn@latest add https://ui.reactflow.dev/component-name
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_ilst5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
bun x shadcn@latest add https://ui.reactflow.dev/component-name
```

</div>

</div>

</div>

-   This command copies the component code inside your components
    folder. You can change this folder by adding an alias inside your
    `components.json`.

-   It automatically installs all necessary dependencies

-   It utilizes previously added and even modified components or asks
    you if you’d like to overwrite them.

-   It uses your existing tailwind configuration.

-   The components are **not black-boxes** and can be **modified and
    extended** to fit your needs.

For more information visit the
<a href="https://ui.shadcn.com/docs">shadcn documentation </a>.
