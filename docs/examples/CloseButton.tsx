import { CloseButton, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "CloseButton",
    category: "Buttons",
    description:
        "The ✕ in the corner of a dialog, drawer or panel: a quiet square that darkens on hover.",
    source: "components/Button/ButtonGroup.tsx",
    notes: [
        "Its label defaults to “Close”. Say what it closes when there's more than one on screen: “Close preview”.",
    ],
    related: ["Drawer", "Dialog", "Alert"],
};

/** md (32px) for dialogs and panels, sm (24px) for toasts, tags and alerts. */
export function Sizes() {
    return (
        <Stack direction="row" gap="md" align="center">
            <CloseButton />
            <CloseButton size="sm" label="Dismiss" />
        </Stack>
    );
}

/** In a panel's header, at the end of the title row. */
export function InAHeader() {
    return (
        <div
            style={{
                display: "flex",
                width: 320,
                maxWidth: "100%",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid var(--ow-border)",
                borderRadius: "var(--ow-radius-container)",
                padding: "10px 10px 10px 16px",
                background: "var(--ow-surface)",
            }}
        >
            <strong style={{ fontSize: 14 }}>Preview</strong>
            <CloseButton label="Close preview" />
        </div>
    );
}
