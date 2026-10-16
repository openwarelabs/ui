# Openware UI

React components and design tokens with a quiet, tactile look: a midnight brand colour, a brass accent kept small, cool slate surfaces, buttons that press in, and Inter. Light and dark themes, and a brand colour you can swap.

**Docs: [openwarelabs.github.io/ui](https://openwarelabs.github.io/ui/)**: every component with live examples and props, every block, the tokens and the guides. It's published from each release, so it matches the packages on npm.

## Docs

To run them from the repository:

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

124 components, each with a page in the docs.

| Group | Components |
| --- | --- |
| Typography | `Text` (each style on the Typography page as a variant: hero to caption, code and kbd; tones, `truncate`, `as`), `Link`, `Kbd`, `Code`, `CodeBlock`, `Snippet`, `Prose` (styles rendered Markdown or HTML, at chat or article size), `InlineEdit` (text you click to edit in place; Enter saves, Escape cancels, async saves) |
| Actions | `Button` (primary, secondary, ghost, danger; sm, md, lg; `loading`; `shape="pill"`), `buttonClassName()` for links, `ButtonGroup`, `CloseButton`, `CopyButton`, `ToggleButton`, `SegmentedControl`, `ToggleButtonGroup` (one or several on), `Toolbar` + `ToolbarSeparator` (arrow keys across its controls) |
| Inputs | `Form` (the browser's checks, your own and the server's errors, under each field; `useFormStatus`), `Wizard` (a form in pages: a Steps strip, checks per step, Back and Next), `Field`, `Fieldset`, `Input` (start and end content), `Textarea` (`autoGrow`), `MarkdownEditor` (a formatting toolbar with shortcuts, Write and Preview tabs or a split view, pasted images uploaded), `NumberField`, `SearchField`, `InputOTP`, `ColorField`, `DateField` and `TimeField` (typed in segments, in the locale's order), `TagInput` (several values as tags, typed or picked from suggestions), `PasswordInput` (show and hide, a strength meter, a checklist of rules; `passwordStrength()`), `MentionInput` (`@` mentions and `/` commands in a list at the caret; `useMentions` for any text box), `SignaturePad` (sign with a mouse, finger or pen, or type instead; sent with a Form) |
| Choices | `Checkbox`, `CheckboxGroup`, `RadioGroup` (plain or cards), `Switch`, `Select`, `Combobox`, `Slider` (one value or a range), `Rating` (pick a score or show one), `ChoiceCard`, `ListBox` (one or many, on the page), `TreeView` (rows that open, select or check, with children loaded on demand), `TransferList` (two lists with buttons to move items between them, searchable and orderable) |
| Pickers | `Calendar`, `DatePicker`, `RangeCalendar`, `DateRangePicker` (with presets), `ColorPicker`, `ColorArea`, `ColorSlider`, `ColorSwatchPicker`, `FileDropZone`, `ImageCropper` (move and zoom a picture under a frame for an avatar or a banner; the cropped image through a ref or with a Form), `UploadList` (files uploading with progress, retry, cancel and remove; `useUploadQueue`) |
| Feedback | `Alert`, `Badge`, `ProgressBar`, `ProgressCircle`, `Meter` (an amount in a range, toned by thresholds), `Spinner`, `Skeleton`, `SkeletonRows`, `Toaster` + `toast()` (sonner: stacked, swipeable, with actions and promises), `Tooltip`, `Banner` (an announcement bar across the top, dismissible and remembered) |
| Overlays | `Dialog`, `ConfirmDialog`, `Drawer`, `Popover`, `HoverCard` (a preview when the pointer rests on a link), `Menu` + `MenuItem`, `CommandPalette`, `ContextMenu` (right-click, long press or Shift+F10, with the same items), `Tour` (steps that point at parts of the page, with an optional spotlight) + `Coachmark`, `NavigationMenu` + `NavigationMenuItem` + `NavigationMenuLink` (a site's top nav with dropdown panels and mega-menus), `NotificationCenter` (a bell with an unread count that opens a popover inbox) + `NotificationList` |
| Navigation | `Tabs`, `Accordion`, `Disclosure`, `Breadcrumbs`, `Pagination`, `Steps`, `NavList` + `NavItem`, `TableOfContents` (a page's headings as links, the one in view marked as it scrolls) |
| Data display | `Table` (sorting, selection), `DataGrid` (thousands of rows: search, column filters, sorting, resizable columns, selection; renders only the rows in view), `Stat`, `FileTree`, `EmptyState`, `Tag`, `ColorSwatch`, `Avatar`, `AvatarGroup`, `User`, `Image` (a placeholder while it loads, a fallback if it fails, `ratio`, `caption`), `Timeline` + `TimelineItem`, `DescriptionList` + `DescriptionItem`, `Carousel` + `CarouselSlide` (scroll-snap, arrows, dots, autoplay), `SortableList` (reorder by dragging or with the keyboard), `Kanban` (cards dragged within and between columns, or moved with the keyboard; WIP limits), `DiffViewer` (code diffs, unified or side by side, from two strings or a patch), `ActivityHeatmap` (a calendar of daily counts in shaded squares), `MediaPlayer` (audio and video with the library's own controls), `QRCode` (drawn as one SVG path, with its own encoder; `encodeQR()`) |
| AI | `PromptInput` (attachments, stop while streaming) + `PromptSuggestion`, `ChatConversation` (follows the newest message, jump to latest), `ChatMessage` + `ChatMessageActions`, `ChatLoader`, `ChatTool` (a tool call with its status, input, output and approval), `ChainOfThought`, `ChatSource` + `ChatSources`, `TextShimmer`, `Markdown` (a safe renderer for answers as they stream, code in CodeBlock) |
| Layout | `Card`, `SettingsRow`, `Stack`, `Separator`, `ScrollShadow`, `ScrollArea` (thin theme-coloured scrollbars that show on hover or while scrolling), `VisuallyHidden`, `AspectRatio`, `Splitter` + `SplitterPanel` + `SplitterHandle` (panels you resize by dragging or with the arrow keys, collapsible, remembered), `VirtualList` (renders only the rows in view, for 10,000 rows, logs and infinite feeds) |
| Marketing | `SiteHeader`, `SectionHeading`, `Chip`, `DotGrid` |

Hooks for your own components: `useControllableState`, `useFloating` (top-layer positioning that flips), `usePresence` (keeps a layer mounted while it animates out), `useDismiss`, `useModalDialog`, `useMenuKeyboard`, `useVirtualizer` (the windowing behind VirtualList). Every prop is typed and described, so your editor explains it on hover.

## Blocks as components

Every block is also a component in its own package, `@openwarelabs/blocks`, that takes its content as props, so you don't copy its code: all 95, from `Header01` and `Hero01` to `Settings03` and `Chat03` ([the list](blocks/README.md#blocks)).

```sh
npm install @openwarelabs/blocks
```

```tsx
import "@openwarelabs/blocks/styles.css"; // after @openwarelabs/ui/styles.css
import { Hero01 } from "@openwarelabs/blocks";

<Hero01 title="The workspace for shipping software" description="…" primaryAction={{ label: "Start for free", href: "/signup" }} />;
```

Each block's page in the docs shows its props under the preview. The source is `blocks/src/<category>/<Name>/` (the component, its `.types.ts` and its `.css`); `npm run blocks:build` builds the package, and `npm run release` publishes it with the library at the same version.

## Use with AI

The MCP server, `@openwarelabs/ui-mcp`, gives Claude Code, Codex, Cursor and other AI tools the setup, every component's examples and props, every block's code and the tokens, so they build with the real components:

```sh
claude mcp add openware-ui -- npx -y @openwarelabs/ui-mcp   # Claude Code
codex mcp add openware-ui -- npx -y @openwarelabs/ui-mcp    # Codex
```

Cursor and most other clients take `{ "mcpServers": { "openware-ui": { "command": "npx", "args": ["-y", "@openwarelabs/ui-mcp"] } } }`. [mcp/README.md](mcp/README.md) has every tool and client.

In the docs, every component and block has a **Copy for AI** button: a prompt with its whole reference (examples and props, or a block's two files) to paste into any AI tool. The built docs also have `llms.txt`, `llms-full.txt` and a Markdown copy of every page under `ai/`. `npm run mcp:build` rebuilds the server from the docs.

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

## Contributing

`main` takes changes only through pull requests, squash-merged, so each one lands as a single commit named after the PR. The PR title follows [Conventional Commits](https://www.conventionalcommits.org) because `npm run release` reads it: `feat: add a date range picker`, `fix(Menu): close on Escape`, `feat!: rename Stack's gap sizes`. Put `BREAKING CHANGE: …` in the PR description for a breaking change.

Five checks have to pass to merge:

- **Checks**: types, contrast, blocks, the library, the MCP server and the docs, and the bundle size: what an app pays, minified and gzipped, for each package and for one piece of it imported alone, against the limits in `size-limits.json` (`npm run size` after a build). Raise a limit in the PR that needs it, so the growth is seen in review. It also lints for React's hooks rules (`npm run lint`; `eslint-suppressions.json` lists the problems there already were), and packs both packages as `npm publish` would, installs them in a new app and imports, requires, bundles and type-checks them there (`npm run smoke`).
- **PR title**: the title follows the convention (`npm run commits:check -- --title "feat: …"` locally).
- **Cleaner**: [openwarelabs/cleaner](https://github.com/openwarelabs/cleaner) on the `.ts` and `.tsx` files the PR changes. Types go in a `<name>.types.ts` beside the component, and imports from another folder use the aliases instead of `../`: `@/…` for `src/` (in the library and the docs), `@docs/…` for `docs/` (`?highlight` imports too) and `@build/…` in `mcp/`. Files that haven't been touched yet don't follow it; they catch up as they change.
- **Visual**: every block (desktop and phone width) and every component example, in light and dark, rendered from the PR and from `main` and compared pixel by pixel. If something looks different, the run's summary lists it and the `visual-report` artifact shows each one before, after and with the changed pixels marked. When the change is meant, add the **visual change** label and the check passes. `npm run visual` runs the same comparison locally against `main` (`-- --filter Hero` for a few).
- **Accessibility**: axe over every block (desktop and phone width) and every component example, in light and dark, against WCAG 2.2 A and AA. The run's summary lists each problem with the element and how to fix it. `a11y-known.json` lists the problems there already were, which don't fail it; fixing one means lowering its count. `npm run a11y` runs it locally (`-- --filter Hero` for a few).

Dependabot opens a pull request each Monday with the week's npm and GitHub Actions updates, minor and patch ones grouped, and React with React DOM in one. Only Checks runs on those (types, builds, size and the package smoke test): PR title, Cleaner, Visual and Accessibility are for changes people make, and skipped jobs count as passing.

`scripts/setup-github.sh` sets this up on GitHub (squash merges only, the PR title as the commit, the ruleset for `main`, the visual change label). Repository admins can bypass the ruleset, which `npm run release` uses to push its version commit and tag.

## Releasing

```sh
npm run release              # works out the version, checks, tags and pushes
npm run release -- --dry-run # shows the version and the notes, changes nothing
npm run release -- minor     # forces patch, minor, major or an exact version
```

The version comes from the commit subjects since the last release, written as [Conventional Commits](https://www.conventionalcommits.org): `feat:` makes a minor release, `fix:` and `perf:` a patch, and `feat!:` or a `BREAKING CHANGE:` line a major one (a minor one before 1.0). `chore:`, `docs:`, `refactor:`, `test:`, `ci:`, `build:` and `style:` don't release on their own. The command checks that `main` is clean and up to date, runs every check and build, bumps both packages, writes `CHANGELOG.md`, commits, tags `vX.Y.Z` and pushes.

The tag starts `.github/workflows/release.yml`, which runs the checks again, publishes `@openwarelabs/ui` and `@openwarelabs/ui-mcp` to npm with trusted publishing (no token, with provenance), and makes the GitHub release from the changelog. Pull requests are squash-merged with their title as the commit, so the titles are what it reads.

## Rules worth keeping

- One primary button per view. Everything else is secondary or ghost.
- Borders before shadows: cards are `--ow-surface` with a 1px `--ow-border`. Shadows are for things that float or press.
- Brass stays small: dots, a star, the pointer on the grid. Never a button.
- Sentence case for every label. Name the action on the button ("Delete project"), never "OK".
- Icons are [Lucide](https://lucide.dev) (`lucide-react`), 16px, 2px stroke; icon-only buttons need an `aria-label`.

## Credits

Icons drawn inside the components are Lucide shapes (ISC). Inter and Geist Mono are under the SIL Open Font License 1.1. Toasts use sonner and the colour picker uses react-colorful, both under the MIT licence.
