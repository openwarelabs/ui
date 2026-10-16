import { Button, Separator, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Separator",
    category: "Primitives",
    description:
        "A hairline between groups of content. Prefer space; use a line when space alone doesn't separate.",
    source: "components/Layout/Layout.tsx",
    notes: ['It has role="separator", and aria-orientation when vertical.'],
    related: ["Stack", "Card"],
};

/** Horizontal, with space either side. */
export function Horizontal() {
    return (
        <div style={{ width: 360, maxWidth: "100%" }}>
            <p style={{ margin: 0 }}>Account</p>
            <Separator spacing="md" />
            <p style={{ margin: 0 }}>Billing</p>
        </div>
    );
}

/** With a label, between two ways of doing the same thing. */
export function WithALabel() {
    return (
        <Stack style={{ width: 320, maxWidth: "100%" }}>
            <Button fullWidth>Continue with GitHub</Button>
            <Separator label="or" spacing="xs" />
            <Button fullWidth variant="primary">
                Continue with email
            </Button>
        </Stack>
    );
}

/** Vertical, between items in a row. */
export function Vertical() {
    return (
        <Stack direction="row" align="center" style={{ height: 20, fontSize: 14 }}>
            <span>Docs</span>
            <Separator orientation="vertical" spacing="sm" />
            <span>Changelog</span>
            <Separator orientation="vertical" spacing="sm" />
            <span>GitHub</span>
        </Stack>
    );
}
