import { ProgressCircle, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "ProgressCircle",
    category: "Feedback",
    description: "Progress as a ring, for tight spaces: a row in a list, a file being uploaded.",
    source: "components/Progress/Progress.tsx",
    props: ["ProgressCircleProps"],
    notes: ["Give it an aria-label that says what's in progress: “Uploading cover.png”."],
    related: ["ProgressBar", "Spinner"],
};

/** sm, md and lg; lg shows the percentage inside. */
export function Sizes() {
    return (
        <Stack direction="row" gap="xl" align="center">
            <ProgressCircle size="sm" value={30} />
            <ProgressCircle size="md" value={55} />
            <ProgressCircle size="lg" value={72} />
        </Stack>
    );
}

/** Tones, and no value for work of unknown length. */
export function TonesAndIndeterminate() {
    return (
        <Stack direction="row" gap="xl" align="center">
            <ProgressCircle size="lg" value={100} tone="success" aria-label="Upload complete" />
            <ProgressCircle size="lg" value={88} tone="warning" aria-label="Disk space used" />
            <ProgressCircle size="lg" aria-label="Uploading" />
        </Stack>
    );
}

/** In a list row. */
export function InARow() {
    return (
        <Stack
            direction="row"
            gap="sm"
            align="center"
            style={{
                width: 280,
                maxWidth: "100%",
                border: "1px solid var(--ow-border)",
                borderRadius: "var(--ow-radius-form)",
                padding: "10px 12px",
                background: "var(--ow-surface)",
            }}
        >
            <ProgressCircle size="sm" value={40} aria-label="Uploading cover.png" />
            <span style={{ flex: 1, fontSize: 14 }}>cover.png</span>
            <span
                style={{
                    color: "var(--ow-text-muted)",
                    fontSize: 12,
                    fontVariantNumeric: "tabular-nums",
                }}
            >
                1.2 of 3 MB
            </span>
        </Stack>
    );
}
