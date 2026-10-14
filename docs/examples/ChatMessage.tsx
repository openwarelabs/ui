import { useEffect, useState } from "react";

import {
    Avatar,
    Button,
    ChatMessage,
    ChatMessageActions,
    Code,
    Stack,
    Text,
    type ChatRating,
} from "@openwarelabs/ui";
import { RotateCcw } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "ChatMessage",
    category: "AI",
    description:
        "One message in a conversation: the person's in a bubble on the right, the agent's across the full width beside its avatar, or a system line in the middle. ChatMessageActions puts Copy, Retry and a rating under it.",
    source: "components/Chat/ChatMessage.tsx",
    imports: ["ChatMessage", "ChatMessageActions", "ChatAgentAvatar"],
    props: ["ChatMessageProps", "ChatMessageActionsProps", "ChatAgentAvatarProps"],
    keyboard: [
        ["Tab", "Moves to a message's actions: the row is one tab stop, and focus shows it."],
        ["Left or Right", "Moves between the actions."],
        ["Home or End", "Goes to the first or last action."],
        [
            "Enter or Space",
            "Copies, retries, edits, or presses a rating (pressing it again clears it).",
        ],
    ],
    notes: [
        'People\'s and the agent\'s messages are articles; with no name shown, screen readers still hear "You" or "Agent" before the words.',
        "A streaming message is aria-busy, so screen readers wait for the finished answer instead of reading every word. Its actions appear once it's done.",
        "The caret follows the last character wherever it is: a plain string, the last paragraph of Prose, a code block.",
        'Actions show on hover or focus, and always on touch screens; showActions="always" keeps them for the latest answer.',
        'The ratings are toggle buttons with aria-pressed, and Copy says "Copied" to screen readers.',
        "ChatAgentAvatar is the agent's bot tile on its own, in Avatar's sizes, for wherever else the agent appears: a chat's header, a list of runs.",
    ],
    related: ["ChatConversation", "ChatLoader", "Prose", "CodeBlock"],
    since: "0.5.0",
};

/** The person's bubble and the agent's answer, with names and times. Times are a Date or an ISO string, shown in the locale's short form. */
export function Basic() {
    return (
        <Stack gap="6xl">
            <ChatMessage
                from="user"
                name="Maya Chen"
                avatar={<Avatar name="Maya Chen" />}
                time="2026-10-14T09:41:00"
                locale="en-GB"
            >
                Why did the checkout test fail on main this morning?
            </ChatMessage>
            <ChatMessage
                from="assistant"
                name="Acme agent"
                time="2026-10-14T09:42:00"
                locale="en-GB"
            >
                <Text variant="copy" tone="default">
                    #476 moved rounding into <Code>lineTotal</Code>, so each line is rounded before
                    the discount. Three lines at £0.335 with 10% off now come to £0.92, and the test
                    expects £0.90.
                </Text>
                <Text variant="copy" tone="default">
                    Rounding once in <Code>formatTotal</Code> fixes it. Shall I make the change?
                </Text>
            </ChatMessage>
        </Stack>
    );
}
Basic.layout = { fill: true };

/**
 * ChatMessageActions under each message: Copy, Retry and a rating for the agent's answer, Copy and Edit for the
 * person's. They show on hover or focus; this answer keeps them in view with showActions="always".
 */
