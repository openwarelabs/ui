import { buttonClassName, CodeBlock, Snippet, Stack, Tab, TabList, TabPanel, Tabs } from "@openwarelabs/ui";
import { ArrowUpRight } from "lucide-react";

import { eslintPackage, mcpPackage, mcpSetup, setupMarkdown } from "../app/ai";
import { hrefOf, showBlocks } from "../app/content";
import { CopyForAI } from "../app/CopyForAI";
import { DocPage, Section } from "../app/Page";
import { version } from "../app/version";

const tools = [
    ["get_setup", "Install, the stylesheets to import once, the theme attributes, and the rules for writing code with Openware UI."],
    ["list_components", "Every component with a line on what it's for, by category."],
    ["get_component", "One component's reference: its import, every example's code, keyboard, notes and props."],
    ["list_blocks", "The ready-made page sections: headers, heroes, pricing, app shells, settings, sign-in, dashboards, chat and more."],
    ["get_block", "A block's .tsx and .css, ready to copy."],
    ["search", "Components and blocks that match what you describe, such as “date range” or “file upload”."],
    ["get_tokens", "The --ow-… variables: colours in both themes, type, spacing, corners, shadows, weights and motion."],
    ["check_code", "The problems in a file it wrote: raw controls, props and values that don't exist, unlabelled inputs, hard-coded colours, tokens, classes and imports that aren't the library's, each with its line and what to use instead. The same rules as the ESLint plugin below."],
] as const;

const lintRules = [
    ["no-raw-controls", "Button, Input, Select, Textarea, ProgressBar and Meter instead of <button>, <input>, <select>, <textarea>, <progress> and <meter>."],
    ["no-inline-colour", "No hex, rgb() or named colours in style props: the --ow- tokens, with the token named when one has that colour."],
    ["input-needs-field", "Every input is in a Field, or has aria-label when its label is elsewhere."],
    ["valid-props", "Every prop on a component is one it has, and a prop that's a choice of strings gets one of its values, with “did you mean”."],
    ["import-from-package", "Components from the package itself: no deep imports, no misspelt names, no look-alikes from Radix, MUI, sonner, recharts and the rest, and nothing used without its import (fixed for you)."],
    ["valid-tokens", "Every --ow- variable and ow- class is one the library ships."],
] as const;

const lintConfig = `import openware from "${eslintPackage}";
import tseslint from "typescript-eslint";

export default [
    { files: ["**/*.{ts,tsx}"], languageOptions: { parser: tseslint.parser } },
    openware.configs.recommended,
];`;

const prompts = [
    "Build a settings page for my app with Openware UI.",
    "Add the Openware pricing block with three plans: Free, Pro at $12 and Team at $40.",
    "Turn this form into Openware components, with errors under each field.",
    "Make a chat screen with a prompt box, streaming messages and tool calls, using Openware UI.",
];

