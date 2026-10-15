/*
 * Openware UI for AI tools: the Markdown that the docs' "Copy for AI" buttons copy, that llms.txt links to, and
 * that the MCP server (@openwarelabs/ui-mcp) answers with. Plain functions of plain data, so the docs in the
 * browser and the build scripts in Node share one source.
 */
import type { DocMeta, PropsDoc, TokensFile } from "./types";

export const packageName = "@openwarelabs/ui";
export const mcpPackage = "@openwarelabs/ui-mcp";
export const mcpName = "openware-ui";

/** How to add the MCP server to each tool. */
export const mcpSetup = {
    claudeCode: `claude mcp add ${mcpName} -- npx -y ${mcpPackage}`,
    codex: `codex mcp add ${mcpName} -- npx -y ${mcpPackage}`,
    codexToml: `[mcp_servers.${mcpName}]\ncommand = "npx"\nargs = ["-y", "${mcpPackage}"]\n`,
    /** Cursor (.cursor/mcp.json), Claude Desktop, Windsurf and most other clients. */
    json: `${JSON.stringify({ mcpServers: { [mcpName]: { command: "npx", args: ["-y", mcpPackage] } } }, null, 2)}\n`,
    /** VS Code (.vscode/mcp.json). */
    vscode: `${JSON.stringify({ servers: { [mcpName]: { type: "stdio", command: "npx", args: ["-y", mcpPackage] } } }, null, 2)}\n`,
    /** Cursor's one-click install link. */
    cursorLink: () =>
        `cursor://anysphere.cursor-deeplink/mcp/install?name=${mcpName}&config=${encodeURIComponent(btoa(JSON.stringify({ command: "npx", args: ["-y", mcpPackage] })))}`,
};

const fence = (code: string, lang = "tsx") => {
    const body = code.replace(/\n+$/, "");
    const ticks = body.includes("```") ? "````" : "```";
    return `${ticks}${lang}\n${body}\n${ticks}`;
};

/** A Markdown table cell: one line, with pipes escaped. */
const cell = (text: string | undefined) => (text ?? "").replace(/\s*\n\s*/g, " ").replace(/\|/g, "\\|").trim();

const join = (parts: Array<string | false | null | undefined>) => `${parts.filter(Boolean).join("\n\n").trim()}\n`;

/** One props interface as a Markdown section: its description, the element it extends, and a row per prop. */
export function propsTable(name: string, doc: PropsDoc, level = "###") {
    const rows = doc.props.map(
        (prop) =>
            `| \`${prop.name}\`${prop.required ? " (required)" : ""} | \`${cell(prop.type)}\` | ${prop.default ? `\`${cell(prop.default)}\`` : ""} | ${cell(prop.description)} |`,
    );
    return join([
        `${level} ${name}`,
        doc.description,
        doc.element ? `Also takes every \`<${doc.element}>\` attribute.` : null,
        `| Prop | Type | Default | Description |\n| --- | --- | --- | --- |\n${rows.join("\n")}`,
    ]).trimEnd();
}

/** The interfaces a props interface's types refer to (BlockAction, Hero06Platform), and theirs, once each. */
export function referencedTypes(name: string, props: Record<string, PropsDoc>, seen = new Set<string>([name])): string[] {
    const found: string[] = [];
    for (const prop of props[name]?.props ?? []) {
        for (const word of prop.type.match(/\b[A-Z]\w+\b/g) ?? []) {
            if (!seen.has(word) && props[word]?.props.length) {
                seen.add(word);
                found.push(word, ...referencedTypes(word, props, seen));
            }
        }
    }
    return found;
}

