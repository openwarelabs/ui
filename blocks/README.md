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

All 95, by group and category. Each one's props, with their types and descriptions, are on its page in the docs and in the MCP server.

### Marketing

- **Headers**: `Header01` floating pill, `Header02` full-width bar, `Header03` centred logo, `Header04` with an announcement, `Header05` phone menu
- **Heroes**: `Hero01` centred with a screenshot, `Hero02` split with an image, `Hero03` with an email field, `Hero04` on a dot grid, `Hero05` with logos below, `Hero06` download buttons
- **Section headings**: `SectionHeading01` centred, `SectionHeading02` with a link, `SectionHeading03` split
- **Features**: `Features01` three columns with icons, `Features02` alternating image and text, `Features03` bento grid, `Features04` tabs that change the screenshot, `Features05` checklist beside a screenshot
- **Logo clouds**: `Logos01` single row, `Logos02` grid, `Logos03` scrolling
- **Stats**: `Stats01` row of numbers, `Stats02` on cards, `Stats03` beside a heading
- **Testimonials**: `Testimonial01` single quote, `Testimonial02` grid of quotes, `Testimonial03` with a company logo
- **Pricing**: `Pricing01` three plans, `Pricing02` monthly or yearly, `Pricing03` comparison table, `Pricing04` one plan, `Pricing05` pay as you go
- **FAQs**: `Faq01` accordion, `Faq02` two columns, `Faq03` with a contact card
- **Calls to action**: `Cta01` banner, `Cta02` on the brand colour, `Cta03` split with an image
- **Newsletter sign-up**: `Newsletter01` inline, `Newsletter02` card
- **Blog and changelog**: `Blog01` post grid, `Blog02` featured post, `Blog03` changelog, `Blog04` article
- **Team**: `Team01` avatar grid, `Team02` cards
- **Contact**: `Contact01` form with details, `Contact02` support options
- **Footers**: `Footer01` columns of links, `Footer02` simple, `Footer03` with a newsletter field, `Footer04` big brand mark

### Application

- **App shells**: `Shell01` sidebar, `Shell02` top bar, `Shell03` three panes, `Shell04` collapsible sidebar
- **Page headings**: `PageHeading01` title and actions, `PageHeading02` with breadcrumbs and tabs, `PageHeading03` with search and filters
- **Dashboards**: `Dashboard01` stats and a chart, `Dashboard02` activity, `Dashboard03` usage and billing
- **Lists and tables**: `List01` table with a toolbar, `List02` bulk actions, `List03` stacked list, `List04` grid of cards
- **Form layouts**: `Form01` single column, `Form02` sections with descriptions, `Form03` multi-step
- **Settings**: `Settings01` settings dialog, `Settings02` settings page, `Settings03` API keys, `Settings04` members and roles, `Settings05` danger zone
- **Sign in and sign up**: `SignIn01` sign-in card, `SignIn02` split with a picture, `SignIn03` magic link, `SignIn04` two-factor code, `SignIn05` reset password
- **Onboarding**: `Onboarding01` checklist, `Onboarding02` choose how to start, `Onboarding03` welcome dialog
- **Empty states**: `Empty01` first run, `Empty02` no results, `Empty03` couldn't load
- **Error pages**: `ErrorPage01` not found, `ErrorPage02` something went wrong, `ErrorPage03` down for maintenance
- **Notifications and activity**: `Notifications01` inbox popover, `Notifications02` activity feed, `Notifications03` notification settings
- **Chat and agents**: `Chat01` chat thread, `Chat02` prompt box, `Chat03` agent run

Actions are `{ label, href?, onClick?, startIcon?, endIcon? }`: with `href` they're links styled as buttons, so they work with any router. Every block also takes the attributes of its root element (`className`, `id` and so on), and the words it shows itself (button labels, messages, aria labels) through an optional `labels` prop, with English defaults. Interactive blocks keep their own state and work with no callbacks; pass `onSubmit`, `onSelect` and the like to connect them, or `value` and `onChange` where a block can be controlled. Product pictures (`visual`, `cover`, a chart) are yours to pass in.

## With AI tools

The Openware MCP server (`npx -y @openwarelabs/ui-mcp`) knows every block's props and examples, so Claude Code, Codex or Cursor use the components rather than rewriting them.
