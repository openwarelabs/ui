# Openware UI ESLint plugin

ESLint rules for code written with [Openware UI](https://github.com/openwarelabs/ui) (`@openwarelabs/ui`), for people and for the AI tools that write it: the library's components instead of raw controls or look-alikes from other libraries, props and values that exist, every input labelled, tokens instead of hard-coded colours, and `--ow-` variables and `ow-` classes the library ships. What the rules know (every export, every prop and its values, every token and class) is bundled in from the docs' data, so the plugin answers for the release it matches.

The MCP server, [`@openwarelabs/ui-mcp`](../mcp/README.md), runs the same rules as its `check_code` tool, so Claude Code, Codex and Cursor fix their own mistakes before you see them. This package is for the project's own lint and CI.

## Add it

```sh
npm install -D @openwarelabs/eslint-plugin-ui
```

```js
// eslint.config.js
import openware from "@openwarelabs/eslint-plugin-ui";

export default [openware.configs.recommended];
```

The recommended config turns every rule on as an error, on `.js`, `.jsx`, `.ts` and `.tsx` files, with JSX parsing on. A TypeScript project adds its parser as usual:

```js
import openware from "@openwarelabs/eslint-plugin-ui";
import tseslint from "typescript-eslint";

export default [
    { files: ["**/*.{ts,tsx}"], languageOptions: { parser: tseslint.parser } },
    openware.configs.recommended,
];
```

Or pick rules yourself: `plugins: { "openware-ui": openware }` and `rules: { "openware-ui/valid-props": "error" }`. ESLint 9 or later (flat config).

## Rules

### no-raw-controls

Use the library's component instead of the raw HTML control: `Button` for `<button>`, `Input` for `<input>` (or `Checkbox`, `RadioGroup`, `Slider`, `FileDropZone`, `ColorField`, `DateField`, `TimeField`, `NumberField`, `PasswordInput` and `SearchField` for the matching `type`), `Select`, `Textarea`, `ProgressBar` for `<progress>` and `Meter` for `<meter>`. `<input type="hidden">` is fine.

```js
"openware-ui/no-raw-controls": ["error", { elements: { h2: "Text", p: "Text", input: false } }]
```

`elements` adds elements to flag (element → component) or allows one (`false`). Where a raw element is the point (a picture that's a button, HTML rendered inside `Prose`), turn it off for that line with `// eslint-disable-next-line openware-ui/no-raw-controls -- why`.

### no-inline-colour

No hard-coded colours in `style` props: no hex, `rgb()`, `hsl()`, `oklch()` or named colours. Use the `--ow-` tokens so the code follows the theme and the brand colour. When a colour is exactly a token's value, the message names the token and `--fix` puts it in: `color: "#f2f3fc"` becomes `color: "var(--ow-brand-50)"`.

### input-needs-field

Every `Input`, `Textarea`, `Select`, `Combobox`, `NumberField`, `PasswordInput`, `DateField`, `TimeField`, `TimeRangeField`, `DurationField`, `ColorField`, `TagInput`, `MentionInput`, `MarkdownEditor` and `SignaturePad` is inside a `Field` (which gives it its label, hint and error), or has `aria-label`, `aria-labelledby` or an `id` a label points at. Hidden inputs are skipped. `SearchField` and `InputOTP` name themselves.

```js
"openware-ui/input-needs-field": ["error", { components: ["Input", "Textarea", "Select"] }]
```

### valid-props

Every prop on a library component is one it has (plus the attributes of the element it extends: a `Button` takes a `<button>`'s), and a prop that's a choice of strings gets one of its values. Misspellings get a "did you mean": `sze` → `size`, `direction="colum"` → `column`. `variant="outline"` on a `Button` lists the variants it does have.

### import-from-package

Components come from `@openwarelabs/ui` (and blocks from `@openwarelabs/blocks`) itself:

- No deep imports (`@openwarelabs/ui/dist/…`); fixed to the package.
- No names the package doesn't export; misspellings are fixed (`Buton` → `Button`, `DataTable` → `DataGrid`).
- No look-alikes from other libraries: Radix, Headless UI, MUI, Chakra, Mantine, Ant, HeroUI; sonner, react-markdown, recharts, react-select, react-day-picker, cmdk, dnd-kit, react-dropzone, react-colorful, qrcode.react, react-resizable-panels, vaul, embla and the rest of the components the library has. The message names what to use instead.
- No copied components with the library's names (`@/components/ui/button`).
- Nothing used without its import: `<Badge>` with no `Badge` imported is added to the import from the package (`--fix`).

```js
"openware-ui/import-from-package": ["error", { allow: ["recharts"] }]
```

`allow` leaves packages alone, say when an app has charts the library's can't draw.

### valid-tokens

Every `--ow-` custom property in the code (in `style` props, template strings, anywhere) is one the library defines, and every `ow-` class in a `className` is one an app may use: `ow-app`, the `ow-type-…` text styles and a block's own classes. A component's own class (`ow-button`) is reported with the component to render instead; a misspelling gets a suggestion.

```js
"openware-ui/valid-tokens": ["error", { allow: ["ow-app-*", "--ow-app-accent"] }]
```

`allow` is for your own names that happen to start with `ow-` or `--ow-`; a trailing `*` matches a prefix.

## In this repository

`npm run eslint:build` builds the plugin from `eslint/src` with a fresh manifest of the library (`scripts/eslint-manifest.mjs`), `npm run eslint:test` runs its tests on the result, and `npm run lint` then runs the rules on the docs' examples and the blocks, as an app using the library would. The MCP server bundles the same sources for `check_code` (`scripts/build-mcp.mjs`).
