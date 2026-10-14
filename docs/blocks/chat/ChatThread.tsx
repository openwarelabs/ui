import { useEffect, useRef, useState, type ReactNode } from "react";

import {
    Avatar,
    Badge,
    Button,
    ChatAgentAvatar,
    ChatConversation,
    ChatLoader,
    ChatMessage,
    ChatMessageActions,
    Code,
    CodeBlock,
    EmptyState,
    Kbd,
    Link,
    Menu,
    MenuItem,
    MenuLabel,
    MenuSeparator,
    PromptInput,
    PromptSuggestion,
    PromptSuggestions,
    Prose,
    Text,
    type ChatConversationHandle,
} from "@openwarelabs/ui";
import { Bot, Bug, Ellipsis, FlaskConical, GitPullRequest, History, ScrollText, SquarePen } from "lucide-react";

import "./ChatThread.css";

interface Message {
    id: string;
    from: "user" | "assistant";
    time: Date | string;
    /** The words as plain text: what Copy copies, what Edit puts back in the box, and what a streaming reply shows. */
    text: string;
    /** How it shows, when that's more than the text: code, a pull request. */
    body?: ReactNode;
    status?: "streaming" | "done";
}

const fix = `export function formatInvoiceDate(issuedAt: Date, customer: Customer) {
    return new Intl.DateTimeFormat(customer.locale, {
        dateStyle: "long",
        timeZone: customer.timeZone, // was the server's, UTC
    }).format(issuedAt);
}`;

const conversation: Message[] = [
    {
        id: "1",
        from: "user",
        time: "2026-10-14T14:02:00",
        text: "Customers in Ireland are getting invoices dated the day before. Can you find where we format the date?",
    },
    {
        id: "2",
        from: "assistant",
        time: "2026-10-14T14:02:00",
        text: `Found it. formatInvoiceDate formats in the server's time zone, UTC, so an invoice issued at 00:30 in Dublin in summer shows the day before. Passing the customer's time zone fixes it:\n\n${fix}\n\nI've added a test for a customer in Europe/Dublin at 23:30 UTC, and it passes. Shall I open a pull request?`,
        body: (
            <Prose size="sm">
                <Text variant="copy" tone="default">
                    Found it. <Code>formatInvoiceDate</Code> formats in the server's time zone, UTC, so an invoice issued at 00:30 in Dublin in summer shows the
                    day before. Passing the customer's time zone fixes it:
                </Text>
                <CodeBlock code={fix} title="src/invoices/format.ts" language="ts" />
                <Text variant="copy" tone="default">
                    I've added a test for a customer in Europe/Dublin at 23:30 UTC, and it passes. Shall I open a pull request?
                </Text>
            </Prose>
        ),
    },
    {
        id: "3",
        from: "user",
        time: "2026-10-14T14:04:00",
        text: "Yes, open it against main and ask Tomás to review.",
    },
    {
        id: "4",
        from: "assistant",
        time: "2026-10-14T14:05:00",
        text: "Done. It's ready for Tomás Reyes, and I'll fix anything he asks for on the same branch. #482 Fix invoice dates in the EU.",
        body: (
            <Prose size="sm">
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
                            <Text as="span" variant="caption" tone="success">
                                +42
                            </Text>{" "}
                            <Text as="span" variant="caption" tone="danger">
                                −8
                            </Text>{" "}
                            · 2 files · billing-api
                        </Text>
                    </span>
                    <Badge size="sm" variant="active">
                        In review
                    </Badge>
                </Link>
            </Prose>
        ),
    },
];

/** Stands in for the model: what it says back to anything new. */
const reply = "On it. I'll look into that in billing-api and add it to #482 if it's related. You'll get a notification when it's ready for review.";

const ideas = [
    { label: "Why did the checkout test fail?", icon: <Bug size={16} /> },
    { label: "Write tests for invoice dates", icon: <FlaskConical size={16} /> },
    { label: "Summarise this week's merges", icon: <ScrollText size={16} /> },
];

let nextId = 0;
const newId = () => `new-${(nextId += 1)}`;

