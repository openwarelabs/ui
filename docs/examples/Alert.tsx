import { useState } from "react";

import { Alert, Button, Stack } from "@openwarelabs/ui";
import { Sparkles } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Alert",
    category: "Feedback",
    description:
        "A message inside the page about the page: a notice, a warning before an action, an error that blocks the work.",
    source: "components/Alert/Alert.tsx",
    notes: [
        'Warnings and errors have role="alert" and are read out when they appear; the others are polite status messages.',
        "Every variant has an icon and words as well as a colour, so it doesn't rely on colour alone.",
        "For news about something that just happened elsewhere, use a toast instead.",
    ],
    related: ["Toast", "Badge", "EmptyState", "Callout"],
};

/** Five variants. Keep the title to a few words and put the detail underneath. */
export function Variants() {
    return (
        <Stack gap="md" style={{ width: 520, maxWidth: "100%", marginInline: "auto" }}>
            <Alert variant="info" title="A new model is available">
                Claude Opus can now run the Architect agent.
            </Alert>
            <Alert variant="success" title="Checkpoint saved">
                You can roll back to this point at any time.
            </Alert>
            <Alert variant="warning" title="Wait for running agents to finish">
                These settings can't change while an agent is working.
            </Alert>
            <Alert variant="danger" title="Couldn't reach the model">
                Check your API key in Settings, then try again.
            </Alert>
            <Alert variant="neutral">The free plan includes three projects.</Alert>
        </Stack>
    );
}
Variants.layout = { fill: true };

/** Actions under the text, and a ✕ when the person may dismiss it. */
export function ActionsAndDismiss() {
    const [open, setOpen] = useState(true);
    if (!open) return <Button onClick={() => setOpen(true)}>Show the alert again</Button>;
    return (
        <div style={{ width: 520, maxWidth: "100%" }}>
            <Alert
                variant="info"
                title="Update ready"
                icon={<Sparkles size={16} />}
                onClose={() => setOpen(false)}
                actions={
                    <>
                        <Button size="sm" variant="primary">
                            Restart to update
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                            Later
                        </Button>
                    </>
                }
            >
                Version 0.2.0 takes a few seconds to install. Your chats stay where they are.
            </Alert>
        </div>
    );
}
