# Openware UI

React components and design tokens with a quiet, tactile look: a midnight brand colour, a brass accent kept small, cool slate surfaces, buttons that press in, and Inter. Light and dark themes, and a brand colour you can swap.

## Docs

```sh
npm install         # installs and builds dist/
npm run dev         # the docs site: http://localhost:5173
npm run docs:build  # the same site as static files in docs-dist/
```

The docs have a page for every component, with live examples, the code to copy, keyboard behaviour, accessibility notes and a props table read from the TypeScript source, plus guides to installation, theming, colours, type and tokens. The Blocks section has 92 whole page sections (headers, heroes, pricing, settings, sign-in, chat and more), each live in a frame you can narrow to a tablet or a phone, with its `.tsx` and `.css` to copy. Search with ⌘K or Ctrl+K. They rebuild as you edit `src/`, `docs/` or `tokens/tokens.json`.

To document a new component, add `docs/examples/<Name>.tsx`: a `meta` export (title, category, description, source file) and one exported function per example. The function's JSDoc becomes the example's description, and its code is what the page shows.

To add a block, list it in `docs/app/blocks.tsx` and write `docs/blocks/<category>/<Name>.tsx` and `<Name>.css`; `docs/blocks/README.md` has the rules, and `npm run blocks:check` checks them.

## Install in a project

```sh
npm install @openwarelabs/ui
```

