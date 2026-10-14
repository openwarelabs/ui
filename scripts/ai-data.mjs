// Openware UI as Markdown for AI tools: every component's and block's reference, the setup guide and the tokens.
// The MCP server (scripts/build-mcp.mjs) bundles it; the docs build writes it out as llms.txt and ai/*.md.
// The Markdown itself comes from docs/app/ai.ts, which the docs' "Copy for AI" buttons use too.
import fs from "node:fs";
import path from "node:path";
import * as esbuild from "esbuild";

import { root } from "./css.mjs";
import { blocksDir, examplesDir, kebab, readBlockCatalog, readCategories, readExamples, readMeta, readProps } from "./docs-data.mjs";

const langOf = (file) => ({ ".tsx": "tsx", ".ts": "ts", ".css": "css" })[path.extname(file)] ?? "tsx";

/** docs/app/ai.ts, compiled for Node. */
async function loadAi() {
    const result = await esbuild.build({ entryPoints: [path.join(root, "docs/app/ai.ts")], bundle: true, format: "esm", platform: "node", write: false, logLevel: "silent" });
    return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
}

export async function readAiData() {
    const ai = await loadAi();
    const version = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;
    const props = readProps();
    const categories = readCategories();
    const { blockGroups, blockCategories } = readBlockCatalog();
    const tokens = JSON.parse(fs.readFileSync(path.join(root, "tokens/tokens.json"), "utf8"));

    const components = fs
        .readdirSync(examplesDir)
        .filter((file) => file.endsWith(".tsx"))
        .map((file) => {
            const full = path.join(examplesDir, file);
            const meta = readMeta(full);
            const examples = readExamples(full).map(({ title, description, code }) => ({ title, description, code }));
            const input = { meta, examples, props };
            return {
                name: meta.title,
                slug: kebab(path.basename(file, ".tsx")),
                category: meta.category,
                description: meta.description,
                imports: meta.imports ?? [meta.title],
                props: ai.propsOf(input).flatMap((name) => props[name].props.map((prop) => prop.name)),
                markdown: ai.componentMarkdown(input),
            };
        })
        .sort((a, b) => categories.indexOf(a.category) - categories.indexOf(b.category) || a.name.localeCompare(b.name));

    const blocks = blockCategories.flatMap((category) =>
        category.variants.flatMap((variant) => {
            const id = `${category.slug}/${variant.id}`;
            const tsx = path.join(blocksDir, category.slug, `${variant.id}.tsx`);
            if (!fs.existsSync(tsx)) return [];
            const files = [tsx, path.join(blocksDir, category.slug, `${variant.id}.css`)]
                .filter((file) => fs.existsSync(file))
                .map((file) => ({ name: path.basename(file), language: langOf(file), code: fs.readFileSync(file, "utf8") }));
            const component = variant.component ? { name: variant.component, props } : undefined;
            const input = {
                id,
                name: variant.name,
                description: variant.description,
                category: { title: category.title, uses: category.uses },
                files,
                component,
            };
            return [
                {
                    id,
                    name: variant.name,
                    description: variant.description,
                    category: category.slug,
                    uses: category.uses,
                    component: variant.component ?? null,
                    markdown: ai.blockMarkdown(input),
                },
            ];
        }),
    );

    return {
        version,
        setup: ai.setupMarkdown(version),
        mcpSetup: { claudeCode: ai.mcpSetup.claudeCode, codex: ai.mcpSetup.codex, json: ai.mcpSetup.json },
        categories,
        components,
        blockGroups,
        blockCategories: blockCategories.map(({ slug, title, group, description, uses }) => ({ slug, title, group, description, uses })),
        blocks,
        tokens: Object.fromEntries(ai.tokenGroups.map((group) => [group, ai.tokensMarkdown(tokens, group)])),
        allTokens: ai.tokensMarkdown(tokens),
    };
}

/** llms.txt, llms-full.txt and ai/<page>.md, for a built copy of the docs. */
export async function writeAiFiles(outDir) {
    const data = await readAiData();
    const write = (file, text) => {
        const target = path.join(outDir, file);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, text);
    };
    write("ai/setup.md", data.setup);
    write("ai/tokens.md", data.allTokens);
    for (const component of data.components) write(`ai/components/${component.slug}.md`, component.markdown);
    for (const block of data.blocks) write(`ai/blocks/${block.id}.md`, block.markdown);

    const line = (title, href, description) => `- [${title}](${href}): ${description.replace(/\s+/g, " ")}`;
    const index = [
        `# Openware UI`,
        "",
        `> React components and design tokens on npm as @openwarelabs/ui (${data.version}), in light and dark themes. Every page is also plain Markdown under ai/. For an AI coding tool, the MCP server is the easiest way in: \`npx -y @openwarelabs/ui-mcp\`.`,
        "",
        "## Start here",
        "",
        line("Setup", "ai/setup.md", "install, styles, theme and the rules for writing code with Openware UI."),
        line("Tokens", "ai/tokens.md", "every colour, type style, space, radius, shadow, weight and timing."),
        "",
        ...data.categories.flatMap((category) => {
            const list = data.components.filter((component) => component.category === category);
            return list.length ? [`## ${category}`, "", ...list.map((component) => line(component.name, `ai/components/${component.slug}.md`, component.description)), ""] : [];
        }),
        "## Blocks",
        "",
        ...data.blocks.map((block) => line(`${block.name} (${data.blockCategories.find((category) => category.slug === block.category)?.title})`, `ai/blocks/${block.id}.md`, block.description)),
        "",
    ].join("\n");
    write("llms.txt", index);
    write("llms-full.txt", [data.setup, ...data.components.map((component) => component.markdown), data.allTokens].join("\n---\n\n"));
    return data;
}
