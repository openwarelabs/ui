import { useState } from "react";

import { Button, Field, Stack, Textarea } from "@openwarelabs/ui";
import { ArrowUp } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Textarea",
    category: "Primitives",
    description:
        "A multi-line text field, 72px tall at least, that can grow line by line with what's typed.",
    source: "components/Textarea/Textarea.tsx",
    notes: [
        "autoGrow measures cheaply: very long drafts stop measuring once they're past the height cap.",
    ],
    related: ["Input", "Field", "MarkdownEditor"],
};

/** A fixed box that the person can resize. */
export function Basic() {
    return (
        <div style={{ width: 360, maxWidth: "100%" }}>
            <Field label="Describe your idea">
                <Textarea placeholder="A recipe app that plans the week from what's in the fridge." />
            </Field>
        </div>
    );
}

/** autoGrow grows with the text up to autoGrowMaxHeight, then scrolls. Type a few lines. */
export function AutoGrow() {
    return (
        <div style={{ width: 360, maxWidth: "100%" }}>
            <Textarea
                aria-label="Notes"
                autoGrow
                autoGrowMaxHeight={160}
                defaultValue={"Works offline.\nSyncs when it's back online."}
            />
        </div>
    );
}

/** bare drops the frame, for a composer that draws its own: here, the text with a send button. */
export function Composer() {
    const [message, setMessage] = useState("");
    return (
        <div
            style={{
                width: 420,
                maxWidth: "100%",
                border: "1px solid var(--ow-border-strong)",
                borderRadius: "var(--ow-radius-container)",
                background: "var(--ow-surface)",
                padding: "12px 12px 10px 14px",
            }}
        >
            <Stack gap="sm">
                <Textarea
                    bare
                    autoGrow
                    aria-label="Message"
                    placeholder="Ask Scope to plan the next screen…"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                />
                <Stack direction="row" justify="end">
                    <Button
                        variant="primary"
                        iconOnly
                        size="sm"
                        aria-label="Send"
                        disabled={!message.trim()}
                    >
                        <ArrowUp size={16} />
                    </Button>
                </Stack>
            </Stack>
        </div>
    );
}

/** Invalid and disabled. */
export function States() {
    return (
        <Stack gap="md" style={{ width: 360, maxWidth: "100%" }}>
            <Textarea aria-label="Invalid" isInvalid defaultValue="Too short" />
            <Textarea
                aria-label="Disabled"
                disabled
                defaultValue="The scope is locked while an agent works."
            />
        </Stack>
    );
}
