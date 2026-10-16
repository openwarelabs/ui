import { Callout, Markdown, Prose, Stack } from "@openwarelabs/ui";
import { Keyboard } from "lucide-react";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Callout",
    category: "Typography",
    description:
        "A note set apart from the text in docs and long-form writing: a tip, a warning before a step, a bit of context. Static content, not a message about the app: for that, use Alert.",
    source: "components/Callout/Callout.tsx",
    imports: ["Callout"],
    props: ["CalloutProps"],
    keyboard: [
        ["Tab", "Moves to a collapsible callout's title, then on to anything inside it."],
        ["Enter or Space", "Opens and closes a collapsible callout."],
    ],
    notes: [
        'Every callout is a note (role="note") the screen reader can skip over, whatever its tone: a warning in the text is not an alert that interrupts.',
        "Each tone has a word as its default title and an icon, so none relies on colour alone. The icon is decorative; the title carries the tone.",
        "The title is a strong line, not a heading, so a callout doesn't disturb the page's outline.",
        "A collapsible callout is a details element: it opens and closes without JavaScript, and a browser's find-in-page can open it.",
        "Inside Prose or between Markdown blocks it takes a block's margins and, in an article, the text's size and leading; outside, it's 14px interface text.",
        "For a message about the app's state (something saved or failed), use Alert; across the top of the page, Banner.",
    ],
    related: ["Alert", "Prose", "Markdown", "Banner"],
    since: "0.18.0",
};

/** The six tones. Each has a word and an icon by default, and the title is the tone's colour. */
export function Tones() {
    return (
        <Stack gap="md" style={{ width: 560, maxWidth: "100%", marginInline: "auto" }}>
            <Callout>Pages render at build time, so a change to the sidebar shows after the next deploy.</Callout>
            <Callout tone="tip">
                Keep the project's name short: it becomes the subdomain, and <code>aoife-recipes</code> is easier to say than the full title.
            </Callout>
            <Callout tone="info">Workspaces on the free plan keep thirty days of history. Older runs are listed but their logs are gone.</Callout>
            <Callout tone="warning">Changing the region moves every file. Uploads fail for a minute or two while that happens.</Callout>
            <Callout tone="danger">Deleting a workspace removes its runs, logs and members at once. There is no undo.</Callout>
            <Callout tone="success">The connection test passed: the agent can reach the repository and push to a branch.</Callout>
        </Stack>
    );
}

/** The three variants, and a callout with its own title and icon. `title={null}` or `icon={null}` leaves one out. */
export function Variants() {
    return (
        <Stack gap="md" style={{ width: 560, maxWidth: "100%", marginInline: "auto" }}>
            <Callout tone="info" variant="soft" title="Soft">
                A tinted panel: the default, and what the other examples on this page use.
            </Callout>
            <Callout tone="info" variant="outline" title="Outline">
                The page's surface with a 1px border, for a callout inside a card that already has a tint.
            </Callout>
            <Callout tone="info" variant="bar" title="Bar">
                A 3px rule down the start edge, like GitHub's and Obsidian's callouts: the quietest, for notes that come often.
            </Callout>
            <Callout tone="tip" variant="bar" title="Shortcut" icon={<Keyboard size={16} />}>
                Press <kbd>⌘</kbd> <kbd>K</kbd> anywhere to search the docs.
            </Callout>
        </Stack>
    );
}

const before = `## Install the agent

Run the installer once on the machine that will host the agent. It writes its configuration to \`~/.config/acme/agent.yaml\` and registers itself to start with the system.

\`\`\`bash
curl -fsSL https://example.com/install.sh | sh
\`\`\``;

const after = `## Connect a repository

Then, in the dashboard, open **Settings → Repositories** and pick the ones the agent may work in. It asks for a GitHub token with \`repo\` scope, which it keeps in the system's keychain.`;

/** A collapsible callout in a Prose article, between Markdown blocks: closed until a reader needs it. */
export function InArticle() {
    return (
        <Prose as="article" style={{ marginInline: "auto" }}>
            <Markdown size="article">{before}</Markdown>
            <Callout tone="note" title="Installing without root" collapsible>
                <p>
                    The installer needs root to register the service. Without it, pass <code>--user</code>: the agent then
                    runs as the person who installed it and starts when they log in.
                </p>
                <p>
                    Niamh's team does this on shared build machines, with one agent per person, so each one pushes under its
                    own name.
                </p>
            </Callout>
            <Markdown size="article">{after}</Markdown>
        </Prose>
    );
}
InArticle.layout = { align: "start" as const, fill: true };