/** What every AI tool should know before it writes Openware code. */
export function setupMarkdown(version?: string) {
    return join([
        `# Openware UI${version ? ` ${version}` : ""}`,
        `React components and design tokens on npm as \`${packageName}\`: a midnight brand colour, a small brass accent, cool slate surfaces, tactile buttons and Inter, in light and dark themes, with a brand colour you can swap.`,
        "## Install",
        fence(`npm install ${packageName} lucide-react`, "sh"),
        `React 18 or 19 is a peer dependency. \`lucide-react\` is for icons; the library's examples and blocks use it.`,
        "## Set up once",
        "Import two stylesheets once, where the app starts. Every component's styles are in styles.css: never import CSS per component.",
        fence(`import "${packageName}/fonts.css";   // Inter and Geist Mono, self-hosted\nimport "${packageName}/styles.css";  // tokens + components`),
        "Put the theme on `<html>` and `ow-app` on `<body>` for the font, text size, colours and the canvas:",
        fence(`<html data-theme="light">   <!-- "light", "dark" or "system" -->\n  <body class="ow-app">`, "html"),
        "Put one `<Toaster />` near the root, then call `toast()` from anywhere.",
        fence(`import { Button, Field, Input, Toaster, toast } from "${packageName}";\n\n<Field label="Project name" hint="Letters, numbers and dashes.">\n    <Input placeholder="recipe-app" />\n</Field>\n<Button variant="primary" onClick={() => toast.success("Saved")}>Save</Button>\n<Toaster />`),
        "## Writing code with it",
        [
            `- Everything is a named export from \`${packageName}\`. Use the library's component whenever one exists instead of writing your own: \`Text\` for every heading and paragraph, \`Button\`, \`Link\`, \`Field\` with \`Input\`, \`Select\` and the other inputs, \`Card\`, \`Badge\`, \`Dialog\`, \`Menu\`, \`Table\` and so on.`,
            "- For a password, use `PasswordInput` in a `Field`, not an `Input` with `type=\"password\"`: it has the show and hide button. To sign up, set `autoComplete=\"new-password\"` and add `strength` and `requirements`.",
            "- For an app's frame, use `AppShell` with `sidebar` (a `SidebarHeader`, a `SidebarContent` of `NavList`s with `NavItem`s, a `SidebarFooter`) and the page as children; it folds into a drawer on narrow screens by itself. Add `collapsible` and a `SidebarToggle` to let people fold it to icons. Don't build your own sidebar layout.",
            "- To show people around a page, use `Tour` with `steps` (`{ target, title, content }`, the target a selector or a ref) and a button that opens it; for one hint beside a single control, `Coachmark`. Don't build your own.",
            "- For actions on a row or an area that open on right-click (and long press, and Shift+F10), wrap it in `ContextMenu` with `label` and a `menu` of `MenuItem`s; don't handle `contextmenu` yourself. Keep the same actions reachable elsewhere too, e.g. in a `Menu`.",
            "- Give a page its width and side margins with `Container` (`size`: `page`, `narrow`, `wide`, `full`; `as=\"main\"`), and your own sections between blocks with `Section` (`tone`, `spacing`), so they line up with the blocks. Lay out inside with `Stack` (`direction`, `gap`, `align`, `justify`, `wrap`) or your own CSS; don't restyle the components' insides.",
            "- For several values in one field (recipients, labels, keywords), use `TagInput`: `options` suggests values, `allowCustom` also takes new ones, `name` submits them. Don't build tags around an `Input`.",
            "- For an announcement or a notice across the top of the page or app, use `Banner` (`tone`, `action`, `dismissible` with `dismissKey` to remember it); for a message inside the page, use `Alert`.",
            "- For panes people resize (an editor beside a preview, a list beside its detail), use `Splitter` with `SplitterPanel`s (`defaultSize`, `minSize`, `collapsible`, in percent) and a `SplitterHandle` between each pair; `autoSaveId` remembers the sizes.",
            "- For long lists (logs, chat histories, feeds, thousands of rows), use `VirtualList`: it renders only the rows in view. Give it `items` + `renderItem` and `itemSize` (fixed) or `estimateSize` (measured), a `label`, a height or a parent with one; `onEndReached` + `loading` + `hasMore` for infinite scroll, `followOutput` for logs. `useVirtualizer` builds your own virtualized table. Don't add a virtualization library or render 10,000 rows.",
            "- For slides that scroll sideways (a gallery, quotes), use `Carousel` with a `label` and a `CarouselSlide` each (`slidesPerView`, `loop`, `autoplay`); don't add a carousel library.",
            "- For a preview when the pointer rests on a link (a person, a page), wrap it in `HoverCard` (`trigger` is the link, the card is children); keep everything in it reachable through the link, as touch never opens it. For controls opened by a click, use `Popover`.",
            "- For a picture, use `Image` (`alt` is required, `\"\"` if it's decorative; `ratio`, `radius`, `caption`): it shows a placeholder while it loads and a fallback if it fails. `AspectRatio` keeps any other box, such as a video or a map, at a ratio.",
            "- In your own CSS, use the tokens: every colour, space, radius, shadow, weight and timing is a CSS variable named `--ow-…` (`var(--ow-surface)`, `var(--ow-text-muted)`, `var(--ow-space-lg)`, `var(--ow-radius-container)`). Never hard-code hex or rgb colours, so the code follows the theme and the brand colour.",
            "- Text styles are classes too (`ow-type-section-title`, `ow-type-lead`), but prefer `<Text variant=\"…\">`.",
            "- For one record's details (a detail page, a settings summary, a receipt), use `DescriptionList` with a `DescriptionItem` (`term`, the value as children, an optional `action`) for each pair, not a Table or your own grid; `layout=\"grid\"` with `columns` for a summary at a glance.",
            "- For an activity feed, a changelog or a history, use `Timeline` with a `TimelineItem` per event (`title`, `time` with `dateTime`, `tone`, an `icon` or `avatar`, `pending`); `density=\"compact\"` for a feed. Don't draw your own line and dots.",
            "- For charts, use `LineChart`, `BarChart` (`stacked`), `DonutChart` and `Sparkline`: pass `data` rows, `index` (the x key), `series` (`{ key, label }`) and a `label` saying what it shows. Their colours are `--ow-chart-1` to `--ow-chart-8`, in order. Don't add a charting library.",
            "- For stars, use `Rating`: to pick a score (`name` sends it with a form, `allowHalf`), or `readOnly` to show one, with `count` for the number of reviews. Don't draw your own.",
            `- Tailwind v4: \`@import "${packageName}/tailwind.css";\` after \`@import "tailwindcss";\` gives \`bg-surface\`, \`text-text-muted\`, \`rounded-container\`, \`p-lg\` and the rest.`,
            `- Rebrand with \`applyBrand("#0d9488")\` (or a preset from \`brandPresets\`); the primary button, focus ring and tints follow in both themes.`,
        ].join("\n"),
        "## Blocks",
        `Every block in the docs, all 95 whole page sections (headers, heroes, pricing, app shells, settings, sign-in, dashboards, chat and the rest), comes as a component in \`${blocksPackage}\`: \`npm install ${blocksPackage}\`, \`import "${blocksPackage}/styles.css";\` once after the library's styles, then \`<Hero01 title="…" description="…" primaryAction={{ label: "Start for free", href: "/signup" }} />\`. Content is props; use them rather than copying their code. Each block's reference lists its props.`,
        "## Rules",
        [
            "- One primary button per view. Everything else is secondary or ghost.",
            "- Borders before shadows: cards are `--ow-surface` with a 1px `--ow-border`. Shadows are for things that float or press.",
            "- Brass stays small: dots, a star, a pointer. Never a button.",
            "- Sentence case for every label. Name the action on the button (\"Delete project\"), never \"OK\".",
            "- Icons are Lucide (`lucide-react`), 16px, 2px stroke. Icon-only buttons need an `aria-label`.",
        ].join("\n"),
    ]);
}

