import { CodeBlock, Kbd, Link, Prose, Text } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Prose",
    category: "Typography",
    description:
        "Styles text you don't write element by element: Markdown rendered to HTML, a CMS body, an agent's answer. The plain elements inside it take Openware's type, spacing and colours.",
    source: "components/Prose/Prose.tsx",
    keyboard: [
        ["Tab", "Moves through the links, details summaries and enabled checkboxes in the text."],
        ["Enter", "Follows a link, or opens and closes the details whose summary has focus."],
        ["Space", "Opens and closes the details whose summary has focus."],
        ["Left or Right", "Scrolls a focused code block or table that's wider than the text."],
    ],
    notes: [
        "Prose has no Markdown parser. Pair it with one: <Prose><ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown></Prose> with react-markdown, or <Prose dangerouslySetInnerHTML={{ __html: html }} /> for HTML from marked or a server, sanitised first.",
        "remark-gfm adds tables, task lists and strikethrough. The checkboxes it renders are disabled: they show a state without taking clicks, so they keep their colours.",
        "Openware components inside it keep their own look. Map fenced code to CodeBlock or links to your router's Link in the renderer's components prop, and Prose only spaces them.",
        "Headings keep the levels the content gives them. Under a page that has its own h1 and h2, shift an answer's headings down in the renderer so the outline still reads in order.",
        "Wide code blocks and tables scroll sideways. Chrome and Firefox let the keyboard focus them to scroll, and Prose outlines them when they have focus.",
        'Nothing in it animates, so an answer can stream into it. Set aria-busy="true" on the message, or on Prose, while it streams: screen readers wait for the finished answer, and lines break as they fill, so words already shown don\'t hop to the next line.',
    ],
    related: ["Text", "CodeBlock", "Table", "Kbd", "Link"],
    since: "0.5.0",
};

const testFix = `it("formats the due date in the customer's time zone", () => {
    vi.setSystemTime(new Date("2026-10-14T23:30:00Z"));
    expect(formatDueDate(invoice, "Europe/Dublin")).toBe("15 October 2026");
});`;

/** An agent's answer at sm: 14px text, a tight rhythm, a list, inline code, a code block and a table. */
export function AgentAnswer() {
    return (
        <Prose size="sm" style={{ maxWidth: 620, marginInline: "auto" }}>
            <p>
                The flaky test is <code>formats the due date</code> in <code>invoices.test.ts</code>
                . It builds the date with <code>new Date()</code>, so it fails whenever the suite
                runs in the last hour before midnight UTC.
            </p>
            <p>I changed three things:</p>
            <ul>
                <li>
                    The test sets a fixed clock with <code>vi.setSystemTime</code>.
                </li>
                <li>
                    <code>formatDueDate</code> takes the customer's time zone instead of the
                    server's.
                </li>
                <li>Two snapshots that captured the wrong day are updated.</li>
            </ul>
            <pre>
                <code>{testFix}</code>
            </pre>
            <table>
                <thead>
                    <tr>
                        <th>Run</th>
                        <th align="right">Passed</th>
                        <th align="right">Failed</th>
                        <th align="right">Time</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Before the fix</td>
                        <td align="right">208</td>
                        <td align="right">4</td>
                        <td align="right">41 s</td>
                    </tr>
                    <tr>
                        <td>After the fix</td>
                        <td align="right">212</td>
                        <td align="right">0</td>
                        <td align="right">39 s</td>
                    </tr>
                </tbody>
            </table>
            <p>
                All 212 tests pass. Shall I open a pull request against <code>main</code>?
            </p>
        </Prose>
    );
}
AgentAnswer.layout = { align: "start" as const, fill: true };

/** A changelog article at md: the prose style at a readable width, with headings, a quote, a figure, a task list and
 * a details. The cover is drawn with CSS. */