export function Actions() {
    const [rating, setRating] = useState<ChatRating | null>("up");
    const [edits, setEdits] = useState(0);
    return (
        <Stack gap="6xl">
            <ChatMessage
                from="user"
                actions={
                    <ChatMessageActions
                        copyText="Open the pull request against main."
                        onEdit={() => setEdits(edits + 1)}
                    />
                }
            >
                Open the pull request against main.
            </ChatMessage>
            <ChatMessage
                from="assistant"
                name="Acme agent"
                showActions="always"
                actions={
                    <ChatMessageActions
                        copyText="Opened pull request #483, “Round checkout totals once”, and asked Tomás Reyes to review it."
                        onRetry={() => undefined}
                        rating={rating}
                        onRate={setRating}
                    />
                }
            >
                Opened pull request #483, “Round checkout totals once”, and asked Tomás Reyes to
                review it.
            </ChatMessage>
            <Text variant="caption">
                {rating === "up"
                    ? "Rated a good response."
                    : rating === "down"
                      ? "Rated a bad response."
                      : "Not rated."}
                {edits > 0 ? ` Edit pressed ${edits === 1 ? "once" : `${edits} times`}.` : ""}
            </Text>
        </Stack>
    );
}
Actions.layout = { fill: true };

const answer =
    "The payments suite passed: 148 tests in 52 seconds. One test, `refunds a partial capture`, took 9 seconds on its own, because it waits for a webhook that the test server never sends. I can mock the webhook so it runs in under a second.";

/** While status is "streaming", a soft caret blinks after the last word and the message is aria-busy. Its actions wait until it's done. */
export function Streaming() {
    const [run, setRun] = useState(0);
    const [length, setLength] = useState(0);
    const words = answer.split(" ");
    const done = length >= words.length;
    useEffect(() => setLength(0), [run]);
    useEffect(() => {
        if (done) return undefined;
        const timer = window.setTimeout(() => setLength(length + 1), 90);
        return () => window.clearTimeout(timer);
    }, [length, done]);

    return (
        <Stack gap="lg">
            <ChatMessage
                from="assistant"
                name="Acme agent"
                status={done ? "done" : "streaming"}
                actions={<ChatMessageActions copyText={answer} onRate={() => undefined} />}
            >
                {words
                    .slice(0, length)
                    .join(" ")
                    .split("`")
                    .map((piece, index) => (index % 2 ? <Code key={index}>{piece}</Code> : piece))}
            </ChatMessage>
            <Button
                size="sm"
                startIcon={<RotateCcw size={16} />}
                onClick={() => setRun(run + 1)}
                style={{ alignSelf: "start" }}
            >
                Restart
            </Button>
        </Stack>
    );
}
Streaming.layout = { fill: true };

/** status="error" says what went wrong, under whatever arrived, and onRetry adds Retry. A person's message that didn't send says so too. */
export function Errors() {
    const [status, setStatus] = useState<"streaming" | "done" | "error">("error");
    useEffect(() => {
        if (status !== "streaming") return undefined;
        const timer = window.setTimeout(() => setStatus("done"), 1600);
        return () => window.clearTimeout(timer);
    }, [status]);

    return (
        <Stack gap="6xl">
            <ChatMessage
                from="user"
                status="error"
                error="Couldn't send. Check your connection."
                onRetry={() => undefined}
            >
                Run the payments suite on the branch too.
            </ChatMessage>
            <ChatMessage
                from="assistant"
                name="Acme agent"
                status={status}
                error="The model stopped responding. Your files haven't changed."
                onRetry={() => setStatus("streaming")}
            >
                {status === "done" ? (
                    "The payments suite passed: 148 tests in 52 seconds."
                ) : (
                    <>
                        Running the payments suite on <Code>fix/checkout-rounding</Code>…
                    </>
                )}
            </ChatMessage>
        </Stack>
    );
}
Errors.layout = { fill: true };

/** from="system" for things that happened rather than things said: a muted line in the middle, between hairlines. */
export function SystemLines() {
    return (
        <Stack gap="6xl">
            <ChatMessage from="system" time="2026-10-14T09:40:00" locale="en-GB">
                Maya Chen started the conversation
            </ChatMessage>
            <ChatMessage from="user">Use Claude Sonnet for this one.</ChatMessage>
            <ChatMessage from="system">Maya Chen changed the model to Claude Sonnet</ChatMessage>
            <ChatMessage from="system">Tomás Reyes joined the conversation</ChatMessage>
        </Stack>
    );
}
SystemLines.layout = { fill: true };
