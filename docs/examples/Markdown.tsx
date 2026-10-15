import { useEffect, useState } from "react";

import { Button, ChatMessage, ChatMessageActions, Markdown, Stack } from "@openwarelabs/ui";
import { RotateCcw } from "lucide-react";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Markdown",
    category: "AI",
    description:
        "Renders Markdown safely, as it streams: an agent's answer in a ChatMessage, or a document. The unfinished end never flashes raw syntax, and Prose sets the type.",
    source: "components/Markdown/Markdown.tsx",
    imports: ["Markdown"],
    props: ["MarkdownProps", "MarkdownCodeBlockProps"],
    keyboard: [
        ["Tab", "Moves through the links, the code blocks' Copy buttons, and code blocks or tables wide enough to scroll."],
        ["Enter", "Follows a link, or copies a focused code block's code."],
    ],
    notes: [
        "It builds React elements and never injects HTML: <b> or <script> in the text shows as typed.",
        "Links are followed only to http, https, mailto and relative URLs; anything else, like javascript:, shows as its text. Links to other sites open in a new tab with rel=\"noopener noreferrer\".",
        "Images show only with allowImages; otherwise each is a link to the image, named by its alt text.",
        "It covers what agents write: headings, emphasis, strikethrough, inline and fenced code, quotes, nested and task lists, links, tables, rules and line breaks. Fenced code is a CodeBlock with its language.",
        "While streaming, half a **bold already shows bold, a link waiting for its URL shows its text, an open fence is already a code block and half a table row fills its cells. Each finished block renders once.",
        "Streaming, it's aria-busy, so screen readers wait for the finished answer. Inside a ChatMessage, leave caret off: the message draws its own.",
        "Use headingOffset when the answer sits under a page's own h1 and h2, so its headings still read in order.",
    ],
    related: ["Prose", "CodeBlock", "ChatMessage", "ChatConversation"],
    since: "0.15.0",
};

const releaseNotes = `# Agents now run your checks before review

Until now, an agent's pull request could reach review with a failing build. From today, every run ends with your project's checks, and only a passing run asks for a reviewer.

## What's changed

After the agent makes its change, it runs the commands under \`checks\` in your \`acme.yaml\`. If one fails, it reads the output, fixes the cause and runs them all again, up to **three times**. A run that still fails comes back to you with what it tried, *not* as a pull request.

> We'd rather wait four minutes for a passing build than review a change that doesn't compile.

### Rolling out

- [x] Run checks on every agent run
- [x] Show each check's output in the run
- [ ] Rerun one failed check from the pull request

Read more in the [docs](https://example.com/docs/checks) or ask in #agents. Raw <b>HTML</b> shows as text.

---

Released 14 October 2026.`;

/** A document at article size: headings, a quote, a task list and a link. The <b> in the last paragraph shows as typed. */
export function Document() {
    return <Markdown size="article" style={{ marginInline: "auto" }}>{releaseNotes}</Markdown>;
}
Document.layout = { align: "start" as const, fill: true };

const answer = `The flaky test is **\`formats the due date\`** in \`invoices.test.ts\`. It builds the date with \`new Date()\`, so it fails in the last hour before midnight UTC.

I changed three things:

1. The test sets a fixed clock with \`vi.setSystemTime\`.
2. \`formatDueDate\` takes the *customer's* time zone, not the server's.
3. Two snapshots that captured the wrong day are updated.

\`\`\`ts
it("formats the due date in the customer's time zone", () => {
    vi.setSystemTime(new Date("2026-10-14T23:30:00Z"));
    expect(formatDueDate(invoice, "Europe/Dublin")).toBe("15 October 2026");
});
\`\`\`

| Run | Passed | Failed |
|:----|-------:|-------:|
| Before the fix | 208 | 4 |
| After the fix | 212 | 0 |

All 212 tests pass. See the [run](https://example.com/runs/4821) for the logs.`;

/** Feeds `text` a few characters at a time, as a model's tokens arrive; restart() starts again. */
function useStream(text: string, speed = 28) {
    const [run, setRun] = useState(0);
    const [length, setLength] = useState(0);
    useEffect(() => {
        setLength(0);
        let at = 0;
        const timer = window.setInterval(() => {
            at = Math.min(text.length, at + 2 + ((at * 7) % 5));
            setLength(at);
            if (at >= text.length) window.clearInterval(timer);
        }, speed);
        return () => window.clearInterval(timer);
    }, [text, speed, run]);
    return { shown: text.slice(0, length), done: length >= text.length, restart: () => setRun((value) => value + 1) };
}

/** A simulated stream with the caret on. Bold, code, the list, the fence and the table never show their raw syntax as
 * they arrive, and finished blocks aren't rendered again. */
export function Streaming() {
    const { shown, done, restart } = useStream(answer);
    return (
        <Stack gap="lg" style={{ width: "100%", maxWidth: 620, marginInline: "auto" }}>
            <Markdown streaming={!done} caret style={{ minHeight: 460 }}>
                {shown}
            </Markdown>
            <Button size="sm" startIcon={<RotateCcw size={16} />} onClick={restart} style={{ alignSelf: "start" }}>
                Restart
            </Button>
        </Stack>
    );
}
Streaming.layout = { align: "start" as const, fill: true };

const setup = `Install it, then add the config:

\`\`\`sh
npm install @acme/agents
\`\`\`

\`\`\`yaml
agents:
  pull_requests: true
  checks:
    - npm test
    - npm run lint
\`\`\`

A fence without a language still gets a Copy button:

\`\`\`
ACME_TOKEN=sk-live-…
\`\`\``;

/** Fenced code becomes a CodeBlock with its language and a Copy button. */
export function CodeBlocks() {
    return <Markdown style={{ maxWidth: 620, marginInline: "auto" }}>{setup}</Markdown>;
}
CodeBlocks.layout = { align: "start" as const, fill: true };

const plans = `| Plan | Seats | Agent runs a month | Price |
|:-----|:-----:|-------------------:|------:|
| Free | 1 | 50 | $0 |
| Team | up to 20 | 2,000 | $24 a seat |
| Business | unlimited | 10,000 | $40 a seat |

Prices are per month, billed yearly. \`|\` inside a cell is written \\|.`;

/** A GitHub table: the colons in the divider align each column. */
export function Tables() {
    return <Markdown style={{ maxWidth: 620, marginInline: "auto" }}>{plans}</Markdown>;
}
Tables.layout = { align: "start" as const, fill: true };

/** Inside a ChatMessage: the message draws the caret and is aria-busy while it streams, and its actions wait for the end. */
export function InAChatMessage() {
    const { shown, done, restart } = useStream(answer, 40);
    return (
        <Stack gap="lg" style={{ width: "100%" }}>
            <ChatMessage
                from="assistant"
                name="Acme agent"
                status={done ? "done" : "streaming"}
                actions={<ChatMessageActions copyText={answer} onRetry={restart} onRate={() => undefined} />}
                style={{ minHeight: 520 }}
            >
                <Markdown streaming={!done}>{shown}</Markdown>
            </ChatMessage>
            <Button size="sm" startIcon={<RotateCcw size={16} />} onClick={restart} style={{ alignSelf: "start" }}>
                Restart
            </Button>
        </Stack>
    );
}
InAChatMessage.layout = { align: "start" as const, fill: true };
