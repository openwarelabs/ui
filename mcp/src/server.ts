/*
 * The Openware UI MCP server: gives AI coding tools (Claude Code, Codex, Cursor and any other MCP client) the
 * library's setup, every component's reference and examples, every block's code, and the tokens. Everything is
 * bundled in at build time (scripts/build-mcp.mjs), so it runs offline and answers instantly.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import registry from "@build/registry.json";

interface Component {
    name: string;
    slug: string;
    category: string;
    description: string;
    imports: string[];
    props: string[];
    markdown: string;
}

interface Block {
    id: string;
    /** Its component in @openwarelabs/blocks, such as "Hero01", or null for a block that's code to copy. */
    component: string | null;
    name: string;
    description: string;
    category: string;
    uses: string[];
    markdown: string;
}

interface Registry {
    version: string;
    setup: string;
    categories: string[];
    components: Component[];
    blockGroups: Array<{ name: string; description: string }>;
    blockCategories: Array<{ slug: string; title: string; group: string; description: string; uses: string[] }>;
    blocks: Block[];
    tokens: Record<string, string>;
    allTokens: string;
}

const data = registry as Registry;

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] });
const failure = (value: string) => ({ ...text(value), isError: true });

/** "Date picker", "date-picker" and "DatePicker" all read as "datepicker". */
const normal = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

function findComponent(name: string) {
    const key = normal(name);
    return (
        data.components.find((component) => normal(component.name) === key || normal(component.slug) === key) ??
        data.components.find((component) => component.imports.some((entry) => normal(entry) === key))
    );
}

function findBlock(id: string) {
    const key = normal(id);
    return data.blocks.find(
        (block) =>
            normal(block.id) === key ||
            normal(block.id.split("/")[1]!) === key ||
            normal(block.name) === key ||
            (block.component !== null && normal(block.component) === key),
    );
}

/** Close matches for a name that wasn't found, to suggest. */
function near(name: string, names: string[]) {
    const key = normal(name);
    return names.filter((entry) => normal(entry).includes(key) || key.includes(normal(entry))).slice(0, 8);
}

const categoryTitle = (slug: string) => data.blockCategories.find((category) => category.slug === slug)?.title ?? slug;

const words = (query: string) => query.toLowerCase().split(/[^a-z0-9-]+/).filter((word) => word.length > 1);

function score(query: string, name: string, description: string, extra: string, body: string) {
    const key = normal(query);
    let total = 0;
    if (normal(name) === key) total += 100;
    else if (key && normal(name).includes(key)) total += 40;
    const lowerName = name.toLowerCase();
    const lowerDescription = description.toLowerCase();
    const lowerExtra = extra.toLowerCase();
    const lowerBody = body.toLowerCase();
    for (const word of words(query)) {
        if (lowerName.includes(word)) total += 15;
        if (lowerDescription.includes(word)) total += 6;
        if (lowerExtra.includes(word)) total += 3;
        if (lowerBody.includes(word)) total += 1;
    }
    return total;
}

const server = new McpServer(
    { name: "openware-ui", version: data.version },
    {
        instructions: [
            `Openware UI (@openwarelabs/ui ${data.version}) is a React component library and design system with light and dark themes.`,
            "Before writing UI with it, call get_setup once for the install, the styles to import and the rules.",
            "Then call get_component for every component you use, and follow its examples and props: import components from @openwarelabs/ui instead of writing look-alikes.",
            "For whole page sections (headers, heroes, pricing, settings, sign-in, dashboards, chat), call list_blocks and get_block. Blocks with a component (Hero01, Hero02…) come from @openwarelabs/blocks and take their content as props: render the component, don't copy its code. The others are two files to copy.",
            "Use search when you don't know a name, and get_tokens before writing your own CSS: colours, spaces and radii come from the --ow-… variables, never hard-coded values.",
        ].join(" "),
    },
);

server.registerTool(
    "get_setup",
    {
        title: "Set up Openware UI",
        description: "How to install @openwarelabs/ui, the stylesheets to import once, the theme attributes for the page, and the rules for writing code with it. Call this first.",
        inputSchema: {},
        annotations: { readOnlyHint: true },
    },
    async () => text(data.setup),
);

server.registerTool(
    "list_components",
    {
        title: "List components",
        description: `Every Openware UI component with a one-line description, grouped by category (${data.categories.join(", ")}).`,
        inputSchema: { category: z.string().optional().describe("Only this category, e.g. Inputs or AI.") },
        annotations: { readOnlyHint: true },
    },
    async ({ category }) => {
        const chosen = category ? data.categories.filter((entry) => normal(entry) === normal(category)) : data.categories;
        if (!chosen.length) return failure(`There's no category "${category}". The categories are: ${data.categories.join(", ")}.`);
        const sections = chosen.flatMap((entry) => {
            const list = data.components.filter((component) => component.category === entry);
            if (!list.length) return [];
            return [`## ${entry}\n\n${list.map((component) => `- **${component.name}**${component.imports.length > 1 ? ` (exports ${component.imports.join(", ")})` : ""}: ${component.description}`).join("\n")}`];
        });
        return text(`# Openware UI components\n\nCall get_component with a name for its examples and props.\n\n${sections.join("\n\n")}\n`);
    },
);

