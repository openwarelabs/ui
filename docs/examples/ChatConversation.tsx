import { useEffect, useRef, useState, type ReactNode } from "react";

import {
    Avatar,
    Button,
    ChainOfThought,
    ChatConversation,
    ChatLoader,
    ChatMessage,
    ChatMessageActions,
    ChatSource,
    ChatSources,
    ChatTool,
    Code,
    CodeBlock,
    EmptyState,
    PromptInput,
    PromptSuggestion,
    PromptSuggestions,
    Prose,
    Stack,
    Text,
    type ChatConversationHandle,
    type ChatSourceItem,
} from "@openwarelabs/ui";
import {
    Bot,
    FileCode2,
    FileSearch,
    FileText,
    RotateCcw,
    Search,
    SquarePen,
    Terminal,
} from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "ChatConversation",
    category: "AI",
    description:
        "The scrolling column of a chat. It follows new messages and streaming answers while you're at the bottom, lets you scroll up to read in peace, and brings you back with Jump to latest.",
    source: "components/Chat/ChatConversation.tsx",
    imports: ["ChatConversation", "ChatMessage"],
    props: ["ChatConversationProps", "ChatConversationHandle"],
    keyboard: [
        [
            "Tab",
            "Moves into the conversation, then through each message's actions, then to Jump to latest when it shows.",
        ],
        [
            "Up, Down, PageUp, PageDown",
            "Scroll the conversation while it has focus. Scrolling up stops it following.",
        ],
        ["Home or End", "Go to the first or the latest message. End starts following again."],
        [
            "Enter or Space",
            "On Jump to latest: scrolls down and keeps up with new messages. Focus stays in the conversation.",
        ],
    ],
    notes: [
        'It\'s a polite live region (role="log") named "Conversation": screen readers hear each message as it\'s added, and a streaming answer is aria-busy until it\'s done.',
        "It fills its parent's height, so give the parent one: a flex column, a grid row or a fixed height.",
        "Call scrollToBottom() on its ref when the person sends a message, so they see their own words and the answer even if they'd scrolled up.",
        "Put the prompt box in footer: it's docked under the messages and lined up with them, outside the log, and Jump to latest floats above it.",
        "Following never animates, so a fast stream doesn't lag; Jump to latest scrolls smoothly, or at once under reduced motion.",
    ],
    related: ["ChatMessage", "ChatLoader", "PromptInput", "ScrollShadow"],
    since: "0.5.0",
};

/** The frame the examples sit in: a bordered panel of a fixed height, which the conversation fills. */
function Panel({ height = 460, children }: { height?: number; children: ReactNode }) {
    return (
        <div
            style={{
                display: "flex",
                height,
                flexDirection: "column",
                overflow: "hidden",
                border: "1px solid var(--ow-border)",
                borderRadius: "var(--ow-radius-panel)",
                background: "var(--ow-surface)",
            }}
        >
            {children}
        </div>
    );
}

const fix = `export function formatTotal(lines: CartLine[], currency: string) {
    const pence = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity * 100, 0);
    // Round once, at the end, as billing-api does.
    return formatMoney(Math.round(pence) / 100, currency);
}`;

/** A short conversation: Siobhan's messages on the right, the agent's answers beside its avatar, and a system line between. */
export function Basic() {
    return (
        <Panel>
            <ChatConversation>
                <ChatMessage
                    from="user"
                    name="Siobhan Murphy"
                    avatar={<Avatar name="Siobhan Murphy" />}
                    time="2026-10-14T14:02:00"
                >
                    The checkout test started failing on main this morning. Can you find out why?
                </ChatMessage>
                <ChatMessage from="assistant" name="Acme agent" time="2026-10-14T14:03:00">
                    <Text variant="copy" tone="default">
                        Since #476, <Code>lineTotal</Code> rounds each line to the penny before
                        they're added up. Three items at £0.335 now come to £1.02, and{" "}
                        <Code>checkout.test.ts</Code> expects £1.01. Rounding once, at the end,
                        fixes it:
                    </Text>
                    <CodeBlock code={fix} title="src/checkout/total.ts" language="ts" />
                    <Text variant="copy" tone="default">
                        All 212 tests pass with this change. Shall I open a pull request?
                    </Text>
                </ChatMessage>
                <ChatMessage from="system" time="2026-10-14T14:04:00">
                    Siobhan Murphy changed the model to Claude Sonnet
                </ChatMessage>
                <ChatMessage
                    from="user"
                    name="Siobhan Murphy"
                    avatar={<Avatar name="Siobhan Murphy" />}
                    time="2026-10-14T14:04:00"
                >
                    Yes, open it against main and ask Ciarán to review.
                </ChatMessage>
                <ChatMessage
                    from="assistant"
                    name="Acme agent"
                    time="2026-10-14T14:05:00"
                    showActions="always"
                    actions={
                        <ChatMessageActions
                            copyText="Opened pull request #483, “Round checkout totals once”, and asked Ciarán Kelly to review it."
                            onRetry={() => undefined}
                            onRate={() => undefined}
                        />
                    }
                >
                    Opened pull request #483, “Round checkout totals once”, and asked Ciarán Kelly to
                    review it.
                </ChatMessage>
            </ChatConversation>
        </Panel>
    );
}
Basic.layout = { fill: true };