export interface AiExample {
    title: string;
    description: string;
    code: string;
}

export interface AiComponentInput {
    meta: DocMeta;
    examples: AiExample[];
    /** Every props interface, by name, as the docs read them. */
    props: Record<string, PropsDoc>;
}

/** The props interfaces a component's page documents. */
export const propsOf = ({ meta, props }: Pick<AiComponentInput, "meta" | "props">) =>
    (meta.props ?? [`${meta.title}Props`]).filter((name) => Boolean(props[name]?.props.length));

/** A component's whole reference: what it is, its import, every example's code, keyboard, notes and props. */
export function componentMarkdown({ meta, examples, props }: AiComponentInput) {
    const imports = meta.imports ?? [meta.title];
    return join([
        `# ${meta.title}`,
        meta.description,
        `Part of Openware UI (\`${packageName}\`), in the ${meta.category} group. Source: \`src/${meta.source}\`.`,
        "## Import",
        fence(`import { ${imports.join(", ")} } from "${packageName}";`),
        examples.length ? "## Examples" : null,
        ...examples.map((example) => join([`### ${example.title}`, example.description, fence(example.code)]).trimEnd()),
        meta.keyboard?.length ? `## Keyboard\n\n| Key | What it does |\n| --- | --- |\n${meta.keyboard.map(([keys, action]) => `| ${cell(keys)} | ${cell(action)} |`).join("\n")}` : null,
        meta.notes?.length ? `## Notes\n\n${meta.notes.map((note) => `- ${note}`).join("\n")}` : null,
        propsOf({ meta, props }).length ? "## API reference" : null,
        ...propsOf({ meta, props }).map((name) => propsTable(name, props[name]!)),
        meta.related?.length ? `## Related\n\n${meta.related.join(", ")}` : null,
    ]);
}

