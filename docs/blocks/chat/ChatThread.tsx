import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";

import { Avatar, Badge, Button, Code, CodeBlock, Kbd, Link, Menu, MenuItem, Spinner, Text, Textarea } from "@openwarelabs/ui";
import { ArrowUp, Bot, Ellipsis, GitPullRequest, History, SquarePen } from "lucide-react";

import "./ChatThread.css";

interface Message {
    id: number;
    from: "person" | "agent";
    time: string;
    body: ReactNode;
    /** Sent or received since the page opened, so it fades in. */
    live?: boolean;
}

const fix = `export function formatInvoiceDate(issuedAt: Date, customer: Customer) {
    return new Intl.DateTimeFormat(customer.locale, {
        dateStyle: "long",
        timeZone: customer.timeZone, // was the server's, UTC
    }).format(issuedAt);
}`;

const conversation: Message[] = [
    {
        id: 1,
        from: "person",
        time: "14:02",
        body: "Customers in Ireland are getting invoices dated the day before. Can you find where we format the date?",
    },
    {
        id: 2,
        from: "agent",
        time: "14:02",
        body: (
            <>
                <Text variant="copy" tone="default">
                    Found it. <Code>formatInvoiceDate</Code> formats in the server's time zone, UTC, so an invoice issued at 00:30 in Dublin in summer shows the
                    day before. Passing the customer's time zone fixes it:
                </Text>
                <CodeBlock code={fix} title="src/invoices/format.ts" language="ts" />
                <Text variant="copy" tone="default">
                    I've added a test for a customer in Europe/Dublin at 23:30 UTC, and it passes. Shall I open a pull request?
                </Text>
            </>
        ),
    },
    {
        id: 3,
        from: "person",
        time: "14:04",
        body: "Yes, open it against main and ask Tomás to review.",
    },
    {
        id: 4,
        from: "agent",
        time: "14:05",
        body: (
            <>
                <Text variant="copy" tone="default">
                    Done. It's ready for Tomás Reyes, and I'll fix anything he asks for on the same branch.
                </Text>
                <Link className="chat-thread__pr" href="#" variant="standalone">
                    <GitPullRequest size={18} />
                    <span className="chat-thread__pr-text">
                        <Text variant="label" truncate>
                            #482 Fix invoice dates in the EU
                        </Text>
                        <Text variant="caption">
                            <Text variant="code" tone="success" className="chat-thread__diff">
                                +42
                            </Text>{" "}
                            <Text variant="code" tone="danger" className="chat-thread__diff">
                                −8
                            </Text>{" "}
                            · 2 files · billing-api
                        </Text>
                    </span>
                    <Badge size="sm" variant="active">
                        In review
                    </Badge>
                </Link>
            </>
        ),
    },
];

/** Stands in for the model: what it says back to anything new. */
const reply = "On it. I'll look into that in billing-api and add it to #482 if it's related. You'll get a notification when it's ready for review.";

const timeNow = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

function AgentAvatar() {
    return (
        <span className="chat-thread__bot" aria-hidden="true">
            <Bot size={16} />
        </span>
    );
}