/** Stands in for the model: reveals the text a word at a time, from the start again whenever `run` changes. */
function useStreamedText(text: string, run: number) {
    const words = text.split(/(?<= )/);
    const [count, setCount] = useState(0);
    useEffect(() => setCount(0), [run]);
    useEffect(() => {
        if (count >= words.length) return undefined;
        const timer = window.setTimeout(() => setCount(count + 1), 70);
        return () => window.clearTimeout(timer);
    }, [count, words.length]);
    return { text: words.slice(0, count).join(""), done: count >= words.length };
}

/** Plain text as paragraphs, with `backticks` as Code. (A real app renders the model's Markdown with Prose.) */
function paragraphs(text: string) {
    return text.split("\n\n").map((paragraph, index) => (
        <Text key={index} variant="copy" tone="default">
            {paragraph.split("`").map((piece, i) => (i % 2 ? <Code key={i}>{piece}</Code> : piece))}
        </Text>
    ));
}

const diagnosis = `It first failed at 09:14, in the first build after #476 was merged. #476 moved rounding into \`lineTotal\`, so each line is now rounded to the penny before the discount is taken off.

With three lines at £0.335 and 10% off, that comes to £0.92, and the test expects £0.90. Nothing else in the suite uses a discount on more than one line, which is why only this test caught it.

There are two ways to fix it: round once in \`formatTotal\`, after the discount, or apply the discount before \`lineTotal\` rounds. The first is the smaller change, and it's how billing-api rounds invoices.

I'll make the first change and run the checkout suite again. It takes about two minutes.`;

/**
 * An answer streaming in. The conversation follows it while you're at the bottom. Scroll up and it stops, and Jump to
 * latest brings you back, counting what arrived while you were away.
 */
export function Streaming() {
    const [run, setRun] = useState(0);
    const answer = useStreamedText(diagnosis, run);
    const [joined, setJoined] = useState(false);

    // A teammate joins once the answer is in: a new message the button counts if you're scrolled up.
    useEffect(() => {
        setJoined(false);
        if (!answer.done) return undefined;
        const timer = window.setTimeout(() => setJoined(true), 1500);
        return () => window.clearTimeout(timer);
    }, [answer.done, run]);

    return (
        <Stack gap="md">
            <Stack direction="row" gap="sm" align="center">
                <Button
                    size="sm"
                    startIcon={<RotateCcw size={16} />}
                    onClick={() => setRun(run + 1)}
                >
                    Restart the answer
                </Button>
                <Text variant="caption">Scroll up while it writes.</Text>
            </Stack>
            <Panel height={320}>
                <ChatConversation>
                    <ChatMessage from="user">Which tests failed on main last night?</ChatMessage>
                    <ChatMessage from="assistant" name="Acme agent">
                        One: <Code>applies a discount to every line</Code> in{" "}
                        <Code>checkout.test.ts</Code>. The other 211 passed.
                    </ChatMessage>
                    <ChatMessage from="user">Can you find out why it fails?</ChatMessage>
                    <ChatMessage
                        key={run}
                        from="assistant"
                        name="Acme agent"
                        status={answer.done ? "done" : "streaming"}
                    >
                        {paragraphs(answer.text)}
                    </ChatMessage>
                    {joined ? (
                        <ChatMessage from="system">Ciarán Kelly joined the conversation</ChatMessage>
                    ) : null}
                </ChatConversation>
            </Panel>
        </Stack>
    );
}
Streaming.layout = { fill: true };

interface Message {
    id: number;
    from: "user" | "assistant";
    text: string;
    status?: "streaming" | "done";
}

