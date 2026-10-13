# Blocks

Whole sections of a page, made from Openware components, to copy into a project and change. The docs show each one live in a frame you can narrow to a tablet or a phone, with its two files beside it.

```
docs/blocks/<category slug>/<Name>.tsx   the component: export function <Name>()
docs/blocks/<category slug>/<Name>.css   its styles, every selector under .<name-in-kebab-case>
```

The list of blocks, with each one's name and description, is `docs/app/blocks.tsx`. A block appears in the docs once its files exist. `npm run blocks:check` checks every block against the rules below.

## Adding a block

1. Add it to its category in `docs/app/blocks.tsx`: `{ id: "HeroCentred", name: "Centred with a screenshot", description: "…" }`. Give it `height: 640` if it fills the window (an app shell, a sign-in page) or opens a dialog or popover over the page; otherwise the preview grows to fit it.
2. Write `<Name>.tsx` and `<Name>.css` in the category's folder.
3. `npm run dev`, open the category under Blocks, and look at it at every width, in light and dark.
4. `npm run blocks:check` and `npm run typecheck`.

## The rules

**Two files, nothing else.** A block imports only `react`, `@openwarelabs/ui`, `lucide-react` and its own `./<Name>.css`, so it can be copied as is. It exports one function, named like its file. Sample data, small helper components and types sit above it in the same file, unexported. No images or outside URLs: draw product visuals with Openware components and CSS, and use `Avatar` initials for people.

**Components, not look-alikes.** Text is `<Text variant="…">`: every heading, paragraph and styled run of text (a label, a caption, a price) takes the variant that matches it, with `as` for the outline and `tone` for its colour. Controls are the library's: `Button` (or `CloseButton`, `CopyButton`, `ToggleButton`), `Link` (or `buttonClassName()` / `linkClassName()` on an `<a>`), `Kbd`, `Code`, `Input` and the other fields, `Badge`, `Avatar`, `Card`. Plain elements are only for layout, and for drawn product visuals (inside `role="img"` or `aria-hidden`), which are pictures rather than page text. `npm run blocks:check` flags a hand-made heading, paragraph or control.

**Its own class, and only its own.** Every selector starts with the block's class: `HeroCentred` → `.hero-centred`, `.hero-centred__title`, `.hero-centred--compact`. Inside it you can reach a library class when you must (`.shell-sidebar .ow-menu { display: block; }`), never the page (`body`, `:root`, bare elements). Start each stylesheet with:

```css
.hero-centred,
.hero-centred *,
.hero-centred *::before,
.hero-centred *::after {
    box-sizing: border-box;
}
```

**Tokens for everything that has one.** Colours are `var(--ow-…)` (or `color-mix()` of them, and `transparent`), never hex or rgb, so a block follows the theme and the brand colour. Spaces, radii, shadows, weights, durations and easings come from the tokens where one fits. Type comes from `Text`, whose display variants shrink on phones by themselves; a block's CSS sets its layout (margins, widths, alignment), not its type.

**Every width.** It must look designed at 1280, 1024, 768 and 390 pixels wide, with nothing scrolling sideways. Phones are under 760px (the library's own breakpoint), tablets under 1024px. Only blocks with a fixed `height` in the list may use viewport units (`100dvh`); the others are measured to fit, and `vh` would make them grow forever.

**Motion** uses the timing tokens, and anything animated has a `prefers-reduced-motion` rule that stills it.

### Marketing blocks

- On `--ow-paper`, which is warm in light: put cards and controls on `--ow-surface`, not straight on the paper, when they need a ground.
- A section is `padding: var(--ow-section-y) 32px` with its content in `max-width: var(--ow-page-max); margin: 0 auto`; on phones, `72px var(--ow-page-gutter)`.
- Titles are big and light: `Text` variant `hero` for a page's first screen, `page-title` for a page's heading, `section-title` for a section's. `SectionHeading` does a section's Chip, title and intro for you. The intro is `variant="lead"`: muted and under 560px wide.
- Buttons are `shape="pill"`. One primary button per section.
- Cards: `--ow-surface`, a 1px `--ow-border`, `--ow-radius-card` (18px). A product visual standing alone can take `--ow-shadow-lift`, the only decorative shadow.

### Application blocks

- On `--ow-canvas`, with the page on a raised `--ow-surface` panel (`--ow-radius-panel`) or in cards (`--ow-radius-container`), each with a 1px `--ow-border`.
- 14px text: `Text` variant `body`, `copy` for descriptions, `caption` for meta. Page titles `heading`; card titles `card-title`; dialog titles come from `Dialog`.
- Buttons are the default rounded shape, `md` in pages and `sm` in toolbars and rows. One primary button per view.
- Blocks that open a dialog, drawer or popover open it as they load, over a believable page, so the preview shows it; closing it leaves a button that opens it again.

### Words

- The sample product is **Acme**, a workspace where software teams plan work, hand routine tasks to AI agents, review the changes and ship them. Its things: projects (`marketing-site`, `billing-api`, `mobile-app`, `docs`, `design-system`), deploys (Live, Building, Failed), agent runs, reviews, members and API keys. Plans: Free (€0, up to 5 people), Team (€12 a person a month), Business (€24), Enterprise (talk to us).
- People are invented: Maya Chen, Tomás Reyes, Clara Novak, Jonas Berg, Aiko Tanaka, Sam Okafor, Lena Fischer, Omar Haddad. Email addresses use `example.com`. Companies in logo clouds and testimonials are invented too (Halcyon, Quarry, Basalt, Oakline, Ferro, Lumen, Pinecrest, Cobalt), drawn as plain wordmarks with a simple shape, never a real company's logo.
- Testimonials are labelled as samples on the page itself.
- Sentence case for every label and heading. Buttons name the action ("Create project", "Delete project"), never "OK" or "Submit". British spelling (colour, centred, organisation). No exclamation marks, no emoji, no lorem ipsum.
- Brass stays small: a dot, a star, the pointer on the dot grid. Never a button or a big fill.
- Icons are lucide-react, 16px in buttons and content, 15px in navigation and menus; icon-only buttons have an `aria-label`.

### Accessibility

- Landmarks and headings in order: a hero, a page heading, a sign-in page and an error page have the page's `h1`; other sections start at `h2`. Label a `section` with `aria-labelledby` pointing at its heading.
- Everything works with a keyboard and has a visible focus ring (`outline: 2px solid var(--ow-focus-ring); outline-offset: 2px` on your own controls).
- A drawn product visual is `role="img"` with an `aria-label` that says what it shows, and holds nothing focusable.
- Make the obvious things work: tabs switch, toggles toggle, menus open, forms validate and say what's wrong, copy buttons copy. Use `toast()` for the result of an action that has nowhere else to show it; the app supplies the `<Toaster />`.