export function ChatThread() {
    const [title, setTitle] = useState("Invoice dates in Ireland");
    const [messages, setMessages] = useState(conversation);
    const [draft, setDraft] = useState("");
    const [thinking, setThinking] = useState(false);
    const view = useRef<ChatConversationHandle>(null);
    const input = useRef<HTMLTextAreaElement>(null);
    const timer = useRef(0);
    useEffect(() => () => window.clearTimeout(timer.current), []);

    const last = messages[messages.length - 1];
    const streaming = last?.status === "streaming";

    // Stands in for the model: the reply arrives a word at a time.
    useEffect(() => {
        if (!streaming) return;
        const step = window.setTimeout(() => {
            const text = reply.slice(0, reply.indexOf(" ", last.text.length + 1) + 1 || reply.length);
            setMessages((list) => [...list.slice(0, -1), { ...last, text, status: text === reply ? "done" : "streaming" }]);
        }, 45);
        return () => window.clearTimeout(step);
    }, [last, streaming]);

    const send = (text: string) => {
        setMessages((list) => [...list, { id: newId(), from: "user", time: new Date(), text }]);
        setDraft("");
        setThinking(true);
        view.current?.scrollToBottom();
        timer.current = window.setTimeout(() => {
            setThinking(false);
            setMessages((list) => [...list, { id: newId(), from: "assistant", time: new Date(), text: "", status: "streaming" }]);
        }, 1400);
    };

    // Stop keeps what has arrived so far.
    const stop = () => {
        window.clearTimeout(timer.current);
        setThinking(false);
        setMessages((list) => list.map((message) => (message.status === "streaming" ? { ...message, status: "done" } : message)));
    };

    const edit = (text: string) => {
        setDraft(text);
        input.current?.focus();
    };

    const open = (chat: "earlier" | "new") => {
        stop();
        setDraft("");
        setTitle(chat === "new" ? "New chat" : "Invoice dates in Ireland");
        setMessages(chat === "new" ? [] : conversation);
        if (chat === "new") input.current?.focus();
    };

    return (
        <div className="chat-thread">
            <div className="chat-thread__panel">
                <header className="chat-thread__header">
                    <ChatAgentAvatar size="lg" />
                    <div className="chat-thread__heading">
                        <Text variant="card-title" as="h1" truncate id="chat-thread-title">
                            {title}
                        </Text>
                        <Text variant="caption" className="chat-thread__context">
                            <span className="chat-thread__context-dot" aria-hidden="true" />
                            Acme agent · billing-api · main
                        </Text>
                    </div>
                    <Button variant="ghost" size="sm" iconOnly aria-label="New chat" onClick={() => open("new")}>
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
                        <MenuLabel>Earlier chats</MenuLabel>
                        <MenuItem icon={<History size={15} />} onSelect={() => open("earlier")}>
                            Invoice dates in Ireland
                        </MenuItem>
                        <MenuSeparator />
                        <MenuItem icon={<GitPullRequest size={15} />}>Open #482</MenuItem>
                    </Menu>
                </header>

                <ChatConversation
                    ref={view}
                    aria-labelledby="chat-thread-title"
                    empty={
                        <EmptyState
                            icon={<Bot size={20} />}
                            title="Ask the Acme agent"
                            description="It can read billing-api, run its tests and open pull requests for your review."
                            actions={
                                <PromptSuggestions align="center" aria-label="Ideas to start from">
                                    {ideas.map((idea) => (
                                        <PromptSuggestion key={idea.label} icon={idea.icon} onClick={() => edit(idea.label)}>
                                            {idea.label}
                                        </PromptSuggestion>
                                    ))}
                                </PromptSuggestions>
                            }
                        />
                    }
                    footer={
                        <PromptInput
                            ref={input}
                            value={draft}
                            onChange={setDraft}
                            onSubmit={send}
                            isStreaming={thinking || streaming}
                            onStop={stop}
                            placeholder="Reply to the agent…"
                            aria-label="Reply to the agent"
                            hint={
                                <>
                                    <Kbd>Enter</Kbd> to send, <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd> for a new line
                                </>
                            }
                        />
                    }
                >
                    {messages.length ? <ChatMessage from="system">Today</ChatMessage> : null}
                    {messages.map((message) =>
                        message.from === "user" ? (
                            <ChatMessage
                                key={message.id}
                                from="user"
                                name="Maya Chen"
                                avatar={<Avatar name="Maya Chen" />}
                                time={message.time}
                                locale="en-GB"
                                actions={<ChatMessageActions copyText={message.text} onEdit={() => edit(message.text)} />}
                            >
                                {message.text}
                            </ChatMessage>
                        ) : (
                            <ChatMessage
                                key={message.id}
                                from="assistant"
                                name="Acme agent"
                                time={message.time}
                                locale="en-GB"
                                status={message.status}
                                showActions={message === last ? "always" : "hover"}
                                actions={<ChatMessageActions copyText={message.text} onRate={() => undefined} />}
                            >
                                {message.body ?? (
                                    <Prose size="sm">
                                        <Text variant="copy" tone="default">
                                            {message.text}
                                        </Text>
                                    </Prose>
                                )}
                            </ChatMessage>
                        ),
                    )}
                    {thinking ? <ChatLoader name="Acme agent" label="Thinking…" /> : null}
                </ChatConversation>
            </div>
        </div>
    );
}