const reply =
    "On it. I'll run the payments suite on `fix/checkout-rounding` and post the results here. If anything else fails, I'll add the fix to #483 rather than open a new pull request.";

/**
 * Sending a message from a PromptInput docked in `footer`: scrollToBottom() on the ref brings Siobhan back to the bottom, a
 * ChatLoader holds the agent's place, and the answer streams in where the loader was.
 */
export function Replying() {
    const conversation = useRef<ChatConversationHandle>(null);
    const timer = useRef(0);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, from: "user", text: "Did the checkout suite pass on the branch?" },
        {
            id: 2,
            from: "assistant",
            text: "Yes: 212 tests passed in 1 minute 48 seconds. #483 is ready for Ciarán to review.",
            status: "done",
        },
    ]);
    const [draft, setDraft] = useState("Can you run the payments tests too?");
    const [thinking, setThinking] = useState(false);
    const last = messages[messages.length - 1];
    const busy = thinking || last?.status === "streaming";

    useEffect(() => () => window.clearTimeout(timer.current), []);

    // Stands in for the model: the answer arrives a word at a time.
    useEffect(() => {
        if (last?.status !== "streaming") return undefined;
        const step = window.setTimeout(() => {
            const text = reply.slice(
                0,
                reply.indexOf(" ", last.text.length + 1) + 1 || reply.length,
            );
            setMessages((list) => [
                ...list.slice(0, -1),
                { ...last, text, status: text === reply ? "done" : "streaming" },
            ]);
        }, 60);
        return () => window.clearTimeout(step);
    }, [last]);

    function send(text: string) {
        setMessages((list) => [...list, { id: Date.now(), from: "user", text }]);
        setDraft("");
        setThinking(true);
        conversation.current?.scrollToBottom();
        timer.current = window.setTimeout(() => {
            setThinking(false);
            setMessages((list) => [
                ...list,
                { id: Date.now(), from: "assistant", text: "", status: "streaming" },
            ]);
        }, 1400);
    }

    // Stop keeps what has arrived so far.
    function stop() {
        window.clearTimeout(timer.current);
        setThinking(false);
        setMessages((list) =>
            list.map((message) =>
                message.status === "streaming" ? { ...message, status: "done" } : message,
            ),
        );
    }

    return (
        <Panel height={420}>
            <ChatConversation
                ref={conversation}
                footer={
                    <PromptInput
                        size="sm"
                        value={draft}
                        onChange={setDraft}
                        onSubmit={send}
                        isStreaming={busy}
                        onStop={stop}
                        placeholder="Reply to the agent…"
                        aria-label="Reply to the agent"
                    />
                }
            >
                {messages.map((message) =>
                    message.from === "user" ? (
                        <ChatMessage key={message.id} from="user">
                            {message.text}
                        </ChatMessage>
                    ) : (
                        <ChatMessage
                            key={message.id}
                            from="assistant"
                            name="Acme agent"
                            status={message.status}
                            actions={
                                <ChatMessageActions
                                    copyText={message.text}
                                    onRate={() => undefined}
                                />
                            }
                        >
                            {paragraphs(message.text)}
                        </ChatMessage>
                    ),
                )}
                {thinking ? <ChatLoader name="Acme agent" /> : null}
            </ChatConversation>
        </Panel>
    );
}
Replying.layout = { fill: true };

const suggestions = [
    "Why is the checkout test failing?",
    "Summarise yesterday's merged pull requests",
    "Find slow queries in billing-api",
];

/** With no messages yet, `empty` shows in their place: a greeting and a few things to ask. Pick one to start. */
export function Empty() {
    const [question, setQuestion] = useState<string | null>(null);
    return (
        <Stack gap="md">
            <Button
                size="sm"
                startIcon={<SquarePen size={16} />}
                disabled={!question}
                onClick={() => setQuestion(null)}
                style={{ alignSelf: "start" }}
            >
                New chat
            </Button>
            <Panel height={360}>
                <ChatConversation
                    empty={
                        <EmptyState
                            icon={<Bot size={20} />}
                            title="Ask the Acme agent"
                            description="It can read billing-api, run its tests and open pull requests for your review."
                            actions={
                                <PromptSuggestions align="center" aria-label="Things to ask">
                                    {suggestions.map((suggestion) => (
                                        <PromptSuggestion
                                            key={suggestion}
                                            onClick={() => setQuestion(suggestion)}
                                        >
                                            {suggestion}
                                        </PromptSuggestion>
                                    ))}
                                </PromptSuggestions>
                            }
                        />
                    }
                >
                    {question ? (
                        <>
                            <ChatMessage from="user">{question}</ChatMessage>
                            <ChatLoader label="Thinking…" />
                        </>
                    ) : null}
                </ChatConversation>
            </Panel>
        </Stack>
    );
}
Empty.layout = { fill: true };