export function ChangelogArticle() {
    return (
        <Prose as="article">
            <h1>Agents now run your checks before review</h1>
            <p>
                Until now, an agent's pull request could reach review with a failing build. From
                today, every run ends with your project's checks, and only a passing run asks for a
                reviewer.
            </p>
            <figure>
                <div
                    role="img"
                    aria-label="An agent's run with its checks passing one after another"
                    style={{
                        aspectRatio: "16 / 7",
                        borderRadius: "var(--ow-radius-container)",
                        background: [
                            "radial-gradient(circle at 72% 40%, var(--ow-brass) 0 6px, transparent 7px)",
                            "radial-gradient(color-mix(in srgb, var(--ow-brand-300) 22%, transparent) 1px, transparent 1.5px) center / 18px 18px",
                            "linear-gradient(165deg, var(--ow-brand-600), var(--ow-brand-800) 75%)",
                        ].join(", "),
                    }}
                />
                <figcaption>Each check runs in the order it's listed in acme.yaml.</figcaption>
            </figure>
            <h2>What's changed</h2>
            <p>
                After the agent makes its change, it runs the commands under <code>checks</code> in
                your <code>acme.yaml</code>. If one fails, it reads the output, fixes the cause and
                runs them all again, up to <strong>three times</strong>. A run that still fails
                comes back to you with what it tried, <em>not</em> as a pull request.
            </p>
            <blockquote>
                <p>
                    We'd rather wait four minutes for a passing build than review a change that
                    doesn't compile.
                </p>
            </blockquote>
            <h3>Turning it on</h3>
            <p>
                Checks are on for new projects. For an existing one, open its{" "}
                <a href="#">project settings</a>, or press{" "}
                <kbd>
                    <kbd>⌘</kbd> <kbd>K</kbd>
                </kbd>{" "}
                and type “checks”.
            </p>
            <h3>Rolling out</h3>
            <ul>
                <li>
                    <input type="checkbox" checked disabled /> Run checks on every agent run
                </li>
                <li>
                    <input type="checkbox" checked disabled /> Show each check's output in the run
                </li>
                <li>
                    <input type="checkbox" disabled /> Rerun one failed check from the pull request
                </li>
            </ul>
            <details>
                <summary>Which commands count as checks?</summary>
                <p>
                    Every command under <code>checks</code>, in order. One that exits with anything
                    but 0 fails the run, and one that takes longer than <mark>10 minutes</mark> is
                    stopped and counts as failed.
                </p>
            </details>
            <hr />
            <p>Released 14 October 2026 to every workspace on the Team plan or above.</p>
        </Prose>
    );
}
ChangelogArticle.layout = { align: "start" as const, fill: true };

/** The two sizes side by side: sm for a chat answer or a comment, md for an article or a docs page. */
export function Sizes() {
    const content = (
        <>
            <h3>Review an agent's pull request</h3>
            <p>
                Open the run from the <a href="#">pull request</a> to see each step, then comment as
                you would on a teammate's change. The agent answers on the same branch.
            </p>
            <ul>
                <li>Check the summary against the diff.</li>
                <li>
                    Run <code>npm test</code> yourself if a check was skipped.
                </li>
            </ul>
        </>
    );
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 40,
                width: "100%",
            }}
        >
            <div>
                <Text variant="overline" as="p" style={{ marginBottom: 12 }}>
                    sm
                </Text>
                <Prose size="sm">{content}</Prose>
            </div>
            <div>
                <Text variant="overline" as="p" style={{ marginBottom: 12 }}>
                    md
                </Text>
                <Prose>{content}</Prose>
            </div>
        </div>
    );
}
Sizes.layout = { align: "start" as const, fill: true };

const reviewers = `agents:
  pull_requests: true
  reviewers: suggested
  checks:
    - npm test
    - npm run lint`;

/** Openware components inside it keep their own look and get a block's spacing, as when a renderer maps fenced code
 * to CodeBlock. */
export function WithComponents() {
    return (
        <Prose size="sm" style={{ maxWidth: 620, marginInline: "auto" }}>
            <p>
                Agents can ask for reviewers themselves. Add this to the project's config, or turn
                it on in <Link href="#">project settings</Link>:
            </p>
            <CodeBlock code={reviewers} title="acme.yaml" language="yaml" />
            <p>
                Press <Kbd>⌘</Kbd> <Kbd>S</Kbd> to save, and the next run picks it up.
            </p>
        </Prose>
    );
}
WithComponents.layout = { align: "start" as const, fill: true };