server.registerTool(
    "get_component",
    {
        title: "Get a component",
        description: "A component's full reference: what it's for, its import, the code of every example, keyboard behaviour, accessibility notes and every prop with its type and default.",
        inputSchema: { name: z.string().describe('The component, e.g. "Button", "DatePicker" or "date-picker". Exported helpers such as "MenuItem" or "toast" find their page.') },
        annotations: { readOnlyHint: true },
    },
    async ({ name }) => {
        const component = findComponent(name);
        if (component) return text(component.markdown);
        const suggestions = near(name, data.components.map((entry) => entry.name));
        return failure(`There's no component called "${name}".${suggestions.length ? ` Did you mean ${suggestions.join(", ")}?` : ""} Use list_components or search to find one.`);
    },
);

server.registerTool(
    "list_blocks",
    {
        title: "List blocks",
        description: "The ready-made page sections (headers, heroes, features, pricing, app shells, settings, sign-in, dashboards, chat and more), each a component in @openwarelabs/blocks that takes its content as props.",
        inputSchema: { category: z.string().optional().describe('Only this category, by slug or title, e.g. "heroes" or "Sign-in".') },
        annotations: { readOnlyHint: true },
    },
    async ({ category }) => {
        const chosen = category ? data.blockCategories.filter((entry) => normal(entry.slug) === normal(category) || normal(entry.title) === normal(category)) : data.blockCategories;
        if (!chosen.length) return failure(`There's no block category "${category}". They are: ${data.blockCategories.map((entry) => entry.slug).join(", ")}.`);
        const sections = chosen.flatMap((entry) => {
            const list = data.blocks.filter((block) => block.category === entry.slug);
            if (!list.length) return [];
            return [
                `## ${entry.title} (${entry.group})\n\n${entry.description}\n\n${list.map((block) => `- \`${block.id}\`${block.component ? ` (component \`<${block.component}>\` from @openwarelabs/blocks)` : ""}: **${block.name}**. ${block.description}`).join("\n")}`,
            ];
        });
        return text(`# Openware UI blocks\n\nCall get_block with an id for both files.\n\n${sections.join("\n\n")}\n`);
    },
);

server.registerTool(
    "get_block",
    {
        title: "Get a block",
        description: "A block's reference: its component in @openwarelabs/blocks, every prop with its type, and an example of it in use.",
        inputSchema: { id: z.string().describe('The block\'s id from list_blocks, e.g. "heroes/HeroCentred", "HeroCentred", or its component, "Hero01".') },
        annotations: { readOnlyHint: true },
    },
    async ({ id }) => {
        const block = findBlock(id);
        if (block) return text(block.markdown);
        const suggestions = near(id, data.blocks.map((entry) => entry.id));
        return failure(`There's no block "${id}".${suggestions.length ? ` Did you mean ${suggestions.join(", ")}?` : ""} Use list_blocks to see them all.`);
    },
);

server.registerTool(
    "search",
    {
        title: "Search Openware UI",
        description: "Finds components and blocks by what they do, e.g. \"date range\", \"file upload\", \"pricing table\" or \"streaming chat\".",
        inputSchema: {
            query: z.string().describe("What you're looking for."),
            limit: z.number().int().min(1).max(30).optional().describe("How many results, 10 by default."),
        },
        annotations: { readOnlyHint: true },
    },
    async ({ query, limit = 10 }) => {
        const results = [
            ...data.components.map((component) => ({
                score: score(query, component.name, component.description, `${component.category} ${component.imports.join(" ")} ${component.props.join(" ")}`, component.markdown),
                line: `- Component **${component.name}** (${component.category}): ${component.description} → get_component("${component.name}")`,
            })),
            ...data.blocks.map((block) => ({
                score: score(query, `${categoryTitle(block.category)} ${block.name} ${block.component ?? ""}`, block.description, block.uses.join(" "), ""),
                line: `- Block **${block.name}** (\`${block.id}\`${block.component ? `, component <${block.component}>` : ""}): ${block.description} → get_block("${block.id}")`,
            })),
        ]
            .filter((result) => result.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
        if (!results.length) return text(`Nothing matches "${query}". Try other words, or list_components and list_blocks.`);
        return text(`# Results for "${query}"\n\n${results.map((result) => result.line).join("\n")}\n`);
    },
);

server.registerTool(
    "get_tokens",
    {
        title: "Get design tokens",
        description: "The design tokens as CSS variables with their values and where each is used: colours (both themes), type styles, spacing, corners, shadows, weights and motion.",
        inputSchema: { group: z.enum(["color", "type", "spacing", "radius", "shadow", "timing", "weight"]).optional().describe("One group; all of them if left out.") },
        annotations: { readOnlyHint: true },
    },
    async ({ group }) => text(group ? data.tokens[group]! : data.allTokens),
);

server.registerResource(
    "setup",
    "openware://setup",
    { title: "Openware UI setup", description: "Install, styles, theme and rules.", mimeType: "text/markdown" },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: data.setup }] }),
);

server.registerResource(
    "tokens",
    "openware://tokens",
    { title: "Openware UI tokens", description: "Every design token.", mimeType: "text/markdown" },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: data.allTokens }] }),
);

await server.connect(new StdioServerTransport());