export function ChatThread() {
    const [messages, setMessages] = useState(conversation);
    const [draft, setDraft] = useState("");
    const [thinking, setThinking] = useState(false);
    const scroller = useRef<HTMLDivElement>(null);
    const timer = useRef(0);
    const firstRender = useRef(true);
    useEffect(() => () => window.clearTimeout(timer.current), []);

    // Keep the newest message in view: jump there on load, glide there after that.
    useLayoutEffect(() => {
        const element = scroller.current;
        if (!element) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        element.scrollTo({ top: element.scrollHeight, behavior: firstRender.current || reduce ? "auto" : "smooth" });
        firstRender.current = false;
    }, [messages, thinking]);

    const send = (event: FormEvent | KeyboardEvent) => {
        event.preventDefault();
        const text = draft.trim();
        if (!text || thinking) return;
        setMessages((list) => [...list, { id: Date.now(), from: "person", time: timeNow(), body: text, live: true }]);
        setDraft("");
        setThinking(true);
        timer.current = window.setTimeout(() => {
            setThinking(false);
            const body = (
                <Text variant="copy" tone="default">
                    {reply}
                </Text>
            );
            setMessages((list) => [...list, { id: Date.now(), from: "agent", time: timeNow(), body, live: true }]);
        }, 1600);
    };

    // Enter sends; Shift+Enter starts a new line.
    const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) send(event);
    };

    return (
        <div className="chat-thread">
            <div className="chat-thread__panel">
                <header className="chat-thread__header">
                    <AgentAvatar />
                    <div className="chat-thread__heading">
                        <Text variant="card-title" as="h1" truncate>
                            Invoice dates in Ireland
                        </Text>
                        <Text variant="caption" className="chat-thread__context">
                            <span className="chat-thread__context-dot" aria-hidden="true" />
                            Acme agent · billing-api · main
                        </Text>
                    </div>
                    <Button variant="ghost" size="sm" iconOnly aria-label="New chat">
                        <SquarePen size={16} />
                    </Button>
                    <Menu
                        label="Chat"
                        align="end"
                        trigger={
                            <Button variant="ghost" size="sm" iconOnly aria-label="More">
                                <Ellipsis size={16} />
                            </Button>
                        }
                    >
                        <MenuItem icon={<History size={15} />}>Earlier chats</MenuItem>
                        <MenuItem icon={<GitPullRequest size={15} />}>Open #482</MenuItem>
                    </Menu>
                </header>

                <div ref={scroller} className="chat-thread__scroll" role="log" aria-label="Conversation" aria-live="polite">
                    <ol className="chat-thread__messages">
                        <Text as="li" variant="caption" className="chat-thread__day" aria-hidden="true">
                            Today
                        </Text>
                        {messages.map((message) => (
                            <li
                                key={message.id}
                                className={`chat-thread__message chat-thread__message--${message.from}${message.live ? " chat-thread__enter" : ""}`}
                            >
                                {message.from === "agent" ? <AgentAvatar /> : <Avatar name="Maya Chen" />}
                                <div className="chat-thread__content">
                                    <div className="chat-thread__meta">
                                        <Text variant="label">{message.from === "agent" ? "Acme agent" : "Maya Chen"}</Text>
                                        <Text variant="caption">
                                            <time>{message.time}</time>
                                        </Text>
                                    </div>
                                    {message.from === "agent" ? (
                                        <div className="chat-thread__answer">{message.body}</div>
                                    ) : (
                                        <Text as="div" variant="copy" tone="default" className="chat-thread__bubble">
                                            {message.body}
                                        </Text>
                                    )}
                                </div>
                            </li>
                        ))}
                        {thinking ? (
                            <li className="chat-thread__message chat-thread__message--agent chat-thread__enter">
                                <AgentAvatar />
                                <div className="chat-thread__content">
                                    <div className="chat-thread__meta">
                                        <Text variant="label">Acme agent</Text>
                                    </div>
                                    <Text as="span" tone="muted" className="chat-thread__thinking">
                                        <Spinner size="sm" label="" />
                                        Thinking…
                                    </Text>
                                </div>
                            </li>
                        ) : null}
                    </ol>
                </div>

                <form className="chat-thread__composer" onSubmit={send}>
                    <div className="chat-thread__box">
                        <Textarea
                            className="chat-thread__input"
                            bare
                            autoGrow
                            autoGrowMaxHeight={140}
                            rows={1}
                            value={draft}
                            placeholder="Reply to the agent…"
                            aria-label="Reply to the agent"
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={onKeyDown}
                        />
                        <div className="chat-thread__toolbar">
                            <Text variant="caption" className="chat-thread__hint">
                                <Kbd>Enter</Kbd> to send, <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd> for a new line
                            </Text>
                            <Button type="submit" variant="primary" size="sm" iconOnly aria-label="Send" disabled={!draft.trim() || thinking}>
                                <ArrowUp size={16} />
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