/** A ready-to-paste instruction for an AI tool, with the component's reference under it. */
export function componentPrompt(input: AiComponentInput) {
    const { meta } = input;
    return join([
        `Use the ${meta.title} component from Openware UI (\`${packageName}\`) in my project. Import it from the package rather than writing your own, and follow its examples, notes and props below. If the package isn't set up in this project yet, install it and import its styles once: \`import "${packageName}/fonts.css"; import "${packageName}/styles.css";\`, with \`data-theme\` on <html> and \`class="ow-app"\` on <body>.`,
        "---",
        componentMarkdown(input),
    ]);
}

export interface AiBlockFile {
    name: string;
    language: string;
    code: string;
}

export interface AiBlockInput {
    /** "<category slug>/<Name>". */
    id: string;
    name: string;
    description: string;
    category: { title: string; uses: string[] };
    files: AiBlockFile[];
    /** Its component in @openwarelabs/blocks, with every props interface the docs know, when it has one. */
    component?: { name: string; props: Record<string, PropsDoc> };
}

export const blocksPackage = "@openwarelabs/blocks";

/**
 * The docs' example cut down to the block in use: its exported function, the top-level constants that function
 * reads (sample data), and the imports those need. The drawn sample visuals (other functions) and their
 * stylesheet are left out, since a real page passes its own.
 */