export function AI() {
    return (
        <DocPage
            title="AI and MCP"
            description="Give Claude, Codex, Cursor and other AI tools the real components. Connect the MCP server so they look up what they need as they work, or copy any page for them."
            toc={[
                { id: "mcp", label: "The MCP server", level: 2 },
                { id: "add", label: "Add it to your tool", level: 2 },
                { id: "try", label: "Try it", level: 2 },
                { id: "lint", label: "Check the code", level: 2 },
                { id: "copy", label: "Copy for AI", level: 2 },
                { id: "llms", label: "llms.txt", level: 2 },
            ]}
        >
            <Section
                id="mcp"
                title="The MCP server"
                description={`${mcpPackage} gives an AI tool every component's examples and props, every block's code, the tokens and the rules, for the release it matches. It's one file with everything inside: it runs offline and needs only Node 18 or later.`}
            >
                <div className="docs-keyboard">
                    <table>
                        <caption className="ow-visually-hidden">The server's tools</caption>
                        <thead>
                            <tr>
                                <th scope="col">Tool</th>
                                <th scope="col">What it returns</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tools.map(([name, description]) => (
                                <tr key={name}>
                                    <td>
                                        <code>{name}</code>
                                    </td>
                                    <td>{description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Section>

            <Section id="add" title="Add it to your tool" description="Once per machine, or per project where the tool keeps its settings in the repository.">
                <Tabs defaultValue="claude-code" variant="line" className="docs-install-tabs">
                    <TabList aria-label="AI tool">
                        <Tab value="claude-code">Claude Code</Tab>
                        <Tab value="codex">Codex</Tab>
                        <Tab value="cursor">Cursor</Tab>
                        <Tab value="other">Others</Tab>
                    </TabList>
                    <TabPanel value="claude-code">
                        <Stack gap="md">
                            <Snippet value={mcpSetup.claudeCode} />
                            <p className="docs-text">
                                Add <code>--scope project</code> to share it with everyone on the project through <code>.mcp.json</code>.
                            </p>
                        </Stack>
                    </TabPanel>
                    <TabPanel value="codex">
                        <Stack gap="md">
                            <Snippet value={mcpSetup.codex} />
                            <p className="docs-text">
                                Or add it to <code>~/.codex/config.toml</code> yourself:
                            </p>
                            <CodeBlock code={mcpSetup.codexToml} title="config.toml" language="toml" />
                        </Stack>
                    </TabPanel>
                    <TabPanel value="cursor">
                        <Stack gap="md" align="start">
                            <a className={buttonClassName({ variant: "secondary" })} href={mcpSetup.cursorLink()}>
                                Add to Cursor <ArrowUpRight size={16} aria-hidden="true" />
                            </a>
                            <p className="docs-text">
                                Or put it in <code>.cursor/mcp.json</code> for this project, or <code>~/.cursor/mcp.json</code> for all of them:
                            </p>
                            <CodeBlock code={mcpSetup.json} title="mcp.json" language="json" />
                        </Stack>
                    </TabPanel>
                    <TabPanel value="other">
                        <Stack gap="md">
                            <p className="docs-text">Claude Desktop, Windsurf and most other clients take the same settings:</p>
                            <CodeBlock code={mcpSetup.json} title="MCP settings" language="json" />
                            <p className="docs-text">
                                VS Code reads <code>.vscode/mcp.json</code>:
                            </p>
                            <CodeBlock code={mcpSetup.vscode} title=".vscode/mcp.json" language="json" />
                        </Stack>
                    </TabPanel>
                </Tabs>
            </Section>

            <Section id="try" title="Try it" description="Ask for what you want and name Openware UI. The tool reads the setup, finds the components and blocks, and writes code with them.">
                <ul className="docs-list">
                    {prompts.map((prompt) => (
                        <li key={prompt}>“{prompt}”</li>
                    ))}
                </ul>
            </Section>

            <Section
                id="lint"
                title="Check the code"
                description={`${eslintPackage} is the same check as an ESLint plugin, for the project's own lint and CI: six rules, each an error in its recommended config, with the library's exports, props, tokens and classes bundled in for the release it matches. The MCP server's check_code runs them on a file as it's written, so an AI tool fixes its own mistakes before you see them. A JavaScript project leaves the parser line out.`}
            >
                <Stack gap="md">
                    <Snippet value={`npm install -D ${eslintPackage}`} />
                    <CodeBlock code={lintConfig} title="eslint.config.js" language="js" />
                    <div className="docs-keyboard">
                        <table>
                            <caption className="ow-visually-hidden">The plugin's rules</caption>
                            <thead>
                                <tr>
                                    <th scope="col">Rule</th>
                                    <th scope="col">What it checks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lintRules.map(([name, description]) => (
                                    <tr key={name}>
                                        <td>
                                            <code>{name}</code>
                                        </td>
                                        <td>{description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Stack>
            </Section>

            <Section
                id="copy"
                title="Copy for AI"
                description="Every component and every block has a Copy for AI button. It copies a prompt with the whole reference under it: a component's examples and props, or a block's two files. The menu beside it copies the plain Markdown instead."
            >
                <p className="docs-text">
                    Starting a project? Copy the setup: how to install it, what to import once and the rules to follow. Then browse the{" "}
                    <a href={hrefOf.components()}>components</a>
                    {showBlocks ? (
                        <>
                            {" "}
                            and <a href={hrefOf.blocks()}>blocks</a>
                        </>
                    ) : null}
                    .
                </p>
                <div>
                    <CopyForAI
                        what="the setup"
                        prompt={() => `Set up Openware UI in my project and use it for the UI from now on. Here's how:\n\n---\n\n${setupMarkdown(version)}`}
                        markdown={() => setupMarkdown(version)}
                    />
                </div>
            </Section>

            <Section
                id="llms"
                title="llms.txt"
                description="The built docs (npm run docs:build) also come as plain Markdown, for tools that read a site rather than an MCP server."
            >
                <ul className="docs-list">
                    <li>
                        <code>/llms.txt</code>: an index of every page, with a line on each.
                    </li>
                    <li>
                        <code>/llms-full.txt</code>: the setup, every component and the tokens in one file.
                    </li>
                    <li>
                        <code>/ai/components/&lt;name&gt;.md</code> and <code>/ai/blocks/&lt;category&gt;/&lt;Name&gt;.md</code>: one page each.
                    </li>
                </ul>
            </Section>
        </DocPage>
    );
}
