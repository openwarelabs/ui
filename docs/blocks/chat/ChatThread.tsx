import { useEffect, useRef, useState } from "react";

import { Chat01, type Chat01Message } from "@openwarelabs/blocks";
import { Badge, Code, CodeBlock, Link, Prose, Text } from "@openwarelabs/ui";
import { Bot, Bug, FlaskConical, GitPullRequest, History, ScrollText } from "lucide-react";

import "./ChatThread.css";

const fix = `export function formatInvoiceDate(issuedAt: Date, customer: Customer) {
    return new Intl.DateTimeFormat(customer.locale, {
        dateStyle: "long",
        timeZone: customer.timeZone, // was the server's, UTC
    }).format(issuedAt);
}`;

const conversation: Chat01Message[] = [
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
        text: "Yes, open it against main and ask Ciarán to review.",
    },
    {
        id: "4",
        from: "assistant",
        time: "2026-10-14T14:05:00",
        text: "Done. It's ready for Ciarán Kelly, and I'll fix anything he asks for on the same branch. #482 Fix invoice dates in the EU.",
        body: (
            <Prose size="sm">
                <Text variant="copy" tone="default">
                    Done. It's ready for Ciarán Kelly, and I'll fix anything he asks for on the same branch.
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
        setThinking(true);
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

    const open = (chat: "earlier" | "new") => {
        stop();
        setDraft("");
        setTitle(chat === "new" ? "New chat" : "Invoice dates in Ireland");
        setMessages(chat === "new" ? [] : conversation);
    };

    return (
        <Chat01
            title={title}
            context="Acme agent · billing-api · main"
            messages={messages}
            user={{ name: "Siobhan Murphy" }}
            agentName="Acme agent"
            day="Today"
            thinking={thinking}
            onSend={send}
            onStop={stop}
            onNewChat={() => open("new")}
            menuHeading="Earlier chats"
            menu={[
                { label: "Invoice dates in Ireland", icon: <History size={15} />, onSelect: () => open("earlier") },
                { label: "Open #482", icon: <GitPullRequest size={15} />, separatorBefore: true },
            ]}
            empty={{
                icon: <Bot size={20} />,
                title: "Ask the Acme agent",
                description: "It can read billing-api, run its tests and open pull requests for your review.",
                suggestions: ideas,
            }}
            draft={draft}
            onDraftChange={setDraft}
            locale="en-GB"
        />
    );
}