React 18 or 19 is a peer dependency. Toasts come from [sonner](https://sonner.emilkowal.ski) and the colour picker from [react-colorful](https://github.com/omgovich/react-colorful), both installed with it.

## Set up once

```tsx
import "@openwarelabs/ui/fonts.css";   // Inter and Geist Mono, self-hosted
import "@openwarelabs/ui/styles.css";  // tokens + components
```

```html
<html data-theme="light">          <!-- "light", "dark", or "system" to follow the OS -->
  <body class="ow-app">            <!-- the system's font, 14px text, colours and canvas -->
```

Then use the components:

```tsx
import { Button, Field, Input, Toaster, toast } from "@openwarelabs/ui";

<Field label="Project name" hint="Letters, numbers and dashes.">
  <Input placeholder="recipe-app" />
</Field>
<Button variant="primary" onClick={() => toast.success("Saved")}>Save</Button>
<Toaster />
```

## Components

93 components, each with a page in the docs.

| Group | Components |
| --- | --- |
| Typography | `Text` (each style on the Typography page as a variant: hero to caption, code and kbd; tones, `truncate`, `as`), `Link`, `Kbd`, `Code`, `CodeBlock`, `Snippet`, `Prose` (styles rendered Markdown or HTML, at chat or article size) |
| Actions | `Button` (primary, secondary, ghost, danger; sm, md, lg; `loading`; `shape="pill"`), `buttonClassName()` for links, `ButtonGroup`, `CloseButton`, `CopyButton`, `ToggleButton`, `SegmentedControl`, `ToggleButtonGroup` (one or several on), `Toolbar` + `ToolbarSeparator` (arrow keys across its controls) |
| Inputs | `Form` (the browser's checks, your own and the server's errors, under each field; `useFormStatus`), `Field`, `Fieldset`, `Input` (start and end content), `Textarea` (`autoGrow`), `NumberField`, `SearchField`, `InputOTP`, `ColorField`, `DateField` and `TimeField` (typed in segments, in the locale's order) |
| Choices | `Checkbox`, `CheckboxGroup`, `RadioGroup` (plain or cards), `Switch`, `Select`, `Combobox`, `Slider` (one value or a range), `ChoiceCard`, `ListBox` (one or many, on the page) |
| Pickers | `Calendar`, `DatePicker`, `RangeCalendar`, `DateRangePicker` (with presets), `ColorPicker`, `ColorArea`, `ColorSlider`, `ColorSwatchPicker`, `FileDropZone` |
| Feedback | `Alert`, `Badge`, `ProgressBar`, `ProgressCircle`, `Meter` (an amount in a range, toned by thresholds), `Spinner`, `Skeleton`, `SkeletonRows`, `Toaster` + `toast()` (sonner: stacked, swipeable, with actions and promises), `Tooltip` |
| Overlays | `Dialog`, `ConfirmDialog`, `Drawer`, `Popover`, `Menu` + `MenuItem`, `CommandPalette` |
| Navigation | `Tabs`, `Accordion`, `Disclosure`, `Breadcrumbs`, `Pagination`, `Steps`, `NavList` + `NavItem` |
| Data display | `Table` (sorting, selection), `Stat`, `FileTree`, `EmptyState`, `Tag`, `ColorSwatch`, `Avatar`, `AvatarGroup`, `User` |
| AI | `PromptInput` (attachments, stop while streaming) + `PromptSuggestion`, `ChatConversation` (follows the newest message, jump to latest), `ChatMessage` + `ChatMessageActions`, `ChatLoader`, `ChatTool` (a tool call with its status, input, output and approval), `ChainOfThought`, `ChatSource` + `ChatSources`, `TextShimmer` |
| Layout | `Card`, `SettingsRow`, `Stack`, `Separator`, `ScrollShadow`, `VisuallyHidden` |
| Marketing | `SiteHeader`, `SectionHeading`, `Chip`, `DotGrid` |

Hooks for your own components: `useControllableState`, `useFloating` (top-layer positioning that flips), `usePresence` (keeps a layer mounted while it animates out), `useDismiss`, `useModalDialog`, `useMenuKeyboard`. Every prop is typed and described, so your editor explains it on hover.

## Tokens

Every colour, space, radius, shadow and weight is a CSS variable named `--ow-…` (`var(--ow-surface)`, `var(--ow-radius-container)`), and every text style is a class (`ow-type-section-title`, `ow-type-lead`). `tokens/tokens.json` is the single source; `npm run tokens` regenerates the CSS and `npm run contrast` checks every text and focus pair in both themes.

**Rebrand** by overriding the eleven brand steps; the primary button, focus ring, checkboxes, tints and the primary button's glow follow, in both themes. `brandScale` builds the steps from any colour, on Openware's lightness curve so the contrast holds, and `applyBrand` puts them on the page:

```ts
import { applyBrand, brandCss, brandPresets, brandScale } from "@openwarelabs/ui";

applyBrand("#0d9488");               // the whole page, from one colour
applyBrand(brandPresets[2]!.scale);  // or a preset: Midnight, Ocean, Teal, Forest, Plum, Rose, Ember
brandCss("#0d9488");                 // ":root { --ow-brand-50: …; }" for a stylesheet
```

The docs' header has a colour picker that does this live, and the Theming page shows each preset in both themes.

**Motion** uses the timing tokens: things enter with `ow-ease-emphasized` and leave faster with `ow-ease-exit`, and knobs and indicators settle with `ow-ease-spring`. Menus, popovers, listboxes and tooltips grow from their trigger and shrink back into it; dialogs and drawers animate both ways; segmented controls and tabs slide their indicator. Everything stands still under `prefers-reduced-motion`.

**Tailwind v4**: `@import "@openwarelabs/ui/tailwind.css";` after `@import "tailwindcss";` gives you `bg-surface`, `text-text-muted`, `rounded-container`, `p-lg`, `font-action`, `shadow-menu` and the rest, plus a `dark:` variant tied to `data-theme="dark"`.

**No bundler?** `dist/openware-ui.iife.js` sets `window.OpenwareUI`, reading React from `window.React`. A CDN serves it straight from npm: `https://cdn.jsdelivr.net/npm/@openwarelabs/ui/dist/openware-ui.iife.js`, with `dist/styles.css` beside it.

## Rules worth keeping

- One primary button per view. Everything else is secondary or ghost.
- Borders before shadows: cards are `--ow-surface` with a 1px `--ow-border`. Shadows are for things that float or press.
- Brass stays small: dots, a star, the pointer on the grid. Never a button.
- Sentence case for every label. Name the action on the button ("Delete project"), never "OK".
- Icons are [Lucide](https://lucide.dev) (`lucide-react`), 16px, 2px stroke; icon-only buttons need an `aria-label`.

## Credits

Icons drawn inside the components are Lucide shapes (ISC). Inter and Geist Mono are under the SIL Open Font License 1.1. Toasts use sonner and the colour picker uses react-colorful, both under the MIT licence.
