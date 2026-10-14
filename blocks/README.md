# Openware UI blocks

Whole page sections built from [Openware UI](https://github.com/openwarelabs/ui) (`@openwarelabs/ui`), as React components that take their content as props. Drop one in, pass your words, actions and screenshots, and it follows the theme, the brand colour and every screen width.

```sh
npm install @openwarelabs/ui @openwarelabs/blocks
```

```tsx
import "@openwarelabs/ui/fonts.css";
import "@openwarelabs/ui/styles.css";
import "@openwarelabs/blocks/styles.css"; // after the library's

import { Hero01 } from "@openwarelabs/blocks";

<Hero01
    eyebrow="New: agents that open their own pull requests"
    title="The workspace for shipping software"
    description="Plan the work, hand the routine parts to agents, review every change and ship it."
    primaryAction={{ label: "Start for free", href: "/signup" }}
    secondaryAction={{ label: "Book a demo", href: "/demo" }}
    note="Free for teams of up to five. No card needed."
    visual={<img src="/screenshot.png" alt="The overview page" />}
/>;
```

The page needs `data-theme` on `<html>` and `class="ow-app"` on `<body>`, as for the library.

## Blocks

| Component | What it is                                                     | Content                                                                                                |
| --------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `Hero01`  | Centred, with a screenshot below that runs on into the page    | `title`, `description`, `primaryAction`, `secondaryAction`, `eyebrow`, `note`, `visual`                |
| `Hero02`  | Split: words on the left, the product on the right             | the same, plus `points` (ticked reasons to believe)                                                    |
| `Hero03`  | With an email field, for a waitlist or a trial                 | `submitLabel`, `onSubmit(email)`, `successTitle`, `successDescription`, `labels` for the field's words |
| `Hero04`  | On Openware's dot grid, with room either side                  | `start`, `end`, `interactive`                                                                          |
| `Hero05`  | With customers' logos below                                    | `logosTitle`, `logos: { name, logo }[]`                                                                |
| `Hero06`  | Download buttons for a desktop app, the visitor's system first | `platforms: { id, name, requirement, href \| onDownload }[]`, `version`, `otherDownloads`              |

Actions are `{ label, href?, onClick?, startIcon?, endIcon? }`: with `href` they're links styled as buttons, so they work with any router. Every block also takes the attributes of its `<section>` (`className`, `id` and so on). The docs show each one live, with its props: `npm run dev` in the repository, then Blocks → Heroes.

More blocks become components release by release; until then, the others in the docs are code to copy.

## With AI tools

The Openware MCP server (`npx -y @openwarelabs/ui-mcp`) knows every block's props and examples, so Claude Code, Codex or Cursor use the components rather than rewriting them.
