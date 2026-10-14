import { useEffect, useState } from "react";

import { Button, Stack, Text, TextShimmer } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "TextShimmer",
    category: "AI",
    description:
        "Text with a highlight sweeping across it, for work in progress: an agent thinking, a search running, a step under way.",
    source: "components/TextShimmer/TextShimmer.tsx",
    notes: [
        "Use it for a status that's still changing, and end the words with an ellipsis. Once the work is done, set active={false} or show the result instead.",
        "It's ordinary text to screen readers. Pair it with a live region (ChatConversation has one) if the change needs announcing.",
        "With reduced motion it's plain muted text, and in forced-colours mode plain text.",
    ],
    related: ["ChatLoader", "ChainOfThought", "Spinner"],
    since: "0.5.0",
};

/** A status line while the agent works. */
export function Basic() {
    return <TextShimmer>Thinking…</TextShimmer>;
}

/** Sizes come from the text around it, so it works as a step's title or a caption. */
export function Sizes() {
    return (
        <Stack gap="md">
            <TextShimmer as="p" className="ow-type-card-title">
                Reading billing-api/src/invoices…
            </TextShimmer>
            <TextShimmer>Running 212 of 240 tests…</TextShimmer>
            <TextShimmer className="ow-type-caption">Searching the codebase…</TextShimmer>
        </Stack>
    );
}
Sizes.layout = { align: "start" as const };

/** Stops when the work finishes: the same words, now still. */
export function Finishing() {
    const [running, setRunning] = useState(true);
    useEffect(() => {
        if (!running) return;
        const timer = window.setTimeout(() => setRunning(false), 4000);
        return () => window.clearTimeout(timer);
    }, [running]);
    return (
        <Stack gap="md" align="start">
            <Text variant="body">
                <TextShimmer active={running}>
                    {running ? "Opening a pull request…" : "Opened pull request #482"}
                </TextShimmer>
            </Text>
            <Button size="sm" disabled={running} onClick={() => setRunning(true)}>
                Run again
            </Button>
        </Stack>
    );
}
Finishing.layout = { align: "start" as const };