export function usageExample(code: string) {
    const lines = code.split("\n");
    const start = lines.findIndex((line) => line.startsWith("export function "));
    if (start === -1) return { code, visuals: [] as string[] };
    const usage = lines.slice(start).join("\n");
    const constants: Array<{ name: string; text: string }> = [];
    const visuals: string[] = [];
    for (let index = 0; index < start; index += 1) {
        const line = lines[index]!;
        const visual = /^function (\w+)/.exec(line);
        if (visual) visuals.push(visual[1]!);
        const constant = /^const (\w+)/.exec(line);
        if (!constant) continue;
        let end = index;
        while (end < start && !(/;\s*$/.test(lines[end]!) && (end === index || /^\S/.test(lines[end]!)))) end += 1;
        constants.push({ name: constant[1]!, text: lines.slice(index, end + 1).join("\n") });
        index = end;
    }
    // Names in code, not in the words of quoted strings ("handled overnight" doesn't use `overnight`).
    const withoutStrings = (text: string) => text.replace(/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/g, '""');
    const uses = (text: string, name: string) => new RegExp(`\\b${name}\\b`).test(withoutStrings(text));
    const kept = constants.filter((constant) => uses(usage, constant.name));
    const body = [...kept.map((constant) => constant.text), usage].join("\n\n");
    const imports = lines
        .slice(0, start)
        .filter((line) => line.startsWith("import ") && !/\.css";$/.test(line))
        .map((line) => {
            const match = /^import (type )?\{ ([^}]+) \} from (.+)$/.exec(line);
            if (!match) return line;
            const names = match[2]!
                .split(",")
                .map((name) => name.trim())
                .filter((name) =>
                    uses(
                        body,
                        name
                            .replace(/^type /, "")
                            .split(" as ")
                            .pop()!,
                    ),
                );
            return names.length ? `import ${match[1] ?? ""}{ ${names.join(", ")} } from ${match[3]}` : null;
        })
        .filter((line): line is string => Boolean(line));
    return { code: `${imports.join("\n")}\n\n${body}`, visuals: visuals.filter((name) => uses(usage, name)) };
}

/** A block that's a component: how to install it, its props, and the docs' example of it in use. */
function blockComponentMarkdown({ name, description, category, files, component }: AiBlockInput & { component: NonNullable<AiBlockInput["component"]> }) {
    const propsName = `${component.name}Props`;
    const example = files.find((file) => file.language === "tsx");
    const sample = files.find((file) => file.language === "css");
    return join([
        `# ${component.name}: ${name} (${category.title})`,
        description,
        `A whole page section from \`${blocksPackage}\`, built from \`${packageName}\` components. It takes its content as props, so use the component rather than copying its code: \`<${component.name} title="…" … />\`. Its layout follows the theme, the brand colour and every screen width by itself.`,
        "## Set up",
        fence(`npm install ${blocksPackage}`, "sh"),
        fence(
            `import "${packageName}/styles.css";\nimport "${blocksPackage}/styles.css"; // once, after the library's\n\nimport { ${component.name} } from "${blocksPackage}";`,
        ),
        "## Props",
        component.props[propsName] ? propsTable(propsName, component.props[propsName]!, "###") : null,
        ...referencedTypes(propsName, component.props).map((type) => propsTable(type, component.props[type]!, "###")),
        example
            ? (() => {
                  const { code, visuals } = usageExample(example.code);
                  const drawn = visuals.length
                      ? ` ${visuals.map((visual) => `\`<${visual} />\``).join(" and ")} ${visuals.length === 1 ? "is a product visual" : "are product visuals"} drawn for the docs${sample ? ` (with \`${sample.name}\`)` : ""} and left out here: pass your own, usually a screenshot, such as \`<img src="/screenshot.png" alt="…" />\`.`
                      : "";
                  return join(["## Example", `The docs' example, with sample content.${drawn}`, fence(code, "tsx")]).trimEnd();
              })()
            : null,
    ]);
}

/** A block's reference: what it is, what it's made from, and both its files. */
export function blockMarkdown(input: AiBlockInput) {
    if (input.component) return blockComponentMarkdown({ ...input, component: input.component });
    const { id, name, description, category, files } = input;
    const component = id.split("/").pop()!;
    return join([
        `# ${name} (${category.title})`,
        description,
        `A block from Openware UI: a whole page section built from \`${packageName}\` components, to copy into a project and change. It's two files, \`${component}.tsx\` (exporting \`${component}\`) and \`${component}.css\`, and imports only \`react\`, \`${packageName}\`, \`lucide-react\` and its own stylesheet. Its CSS is scoped under its own class and uses the \`--ow-…\` tokens, so it follows the theme and brand colour.`,
        category.uses.length ? `Made from: ${category.uses.map((use) => `\`${use}\``).join(", ")}.` : null,
        ...files.map((file) => `## ${file.name}\n\n${fence(file.code, file.language)}`),
    ]);
}