/** width="full" for a narrow side panel: the messages use its whole width, and the agent goes without its avatar to save room. */
export function SidePanel() {
    return (
        <div style={{ width: 340, maxWidth: "100%" }}>
            <Panel height={400}>
                <Text
                    variant="label"
                    style={{ borderBottom: "1px solid var(--ow-border)", padding: "12px 16px" }}
                >
                    Acme agent · #483
                </Text>
                <ChatConversation width="full" aria-label="Acme agent on #483">
                    <ChatMessage from="system">Ciarán Kelly asked for changes</ChatMessage>
                    <ChatMessage from="assistant" avatar={null} name="Acme agent">
                        Ciarán asked for a test with a discount over 100%. I've added one to{" "}
                        <Code>checkout.test.ts</Code>, and it passes.
                    </ChatMessage>
                    <ChatMessage from="user">
                        Does it also cover a basket with no lines?
                    </ChatMessage>
                    <ChatMessage from="assistant" avatar={null} name="Acme agent">
                        It does now: <Code>formatTotal([])</Code> returns £0.00. Both tests are on
                        the branch, and #483 is ready for another look.
                    </ChatMessage>
                </ChatConversation>
            </Panel>
        </div>
    );
}

const runSources: Array<ChatSourceItem & { id: string }> = [
    {
        id: "invoice",
        index: 1,
        title: "formatInvoiceDate",
        source: "src/billing/invoice.ts · lines 40–72",
        href: "#",
        icon: <FileCode2 size={15} />,
        snippet:
            'export function formatInvoiceDate(issuedAt: Date) {\n    return new Intl.DateTimeFormat("en-GB", {\n        dateStyle: "long",\n        timeZone: "UTC",\n    }).format(issuedAt);\n}',
    },
    {
        id: "pdf",
        index: 2,
        title: "renderInvoicePdf",
        source: "src/billing/pdf.ts · lines 24–38",
        href: "#",
        icon: <FileCode2 size={15} />,
        snippet: "// Its own formatter, also in UTC\nconst issued = formatDate(invoice.issuedAt);",
    },
    {
        id: "ticket",
        index: 3,
        title: "Our July invoice is dated 14 July",
        source: "Support ticket 1093 · Halcyon · 15 July",
        href: "#",
        icon: <FileText size={15} />,
        snippet:
            "We were billed just after midnight on 15 July, but the invoice says 14 July. Our accountant needs the right date.",
    },
];

/** One of the sources above as an inline citation, by its number. */
function Cite({ index }: { index: number }) {
    const { id, ...item } = runSources.find((source) => source.index === index)!;
    return <ChatSource {...item} snippetFormat={id === "ticket" ? "text" : "code"} />;
}

const followUp =
    "On it. I'll make both changes on fix/invoice-dates, add the Dublin test, and ask you before I push anything.";

/**
 * A whole run: Siobhan's question; the agent's reasoning, its tool calls, and its answer in Prose with citations, sources
 * and actions; and a PromptInput docked under the conversation. Send a follow-up to see the loader take the agent's
 * place.
 */
