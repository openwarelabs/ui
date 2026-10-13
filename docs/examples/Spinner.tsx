import { Button, Spinner, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Spinner",
    category: "Feedback",
    description:
        "A small spinning ring for work that takes a moment, as in Commandr's project list.",
    source: "components/Spinner/Spinner.tsx",
    notes: [
        'It has role="status" and reads “Loading” unless given another label. Pass an empty label when nearby text already says it.',
        "With reduced motion it turns slowly instead of stopping, so it still shows work in progress.",
    ],
    related: ["ProgressCircle", "Skeleton", "Button"],
};

/** Three sizes. */
export function Sizes() {
    return (
        <Stack direction="row" gap="xl" align="center">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
        </Stack>
    );
}

/** tone="current" takes the text colour, for use inside other things. Buttons have a loading prop that does this. */
export function InContext() {
    return (
        <Stack direction="row" gap="xl" align="center" wrap>
            <span
                style={{
                    display: "inline-flex",
                    gap: 8,
                    alignItems: "center",
                    color: "var(--ow-text-muted)",
                    fontSize: 14,
                }}
            >
                <Spinner size="sm" tone="current" label="" /> Loading projects…
            </span>
            <Button variant="primary" loading>
                Deploying
            </Button>
        </Stack>
    );
}