/** A ready-to-paste instruction to add a block, with its files under it. */
export function blockPrompt(input: AiBlockInput) {
    if (input.component) {
        return join([
            `Add the "${input.name}" block from Openware UI to my page with the \`${input.component.name}\` component from \`${blocksPackage}\`. Install it if it isn't yet and import its styles once after the library's, then render \`<${input.component.name}>\` with my content as its props, following the props and the example below. Don't copy or rewrite the component's code.`,
            "---",
            blockMarkdown(input),
        ]);
    }
    const component = input.id.split("/").pop()!;
    return join([
        `Add the "${input.name}" block from Openware UI to my project. Create \`${component}.tsx\` and \`${component}.css\` from the files below, next to my other components, keep the stylesheet import, and then replace the sample content with mine. Keep using the \`${packageName}\` components it's made from. If the package isn't set up yet: \`npm install ${packageName} lucide-react\`, import \`${packageName}/fonts.css\` and \`${packageName}/styles.css\` once, and put \`data-theme="light"\` on <html> and \`class="ow-app"\` on <body>.`,
        "---",
        blockMarkdown(input),
    ]);
}

export const tokenGroups = ["color", "type", "spacing", "radius", "shadow", "timing", "weight"] as const;
export type TokenGroup = (typeof tokenGroups)[number];

/** The design tokens of one group, or all of them, as Markdown tables. */
export function tokensMarkdown(tokens: TokensFile, group?: TokenGroup) {
    const groups = group ? [group] : tokenGroups;
    const sections = groups.map((name) => {
        if (name === "type") {
            const families = Object.entries(tokens.type.families).map(([key, value]) => `- \`${key}\`: ${value}`).join("\n");
            const styles = tokens.type.groups.map((typeGroup) =>
                join([
                    `### ${typeGroup.name}`,
                    typeGroup.note,
                    `| Class | Size | Line height | Weight | Use |\n| --- | --- | --- | --- | --- |\n${typeGroup.styles
                        .map((style) => `| \`${style.name}\` | ${style.fontSize} | ${style.lineHeight} | ${style.fontWeight} | ${cell(style.usage)} |`)
                        .join("\n")}`,
                ]).trimEnd(),
            );
            return join([
                "## Type",
                "Use `<Text variant=\"…\">` (the variant is the class name without `ow-type-`), or the class itself.",
                families,
                ...styles,
            ]).trimEnd();
        }
        if (name === "color") {
            const themes = tokens.color.themes.map((theme) => theme.id);
            const value = (entry: TokensFile["color"]["tokens"][number]) =>
                typeof entry.value === "string" ? `\`${entry.value}\`` : themes.map((theme) => `${theme}: \`${(entry.value as Record<string, string>)[theme] ?? ""}\``).join(", ");
            return join([
                "## Colour",
                "Use them as `var(--<name>)`. Themed values change with `data-theme`.",
                `| Token | Value | Use |\n| --- | --- | --- |\n${tokens.color.tokens.map((entry) => `| \`--${entry.name}\` | ${value(entry)} | ${cell(entry.usage)} |`).join("\n")}`,
            ]).trimEnd();
        }
        const list = tokens[name].tokens;
        const title = { spacing: "Spacing", radius: "Corners", shadow: "Shadows", timing: "Motion", weight: "Weights" }[name];
        return join([
            `## ${title}`,
            `| Token | Value | Use |\n| --- | --- | --- |\n${list
                .map((entry) => `| \`--${entry.name}\` | ${typeof entry.value === "string" ? `\`${cell(entry.value)}\`` : cell(JSON.stringify(entry.value))} | ${cell(entry.usage)} |`)
                .join("\n")}`,
        ]).trimEnd();
    });
    return join(["# Openware UI tokens", ...sections]);
}
