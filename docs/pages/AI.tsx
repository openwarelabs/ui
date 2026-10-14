import { buttonClassName, CodeBlock, Snippet, Stack, Tab, TabList, TabPanel, Tabs } from "@openwarelabs/ui";
import { ArrowUpRight } from "lucide-react";

import { mcpPackage, mcpSetup, setupMarkdown } from "../app/ai";
import { hrefOf } from "../app/content";
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
] as const;

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
                id="copy"
                title="Copy for AI"
                description="Every component and every block has a Copy for AI button. It copies a prompt with the whole reference under it: a component's examples and props, or a block's two files. The menu beside it copies the plain Markdown instead."
            >
                <p className="docs-text">
                    Starting a project? Copy the setup: how to install it, what to import once and the rules to follow. Then browse the{" "}
                    <a href={hrefOf.components()}>components</a> and <a href={hrefOf.blocks()}>blocks</a>.
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
