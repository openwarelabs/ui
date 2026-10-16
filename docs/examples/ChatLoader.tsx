import { useEffect, useState } from "react";

import { Button, ChatLoader, ChatMessage, Code, Stack, Text } from "@openwarelabs/ui";
import { RotateCcw } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "ChatLoader",
    category: "AI",
    description:
        "The agent is working and nothing has arrived yet: three dots that pulse in turn, or a shimmering label such as “Thinking…”. It takes the place of the agent's next message.",
    source: "components/Chat/ChatLoader.tsx",
    notes: [
        "It's a status region: screen readers hear the label, or “Working…” (srLabel) while the dots show.",
        "Laid out like the agent's message, so the answer replaces it without a jump; inline drops the avatar for use inside a line or a step.",
        "Under reduced motion the dots stand still and the label doesn't shimmer.",
    ],
    related: ["ChatMessage", "ChatConversation", "TextShimmer", "Spinner"],
    since: "0.5.0",
};

/** Three dots that pulse in turn, beside the agent's avatar and name. */
export function Basic() {
    return <ChatLoader name="Acme agent" />;
}
Basic.layout = { align: "start" as const };

/** A label says what the agent is doing, with a shimmer across it. */
export function WithLabel() {
    return (
        <Stack gap="6xl">
            <ChatLoader label="Thinking…" />
            <ChatLoader name="Acme agent" label="Reading src/checkout and its tests…" />
        </Stack>
    );
}
WithLabel.layout = { align: "start" as const };

/** inline: just the dots or the label, inside a line of text or a step of the agent's run. */
export function Inline() {
    return (
        <Stack gap="lg">
            <Text variant="body">
                Acme agent is replying <ChatLoader inline srLabel="Acme agent is replying" />
            </Text>
            <Text variant="body">
                <Code>npm test -- checkout</Code> <ChatLoader inline label="Running 212 tests…" />
            </Text>
        </Stack>
    );
}
Inline.layout = { align: "start" as const };

/** The loader holds the agent's place until the first words arrive; then the answer takes its place without a jump. */
export function BecomingTheAnswer() {
    const [run, setRun] = useState(0);
    const [answered, setAnswered] = useState(false);
    useEffect(() => {
        setAnswered(false);
        const timer = window.setTimeout(() => setAnswered(true), 2200);
        return () => window.clearTimeout(timer);
    }, [run]);

    return (
        <Stack gap="lg">
            <Stack gap="6xl">
                <ChatMessage from="user">Is #483 ready to merge?</ChatMessage>
                {answered ? (
                    <ChatMessage from="assistant" name="Acme agent">
                        Yes. Ciarán approved it at 10:12, and all 212 checks passed.
                    </ChatMessage>
                ) : (
                    <ChatLoader name="Acme agent" label="Checking #483…" />
                )}
            </Stack>
            <Button
                size="sm"
                startIcon={<RotateCcw size={16} />}
                onClick={() => setRun(run + 1)}
                style={{ alignSelf: "start" }}
            >
                Ask again
            </Button>
        </Stack>
    );
}
BecomingTheAnswer.layout = { fill: true };