export function WholeRun() {
    const conversation = useRef<ChatConversationHandle>(null);
    const timer = useRef(0);
    const [followUps, setFollowUps] = useState<
        Array<{ id: number; text: string; answered: boolean }>
    >([]);
    const [thinking, setThinking] = useState(false);
    useEffect(() => () => window.clearTimeout(timer.current), []);

    function send(text: string) {
        setFollowUps((list) => [...list, { id: Date.now(), text, answered: false }]);
        setThinking(true);
        conversation.current?.scrollToBottom();
        timer.current = window.setTimeout(() => {
            setThinking(false);
            setFollowUps((list) =>
                list.map((item, index) =>
                    index === list.length - 1 ? { ...item, answered: true } : item,
                ),
            );
        }, 1600);
    }

    return (
        <Panel height={640}>
            <ChatConversation
                ref={conversation}
                aria-label="Acme agent on invoice dates"
                footer={
                    <PromptInput
                        placeholder="Ask a follow-up…"
                        aria-label="Reply to the agent"
                        isStreaming={thinking}
                        onStop={() => {
                            window.clearTimeout(timer.current);
                            setThinking(false);
                        }}
                        onSubmit={send}
                    />
                }
            >
                <ChatMessage
                    from="user"
                    name="Siobhan Murphy"
                    avatar={<Avatar name="Siobhan Murphy" />}
                    time="2026-10-14T09:41:00"
                    locale="en-GB"
                >
                    Why are invoices for customers in Ireland dated the day before?
                </ChatMessage>
                <ChatMessage
                    from="assistant"
                    name="Acme agent"
                    time="2026-10-14T09:42:00"
                    locale="en-GB"
                    showActions={followUps.length ? "hover" : "always"}
                    actions={
                        <ChatMessageActions
                            copyText="Invoices are dated in the server's time zone, UTC, rather than the customer's. The PDF invoice has its own copy of the formatter with the same problem."
                            onRetry={() => undefined}
                            onRate={() => undefined}
                        />
                    }
                >
                    <ChainOfThought
                        duration={9200}
                        steps={[
                            {
                                id: "search",
                                title: "Search for where invoices format their dates",
                                status: "success",
                                icon: <Search />,
                            },
                            {
                                id: "read",
                                title: "Read the web and PDF invoice code",
                                status: "success",
                                icon: <FileSearch />,
                            },
                            {
                                id: "check",
                                title: "Check the server's time zone",
                                status: "success",
                                icon: <Terminal />,
                            },
                        ]}
                    >
                        Dated the day before, only east of UTC: that points at a time zone. I'll
                        find where the date is formatted and check what the server runs in.
                    </ChainOfThought>
                    <Stack gap="xs">
                        <ChatTool
                            title="Search the code"
                            name="search_code"
                            icon={<Search size={15} />}
                            status="success"
                            summary="4 matches in 2 files"
                            duration={640}
                            input={{ query: "formatInvoiceDate", path: "src/" }}
                        />
                        <ChatTool
                            title="Read the invoice code"
                            name="read_files"
                            icon={<FileText size={15} />}
                            status="success"
                            summary="Read 2 files"
                            duration={380}
                            input={{ paths: ["src/billing/invoice.ts", "src/billing/pdf.ts"] }}
                        />
                        <ChatTool
                            title="Check the server's time zone"
                            name="run_command"
                            icon={<Terminal size={15} />}
                            status="success"
                            summary="UTC"
                            duration={210}
                            input="date +%Z"
                            output="UTC"
                        />
                    </Stack>
                    <Prose size="sm">
                        <p>
                            Invoices are dated in the server's time zone, UTC, rather than the
                            customer's <Cite index={1} />. An invoice issued at 00:30 in Dublin in
                            summer is still 23:30 the day before in UTC, so it shows the earlier
                            date, as Halcyon reported <Cite index={3} />.
                        </p>
                        <p>
                            The PDF invoice has its own copy of the formatter, with the same problem{" "}
                            <Cite index={2} />. To fix both:
                        </p>
                        <ol>
                            <li>
                                Pass the customer's time zone to <code>formatInvoiceDate</code>.
                            </li>
                            <li>
                                Use <code>formatInvoiceDate</code> in the PDF as well.
                            </li>
                            <li>Add a test for a customer in Europe/Dublin billed at 23:30 UTC.</li>
                        </ol>
                        <p>Shall I make the change and open a pull request?</p>
                    </Prose>
                    <ChatSources sources={runSources} />
                </ChatMessage>
                {followUps.map((message) => (
                    <FollowUp key={message.id} text={message.text} answered={message.answered} />
                ))}
                {thinking ? <ChatLoader name="Acme agent" label="Thinking…" /> : null}
            </ChatConversation>
        </Panel>
    );
}
WholeRun.layout = { fill: true };

/** A follow-up Siobhan sent, and the agent's answer once it's in. */
function FollowUp({ text, answered }: { text: string; answered: boolean }) {
    return (
        <>
            <ChatMessage from="user" name="Siobhan Murphy" avatar={<Avatar name="Siobhan Murphy" />}>
                {text}
            </ChatMessage>
            {answered ? (
                <ChatMessage
                    from="assistant"
                    name="Acme agent"
                    showActions="always"
                    actions={<ChatMessageActions copyText={followUp} onRate={() => undefined} />}
                >
                    <Prose size="sm">
                        <p>{followUp}</p>
                    </Prose>
                </ChatMessage>
            ) : null}
        </>
    );
}
